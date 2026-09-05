import React from 'react';
import { RecruiterProvider, useRecruiter } from './context';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './views/DashboardView';
import { SourcingBuilderView } from './views/SourcingBuilderView';
import { PipelineView } from './views/PipelineView';
import { InterviewAuditView } from './views/InterviewAuditView';

const AppContent: React.FC = () => {
  const { currentRoute } = useRecruiter();

  const renderActiveView = () => {
    if (currentRoute === '/') {
      return <DashboardView />;
    }
    if (currentRoute === '/sourcing') {
      return <SourcingBuilderView />;
    }
    if (currentRoute === '/pipeline') {
      return <PipelineView />;
    }
    if (currentRoute.startsWith('/candidate')) {
      return <InterviewAuditView />;
    }
    return <DashboardView />;
  };

  return <AppLayout>{renderActiveView()}</AppLayout>;
};

export function App() {
  return (
    <RecruiterProvider>
      <AppContent />
    </RecruiterProvider>
  );
}

export default App;
