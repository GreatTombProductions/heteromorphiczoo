"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminNav from "@/components/admin/AdminNav";
import "./admin.css";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-email">{session.user?.email}</span>
          <button
            className="admin-topbar-signout"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Sign out
          </button>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminGuard>{children}</AdminGuard>
    </SessionProvider>
  );
}
