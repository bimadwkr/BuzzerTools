'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquareText, History, Bookmark, Sliders, Settings, Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Generator', href: '/', icon: MessageSquareText },
    { name: 'History', href: '/history', icon: History },
    { name: 'Favorites', href: '/favorites', icon: Bookmark },
    { name: 'Presets', href: '/presets', icon: Sliders },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">Buzzer Tools</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                AI Comments
              </span>
            </div>
          </div>
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
