import React from 'react';
import { Star, StarHalf, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Bride',
    event: 'Wedding',
    rating: 5,
    content: 'The photographer captured our wedding day perfectly! The photos are absolutely stunning and bring back all the beautiful memories. Highly recommend!',
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    role: 'Groom',
    event: 'Pre-Wedding',
    rating: 4.5,
    content: 'Amazing experience! The photographer made us feel so comfortable during our pre-wedding shoot. The pictures came out better than we could have imagined.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    name: 'Ananya Patel',
    role: 'Marketing Director',
    event: 'Corporate Event',
    rating: 5,
    content: 'We hired a photographer for our annual conference and the results were outstanding. Professional, punctual, and high-quality work. Will definitely book again!',
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Portrait Client',
    event: 'Family Portrait',
    rating: 5,
    content: 'The family portraits turned out amazing! The photographer was great with our kids and managed to get the perfect shots even with their endless energy.',
    image: 'https://randomuser.me/api/portraits/men/75.jpg'
  }
];

const Testimonials = () => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-5 h-5 text-amber-400 fill-current" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 text-amber-400 fill-current" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-zinc-600" />);
    }
    
    return stars;
  };

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about their experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
              data-aos="fade-up"
              data-aos-delay={testimonial.id * 50}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <img 
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/30" 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-medium">{testimonial.name}</h4>
                  <p className="text-zinc-400 text-sm">{testimonial.role} • {testimonial.event}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                <div className="flex">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="ml-2 text-sm text-zinc-500">{testimonial.rating}</span>
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 text-zinc-800 w-6 h-6" />
                <p className="text-zinc-300 relative z-10">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-6 py-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>
            <span className="text-white font-medium">4.9/5</span>
            <span className="text-zinc-400 text-sm">based on 1,200+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
