"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-auto self-center"
            />
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/participer"
              className="text-white px-5 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: '#00B377' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#008F5A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00B377'}
            >
              Participer
            </Link>
            <Link
              href="/signin"
              className="px-3 py-2 rounded-sm border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Accès admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <div className="px-4 py-3 gap-2 flex flex-col">
              <Link
                href="/participer"
                className="flex-1 text-white px-4 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-center"
                style={{ backgroundColor: '#00B377' }}
                onClick={() => setIsOpen(false)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#008F5A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00B377'}
              >
                Participer
              </Link>
              <Link
                href="/signin"
                className="flex-1 px-4 py-2 rounded-sm border border-border text-sm font-medium text-center text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Accès admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
