import React from 'react';

interface NavbarProps {
  onInstallApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onInstallApp }) => {
  return (
    <nav className="sticky top-0 z-50 bg-luxury-950/90 backdrop-blur-xl border-b border-gold-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0 flex items-center gap-4">
            {/* Premium Monogram Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center group">
               {/* Deeper borders for focus */}
               <div className="absolute inset-0 border border-gold-500/50 rotate-45 transition-transform duration-700 group-hover:rotate-90"></div>
               <div className="absolute inset-0 border border-gold-500/50 -rotate-45 transition-transform duration-700 group-hover:-rotate-90"></div>
               <span className="text-gold-400 font-serif font-bold text-sm italic relative z-10 drop-shadow-md">Sg</span>
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-2xl tracking-wide text-gradient-gold flex items-baseline gap-1 filter drop-shadow-lg leading-none">
                Sg16<span className="text-gold-500 text-xs align-top opacity-50">™</span>
              </span>
              <span className="text-gold-200/50 font-sans font-medium text-[8px] tracking-[0.3em] uppercase pl-0.5">
                Intelligent Capital
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Install Button - Visible only if prompt is available */}
            {onInstallApp && (
              <button 
                onClick={onInstallApp}
                className="hidden sm:flex items-center gap-2 bg-gold-600/10 hover:bg-gold-600/20 border border-gold-600/30 text-gold-400 px-4 py-2 rounded-full transition-all text-[10px] uppercase tracking-widest font-bold"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Install App
              </button>
            )}

            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-gold-600 tracking-[0.2em] uppercase mb-1 font-bold">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-gray-500 text-xs font-mono uppercase">AI Neural Net Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};