import { Link, useLocation } from "wouter";
import { Image, FileText, Menu, X, Github } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ToggleSwitch from "@/components/ToggleSwitch";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Image Editor", icon: Image },
    { href: "/pdf", label: "PDF Tools", icon: FileText },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:inline-block">
            Scribble
          </span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>
        {/* right-side controls (menu toggle, links, icon, theme) */}{" "}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-4">
            {/* 1. GitHub Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/AbinayaPandey" // <-- your github page here
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5" />
              </a>
            </Button>

            {/* 2. Theme Changer Icon */}
            <ToggleSwitch />

            {/* 3. Custom SVG Icon (Login) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-5 h-5 text-muted-foreground fill-current hover:text-foreground cursor-pointer transition-colors"
            >
              <path d="m407 81 10 9 4 4 19 22 1 2a233 233 0 0 1-22 302l-2 2-17 15-3 2a230 230 0 0 1-303-18l-5-4-17-21-1-2a234 234 0 0 1-5-270l1-2q11-15 23-27l5-5q9-10 21-18l2-1c82-62 200-61 289 10m-265 7-3 2q-27 19-46 45l-2 3a206 206 0 0 0-5 229l3 4 2 3 1 2 8 9v-3q1-26 21-43 35-26 75-41 13-4 19-15 3-10-2-18l-7-10c-23-30-37-67-32-106q4-33 28-56 33-22 71-17 33 6 53 34 5 8 8 18l1 2q5 17 4 34v2q0 45-28 82c-12 15-12 15-14 34q3 10 12 14l25 11c26 10 59 24 73 51q4 13 5 27c28-26 41-71 46-107v-3l1-9v-2c2-43-10-87-35-122l-2-3q-52-70-139-84c-48-7-101 5-141 33" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2 animate-in slide-in-from-top-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </div>
              </Link>
            );
          })}
          {isOpen && (
            <div className="md:hidden …">
              {links.map(/* … */)}

              {/* mobile GitHub entry */}
              <a
                href="https://github.com/AbinayaPandey"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)} // close menu
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
