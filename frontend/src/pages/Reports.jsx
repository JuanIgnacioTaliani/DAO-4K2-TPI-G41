import { useEffect, useMemo, useState } from "react";
import {
    fetchAlquileresPorCliente,
    fetchVehiculosMasAlquilados,
    fetchAlquileresPorPeriodo,
    fetchFacturacionMensual,
} from "../api/reports";

import { Card, Button, Form } from "react-bootstrap";
import ClientAutocomplete from "../components/ClientAutocomplete";
import { fetchClienteById } from "../api/clientes";

import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Reports() {
    // Alquileres por cliente
    const [clientId, setClientId] = useState(1);
    const [alquileresCliente, setAlquileresCliente] = useState(null);
    const [clientQuery, setClientQuery] = useState("");

    // Vehículos más alquilados
    const [vehDesde, setVehDesde] = useState("");
    const [vehHasta, setVehHasta] = useState("");
    const [topVehiculos, setTopVehiculos] = useState([]);

    // Alquileres por periodo
    const [periodo, setPeriodo] = useState("mes");
    const [perDesde, setPerDesde] = useState("");
    const [perHasta, setPerHasta] = useState("");
    const [alquileresPeriodo, setAlquileresPeriodo] = useState([]);

    // Facturación mensual
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [facturacionMensual, setFacturacionMensual] = useState([]);

    // Errores
    const [errors, setErrors] = useState({});

    const isValidRange = (d, h) => {
        if (!d || !h) return true;
        return new Date(h) >= new Date(d);
    };

    const validateVehiculos = () => {
        if (!isValidRange(vehDesde, vehHasta)) {
            setErrors(prev => ({ ...prev, vehiculos: "Fin < Inicio en vehículos más alquilados" }));
            return false;
        }
        setErrors(prev => ({ ...prev, vehiculos: undefined }));
        return true;
    };

    const validatePeriodo = () => {
        if (!isValidRange(perDesde, perHasta)) {
            setErrors(prev => ({ ...prev, periodo: "Fin < Inicio en alquileres por período" }));
            return false;
        }
        setErrors(prev => ({ ...prev, periodo: undefined }));
        return true;
    };
    const loadAlquileresCliente = async () => {
        if (!clientId || isNaN(clientId)) return;
        try {
            const c = await fetchAlquileresPorCliente({ client_id: clientId, page: 1, size: 10 });
            setAlquileresCliente(c);
        } catch (e) { console.error(e); }
    };

    const loadVehiculosMasAlquilados = async () => {
        if (!validateVehiculos()) return;
        try {
            const v = await fetchVehiculosMasAlquilados({ desde: vehDesde || undefined, hasta: vehHasta || undefined, limit: 10 });
            setTopVehiculos(v.items || []);
        } catch (e) { console.error(e); }
    };

    const loadAlquileresPeriodo = async () => {
        if (!validatePeriodo()) return;
        try {
            const p = await fetchAlquileresPorPeriodo({ periodo, desde: perDesde || undefined, hasta: perHasta || undefined });
            setAlquileresPeriodo(p.items || []);
        } catch (e) { console.error(e); }
    };

    const loadFacturacionMensual = async () => {
        try {
            const f = await fetchFacturacionMensual({ anio });
            setFacturacionMensual(f.items || []);
        } catch (e) { console.error(e); }
    };

    // Limpiar filtros
    const clearClienteFilters = () => {
        setClientQuery("");
        setClientId(NaN);
    };
    const clearVehiculosFilters = () => {
        setVehDesde("");
        setVehHasta("");
        setErrors(prev => ({ ...prev, vehiculos: undefined }));
    };
    const clearPeriodoFilters = () => {
        setPerDesde("");
        setPerHasta("");
        setPeriodo("mes");
        setErrors(prev => ({ ...prev, periodo: undefined }));
    };

    // Autocomplete manejado completamente dentro de ClientAutocomplete (se elimina lógica previa)

    useEffect(() => {
        // cargar todos una sola vez al inicio
        loadAlquileresCliente();
        loadVehiculosMasAlquilados();
        loadAlquileresPeriodo();
        loadFacturacionMensual();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-completar nombre sólo cuando cambia el ID
    useEffect(() => {
        let cancel = false;
        async function fillName() {
            if (!clientId || isNaN(clientId)) return;
            try {
                const data = await fetchClienteById(clientId);
                if (!cancel && data) {
                    const full = `${data.nombre} ${data.apellido}`;
                    setClientQuery(full);
                }
            } catch {
                // ignorar errores 404
            }
        }
        fillName();
        return () => { cancel = true; };
    }, [clientId]);

    // Recargar facturación cuando cambia el año
    useEffect(() => {
        loadFacturacionMensual();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anio]);

    const billingChartData = useMemo(() => ({
        labels: facturacionMensual.map((i) => `${i.mes}`),
        datasets: [
            {
                label: `Facturación ${anio}`,
                data: facturacionMensual.map((i) => i.monto_total),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
        ],
    }), [facturacionMensual, anio]);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="h4 mb-3">Reportes</h1>

            <Card className="mb-4">
                <Card.Header>Listado detallado de alquileres por cliente</Card.Header>
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-end gap-2 mb-3" aria-label="Filtros alquileres por cliente (sin fechas)">
                        <ClientAutocomplete
                            valueId={clientId}
                            valueText={clientQuery}
                            onTextChange={(t) => setClientQuery(t)}
                            onSelect={(s) => {
                                setClientId(s.id_cliente);
                                setClientQuery(`${s.nombre} ${s.apellido}`);
                            }}
                        />
                        <div>
                            <Form.Label htmlFor="clientId">ID Cliente</Form.Label>
                            <Form.Control id="clientId" style={{ maxWidth: 140 }} type="number" value={clientId} onChange={(e) => setClientId(Number(e.target.value))} placeholder="ID" />
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ paddingTop: 24 }}>
                            <Button variant="primary" onClick={loadAlquileresCliente}>Buscar</Button>
                            <Button variant="outline-secondary" onClick={clearClienteFilters}>Limpiar filtros</Button>
                        </div>
                    </div>
                    {alquileresCliente && (
                        <p className="text-muted mb-2">Total: <strong>{alquileresCliente.total}</strong> | Página {alquileresCliente.page}</p>
                    )}
                    <div className="table-responsive">
                        <table className="table table-sm table-striped table-hover" aria-label="Alquileres por cliente">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Patente</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Inicio</th>
                                    <th scope="col">Fin</th>
                                    <th scope="col">Días</th>
                                    <th scope="col">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alquileresCliente?.items?.map((a) => (
                                    <tr key={a.id_alquiler}>
                                        <td>{a.id_alquiler}</td>
                                        <td>{a.cliente_nombre} {a.cliente_apellido}</td>
                                        <td>{a.vehiculo_patente}</td>
                                        <td>{a.estado || '-'}</td>
                                        <td>{a.fecha_inicio}</td>
                                        <td>{a.fecha_fin || "-"}</td>
                                        <td>{a.dias ?? "-"}</td>
                                        <td>{a.monto ?? "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>Vehículos más alquilados</Card.Header>
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-end gap-2 mb-3" aria-label="Filtros vehículos más alquilados">
                        <div>
                            <Form.Label htmlFor="vehDesde">Desde</Form.Label>
                            <Form.Control id="vehDesde" type="date" value={vehDesde} onChange={(e) => setVehDesde(e.target.value)} />
                        </div>
                        <div>
                            <Form.Label htmlFor="vehHasta">Hasta</Form.Label>
                            <Form.Control id="vehHasta" type="date" value={vehHasta} onChange={(e) => setVehHasta(e.target.value)} min={vehDesde || undefined} />
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ paddingTop: 24 }}>
                            <Button variant="primary" disabled={!!errors.vehiculos} onClick={loadVehiculosMasAlquilados}>Aplicar</Button>
                            <Button variant="outline-secondary" onClick={clearVehiculosFilters}>Limpiar filtros</Button>
                        </div>
                        {errors.vehiculos && <div className="text-danger" role="alert">{errors.vehiculos}</div>}
                    </div>
                    <ul className="ps-3" aria-label="Vehículos más alquilados">
                        {topVehiculos.map((v) => {
                            const max = Math.max(...topVehiculos.map(t => t.cantidad_alquileres), 1);
                            const pct = Math.round((v.cantidad_alquileres / max) * 100);
                            return (
                                <li key={v.id_vehiculo} className="mb-2">
                                    <div className="d-flex justify-content-between"><span>{v.patente} - {v.modelo}</span><span className="text-muted">{v.cantidad_alquileres}</span></div>
                                    <div className="progress" style={{ height: 6 }} aria-label={`Cantidad de alquileres ${v.cantidad_alquileres}`}>
                                        <div className="progress-bar" role="progressbar" style={{ width: pct + "%" }} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>Alquileres por período</Card.Header>
                <Card.Body>
                    <div className="d-flex flex-wrap align-items-end gap-2 mb-3" aria-label="Filtros alquileres por período">
                        <div>
                            <Form.Label htmlFor="periodoSelect">Tipo</Form.Label>
                            <Form.Select id="periodoSelect" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ maxWidth: 160 }}>
                                <option value="mes">Mes</option>
                                <option value="trimestre">Trimestre</option>
                            </Form.Select>
                        </div>
                        <div>
                            <Form.Label htmlFor="perDesde">Desde</Form.Label>
                            <Form.Control id="perDesde" type="date" value={perDesde} onChange={(e) => setPerDesde(e.target.value)} />
                        </div>
                        <div>
                            <Form.Label htmlFor="perHasta">Hasta</Form.Label>
                            <Form.Control id="perHasta" type="date" value={perHasta} onChange={(e) => setPerHasta(e.target.value)} min={perDesde || undefined} />
                        </div>
                        <div className="d-flex align-items-center gap-2" style={{ paddingTop: 24 }}>
                            <Button variant="primary" disabled={!!errors.periodo} onClick={loadAlquileresPeriodo}>Aplicar</Button>
                            <Button variant="outline-secondary" onClick={clearPeriodoFilters}>Limpiar filtros</Button>
                        </div>
                        {errors.periodo && <div className="text-danger" role="alert">{errors.periodo}</div>}
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="table-responsive">
                                <table className="table table-sm table-striped table-hover" aria-label="Alquileres por período">
                                    <thead>
                                        <tr>
                                            <th scope="col">Periodo</th>
                                            <th scope="col">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alquileresPeriodo.map((i) => (
                                            <tr key={i.periodo}>
                                                <td>{i.periodo}</td>
                                                <td>{i.cantidad_alquileres}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <Bar
                                data={{
                                    labels: alquileresPeriodo.map(i => i.periodo),
                                    datasets: [{
                                        label: 'Alquileres',
                                        data: alquileresPeriodo.map(i => i.cantidad_alquileres),
                                        backgroundColor: 'rgba(255, 159, 64, 0.6)'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { display: false }, title: { display: true, text: `Alquileres por ${periodo}` } }
                                }}
                                aria-label={`Gráfico de alquileres por ${periodo}`}
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>Facturación mensual</Card.Header>
                <Card.Body>
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-3" aria-label="Navegación de año facturación">
                        <Button variant="outline-secondary" onClick={() => setAnio(a => a - 1)} aria-label="Año anterior">◀</Button>
                        <div className="px-3 py-1 border rounded" aria-live="polite" aria-label="Año seleccionado" style={{ minWidth: 90, textAlign: 'center' }}>{anio}</div>
                        <Button variant="outline-secondary" onClick={() => setAnio(a => a + 1)} aria-label="Año siguiente">▶</Button>
                    </div>
                    <Bar
                        data={billingChartData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: "top" }, title: { display: true, text: `Facturación mensual ${anio}` } },
                        }}
                        aria-label={`Gráfico de barras de facturación mensual del año ${anio}`}
                    />
                </Card.Body>
            </Card>
        </div>
    );
}
