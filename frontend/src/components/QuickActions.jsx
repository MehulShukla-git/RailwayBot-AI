import React from 'react';
import { Train, Info, MapPin, Calendar, Route, Ticket } from 'lucide-react';

export default function QuickActions({ onActionSelect }) {
  const actions = [
    {
      id: 'search',
      label: 'Search Train',
      icon: Train,
      color: 'text-[#C7862B]',
      bg: 'bg-[#C7862B]/10',
      prompt: 'Show trains from Mumbai to Delhi'
    },
    {
      id: 'details',
      label: 'Train Details',
      icon: Info,
      color: 'text-[#2E7D5B]',
      bg: 'bg-[#2E7D5B]/10',
      prompt: 'Tell me about train 12951'
    },
    {
      id: 'station',
      label: 'Station Info',
      icon: MapPin,
      color: 'text-[#2E7D5B]',
      bg: 'bg-[#2E7D5B]/10',
      prompt: 'Tell me about Nagpur'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      color: 'text-[#5A67D8]',
      bg: 'bg-[#5A67D8]/10',
      prompt: 'Show schedule of train 12951'
    },
    {
      id: 'route',
      label: 'Route Search',
      icon: Route,
      color: 'text-[#C7862B]',
      bg: 'bg-[#C7862B]/10',
      prompt: 'Show trains from Mumbai to Delhi'
    },
    {
      id: 'pnr',
      label: 'PNR Status',
      icon: Ticket,
      color: 'text-[#7A1F2B]',
      bg: 'bg-[#7A1F2B]/10',
      prompt: 'Check PNR 4820194852'
    }
  ];

  return (
    <div className="bg-transparent">
      <h3 className="font-bold text-[var(--rail-charcoal)] text-[15px] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionSelect && onActionSelect(action.prompt)}
              className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-white border border-[var(--rail-border)] shadow-sm hover:border-[var(--rail-maroon)] hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg} transition-transform group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-xs font-bold text-[var(--rail-charcoal)] text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
