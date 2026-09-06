import sys

file_path = 'src/views/InterviewAuditView.tsx'
with open(file_path, 'r') as f:
    content = f.read()

start_marker = '{/* RIGHT PANEL: Audio Player & Synced Transcript (7 Cols) */}'
end_marker = '        </div>\n      </div>\n    </div>\n  );\n};'

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    right_panel = content[start_idx:end_idx]
    
    insert_str = '<div className="lg:col-span-7 space-y-4">\n'
    insert_idx = right_panel.find(insert_str) + len(insert_str)
    
    before_wrap = right_panel[:insert_idx]
    to_wrap = right_panel[insert_idx:]
    
    wrapped = before_wrap + '          {!isRinging ? (\n            <>\n'
    
    for line in to_wrap.split('\n'):
        if line:
            wrapped += '  ' + line + '\n'
        else:
            wrapped += '\n'
            
    wrapped += '            </>\n          ) : (\n            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-[#e6e5e3] rounded-xl bg-[#fbfbfa] text-[#8c8b88] space-y-3">\n              <div className="w-8 h-8 rounded-full border-2 border-[#1b6b27] border-t-transparent animate-spin" />\n              <span className="text-xs font-mono">Audio & Transcript will be available after the call completes...</span>\n            </div>\n          )}\n'
    
    new_content = content[:start_idx] + wrapped + content[end_idx:]
    
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Successfully patched right panel.")
else:
    print("Could not find markers.")
