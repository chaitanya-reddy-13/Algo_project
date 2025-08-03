import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Problems } from "@/pages/Problems";
import { ProblemDetail } from "@/pages/ProblemDetail";
import { Submissions } from "@/pages/Submissions";
import { Leaderboard } from "@/pages/Leaderboard";
import { AIAssistant } from "@/pages/AIAssistant";
import { OnlineCompiler } from "@/pages/OnlineCompiler";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { AdminContests } from "@/pages/AdminContests";
import { Contests } from "@/pages/Contests";
import { ContestDetail } from "@/pages/ContestDetail";
import { Profile } from "@/pages/Profile";
import NotFound from "./pages/NotFound";
import { authAPI } from "@/lib/api";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/" 
              element={
                <Layout user={user} onLogout={handleLogout}>
                  <Home />
                </Layout>
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/problems" replace /> : <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/problems" replace /> : <Register onLogin={handleLogin} />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/problems" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Problems />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/problems/:id" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <ProblemDetail />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/submissions" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Submissions />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Leaderboard />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/ai-assistant" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <AIAssistant />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/online-compiler" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <OnlineCompiler />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Contest routes */}
            <Route 
              path="/contests" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Contests />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/contests/:id" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <ContestDetail />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                user && user.role === 'Admin' ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <AdminDashboard />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/admin/contests" 
              element={
                user && user.role === 'Admin' ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <AdminContests />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            
            {/* Profile route */}
            <Route 
              path="/profile" 
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Profile />
                  </Layout>
                ) : <Navigate to="/login" replace />
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
