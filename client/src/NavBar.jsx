import { Link } from "react-router-dom";
import { navBarStyle, navLinkStyle } from "./lib/styles";

function NavBar() {
  return (
    <nav className= {navBarStyle}>
      <Link to="/" className={navLinkStyle}>
        Home
      </Link>
      <Link to="/attributes" className={navLinkStyle}>
        Attributes
      </Link>
      <Link to="/positions" className={navLinkStyle}>
        Positions
      </Link>
      <Link to="/profile" className={navLinkStyle}>
        Profile
      </Link>
      
      <div className="flex-1"></div> 
      <Link to="/login" className={navLinkStyle}>
        Login
      </Link>
      <div>/</div>
      <Link to="/register" className={navLinkStyle}>
        Register
      </Link>
    </nav>
  );
}

export default NavBar;