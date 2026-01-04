// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { Toaster, toast } from "react-hot-toast";

// Lazy-loaded pages
const HomeFeed = lazy(() => import("./pages/HomeFeed.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CreatePlan = lazy(() => import("./pages/CreatePlan.jsx"));
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const EditPlan = lazy(() => import("./pages/EditPlan.jsx"));

// ✅ Custom InstallButton component
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Fired when browser detects installable PWA
    const handler = (e) => {
      e.preventDefault(); // prevent automatic prompt
      setDeferredPrompt(e);
      console.log("🔥 beforeinstallprompt fired!");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      toast.success("App installed ✅");
    });

    // Check standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      toast.success("Thanks for installing the app! ✅");
    } else {
      toast.error("Install canceled ❌");
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-brand text-white px-4 py-2 rounded shadow-lg hover:bg-brand-dark transition z-50"
    >
      Install App
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        {/* Toast container */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* Install button */}
        <InstallButton />

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Layout>
                  <HomeFeed />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/plan/create"
            element={
              <RequireAuth>
                <Layout>
                  <CreatePlan />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <RequireAuth>
                <Layout>
                  <PlanDetail />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/edit-plan/:id"
            element={
              <RequireAuth>
                <Layout>
                  <EditPlan />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireAuth>
                <Layout>
                  <MyActivity />
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
