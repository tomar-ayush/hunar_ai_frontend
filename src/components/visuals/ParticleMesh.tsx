import React, { useRef, useEffect } from 'react';

interface ParticleMeshProps {
  className?: string;
  /** Approximate px between lattice points; smaller = denser */
  spacing?: number;
  /** React to pointer movement */
  interactive?: boolean;
  /** Dim the whole mesh via canvas opacity */
  opacity?: number;
}

interface Node {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
  ampX: number;
  ampY: number;
  accent: boolean;
}

const INK = '18, 18, 18';
const ACCENT = '79, 70, 229';

/**
 * Animated geometric lattice — nodes drift on a triangular grid while a
 * pointer distorts the mesh and highlights nearby links in indigo.
 */
export const ParticleMesh: React.FC<ParticleMeshProps> = ({
  className = '',
  spacing = 88,
  interactive = true,
  opacity = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    const mouse = { x: -9999, y: -9999, strength: 0, targetStrength: 0 };

    const buildLattice = () => {
      nodes = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const offsetX = (width - (cols - 1) * spacing) / 2;
      const offsetY = (height - (rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // stagger alternate rows for a triangular weave
          const stagger = r % 2 === 0 ? 0 : spacing / 2;
          const homeX = offsetX + c * spacing + stagger;
          const homeY = offsetY + r * spacing;
          if (homeX > width + spacing || homeY > height + spacing) continue;

          nodes.push({
            homeX,
            homeY,
            x: homeX,
            y: homeY,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            speedX: 0.15 + Math.random() * 0.25,
            speedY: 0.15 + Math.random() * 0.25,
            ampX: 4 + Math.random() * 7,
            ampY: 4 + Math.random() * 7,
            accent: Math.random() < 0.12,
          });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLattice();
      if (reducedMotion) drawFrame(0);
    };

    const pointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.targetStrength = inside ? 1 : 0;
    };

    const REPEL_RADIUS = 130;
    const LINK_DIST = spacing * 1.15;

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      mouse.strength += (mouse.targetStrength - mouse.strength) * 0.08;

      // update positions: gentle drift around lattice home + pointer repulsion
      for (const n of nodes) {
        let x = n.homeX + Math.sin(t * 0.0006 * n.speedX + n.phaseX) * n.ampX;
        let y = n.homeY + Math.cos(t * 0.0006 * n.speedY + n.phaseY) * n.ampY;

        if (interactive && mouse.strength > 0.01) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = (1 - dist / REPEL_RADIUS) * 22 * mouse.strength;
            x += (dx / dist) * force;
            y += (dy / dist) * force;
          }
        }

        n.x = x;
        n.y = y;
      }

      // links between nearby lattice points
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;

          const closeness = 1 - dist / LINK_DIST;

          // pointer proximity tints the link indigo
          let nearPointer = 0;
          if (interactive && mouse.strength > 0.01) {
            const mx = (a.x + b.x) / 2 - mouse.x;
            const my = (a.y + b.y) / 2 - mouse.y;
            const md = Math.hypot(mx, my);
            nearPointer = md < REPEL_RADIUS * 1.4
              ? (1 - md / (REPEL_RADIUS * 1.4)) * mouse.strength
              : 0;
          }

          const inkAlpha = 0.05 + closeness * 0.09;
          if (nearPointer > 0.05) {
            ctx.strokeStyle = `rgba(${ACCENT}, ${Math.min(0.45, inkAlpha + nearPointer * 0.35)})`;
          } else {
            ctx.strokeStyle = `rgba(${INK}, ${inkAlpha})`;
          }
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // nodes as small squares — geometric, not soft circles
      for (const n of nodes) {
        const size = n.accent ? 3.5 : 2.5;
        const dist = interactive && mouse.strength > 0.01
          ? Math.hypot(n.x - mouse.x, n.y - mouse.y)
          : Infinity;
        const lit = dist < REPEL_RADIUS;
        ctx.fillStyle = n.accent
          ? `rgba(${ACCENT}, ${0.55 + (lit ? 0.35 * mouse.strength : 0)})`
          : `rgba(${INK}, ${0.3 + (lit ? 0.4 * mouse.strength : 0)})`;
        ctx.fillRect(n.x - size / 2, n.y - size / 2, size, size);
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    if (interactive) {
      window.addEventListener('pointermove', pointerMove, { passive: true });
    }

    if (reducedMotion) {
      drawFrame(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      if (interactive) {
        window.removeEventListener('pointermove', pointerMove);
      }
    };
  }, [spacing, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
