import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RecruiterProvider } from './context';
import { AppLayout } from './components/layout/AppLayout';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { SourcingBuilderView } from './views/SourcingBuilderView';
import { PipelineView } from './views/PipelineView';
import { InterviewAuditView } from './views/InterviewAuditView';
import { VoiceAgentsView } from './views/VoiceAgentsView';

export function App() {
  return (
    <BrowserRouter>
      <RecruiterProvider>
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <DashboardView />
              </AppLayout>
            }
          />
          <Route
            path="/sourcing"
            element={
              <AppLayout>
                <SourcingBuilderView />
              </AppLayout>
            }
          />
          <Route
            path="/pipeline"
            element={
              <AppLayout>
                <PipelineView />
              </AppLayout>
            }
          />
          <Route
            path="/agents"
            element={
              <AppLayout>
                <VoiceAgentsView />
              </AppLayout>
            }
          />
          <Route
            path="/candidate/:candidateId"
            element={
              <AppLayout>
                <InterviewAuditView />
              </AppLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RecruiterProvider>
    </BrowserRouter>
  );
}

export default App;
