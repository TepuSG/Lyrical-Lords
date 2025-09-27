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

const comicFont = Comic_Neue({
  variable: "--font-comic",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Valiant Voices",
  description: "Write songs, pass lyrics, create musical masterpieces together",
};

// Header Component
function Header() {
  return (
    <header className="bg-black shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-white">Valiant Voices</h1>
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
            <small>Valiant Voices</small>
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${comicFont.variable} font-comic antialiased min-h-screen flex flex-col`}
      >
        <SocketProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </SocketProvider>
      </body>
    </html>
  );
}