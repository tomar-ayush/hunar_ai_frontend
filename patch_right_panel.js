const fs = require('fs');
const file = 'src/views/InterviewAuditView.tsx';
let content = fs.readFileSync(file, 'utf8');

const rightPanelStart = content.indexOf('{/* RIGHT PANEL: Audio Player & Synced Transcript (7 Cols) */}');
const rightPanelEnd = content.indexOf('</div>\n      </div>\n    </div>\n  );\n};');

if (rightPanelStart !== -1 && rightPanelEnd !== -1) {
  let rightPanelContent = content.substring(rightPanelStart, rightPanelEnd);
  // We need to wrap the contents of the right panel inside {!isRinging && ( <> ... </> )}
  
  // The right panel starts with:
  // {/* RIGHT PANEL... */}
  // <div className="lg:col-span-7 space-y-4">
  //   {/* Real Audio Element if recording URL is present */}
  //   {recordingUrl && (
  
  const insertStartStr = '<div className="lg:col-span-7 space-y-4">\n';
  const insertStartIndex = rightPanelContent.indexOf(insertStartStr) + insertStartStr.length;
  
  const beforeWrap = rightPanelContent.substring(0, insertStartIndex);
  const toWrap = rightPanelContent.substring(insertStartIndex);
  
  const newRightPanel = beforeWrap + '          {!isRinging ? (\n            <>\n' + toWrap.split('\n').map(l => '  ' + l).join('\n') + '\n            </>\n          ) : (\n            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#e6e5e3] rounded-xl bg-[#fbfbfa] text-[#8c8b88] space-y-3">\n              <div className="w-8 h-8 rounded-full border-2 border-[#1b6b27] border-t-transparent animate-spin" />\n              <span className="text-xs font-mono">Audio & Transcript will be available after the call...</span>\n            </div>\n          )}';
  
  content = content.substring(0, rightPanelStart) + newRightPanel + content.substring(rightPanelEnd);
  fs.writeFileSync(file, content);
  console.log("Successfully wrapped right panel.");
} else {
  console.log("Could not find right panel boundaries.");
}
