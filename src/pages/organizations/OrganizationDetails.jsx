import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PhotographerCard from '@/components/organization/PhotographerCard';

export default function OrganizationDetails() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/organizations/${id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Failed to load organization');
        return data;
      })
      .then((data) => {
        setOrganization(data.organization || null);
        setPhotographers(data.photographers || []);
      })
      .catch((err) => setError(err.message || 'Failed to load organization'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-12 md:px-10">
        {loading ? <div className="py-10 text-center text-zinc-400">Loading organization...</div> : null}
        {error ? <div className="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div> : null}
        {!loading && !error && organization ? (
          <>
            <section className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
              <h1 className="text-3xl font-bold text-white">{organization.name}</h1>
              <p className="mt-2 text-zinc-400">{organization.location || 'Location unavailable'}</p>
              <p className="mt-2 text-sm text-zinc-500">
                {organization.photographer_count} photographer{organization.photographer_count === 1 ? '' : 's'}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">Photographers</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {photographers.map((photographer) => (
                  <PhotographerCard
                    key={photographer.id}
                    photographer={photographer}
                    organizationName={organization.name}
                  />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
