import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Menu from "./Menu";

function SideNav() {
  useEffect(() => {
    if (window.$?.fn?.Treeview) {
      window.$('[data-widget="treeview"]').Treeview("init");
    }
  }, []);

  return (
    <aside className="main-sidebar sidebar-dark-primary">
      {/* Brand Logo */}
      <Link to="/" className="brand-link">
        <img
          src="/icono.ico"
          alt="Logo"
          className="brand-image img-circle"
          style={{ opacity: ".8" }}
        />
        <span className="brand-text font-weight-light">Alquiler de Vehículos</span>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Sidebar Menu */}
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            <Menu />
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default SideNav;
