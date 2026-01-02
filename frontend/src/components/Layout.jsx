// src/components/Layout.jsx
import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Nav />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer (optional) */}
      <footer className="bg-brand text-white text-center py-4 mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Unplango. All rights reserved.</p>
      </footer>
    </div>
  );
}
