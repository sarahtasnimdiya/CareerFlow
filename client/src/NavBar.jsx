import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav className="flex gap-4 p-4 border-b border-gray-light">
      <Link to="/attributes">Attributes</Link>
      <Link to="/positions">Positions</Link>
    </nav>
  );
}

export default NavBar;