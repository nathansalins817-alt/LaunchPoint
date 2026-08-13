import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Discover",
    links: [
      { href: "/discover", label: "Opportunities" },
      { href: "/categories", label: "Categories" },
      { href: "/deadlines", label: "Deadlines" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "About" },
      { href: "/submit", label: "Submit an Opportunity" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign In" },
      { href: "/sign-up", label: "Create Account" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Helping students find their next opportunity.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <p>© 2026 LaunchPoint. Helping students find their next opportunity.</p>
        </div>
      </div>
    </footer>
  );
}
