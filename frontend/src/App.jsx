// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

// Lazy imports for pages
const HomeFeed = lazy(() => import("./pages/HomeFeed.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CreatePlan = lazy(() => import("./pages/CreatePlan.jsx"));
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      {/* Suspense wrapper for lazy-loaded routes */}
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Public routes (no auth, no layout) */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes wrapped in Layout */}
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
