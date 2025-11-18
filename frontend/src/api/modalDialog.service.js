let ModalDialog_Show = null;  //apunta a la funcion show del componente ModalDialog


const Alert = (
  _mensaje,
  _titulo = "Atención",
  _boton1 = "Aceptar",
  _boton2 = "",
  _accionBoton1 = null,
  _accionBoton2 = null,
  _tipo = 'info'
) => {
  if (ModalDialog_Show)
    ModalDialog_Show(
      _mensaje,
      _titulo,
      _boton1,
      _boton2,
      _accionBoton1,
      _accionBoton2,
      _tipo
    );
};


const Confirm = (
  _mensaje,
  _titulo = "Confirmar",
  _boton1 = "Aceptar",
  _boton2 = "Cancelar",
  _accionBoton1 = null,
  _accionBoton2 = null,
  _tipo = 'warning'
) => {
  return new Promise((resolve) => {
    if (ModalDialog_Show) {
      ModalDialog_Show(
        _mensaje,
        _titulo,
        _boton1,
        _boton2,
        () => {
          if (_accionBoton1) _accionBoton1();
          resolve(true);
        },
        () => {
          if (_accionBoton2) _accionBoton2();
          resolve(false);
        },
        _tipo
      );
    } else {
      resolve(false);
    }
  });
};

const success = (_mensaje, _titulo = "Éxito") => {
  Alert(_mensaje, _titulo, "Aceptar", "", null, null, "success");
};

const error = (_mensaje, _titulo = "Error") => {
  Alert(_mensaje, _titulo, "Aceptar", "", null, null, "danger");
};


let cntBloquearPantalla = 0;
const BloquearPantalla = (blnBloquear) => {
  if (blnBloquear) {
    cntBloquearPantalla++;
  } else {
    cntBloquearPantalla = Math.max(0, cntBloquearPantalla - 1); // <- evita negativos
  }

  if (!ModalDialog_Show) return;

  if (cntBloquearPantalla > 0) {
    ModalDialog_Show("BloquearPantalla", "Espere por favor...", "", "", null, null, "info");
  } else {
    ModalDialog_Show("", "", "", "", null, null);
  }
};


const subscribeShow = (_ModalDialog_Show) => {
  ModalDialog_Show = _ModalDialog_Show;
};


const modalDialogService = { Alert, Confirm, success, error, BloquearPantalla, subscribeShow };


export default modalDialogService;
