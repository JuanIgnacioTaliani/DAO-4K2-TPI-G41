import React from "react";
import { useForm } from "react-hook-form";

export default function CategoriasRegistro({ AccionABMC, Item, Grabar, Volver }) {
	 const { register, handleSubmit, formState: { errors } } = useForm({ values: Item });
	const onSubmit = (data) => Grabar(data);

	const formatPeso = (value) => {
		const num = parseFloat(value);
		if (Number.isNaN(num)) return value ?? "";
		return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(num);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="container-fluid">

				<fieldset disabled={AccionABMC === "C"}>

					{/* Nombre */}
					<div className="row">
						<div className="col-sm-4 col-md-3 offset-md-1">
							<label>Nombre:</label>
						</div>
						<div className="col-sm-8 col-md-6">
							<input {...register("nombre", { required: true })} className="form-control" />
													{errors.nombre && (
														<span className="text-danger">El nombre es requerido</span>
													)}
						</div>
					</div>

					{/* Descripción */}
					<div className="row mt-2">
						<div className="col-sm-4 col-md-3 offset-md-1">
							<label>Descripción:</label>
						</div>
						<div className="col-sm-8 col-md-6">
							<input {...register("descripcion")} className="form-control" />
						</div>
					</div>

					{/* Tarifa diaria */}
					<div className="row mt-2">
						<div className="col-sm-4 col-md-3 offset-md-1">
							<label>Tarifa diaria:</label>
						</div>
						<div className="col-sm-8 col-md-6">
							{AccionABMC === "C" ? (
								<input
									className="form-control"
									value={formatPeso(Item?.tarifa_diaria)}
									readOnly
								/>
							) : (
								<>
									<input {...register("tarifa_diaria", { required: true })} className="form-control" type="number" step="0.01"/>
									{errors.tarifa_diaria && (
										<span className="text-danger">La tarifa diaria es requerida</span>
									)}
								</>
							)}
						</div>
					</div>

				</fieldset>

				<hr />
				<div className="row text-center">
					<div className="col">
						{AccionABMC !== "C" && (
							<button type="submit" className="btn btn-primary m-1">
								<i className="fa fa-check" /> Grabar
							</button>
						)}

						<button type="button" className="btn btn-warning" onClick={Volver}>
							<i className="fa fa-undo" /> {AccionABMC === "C" ? "Volver" : "Cancelar"}
						</button>
					</div>
				</div>

			</div>
		</form>
	);
}
