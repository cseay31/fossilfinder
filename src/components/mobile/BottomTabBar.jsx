import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Camera, Search, TrendingUp, User } from 'lucide-react';

// Tab-specific history stacks
const tabHistoryStacks = {
  'Dashboard': [],
  'Upload': [],
  'FosFeed': [],
  'Profile': []
};

export default function BottomTabBar({ isDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const previousTab = useRef(null);
  
  const tabs = [
    { name: 'Dashboard', icon: Search, path: createPageUrl('Dashboard'), basePath: '/Dashboard' },
    { name: 'Upload', icon: Camera, path: createPageUrl('Upload'), basePath: '/Upload' },
    { name: 'FosFeed', icon: TrendingUp, path: createPageUrl('FosFeed'), basePath: '/FosFeed' },
    { name: 'Profile', icon: User, path: createPageUrl('Profile'), basePath: '/Profile' }
  ];

  // Determine which tab the current location belongs to
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.startsWith('/DiscoveryDetail') || path === '/Dashboard') return 'Dashboard';
    if (path === '/Upload') return 'Upload';
    if (path === '/FosFeed') return 'FosFeed';
    if (path === '/Profile') return 'Profile';
    if (path.startsWith('/ForumPost')) return 'Dashboard'; // Forum posts belong to Dashboard stack
    if (path.startsWith('/WikiArticle')) return 'Dashboard'; // Wiki articles belong to Dashboard stack
    return null;
  };

  // Track navigation history for each tab
  useEffect(() => {
    const currentTab = getCurrentTab();
    if (currentTab && currentTab !== previousTab.current) {
      previousTab.current = currentTab;
    }
    
    // Store current path in the active tab's history
    if (currentTab) {
      const stack = tabHistoryStacks[currentTab];
      if (stack[stack.length - 1] !== location.pathname) {
        stack.push(location.pathname);
        // Keep stack size reasonable
        if (stack.length > 10) stack.shift();
      }
    }
  }, [location]);

  const isActive = (tabName) => {
    const currentTab = getCurrentTab();
    return currentTab === tabName;
  };
  
  const handleTabClick = (e, tab) => {
    e.preventDefault();
    const currentTab = getCurrentTab();
    
    // If already on this tab, navigate to root of that tab
    if (currentTab === tab.name) {
      navigate(tab.path, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Clear the tab's history stack except the root
      tabHistoryStacks[tab.name] = [tab.basePath];
    } else {
      // Switching tabs - restore last state or go to root
      const stack = tabHistoryStacks[tab.name];
      const lastPath = stack.length > 0 ? stack[stack.length - 1] : tab.basePath;
      navigate(lastPath);
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
          
          const active = isActive(tab.name);
          
          return (
            <button
              key={tab.name}
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
            </button>
          );
        })}
      </div>
    </div>
  );
}