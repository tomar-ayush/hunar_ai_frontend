import React from 'react';

export const InterviewAuditView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] border border-dashed border-[#e6e5e3] rounded-2xl bg-white p-12 text-center">
      <h3 className="text-base font-semibold text-[#121212]">Interview Audit & Scorecard (Screen 4)</h3>
      <p className="text-xs text-[#6e6d69] max-w-md mt-1">
        Split-screen evaluation: Left panel structured AI insights (Intent, Notice, Strengths, Red Flags) & Right panel interactive audio player with synced transcript.
      </p>
    </div>
  );
};
