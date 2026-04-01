import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme-provider';
import Home from '@/pages/home/Home';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Photographers from '@/pages/photographers/Photographers';
import Profile from '@/pages/profile/Profile';
import PortfolioList from '@/pages/portfolio/PortfolioList';
import PortfolioFormPage from '@/pages/portfolio/PortfolioFormPage';
import OrganizationsList from '@/pages/organizations/OrganizationsList';
import OrganizationDetails from '@/pages/organizations/OrganizationDetails';
import PhotographerDetails from '@/pages/photographer/PhotographerDetails';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-zinc-950 text-white flex flex-col">
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/photographers" element={<Photographers />} />
                <Route path="/organizations" element={<OrganizationsList />} />
                <Route path="/organizations/:id" element={<OrganizationDetails />} />
                <Route path="/photographer/:id" element={<PhotographerDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <ProtectedRoute>
                      <PortfolioList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio/new"
                  element={
                    <ProtectedRoute>
                      <PortfolioFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio/:id"
                  element={
                    <ProtectedRoute>
                      <PortfolioFormPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
