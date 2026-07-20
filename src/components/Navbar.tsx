"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "./LoginModal";

const NAV_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Studio", href: "/studio" },
  { label: "Academy", href: "/academy" },
  { label: "Read", href: "/read" },
  { label: "About", href: "/#about" },
  { label: "Support", href: "/#support" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Auth state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll state for premium header effect
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  return (
    <>
    <nav className={`nav-animate fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
      scrolled 
        ? "bg-[#0D0D0D]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-1" 
        : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent py-3"
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/ic_logo.png"
            alt="Don't Skip Humanity"
            width={180}
            height={52}
            className={`w-auto transition-all duration-500 ${scrolled ? 'h-7 sm:h-8 lg:h-9' : 'h-8 sm:h-10 lg:h-11'}`}
            priority
          />
        </Link>

        {/* Desktop Nav — centered */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] tracking-wide text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side — Auth & Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isLoggedIn ? (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-sm font-medium text-white border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors"
            >
              Log in
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#9B59B6] to-[#1ABC9C] border-2 border-transparent hover:border-white/50 transition-all focus:outline-none"
              >
                <span className="text-white text-xs sm:text-sm font-bold">JD</span>
              </button>

              {/* Avatar Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-sm font-medium text-white">John Doe</p>
                    <p className="text-xs text-gray-500">john@example.com</p>
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/academy" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                    Academy
                  </Link>
                  <Link href="/courses" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                    My Courses
                  </Link>
                  <div className="h-px bg-white/5 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#E74C3C] hover:bg-white/5 transition-colors">
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/expanded menu */}
      {menuOpen && (
        <div className="bg-[#0D0D0D]/98 backdrop-blur-md border-t border-white/5 px-5 sm:px-8 py-5 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-gray-300 hover:text-white transition-colors py-2.5 text-sm border-b border-white/5 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
    />
    </>
  );
}
