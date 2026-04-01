import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AddPortfolioForm from '@/components/portfolio/AddPortfolioForm';
import { useAuth } from '@/context/AuthContext';

export default function PortfolioFormPage() {
  const { id } = useParams();
  const mode = id ? 'edit' : 'create';
  const { user, loading, isAuthenticated } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [pageLoading, setPageLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'edit' || !isAuthenticated || user?.role !== 'photographer') return;
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    const token = stored?.state?.token;

    fetch(`/api/portfolio/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load portfolio');
        return data;
      })
      .then((data) => setInitialData(data))
      .catch((fetchError) => setError(fetchError.message || 'Failed to load portfolio'))
      .finally(() => setPageLoading(false));
  }, [id, isAuthenticated, mode, user?.role]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && isAuthenticated && user?.role !== 'photographer') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        {pageLoading ? <div className="py-10 text-center text-zinc-400">Loading photoshoot...</div> : null}
        {!pageLoading && error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!pageLoading && !error ? <AddPortfolioForm initialData={initialData} mode={mode} /> : null}
      </main>
      <Footer />
    </div>
  );
}
