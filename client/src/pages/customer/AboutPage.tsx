import React from 'react';
import { Award, CheckCircle2, Heart, Sparkles, Star, Users } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  const team = [
    {
      name: 'Aashmi Sharma',
      role: 'Founder & Master Stylist',
      bio: 'Certified by international beauty academies with over 12 years of hands-on experience in bridal aesthetics and skin restoration.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Priya Verma',
      role: 'Senior Hair & Makeup Artist',
      bio: 'Specialist in HD bridal looks, balayage, and restorative keratin hair treatments.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Neha Singh',
      role: 'Skin & Nail Aesthetician',
      bio: 'Expert in soothing botanical facials, micro-crystal cleanups, and luxury spa pedicures.',
      image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero / Mission */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Our Heritage & Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Where Elegance Meets Personalized Care
        </h1>
        <p className="text-base text-charcoal-600 font-light leading-relaxed">
          Founded with a mission to bring world-class salon luxury, sterile hygiene, and comforting personalized care to our local community.
        </p>
      </div>

      {/* Story & Founder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 relative">
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
              alt="Aashmi Sharma Founder"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-lg border border-rosegold-100 max-w-xs">
            <p className="font-serif font-bold text-charcoal-900 text-lg">Aashmi Sharma</p>
            <p className="text-xs text-rosegold-600 font-semibold">Founder & Creative Director</p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
              The Parlour Story
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              A Passion Born from Pure Artistry
            </h2>
          </div>

          <p className="text-sm sm:text-base text-charcoal-700 font-light leading-relaxed">
            {settings.parlour_name} was created out of a simple belief: every woman deserves a warm, peaceful space where her individual beauty is celebrated with respect, artistic precision, and uncompromised hygiene.
          </p>

          <p className="text-sm sm:text-base text-charcoal-700 font-light leading-relaxed">
            What started as a boutique beauty studio has grown into a cherished destination for brides, professionals, and homemakers alike. We stay continuously updated with international makeup techniques and skin rejuvenation therapies while retaining the warm, personal touch our clients know and love.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-200">
            <div className="space-y-1">
              <span className="font-serif text-3xl font-bold text-rosegold-700">10,000+</span>
              <p className="text-xs text-charcoal-500">Treatments Performed</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl font-bold text-rosegold-700">100%</span>
              <p className="text-xs text-charcoal-500">Sterilized & Disinfected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Artists */}
      <div className="space-y-10 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
            Dedicated Specialists
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900">Meet Our Master Stylists</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl overflow-hidden shadow-soft border border-rosegold-100 flex flex-col group"
            >
              <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">{member.name}</h3>
                  <span className="text-xs font-semibold text-rosegold-600 block mb-2">{member.role}</span>
                  <p className="text-xs text-charcoal-600 leading-relaxed font-light">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
