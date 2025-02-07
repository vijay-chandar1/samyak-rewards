'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Menu } from 'lucide-react';
import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { Button } from '@/components/ui/button';

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b-[1px] bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container flex h-14 w-screen items-center justify-between px-4">
          {/* Logo Section */}
          <NavigationMenuItem className="flex items-center">
            <a
              rel="noreferrer noopener"
              href="/"
              className="flex items-center gap-2"
            >
              <Image
                src="/backup-stl-logo.svg"
                alt="Samyak Tech Labs Logo"
                width={40}
                height={40}
                className="dark:brightness-150"
              />
              <span className="hidden text-lg font-bold sm:block">
                Samyak Tech Labs
              </span>
              <span className="text-lg font-bold sm:hidden">STL</span>
            </a>
          </NavigationMenuItem>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {routeList.map(({ href, label }) => (
              <a
                rel="noreferrer noopener"
                href={href}
                key={label}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right Section - Desktop */}
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            <Link href="/signin">
              <Button className="w-[120px] bg-blue-600 font-medium text-gray-100 transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="h-5 w-5"
                  onClick={() => setIsOpen(true)}
                  aria-hidden="true"
                />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] sm:w-[340px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <Image
                      src="/backup-stl-logo.svg"
                      alt="Samyak Tech Labs Logo"
                      width={40}
                      height={40}
                      className="dark:brightness-150"
                    />
                    <span className="text-lg font-bold">Samyak Tech Labs</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col items-start gap-6">
                  {routeList.map(({ href, label }) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </a>
                  ))}
                  <Link 
                    href="/signin" 
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button className="w-full bg-blue-600 font-medium text-gray-100 transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                      Get Started
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};