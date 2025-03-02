import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import FeaturesPage from '../pages/FeaturesPage';
import PricingPage from '../pages/PricingPage';
import ProjectListPage from '../pages/projects/ProjectListPage';
import NewProjectPage from '../pages/projects/NewProjectPage';
import TaskPage from '../pages/tasks/TaskPage';
import NewTaskPage from '../pages/tasks/NewTaskPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="dashboard/projects" element={
          <ProtectedRoute>
            <ProjectListPage />
          </ProtectedRoute>
        } />
        
        <Route path="dashboard/projects/new" element={
          <ProtectedRoute>
            <NewProjectPage />
          </ProtectedRoute>
        } />

        <Route path="dashboard/tasks" element={
          <ProtectedRoute>
            <TaskPage />
          </ProtectedRoute>
        } />

        <Route path="dashboard/tasks/new" element={
          <ProtectedRoute>
            <NewTaskPage />
          </ProtectedRoute>
        } />

        {/* Add more routes here */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
