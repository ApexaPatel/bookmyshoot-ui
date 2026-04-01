import { useEffect, useState } from 'react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import OrganizationCard from '@/components/organization/OrganizationCard';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/organizations')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load organizations');
        return data;
      })
      .then((data) => setOrganizations(data.organizations || []))
      .catch((err) => setError(err.message || 'Failed to load organizations'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        <h1 className="text-3xl font-bold text-white">Organizations</h1>
        <p className="mt-2 text-zinc-400">Browse photography organizations and explore the photographers in each team.</p>

        {loading ? <div className="py-10 text-center text-zinc-400">Loading organizations...</div> : null}
        {error ? <div className="mt-6 rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!loading && !error ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {organizations.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
