import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { QuestProvider } from "@/context/QuestContext";
import Sidebar from "@/components/Navigation";
import AchievementToast from "@/components/AchievementToast";
import LoginGate from "@/components/LoginGate";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Build With AI Palembang 2026",
  description: "Gamified dashboard for workshop session",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const connectedServices = {
    gemini:       !!process.env.GEMINI_API_KEY,
    groq:         !!process.env.GROQ_API_KEY,
    serper:       !!process.env.SERPER_API_KEY,
    loginEnabled: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
  };

  return (
    <html lang="en" className={`${pressStart2P.variable} h-full`}>
      {/* Clean dark background — no busy full-page image */}
      <body
        className="min-h-full"
        style={{
          background: 'var(--aap-darkest)',
          color: 'var(--aap-grey-lt)',
          fontFamily: 'var(--font-pixel), monospace',
        }}
      >
        {/* Subtle pixel-grid overlay for game texture */}
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--aap-dark3) 1px, transparent 1px),
            linear-gradient(90deg, var(--aap-dark3) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <QuestProvider initialConnections={connectedServices}>
          <LoginGate loginEnabled={connectedServices.loginEnabled}>
            <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
              {/* Sidebar — fixed, 60px collapsed / 200px expanded */}
              <Sidebar />

              {/* Main content — offset by sidebar width (60px collapsed) */}
              <main style={{
                flex: 1,
                marginLeft: '60px',
                padding: '32px 32px 48px',
                minHeight: '100vh',
                maxWidth: 'calc(100vw - 60px)',
                overflowX: 'hidden',
              }}>
                {children}
              </main>
            </div>
          </LoginGate>
          <AchievementToast />
        </QuestProvider>
      </body>
    </html>
  );
}
