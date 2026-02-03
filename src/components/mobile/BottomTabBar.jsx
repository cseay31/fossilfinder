import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, Search, TrendingUp, User } from 'lucide-react';

export default function BottomTabBar({ isDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { name: 'Dashboard', icon: Search, path: createPageUrl('Dashboard') },
    { name: 'Upload', icon: Camera, path: createPageUrl('Upload') },
    { name: 'FosFeed', icon: TrendingUp, path: createPageUrl('FosFeed') },
    { name: 'Profile', icon: User, path: createPageUrl('Profile') }
  ];

  const isActive = (path) => location.pathname === path;
  
  const handleTabClick = (e, tab) => {
    // If already on this tab, navigate to root
    if (isActive(tab.path)) {
      e.preventDefault();
      navigate(tab.path, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${
        isDarkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-stone-200'
      } backdrop-blur-xl border-t safe-area-bottom`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={(e) => handleTabClick(e, tab)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                active
                  ? isDarkMode
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-amber-100 text-amber-700'
                  : isDarkMode
                    ? 'text-slate-400'
                    : 'text-stone-600'
              }`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
            >
              <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}