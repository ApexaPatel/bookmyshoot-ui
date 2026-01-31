import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Components
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import EventTypes from '@/components/home/EventTypes';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import Footer from '@/components/layout/Footer';

const Home = () => {
  useEffect(() => {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main>
        <Hero />
        <EventTypes />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
