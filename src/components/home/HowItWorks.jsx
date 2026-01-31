import React from 'react';
import { Search, UserCheck, CalendarCheck, Camera, CheckCircle } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Search & Discover',
    description: 'Browse through our curated list of professional photographers and filter by style, location, and budget.',
    icon: <Search className="w-8 h-8 text-indigo-500" />,
  },
  {
    id: 2,
    title: 'Compare Portfolios',
    description: 'View photographer profiles, portfolios, and reviews to find the perfect match for your needs.',
    icon: <UserCheck className="w-8 h-8 text-indigo-500" />,
  },
  {
    id: 3,
    title: 'Book & Pay Securely',
    description: 'Select your preferred photographer, choose a package, and book with our secure payment system.',
    icon: <CalendarCheck className="w-8 h-8 text-indigo-500" />,
  },
  {
    id: 4,
    title: 'Capture Your Moment',
    description: 'Enjoy your photoshoot and receive professionally edited photos in your preferred format.',
    icon: <Camera className="w-8 h-8 text-indigo-500" />,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-zinc-900">
      <div className="container mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Booking your perfect photographer is quick and easy with our simple 4-step process
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/20 via-indigo-500/50 to-indigo-500/20 -ml-px"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-y-20">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`relative group ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:ml-auto lg:text-left lg:mt-20'}`}
                data-aos={index % 2 === 0 ? 'fade-right' : 'fade-left'}
                data-aos-delay={index * 100}
              >
                {/* Step indicator */}
                <div className="hidden lg:flex absolute top-0 left-1/2 -ml-5 w-10 h-10 rounded-full bg-zinc-800 border-2 border-indigo-500 items-center justify-center text-indigo-400 font-bold z-10 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {step.id}
                </div>
                
                <div className="relative p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/80 mb-4 ${index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-zinc-400">{step.description}</p>
                  
                  {/* Mobile step indicator */}
                  <div className="lg:hidden absolute -top-5 left-6 w-10 h-10 rounded-full bg-zinc-800 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 font-bold z-10">
                    {step.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 max-w-3xl mx-auto">
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to book your perfect photographer?</h3>
              <p className="text-zinc-400 mb-4">Join thousands of happy customers who found their perfect photographer through us</p>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
