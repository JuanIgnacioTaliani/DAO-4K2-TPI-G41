import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./pages/layouts/Header";
import SideNav from "./pages/layouts/SideNav";
import Footer from "./pages/layouts/Footer";
import { ContentWrapper } from "./pages/layouts/ContentWrapper";
import { ModalDialog } from "./pages/layouts/ModalDialog";

import Clientes from "./pages/clientes/Clientes";
import Empleados from "./pages/empleados/Empleados";
import Vehiculos from "./pages/vehiculos/Vehiculos";
import CategoriasVehiculo from "./pages/categoriasVehiculo/CategoriasVehiculo";
import Alquileres from "./pages/alquileres/Alquileres";
import AlquilerPage from "./pages/AlquilerPage";
import MultasDaniosPage from "./pages/MultasDaniosPage";
import Mantenimientos from "./pages/mantenimientos/Mantenimientos";

function AppLayout() {
  return (
    <>
      <ModalDialog />
      <Header />
      <SideNav />
      <ContentWrapper />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de layout */}
        <Route path="/" element={<AppLayout />}>
          {/* ruta por defecto: redirige a /clientes */}
          <Route index element={<Navigate to="/clientes" replace />} />

          {/* rutas hijas, estas se renderizan dentro de <ContentWrapper> -> <Outlet> */}
          <Route path="clientes" element={<Clientes />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route
            path="categorias-vehiculos"
            element={<CategoriasVehiculo />}
          />
          <Route path="alquiler" element={<AlquilerPage />} />
          <Route path="alquiler-new" element={<Alquileres />} />
          <Route path="multas-danios" element={<MultasDaniosPage />} />
          <Route path="mantenimientos" element={<Mantenimientos />} />

          {/* fallback por si ponen cualquier cosa */}
          <Route path="*" element={<Navigate to="/clientes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
