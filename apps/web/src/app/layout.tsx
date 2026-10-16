import type { ReactNode } from "react";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";
import "./globals.css";

export const metadata = {
  title: "NYSC Radio & TV",
  description: "Live radio, television, and programmes from NYSC.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FirebaseAnalytics />
          <div className="app-shell">
            <aside className="sidebar">
              <Link className="brand" href="/" aria-label="NYSC Radio and TV home">
                <span className="brand-mark">N</span>
                <span>NYSC<span className="brand-accent">.</span></span>
              </Link>

              <div className="sidebar-group">
                <span className="sidebar-label">MENU</span>
                <Link className="side-link side-link-active" href="/">
                  <span className="side-icon">◉</span> Discover
                </Link>
                <Link className="side-link" href="/schedule">
                  <span className="side-icon">▦</span> Schedule
                </Link>
                <Link className="side-link" href="/admin/channels">
                  <span className="side-icon">⚙</span> Channel media
                </Link>
              </div>

              <div className="sidebar-group">
                <span className="sidebar-label">YOUR ACCOUNT</span>
                <Link className="side-link" href="/login">
                  <span className="side-icon">♙</span> Sign in
                </Link>
              </div>

              <div className="sidebar-note">
                <span className="note-icon">✦</span>
                <strong>Stay connected</strong>
                <p>Your stories, your service, your station.</p>
                <Link href="/schedule">Explore schedule <span aria-hidden="true">→</span></Link>
              </div>
              <span className="sidebar-footer">Serving with purpose</span>
            </aside>

            <main className="main-shell">
              <header className="topbar">
                <div className="topbar-breadcrumb">NYSC <span>/</span> <strong>Discover</strong></div>
                <div className="topbar-actions">
                  <span className="topbar-status"><span /> Live on air</span>
                  <Link className="account-link" href="/login"><span className="avatar">N</span> Account</Link>
                </div>
              </header>
              <div className="page-content">{children}</div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
