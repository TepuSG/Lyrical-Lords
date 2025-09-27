import type { Metadata } from "next";
import { Geist, Geist_Mono, Comic_Neue } from "next/font/google";
import { SocketProvider } from "../contexts/SocketContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const prevURL = "/app/page.js";

const comicFont = Comic_Neue({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Lyrical Lords",
  description: "Write songs, pass lyrics, create musical masterpieces together",
};

// Header Component
function Header() {
  return (
    <header className="bg-black shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img src="/LyricalLordsLight.png" alt="logo" className="w-10 h-10" />
            <a href="/"className="text-xl font-bold text-white">Lyrical Lords</a>
          </div>
          <nav>
            <ul className="flex space-x-8">
              <li><a href="/instructions" className="text-gray-300 hover:text-white">Instructions</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            <small>Lyrical Lords</small>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use a fixed background layer so the PNG reliably shows behind all content
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${comicFont.variable} font-comic antialiased`}
      >
        {/* Background layer - fixed, behind everything */}
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: 'url("/lyricallordsbg.png")' }}
        />

        <div className="min-h-screen flex flex-col">
          <SocketProvider>
            <Header />
            <main className="flex-grow">
              {/* Default page container: wraps pages that don't already use cards so text is readable */}
              <div className="mx-auto w-full max-w-6xl p-6 sm:p-8">
                <div className="page-card rounded-lg shadow-md p-6 sm:p-8 backdrop-blur-sm">
                  {children}
                </div>
              </div>
            </main>
            <Footer />
          </SocketProvider>
        </div>
      </body>
    </html>
  );
}