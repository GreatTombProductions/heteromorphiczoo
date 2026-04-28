"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "\u25A3" },
  { href: "/admin/offerings", label: "Offerings", icon: "\u2726" },
  { href: "/admin/reactions", label: "Reactions", icon: "\u25B6" },
  { href: "/admin/chronicle", label: "Chronicle", icon: "\u270E" },
  { href: "/admin/fans", label: "Fans", icon: "\u2606" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav">
      <div className="admin-nav-title">HZ Admin</div>
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link ${isActive ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
