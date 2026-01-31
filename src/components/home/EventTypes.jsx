import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const eventTypes = [
  {
    id: 1,
    name: 'Wedding',
    description: 'Capture your special day with our professional wedding photographers',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '👰',
    href: '/events/wedding'
  },
  {
    id: 2,
    name: 'Pre-Wedding',
    description: 'Romantic pre-wedding photoshoots to celebrate your love story',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '💑',
    href: '/events/pre-wedding'
  },
  {
    id: 3,
    name: 'Portrait',
    description: 'Professional portraits for individuals, couples, and families',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '📸',
    href: '/events/portrait'
  },
  {
    id: 4,
    name: 'Corporate',
    description: 'Professional photography for your business events and headshots',
    image: 'https://images.unsplash.com/photo-1522071820081-009c01201c0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '💼',
    href: '/events/corporate'
  },
  {
    id: 5,
    name: 'Fashion',
    description: 'High-fashion photography for models and brands',
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '👗',
    href: '/events/fashion'
  },
  {
    id: 6,
    name: 'Product',
    description: 'Showcase your products with professional product photography',
    image: 'https://images.unsplash.com/photo-1602143407151-a06ef5f87372?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    icon: '📦',
    href: '/events/product'
  }
];

const EventTypes = () => {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore by Event Type</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Find the perfect photographer for any occasion. Each professional is vetted for quality and style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((event) => (
            <Link to={event.href} key={event.id} className="group">
              <Card className="h-full bg-zinc-900/50 border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 group-hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center text-2xl">
                    {event.icon}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                  <p className="text-zinc-400 text-sm">{event.description}</p>
                  <div className="mt-4 flex items-center text-sm text-indigo-400 font-medium">
                    Explore photographers
                    <svg 
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="px-6 py-3 rounded-full border border-zinc-700 text-white hover:bg-zinc-800/50 transition-colors text-sm font-medium">
            View All Event Types
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventTypes;
