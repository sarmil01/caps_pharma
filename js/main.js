document.addEventListener("DOMContentLoaded", () => {
  const thicknessSection = document.getElementById("control-espesor");
  if (!thicknessSection) return;

  // 0. Initialize Defaults
  const dateInput = document.getElementById("header-fecha");
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  // 1. Initial Values & Focus
  const firstInput = document.getElementById("first-input");
  if (firstInput) {
    firstInput.focus();
    firstInput.select();
  }

  const btnNuevoRegistro = document.getElementById("btn-nuevo-registro");
  if (btnNuevoRegistro) {
    btnNuevoRegistro.addEventListener("click", () => {
      document.getElementById("header-mpcd").selectedIndex = 0;
      document.getElementById("header-tamano").value = "0";
      document.getElementById("header-turno").selectedIndex = 0;
      document.getElementById("header-granel").value = "";
      document.getElementById("header-tecnico").value = "";

      if (dateInput) {
        dateInput.value = new Date().toISOString().split("T")[0];
      }

      const tInput = document.getElementById("header-hora");
      if (tInput) {
        const now = new Date();
        tInput.value = now.toTimeString().slice(0, 5);
      }

      const clearInputs = Array.from(
        thicknessSection.querySelectorAll('input[type="number"]'),
      );
      clearInputs.forEach((input) => {
        input.value = "0.00";
      });

      allRows.forEach((row) => calculateAverage(row));

      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    });
  }

  const allRows = document.querySelectorAll(".measurement-row");
  const inputs = Array.from(
    thicknessSection.querySelectorAll('input[type="number"]'),
  );

  // 2. Format on Blur
  function formatInputValue(input) {
    let val = parseFloat(input.value);
    if (isNaN(val)) val = 0;
    input.value = val.toFixed(3);
  }

  // 3. Real-time Calculations
  function calculateAverage(row) {
    const rowInputs = Array.from(
      row.querySelectorAll('input[type="number"]'),
    );
    const values = rowInputs.map((input) => parseFloat(input.value) || 0);

    // standard: divide by 10 as per samples
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / 10;

    const promCell = row.querySelector(".prom-cell");
    if (promCell) {
      promCell.textContent = avg.toFixed(3);
    }
  }

  allRows.forEach((row) => {
    const rowInputs = row.querySelectorAll('input[type="number"]');
    rowInputs.forEach((input) => {
      input.addEventListener("input", () => calculateAverage(row));
      input.addEventListener("blur", () => {
        formatInputValue(input);
        calculateAverage(row);
      });
    });
    // Initial calculation
    calculateAverage(row);
  });

  // Input Navigation (Enter key)
  inputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    });
  });

  // 4. Console Export
  // Destino de datos: https://docs.google.com/spreadsheets/d/1N8op4T6Byg86WQIrmUDaX-0LfxBEsLSW7to1S9j5jtM/edit?usp=sharing
  const finalizarBtn = document.getElementById("finalizar-btn");
  if (finalizarBtn) {
    finalizarBtn.addEventListener("click", () => {
      const mpcd = document.getElementById("header-mpcd").value;
      const tamano = document.getElementById("header-tamano").value;
      const turno = document.getElementById("header-turno").value;
      const granel = document.getElementById("header-granel").value;
      const tecnico = document.getElementById("header-tecnico").value;
      const fecha = document.getElementById("header-fecha").value;
      const timeInput = document.getElementById("header-hora");
      const hora_registro = timeInput ? timeInput.value : "";

      const rowsToSave = [];

      allRows.forEach((row) => {
        const average = parseFloat(
          row.querySelector(".prom-cell").textContent,
        );

        if (average > 0) {
          const rowInputs = Array.from(
            row.querySelectorAll('input[type="number"]'),
          );
          const measurements = rowInputs.map((input) =>
            parseFloat(parseFloat(input.value || 0).toFixed(3)),
          );

          const tipo = row.dataset.section.toUpperCase();
          const componente = row.dataset.component.toUpperCase();

          const flatRow = [
            mpcd,
            tamano,
            turno,
            granel,
            tecnico,
            fecha,
            hora_registro,
            tipo,
            componente,
            ...measurements,
            average,
          ];

          rowsToSave.push(flatRow);
        }
      });

      if (rowsToSave.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'No hay datos para guardar (todos los promedios son 0).',
          confirmButtonColor: '#00658b'
        });
        return;
      }

      const googleScriptURL = GOOGLE_SCRIPT_URL;

      const originalBtnText = finalizarBtn.innerHTML;
      finalizarBtn.innerHTML =
        '<span class="material-symbols-outlined text-xl animate-spin">refresh</span> Guardando...';
      finalizarBtn.disabled = true;

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
          finalizarBtn.innerHTML = originalBtnText;
          finalizarBtn.disabled = false;
        });
    });
  }
});
