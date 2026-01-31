import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme-provider';
import Home from '@/pages/home/Home';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect } from 'react';

function App() {
  // Set theme to dark by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <div className="min-h-screen bg-zinc-950 text-white">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Add more routes here */}
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
