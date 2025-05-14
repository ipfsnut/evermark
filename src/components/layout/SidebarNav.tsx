import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusIcon, 
  BookmarkIcon, 
  UserIcon, 
  BookOpenIcon,
  XIcon
} from 'lucide-react';

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const navigation = [
    { name: 'Browse', href: '/', icon: HomeIcon },
    { name: 'Create', href: '/create', icon: PlusIcon },
    { name: 'My Evermarks', href: '/my-evermarks', icon: BookmarkIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];
  
  return (
    <>
      {/* Desktop sidebar - always visible on md+ screens */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:z-10 md:w-64">
        <div className="h-full bg-wood-texture border-r border-wood-light flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-center flex-shrink-0 px-4 h-16 bg-wood-dark border-b border-wood-light">
            <Link to="/" className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-brass" />
              <h1 className="ml-2 text-xl font-serif font-bold text-parchment-light">
                Evermark
              </h1>
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="px-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-wood-light text-parchment'
                      : 'text-parchment-light hover:bg-wood-dark hover:text-parchment'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar - only visible when isOpen is true */}
      <div className={`md:hidden fixed inset-0 z-40 ${isOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-ink-dark bg-opacity-75" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-wood-grain shadow-xl">
          <div className="h-full flex flex-col py-6 bg-wood bg-opacity-95">
            {/* Close button and logo */}
            <div className="px-4 flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <BookOpenIcon className="h-8 w-8 text-brass" />
                <h1 className="ml-2 text-xl font-serif font-bold text-parchment-light">
                  Evermark
                </h1>
              </Link>
              <button
                type="button"
                className="text-parchment-light hover:text-parchment focus:outline-none"
                onClick={onClose}
              >
                <XIcon className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex-1 px-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-wood-light text-parchment'
                        : 'text-parchment-light hover:bg-wood hover:text-parchment'
                    }`}
                    onClick={onClose}
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
