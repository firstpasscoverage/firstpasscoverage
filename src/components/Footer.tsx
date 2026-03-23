import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.08]">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} First Pass Coverage
        </span>
        <div className="flex gap-5">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
