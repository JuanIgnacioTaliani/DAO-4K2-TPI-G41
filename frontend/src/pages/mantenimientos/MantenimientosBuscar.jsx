import { useState } from "react";

export default function MantenimientosBuscar({
    Vehiculos,
    Vehiculo,
    setVehiculo,
    Tipo,
    setTipo,
    Estado,
    setEstado,
    Buscar,
    Agregar
}) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="col-lg-12 col-md-12">
            <div className="card mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0">
                        <button
                            type="button"
                            className="btn btn-tool"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className={`fas fa-${showFilters ? "minus" : "plus"}`}></i>
                        </button>
                        Filtros de búsqueda
                    </h3>
                    <div>
                        <button type="button" className="btn btn-primary" onClick={Agregar}>
                            <i className="fa fa-plus" /> Agregar
                        </button>
                    </div>
                </div>
                {showFilters && (
                    <div className="card-body">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                Buscar();
                            }}
                        >
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-sm-4 col-md-2">
                                        <label>Vehiculo:</label>
                                    </div>
                                    <div className="col-sm-8 col-md-10">
                                        <select
                                            className="form-control"
                                            value={Vehiculo}
                                            onChange={(e) => setVehiculo(e.target.value)}
                                        >
                                            <option value="">Todos los vehículos</option>
                                            {Vehiculos.map((v) => (
                                                <option key={v.id_vehiculo} value={v.id_vehiculo}>
                                                    {v.marca} {v.modelo} ({v.patente})
                                                </option>
                                            ))}
                                        </select>
                                        <small className="form-text text-muted">
                                            Solo se puede crear mantenimiento si el vehículo no está en curso/checkout. Si el vehículo tiene reservas futuras, el mantenimiento debe finalizar antes del inicio del alquiler; de lo contrario, la reserva será cancelada automáticamente.
                                        </small>
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-sm-4 col-md-2">
                                        <label>Tipo:</label>
                                    </div>
                                    <div className="col-sm-8 col-md-4">
                                        <select
                                            className="form-control"
                                            value={Tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                        >
                                            <option value="">Todos los tipos</option>
                                            <option value="preventivo">Preventivo</option>
                                            <option value="correctivo">Correctivo</option>
                                        </select>
                                    </div>

                                    <div className="col-sm-4 col-md-2">
                                        <label>Estado:</label>
                                    </div>
                                    <div className="col-sm-8 col-md-4">
                                        <select
                                            className="form-control"
                                            value={Estado}
                                            onChange={(e) => setEstado(e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            <option value="en_curso">En Curso</option>
                                            <option value="finalizado">Finalizados</option>
                                        </select>
                                    </div>
                                </div>

                                <hr />

                                <div className="row">
                                    <div className="col text-center pb-3">
                                        <button
                                            type="button"
                                            className="btn btn-primary mr-1"
                                            onClick={() => Buscar()}
                                        >
                                            <i className="fa fa-search" /> Buscar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary mr-1"
                                            onClick={() => {
                                                setVehiculo("");
                                                setTipo("");
                                                setEstado("");
                                                Buscar({
                                                    vehiculo: "",
                                                    tipo: "",
                                                    estado: "",
                                                });
                                            }}
                                        >
                                            <i className="fa fa-eraser" /> Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
