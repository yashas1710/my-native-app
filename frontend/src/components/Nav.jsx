import { Link } from "react-router-dom";

export default function Nav() {
  const loggedIn = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="flex gap-4 p-3 border-b bg-gray-100">
      <Link to="/" className="font-semibold">Home</Link>
      <Link to="/create">Create Plan</Link>
      <Link to="/my-activity">My Activity</Link>
      {loggedIn ? (
        <button onClick={logout} className="text-red-600">Logout</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      )}
    </nav>
  );
}
