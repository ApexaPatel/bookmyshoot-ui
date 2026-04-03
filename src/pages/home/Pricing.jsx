import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingPlansSection from '@/components/billing/PricingPlansSection';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Pricing() {
  const { user } = useAuth();
  if (user?.role !== 'photographer') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 py-16 md:px-10">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-300">Pricing</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Choose the photographer plan that fits your portfolio growth
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Compare Free, Pro, and Premium plans by photoshoot limits, gallery capacity, and monthly pricing.
          </p>
        </div>

        <PricingPlansSection />
      </main>
      <Footer />
    </div>
  );
}
