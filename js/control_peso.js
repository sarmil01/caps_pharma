document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('weight-tbody');

    // Inicializar fecha
    const dateInput = document.getElementById('field-fecha');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Botón Nuevo Registro
    const btnNuevoRegistro = document.getElementById('btn-nuevo-registro');
    if (btnNuevoRegistro) {
        btnNuevoRegistro.addEventListener('click', () => {
            // Reset de campos de encabezado
            document.getElementById('field-mpcd').selectedIndex = 0;
            document.getElementById('field-tamano').value = "0";
            document.getElementById('field-turno').selectedIndex = 0;
            document.getElementById('field-granel').value = "";
            document.getElementById('field-tecnico').value = "";
            
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }

            const timeInput = document.getElementById('field-hora');
            if (timeInput) {
                const now = new Date();
                timeInput.value = now.toTimeString().slice(0, 5);
            }

            // Reset de inputs de la tabla
            const inputTapa = document.querySelector('.input-tapa');
            const inputCuerpo = document.querySelector('.input-cuerpo');
            
            if (inputTapa) inputTapa.value = "0.00";
            if (inputCuerpo) inputCuerpo.value = "0.00";
            
            const tr = tbody.querySelector('tr');
            if (tr) calculateRowTotal(tr);
            
            // Foco y selección en PESO TAPA
            if (inputTapa) {
                inputTapa.focus();
                inputTapa.select();
            }
        });
    }

    function calculateRowTotal(row) {
        const tapa = parseFloat(row.querySelector('.input-tapa').value) || 0;
        const cuerpo = parseFloat(row.querySelector('.input-cuerpo').value) || 0;
        const totalInput = row.querySelector('.input-total');
        
        const total = tapa + cuerpo;
        totalInput.value = total.toFixed(3);
    }

    // Real-time calculation
    tbody.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-tapa') || e.target.classList.contains('input-cuerpo')) {
            calculateRowTotal(e.target.closest('tr'));
        }
    });

    // Input Navigation (Enter key)
    const inputs = Array.from(tbody.querySelectorAll('input[type="number"]:not([readonly])'));
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

    // Data Export
    const finalizarBtn = document.getElementById('btn-finalizar');
    if (finalizarBtn) {
        finalizarBtn.addEventListener('click', () => {
            const mpcd = document.getElementById('field-mpcd').value;
            const tamano = document.getElementById('field-tamano').value;
            const turno = document.getElementById('field-turno').value;
            const granel = document.getElementById('field-granel').value;
            const tecnico = document.getElementById('field-tecnico').value;
            const fecha = document.getElementById('field-fecha').value;
            const timeInput = document.getElementById('field-hora');
            const hora_registro = timeInput ? timeInput.value : "";

            const row = tbody.querySelector('tr');
            const tapa = parseFloat(row.querySelector('.input-tapa').value) || 0;
            const cuerpo = parseFloat(row.querySelector('.input-cuerpo').value) || 0;
            const total = parseFloat(row.querySelector('.input-total').value) || 0;

            if (total === 0) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Datos incompletos',
                  text: 'No hay datos para guardar (el peso total es 0).',
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
                tapa,
                cuerpo,
                total
            ];

            const rowsToSave = [flatRow];

            const googleScriptURL = "https://script.google.com/macros/s/AKfycbyuD_uoWnS0pFBW1k4Dl9Adp-dko1gpAB6-Plo_4Rw4M15_yD16Cr3A_7zhCxJ7yGo0/exec";

            const originalBtnText = finalizarBtn.innerHTML;
            finalizarBtn.innerHTML = '<span class="material-symbols-outlined text-xl animate-spin">refresh</span> Guardando...';
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
    
    // Initialize calculation
    calculateRowTotal(tbody.querySelector('tr'));
});
