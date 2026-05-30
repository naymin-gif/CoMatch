'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Bell, User } from 'lucide-react';

export default function NavigationBar() {
  const pathname = usePathname();

  // Define the routes based on your mockups
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Alerts', href: '/alerts', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Hide the navigation bar on authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white/80 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-blue-600 bg-blue-100/50 scale-110' 
                : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}