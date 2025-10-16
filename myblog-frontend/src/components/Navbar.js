import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/">MyBlog</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {token && <li><Link to="/create">Create</Link></li>}
          {!token && <li><Link to="/login">Login</Link></li>}
          {!token && <li><Link to="/register">Register</Link></li>}
          {token && <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>}
          <li><button onClick={toggleDarkMode} className="darkmode-btn">{darkMode ? "🌙" : "☀️"}</button></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
