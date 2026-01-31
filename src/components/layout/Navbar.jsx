import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-6 md:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white">BookMyShoot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-white hover:bg-zinc-800">
                  Events
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 min-w-[200px]">
                  <div className="grid gap-1 p-2">
                    <NavigationMenuLink asChild>
                      <Link
                        to="/events/wedding"
                        className="flex items-center px-4 py-2 rounded-md hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        👰 Wedding
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/events/pre-wedding"
                        className="flex items-center px-4 py-2 rounded-md hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        💑 Pre-Wedding
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/events/portrait"
                        className="flex items-center px-4 py-2 rounded-md hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        📸 Portrait
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/events/corporate"
                        className="flex items-center px-4 py-2 rounded-md hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        💼 Corporate
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Link to="/photographers" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Photographers
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-zinc-800" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
            <Link to="/find-photographer">Find Photographer</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
