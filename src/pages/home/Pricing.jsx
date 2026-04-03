import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PricingPlansSection from '@/components/billing/PricingPlansSection';
import DemoCheckoutModal from '@/components/billing/DemoCheckoutModal';
import { useAuth } from '@/context/AuthContext';

export default function Pricing() {
  const { user, refreshUser, token } = useAuth();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoPlan, setDemoPlan] = useState('pro');

  if (user?.role !== 'photographer') {
    return <Navigate to="/profile" replace />;
  }

  const openDemo = (planCode) => {
    setDemoPlan(planCode);
    setDemoOpen(true);
  };

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
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-amber-400/90">
            Demo billing — upgrades use a simulated checkout only
          </p>
        </div>

        <PricingPlansSection
          currentPlanCode={user?.photographerPlan ?? 'free'}
          showCurrentPlan
          onUpgrade={openDemo}
        />
      </main>
      <Footer />
      <DemoCheckoutModal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        planCode={demoPlan}
        userName={user?.name}
        userEmail={user?.email}
        token={token}
        onPaidSuccess={async () => {
          await refreshUser();
          navigate('/portfolio');
        }}
      />
    </div>
  );
}
