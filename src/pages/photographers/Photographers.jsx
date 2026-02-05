import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

/**
 * Photographers (Explore) page – PUBLIC.
 * No auth required; anyone can browse. Header still reflects login state.
 */
const Photographers = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Photographers</h1>
        <p className="text-zinc-400 mb-8">
          Browse and discover photographers. No login required.
        </p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          Photographer listings will appear here.
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Photographers;
