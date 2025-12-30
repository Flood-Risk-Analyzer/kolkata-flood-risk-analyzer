import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  MapPin,
  MapTrifold,
  CaretDoubleRight,
} from "phosphor-react";
import "../styles/Sidebar.css";

export default function Sidebar() {
  // 🔥 START COLLAPSED BY DEFAULT
  const [collapsed, setCollapsed] = useState(true);

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="logo">Flood Risk</span>}

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          <CaretDoubleRight
            size={18}
            weight="bold"
            className={collapsed ? "" : "rotated"}
          />
        </button>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end>
            <House size={22} weight="fill" />
            {!collapsed && <span>Home</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/analyze">
            <MapPin size={22} weight="fill" />
            {!collapsed && <span>Analyze</span>}
          </NavLink>
        </li>

        <li>
          <NavLink to="/map">
            <MapTrifold size={22} weight="fill" />
            {!collapsed && <span>Risk Map</span>}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
