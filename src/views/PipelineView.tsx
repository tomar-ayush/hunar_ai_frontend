import React from 'react';

export const PipelineView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] border border-dashed border-[#e6e5e3] rounded-2xl bg-white p-12 text-center">
      <h3 className="text-base font-semibold text-[#121212]">Candidate CRM Pipeline (Screen 3)</h3>
      <p className="text-xs text-[#6e6d69] max-w-md mt-1">
        Data table of Apollo/PDL sourced talent, multi-select checkboxes, match badges, and floating Hunar.AI voice outreach action bar.
      </p>
    </div>
  );
};
