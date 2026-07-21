import { Link } from "react-router-dom";
import { navBarStyle, navLinkStyle } from "./lib/styles";

function NavBar() {
  return (
    <nav className= {navBarStyle}>
      <Link to="/attributes" className={navLinkStyle}>
        Attributes
      </Link>
      <Link to="/positions" className={navLinkStyle}>
        Positions
      </Link>
      <Link to="/projects" className={navLinkStyle}>
        Projects
      </Link>
    </nav>
  );
}

export default NavBar;