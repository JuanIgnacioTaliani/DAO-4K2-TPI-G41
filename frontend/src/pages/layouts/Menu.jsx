import { Link } from "react-router-dom";

function Menu() {
  return (
    <>
      <li className="nav-item has-treeview">
        <a href="#" className="nav-link">
          <i className="nav-icon fas fa-users" />
          <p>
            ABMC Entidades
            <i className="fas fa-angle-left right" />
          </p>
        </a>

        <ul className="nav nav-treeview">
            <li className="nav-item">
              <Link to="/clientes" className="nav-link">
                <i className="far fa-circle nav-icon" />
                <p>Clientes</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/empleados" className="nav-link">
                <i className="far fa-circle nav-icon" />
                <p>Empleados</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/vehiculos" className="nav-link">
                <i className="far fa-circle nav-icon" />
                <p>Vehiculos</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categorias-vehiculos" className="nav-link">
                <i className="far fa-circle nav-icon" />
                <p>Categorias Vehiculos</p>
              </Link>
            </li>
        </ul>
      </li>
    </>
  );
}

export default Menu;
