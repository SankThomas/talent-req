import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { LoginPage, SignupPage } from "@/pages/auth/AuthPages";
import { CandidateDetailPage } from "@/pages/CandidateDetailPage";
import { CandidatesPage } from "@/pages/CandidatesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { InterviewsPage } from "@/pages/InterviewsPage";
import { JobsPage } from "@/pages/JobsPage";
import { PipelinePage } from "@/pages/PipelinePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TeamPage } from "@/pages/TeamPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/jobs", element: <JobsPage /> },
      { path: "/candidates", element: <CandidatesPage /> },
      { path: "/candidates/:id", element: <CandidateDetailPage /> },
      { path: "/pipeline", element: <PipelinePage /> },
      { path: "/interviews", element: <InterviewsPage /> },
      { path: "/team", element: <TeamPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
