// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { Toaster } from "react-hot-toast";


// Lazy imports for pages
const HomeFeed = lazy(() => import("./pages/HomeFeed.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CreatePlan = lazy(() => import("./pages/CreatePlan.jsx"));
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const EditPlan = lazy(() => import("./pages/EditPlan.jsx"));

export default function App() {
  return (
    <>
      {/* Global Toaster mounted at top-level */}
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
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
    </>
  );
}
