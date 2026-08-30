import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FACTS = [
  {
    prefix: 'Indian Railways operates',
    highlight: '13,000+ Trains',
    desc: 'connecting more than 7,300 stations across India daily.',
    image: '/images/heritage_station.jpg'
  },
  {
    prefix: 'World\'s highest railway bridge is the',
    highlight: 'Chenab Bridge',
    desc: 'standing at 359 metres above the river bed in J&K.',
    image: '/images/hero_train.jpg'
  },
  {
    prefix: 'Fastest indigenous train is',
    highlight: 'Vande Bharat',
    desc: 'capable of reaching operational speeds up to 160 km/h.',
    image: '/images/hero_train.jpg'
  },
  {
    prefix: 'The longest train route is',
    highlight: 'Vivek Express',
    desc: 'covering 4,189 km from Dibrugarh to Kanyakumari.',
    image: '/images/heritage_station.jpg'
  }
];

export default function DidYouKnow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % FACTS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + FACTS.length) % FACTS.length);
  };

  const currentFact = FACTS[currentIndex];

  return (
    <div className="bg-[var(--rail-bg-card)] rounded-2xl border border-[var(--rail-border)] shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-[var(--rail-warning)]" />
          <h3 className="font-bold text-[var(--rail-charcoal)] text-xs uppercase tracking-wider">Did You Know?</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 text-gray-400 hover:text-[var(--rail-charcoal)] rounded-md hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
            aria-label="Previous fact"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 text-gray-400 hover:text-[var(--rail-charcoal)] rounded-md hover:bg-[var(--rail-bg-secondary)] transition-colors cursor-pointer"
            aria-label="Next fact"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 pt-1 relative min-h-[110px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <p className="text-[11px] text-gray-500 font-medium mb-0.5">{currentFact.prefix}</p>
            <p className="text-lg font-black text-[var(--rail-maroon)] mb-1 leading-tight">{currentFact.highlight}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-snug w-3/4">
              {currentFact.desc}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <img 
          src={currentFact.image} 
          alt="Indian Railways Heritage" 
          className="absolute right-[-15px] bottom-0 w-[120px] h-[90px] object-cover rounded-tl-[32px] shadow-sm mix-blend-multiply dark:mix-blend-lighten opacity-80 pointer-events-none"
        />
      </div>
      
      {/* Interactive Pagination Dots */}
      <div className="px-4 pb-3 pt-1 flex items-center gap-1.5 z-10">
        {FACTS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-4 bg-[var(--rail-maroon)]' : 'w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
            }`}
            aria-label={`Go to fact ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
