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
    </nav>
  );
}

export default NavBar;