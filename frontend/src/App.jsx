import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./pages/layouts/Header";
import SideNav from "./pages/layouts/SideNav";
import Footer from "./pages/layouts/Footer";
import { ContentWrapper } from "./pages/layouts/ContentWrapper";
import { ModalDialog } from "./pages/layouts/ModalDialog";

import ClientesPage from "./pages/ClientesPage";
import EmpleadosPage from "./pages/EmpleadosPage";
import VehiculosPage from "./pages/VehiculosPage";
import CategoriasVehiculoPage from "./pages/CategoriasVehiculoPage";
import AlquilerPage from "./pages/AlquilerPage";

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
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="empleados" element={<EmpleadosPage />} />
          <Route path="vehiculos" element={<VehiculosPage />} />
          <Route
            path="categorias-vehiculos"
            element={<CategoriasVehiculoPage />}
          />
          <Route path="alquiler" element={<AlquilerPage />} />

          {/* fallback por si ponen cualquier cosa */}
          <Route path="*" element={<Navigate to="/clientes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
