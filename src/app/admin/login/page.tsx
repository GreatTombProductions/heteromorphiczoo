"use client";

import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1 className="admin-login-title">HZ Admin</h1>
        <p className="admin-login-subtitle">
          Sign in with your greattombproductions.com account
        </p>
        <button
          className="admin-login-btn"
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
