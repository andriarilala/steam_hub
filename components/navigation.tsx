"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/lib/auth-context";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, signOut, user } = useAuth();
  const isYouth = user?.role === "youth";

  const navItems = [
    { href: "/", label: "nav.home" },
    { href: "/story", label: "nav.story" },
    { href: "/event", label: "nav.event" },
    { href: "/events", label: "nav.events" },
    { href: "/agenda", label: "nav.agenda" },
    { href: "/partners", label: "nav.partners" },
    { href: "/community", label: "nav.community" },
    { href: "/media", label: "nav.media" },
  ];

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />
            {isYouth && (
              <Link
                href="/my-tickets"
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                🎫 Mes billets
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => signOut()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t("dashboard.signOut")}
              </button>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
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
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                {t(item.label)}
              </Link>
            ))}
            <div className="px-4 py-3 gap-2 flex flex-col">
              <LanguageSwitcher />
              {isYouth && (
                <Link
                  href="/my-tickets"
                  className="flex-1 text-sm font-medium border border-primary text-primary px-4 py-2 rounded-sm hover:bg-primary/5 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  🎫 Mes billets
                </Link>
              )}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-sm font-medium hover:opacity-90 transition-opacity text-center"
                >
                  {t("dashboard.signOut")}
                </button>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="flex-1 text-sm font-medium border border-primary text-primary px-4 py-2 rounded-sm hover:bg-primary/5 transition-colors text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("nav.signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-sm font-medium hover:opacity-90 transition-opacity text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
