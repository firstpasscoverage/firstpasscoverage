"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/samples", label: "Samples" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/[0.08]">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-brand text-[31px] text-[#111] tracking-[-0.3px] hover:opacity-70 transition-opacity"
        >
          First Pass Coverage
        </Link>

        <div className="flex items-center gap-7">
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
          <Link
            href="/coverage"
            className="px-[18px] py-[7px] bg-[#111] text-[#fafafa] text-[13px] rounded-md hover:bg-[#333] transition-colors"
          >
            Get Coverage
          </Link>
        </div>
      </div>
    </nav>
  );
}
