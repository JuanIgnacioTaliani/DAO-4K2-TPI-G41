import { Outlet } from "react-router-dom";
import { useState } from "react";

function ContentWrapper() {
  const [titutlo, setTitulo] = useState("Sistema de Alquiler de Vehículos");
  return (
    <div className="content-wrapper">
      {/* Content Header (Page header) */}
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">{titutlo}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          {/* 👇 Acá se renderiza la ruta hija activa */}
          <Outlet context={{ setTitulo }} />
        </div>
      </section>
    </div>
  );
}

export { ContentWrapper };
