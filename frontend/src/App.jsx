import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Chat from "./pages/Chat";

// Lazy-loaded pages
const HomeFeed = lazy(() => import("./pages/HomeFeed.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CreatePlan = lazy(() => import("./pages/CreatePlan.jsx"));
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const EditPlan = lazy(() => import("./pages/EditPlan.jsx"));

function InstallButton() {
  return null;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Unplango
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="ml-4 px-4 py-2 rounded bg-blue-500 text-white dark:bg-blue-600 transition-colors duration-300"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      {/* Main */}
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          <Toaster position="top-right" reverseOrder={false} />
          <InstallButton />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat/:planId" element={<Chat />} />

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
      </main>
    </div>
  );
}
