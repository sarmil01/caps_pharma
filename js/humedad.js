function finalizeRegistration() {
  const mpcd = document.querySelector('select[name="mpcd_no"]').value;
  const tamano = document.querySelector('select[name="tamano"]').value;
  const turno = document.querySelector('select[name="turno"]').value;
  const granel = document.querySelector('input[name="granel"]').value;
  const tecnico = document.querySelector('input[name="tecnico"]').value;
  const fecha = document.querySelector('input[name="fecha"]').value;
  const timeInput = document.querySelector('input[name="hora"]');
  const hora_registro = timeInput ? timeInput.value : "";

  const humedad_tapa = parseFloat(document.querySelector('input[name="humedad_tapa"]').value) || 0;
  const humedad_cuerpo = parseFloat(document.querySelector('input[name="humedad_cuerpo"]').value) || 0;

  if (humedad_tapa === 0 && humedad_cuerpo === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'No hay datos para guardar (las humedades son 0).',
      confirmButtonColor: '#00658b'
    });
    return;
  }

  const flatRow = [
    mpcd,
    tamano,
    turno,
    granel,
    tecnico,
    fecha,
    hora_registro,
    humedad_tapa,
    humedad_cuerpo
  ];

  const rowsToSave = [flatRow];
  const googleScriptURL = GOOGLE_SCRIPT_URL;

  const btn = document.querySelector('button[onclick="finalizeRegistration()"]');
  let originalBtnText = "";
  if (btn) {
    originalBtnText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined text-xl animate-spin">refresh</span> Guardando...';
    btn.disabled = true;
  }

  fetch(googleScriptURL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(rowsToSave),
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
  })
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '¡Guardado exitoso!',
        text: 'Verifica tu Google Sheet para confirmar los datos.',
        confirmButtonColor: '#00658b',
        timer: 3000
      });
      const btnNuevoRegistro = document.getElementById("btn-nuevo-registro");
      if (btnNuevoRegistro) btnNuevoRegistro.click();
    })
    .catch((error) => {
      console.error("Error enviando datos:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Ocurrió un error al intentar enviar los datos.',
        confirmButtonColor: '#00658b'
      });
    })
    .finally(() => {
      if (btn) {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
      }
    });
}

// Set default date to today
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.querySelector('input[type="date"]');
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (dateInput) dateInput.value = today;

  const timeInput = document.querySelector('input[type="time"]');
  if (timeInput) {
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    timeInput.value = `${hours}:${minutes}`;
  }

  // Botón Nuevo Registro
  const btnNuevoRegistro = document.getElementById("btn-nuevo-registro");
  if (btnNuevoRegistro) {
    btnNuevoRegistro.addEventListener("click", () => {
      // Reset de campos de encabezado
      const mpcd = document.querySelector('select[name="mpcd_no"]');
      if (mpcd) mpcd.selectedIndex = 0;

      const tamano = document.querySelector('select[name="tamano"]');
      if (tamano) tamano.value = "00E";

      const turno = document.querySelector('select[name="turno"]');
      if (turno) turno.selectedIndex = 0;

      const granel = document.querySelector('input[name="granel"]');
      if (granel) granel.value = "";

      const tecnico = document.querySelector('input[name="tecnico"]');
      if (tecnico) tecnico.value = "";

      const currentDate = new Date();
      if (dateInput) {
        dateInput.value = currentDate.toISOString().split("T")[0];
      }

      if (timeInput) {
        const h = String(currentDate.getHours()).padStart(2, "0");
        const m = String(currentDate.getMinutes()).padStart(2, "0");
        timeInput.value = `${h}:${m}`;
      }

      // Reset de inputs de humedad
      const inputTapa = document.querySelector('input[name="humedad_tapa"]');
      const inputCuerpo = document.querySelector('input[name="humedad_cuerpo"]');

      if (inputTapa) inputTapa.value = "";
      if (inputCuerpo) inputCuerpo.value = "";

      // Foco y selección en Humedad TAPA
      if (inputTapa) {
        inputTapa.focus();
        inputTapa.select();
      }
    });
  }
});
