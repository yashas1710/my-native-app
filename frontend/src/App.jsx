import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeFeed from "./pages/HomeFeed";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreatePlan from "./pages/CreatePlan";
import PlanDetail from "./pages/PlanDetail";
import MyActivity from "./pages/MyActivity";
import Nav from "./components/Nav";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomeFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreatePlan />
            </RequireAuth>
          }
        />
        <Route
          path="/plans/:id"
          element={
            <RequireAuth>
              <PlanDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/my-activity"
          element={
            <RequireAuth>
              <MyActivity />
            </RequireAuth>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
