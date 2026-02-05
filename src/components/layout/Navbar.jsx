import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur overflow-x-hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-10 min-w-0">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <span className="text-xl font-bold text-white">BookMyShoot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 min-w-0">
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
          <Link to="/photographers" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            Photographers
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors shrink-0">
            About
          </Link>
        </nav>

        {/* Right: Auth or User menu */}
        <div className="flex items-center gap-2 shrink-0">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" className="text-white hover:bg-zinc-800 hidden sm:inline-flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="ghost" className="text-white hover:bg-zinc-800 hidden sm:inline-flex" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                <Link to="/photographers">Find Photographer</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full overflow-hidden h-9 w-9 flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Profile menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer focus:bg-zinc-800 focus:text-white">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-zinc-800 focus:text-white text-red-400 focus:text-red-400"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
