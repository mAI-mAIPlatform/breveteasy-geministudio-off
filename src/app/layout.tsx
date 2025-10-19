import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
// Fix: Add missing React import for React.ReactNode type.
import React from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Brevet' Easy - Révise avec l'IA",
  description: "An AI-powered quiz generator to help students revise for the French Brevet exam. Select a subject and Brevet AI will create a 15-question quiz for you.",
  icons: {
    icon: '/favicon.svg',
  }
};

// This component is necessary to apply the theme without a flash of the wrong theme (FOUC).
// It runs a script before the page is hydrated by React.
const ThemeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function() {
          const theme = localStorage.getItem('brevet-easy-theme') || 'system';
          if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        })();
      `,
    }}
  />
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <ThemeScript />
      </head>
      <body className={poppins.className}>
        <div className="background-container"></div>
        <div id="root-scroll-container">
          {children}
        </div>
      </body>
    </html>
  )
}