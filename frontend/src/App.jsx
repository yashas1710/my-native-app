// src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
const Profile = lazy(() => import("./pages/Profile"));
// Chat is Phase 2 — intentionally removed from MVP bundle

// Lazy-loaded pages
import HomeFeed from "./pages/HomeFeed.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import CreatePlan from "./pages/CreatePlan.jsx";
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const EditPlan = lazy(() => import("./pages/EditPlan.jsx"));

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <main>
<Suspense
  fallback={
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg font-medium">
        Loading...
      </div>
    </div>
  }
>          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Public routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <Layout>
                    <CreatePlan />
                  </Layout>
                </RequireAuth>
              }
            />
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
            {/* /chat/:planId — Phase 2 */}
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
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Layout>
                    <Profile />
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
