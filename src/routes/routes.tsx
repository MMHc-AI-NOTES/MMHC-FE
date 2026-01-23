import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import PublicGuard from './PublicGuard';
import RoleGuard from './RoleGuard';

const MainLayout = lazy(() => import('@/components/layout/MainLayout'));
const SimpleLayout = lazy(() => import('@/theme/simpleLayout/SimpleLayout'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const NotesQueue = lazy(() => import('@/pages/notesQueue/NotesQueue'));
const SingleNoteAudit = lazy(() => import('@/pages/singleNoteAudit/SingleNoteAudit'));
const AdminReviewQueue = lazy(() => import('@/pages/adminReviewQueue/AdminReviewQueue'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const AILogs = lazy(() => import('@/pages/aiLogs/AILogs'));
const ManagerReviewQueue = lazy(() => import('@/pages/managerReview/ManagerReviewQueue'));
const ManagerSingleReview = lazy(() => import('@/pages/managerReview/ManagerSingleReview'));
const BlacklistedNotes = lazy(() => import('@/pages/blacklistedNotes/BlacklistedNotes'));
const NoteSubmission = lazy(() => import('@/pages/noteSubmission/NoteSubmission'));

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
        {
          path: 'dashboard',
          element: (
            <RoleGuard>
              <Dashboard />
            </RoleGuard>
          ),
        },
        {
          path: 'notes-queue',
          element: (
            <RoleGuard>
              <NotesQueue />
            </RoleGuard>
          ),
        },
        {
          path: 'notes-queue/single-note-audit/:id',
          element: (
            <RoleGuard>
              <SingleNoteAudit />
            </RoleGuard>
          ),
        },
        {
          path: 'admin-review-queue',
          element: (
            <RoleGuard>
              <AdminReviewQueue />
            </RoleGuard>
          ),
        },
        {
          path: 'admin-review-queue/single-note-audit/:id',
          element: (
            <RoleGuard>
              <SingleNoteAudit />
            </RoleGuard>
          ),
        },
        {
          path: 'blacklisted-notes',
          element: (
            <RoleGuard>
              <BlacklistedNotes />
            </RoleGuard>
          ),
        },
        {
          path: 'manager-review',
          element: (
            <RoleGuard>
              <ManagerReviewQueue />
            </RoleGuard>
          ),
        },
        {
          path: 'manager-review/single-review/:id',
          element: (
            <RoleGuard>
              <ManagerSingleReview />
            </RoleGuard>
          ),
        },
        {
          path: 'ai-logs',
          element: (
            <RoleGuard>
              <AILogs />
            </RoleGuard>
          ),
        },
        {
          path: 'settings',
          element: (
            <RoleGuard>
              <Settings />
            </RoleGuard>
          ),
        },
        {
          path: 'note-submission',
          element: (
            <RoleGuard>
              <NoteSubmission />
            </RoleGuard>
          ),
        },
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
        { path: 'create-invited-user', element: <Signup /> },
      ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
  ]);

  return routes;
};

export default Routes;
