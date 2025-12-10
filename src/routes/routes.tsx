import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import PublicGuard from './PublicGuard';

const MainLayout = lazy(() => import('@/components/layout/MainLayout'));
const SimpleLayout = lazy(() => import('@/theme/simpleLayout/SimpleLayout'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const NotesQueue = lazy(() => import('@/pages/notesQueue/NotesQueue'));
const SingleNoteAudit = lazy(() => import('@/pages/singleNoteAudit/SingleNoteAudit'));
const HumanReviewQueue = lazy(() => import('@/pages/humanReviewQueue/HumanReviewQueue'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const AILogs = lazy(() => import('@/pages/aiLogs/AILogs'));

const Routes = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'notes-queue', element: <NotesQueue /> },
        { path: 'notes-queue/single-note-audit/:id', element: <SingleNoteAudit /> },
        { path: 'human-review-queue', element: <HumanReviewQueue /> },
        { path: 'human-review-queue/single-note-audit/:id', element: <SingleNoteAudit /> },
        { path: 'blacklisted-notes', element: <h1>Blacklisted Notes</h1> },
        { path: 'manager-review', element: <h1>Manager Review</h1> },
        { path: 'ai-logs', element: <AILogs /> },
        { path: 'settings', element: <Settings /> },
        { path: 'note-submission', element: <h1>Note Submission</h1> },
      ],
    },
    {
      path: '/',
      element: (
        <PublicGuard>
          <SimpleLayout />
        </PublicGuard>
      ),
      children: [
        { path: 'login', element: <Login /> },
        { path: 'signup', element: <Signup /> },
      ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);

  return routes;
};

export default Routes;
