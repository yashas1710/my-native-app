import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { Toaster, toast } from "react-hot-toast";
// App.jsx
import Chat from "./pages/Chat"; // adjust the path if your file is somewhere else


// Lazy-loaded pages
const HomeFeed = lazy(() => import("./pages/HomeFeed.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const CreatePlan = lazy(() => import("./pages/CreatePlan.jsx"));
const PlanDetail = lazy(() => import("./pages/PlanDetail.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const EditPlan = lazy(() => import("./pages/EditPlan.jsx"));

// Install PWA button
function InstallButton() {
  return null; // optional, keep your previous code if needed
}

export default function App() {
  return (
    <>
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
    </>
  );
}
