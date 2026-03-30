"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/samples", label: "Samples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID;

  return (
    <nav className="border-b border-black/[0.08]">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Brand */}
        <Link
          href="/"
          className="font-brand text-[24px] sm:text-[31px] text-[#111] tracking-[-0.3px] hover:opacity-70 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          First Pass Coverage
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] transition-colors ${
                pathname === href
                  ? "text-[#111] font-medium"
                  : "text-gray-500 hover:text-[#111]"
              }`}
            >
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/samples"
              className={`text-[13px] transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-[#111] font-medium"
                  : "text-amber-600 hover:text-amber-800"
              }`}
            >
              Admin
            </Link>
          )}
          <Link
            href="/coverage"
            className="px-[18px] py-[7px] bg-[#111] text-[#fafafa] text-[13px] rounded-md hover:bg-[#333] transition-colors"
          >
            Get Coverage
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 ${
              menuOpen ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[1.5px] bg-[#111] transition-all duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/[0.08] bg-[#fafafa]">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-[15px] transition-colors ${
                  pathname === href
                    ? "text-[#111] font-medium"
                    : "text-gray-500 hover:text-[#111]"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/samples"
                onClick={() => setMenuOpen(false)}
                className={`text-[15px] transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-[#111] font-medium"
                    : "text-amber-600 hover:text-amber-800"
                }`}
              >
                Admin
              </Link>
            )}
            <Link
              href="/coverage"
              onClick={() => setMenuOpen(false)}
              className="inline-block text-center px-[18px] py-[10px] bg-[#111] text-[#fafafa] text-[15px] rounded-md hover:bg-[#333] transition-colors mt-1"
            >
              Get Coverage
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
