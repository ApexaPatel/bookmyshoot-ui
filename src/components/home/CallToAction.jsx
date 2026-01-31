import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 -skew-y-3 -translate-y-6"></div>
      
      <div className="relative container mx-auto px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6">
            <Camera className="w-8 h-8" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to capture your perfect moment?
          </h2>
          
          <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who found their perfect photographer through BookMyShoot.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg h-14 px-8 rounded-xl flex items-center space-x-2 group"
              size="lg"
            >
              <span>Find Your Photographer</span>
              <svg 
                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-zinc-600 hover:bg-zinc-800/50 text-white text-lg h-14 px-8 rounded-xl"
              size="lg"
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-zinc-400 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-700"></div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-700"></div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
              <span>100% satisfaction guaranteed</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 left-0 w-48 h-48 bg-purple-600/20 rounded-full filter blur-3xl -z-10"></div>
    </section>
  );
};

export default CallToAction;
