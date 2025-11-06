
import React from 'react';

const AtomIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <path d="M20.2 20.2c2.04-2.03.02-5.91-2.81-8.74s-6.7-4.85-8.74-2.81"></path>
        <path d="M3.8 3.8c-2.04 2.03-.02 5.91 2.81 8.74s6.7 4.85 8.74 2.81"></path>
        <path d="M3.8 20.2c2.03-2.04 5.91-.02 8.74-2.81s4.85-6.7 2.81-8.74"></path>
        <path d="M20.2 3.8c-2.03 2.04-5.91.02-8.74 2.81s-4.85 6.7-2.81 8.74"></path>
    </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4 shadow-lg flex items-center justify-center z-10">
        <AtomIcon className="w-8 h-8 text-cyan-400 mr-3 animate-spin-slow" />
        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Sabedoria Quântica Chatbot
        </h1>
    </header>
  );
};
