import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Star, Users, Camera } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl

" data-aos="fade-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find the Perfect Photographer for Your Special Moments
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
              Discover, compare, and book verified professional photographers across India. 
              Capture your memories beautifully with the perfect photographer for every occasion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg h-14 px-8 rounded-xl" size="lg">
                Find Photographers
              </Button>
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800 text-lg h-14 px-8 rounded-xl" size="lg">
                Join as Photographer
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-800"></div>
                  ))}
                </div>
                <span>500+ Photographers</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full mr-2">
                  <Star className="w-4 h-4 mr-1" />
                  <span>4.9</span>
                </div>
                <span>Average Rating</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-emerald-400" />
                <span>10K+ Happy Customers</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image Collage */}
          <div className="relative h-[500px]" data-aos="fade-left">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl blur-3xl -z-10"></div>
            
            <div className="relative h-full">
              {/* Main Image */}
              <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1503185912274-9f06e82be2aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Wedding photography"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>
              
              {/* Small Image 1 */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80" 
                  alt="Portrait photography"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Small Image 2 */}
              <div className="absolute bottom-1/3 right-0 w-1/3 h-1/3 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Corporate event photography"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-600/20 rounded-full filter blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
