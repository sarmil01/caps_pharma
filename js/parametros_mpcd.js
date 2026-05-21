document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.data-input');

    // Enter to navigate logic
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    document.getElementById('btn-submit').focus();
                }
            }
        });
    });

    // Automatic calculations for Registro de Contadores
    const inmersionesInicial = document.getElementById('inmersiones_inicial');
    const inmersionesFinal = document.getElementById('inmersiones_final');
    const inmersionesTotal = document.getElementById('inmersiones_total');

    function calcularInmersiones() {
        const inicial = parseFloat(inmersionesInicial.value) || 0;
        const final = parseFloat(inmersionesFinal.value) || 0;
        if (inmersionesInicial.value || inmersionesFinal.value) {
            inmersionesTotal.value = final - inicial;
        } else {
            inmersionesTotal.value = '';
        }
    }

    if (inmersionesInicial && inmersionesFinal) {
        inmersionesInicial.addEventListener('input', calcularInmersiones);
        inmersionesFinal.addEventListener('input', calcularInmersiones);
    }

    const tiempoPerdidoInicial = document.getElementById('tiempo_perdido_inicial');
    const tiempoPerdidoFinal = document.getElementById('tiempo_perdido_final');
    const tiempoPerdidoTotal = document.getElementById('tiempo_perdido_total');

    function calcularTiempoPerdido() {
        const inicial = parseFloat(tiempoPerdidoInicial.value) || 0;
        const final = parseFloat(tiempoPerdidoFinal.value) || 0;
        if (tiempoPerdidoInicial.value || tiempoPerdidoFinal.value) {
            tiempoPerdidoTotal.value = (inicial + final).toFixed(1);
        } else {
            tiempoPerdidoTotal.value = '';
        }
    }

    if (tiempoPerdidoInicial && tiempoPerdidoFinal) {
        tiempoPerdidoInicial.addEventListener('input', calcularTiempoPerdido);
        tiempoPerdidoFinal.addEventListener('input', calcularTiempoPerdido);
    }

    // Form submission
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent standard form submission

        const form = document.getElementById('parametros-form');

        // Helper to safely get value
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        const flatRow = [
            getVal('mpcd_no'),
            getVal('tamano'),
            getVal('turno'),
            getVal('granel'),
            getVal('tecnico'),
            getVal('fecha'),
            getVal('hora_inicio'),
            getVal('inmersiones_inicial'),
            getVal('inmersiones_final'),
            getVal('inmersiones_total'),
            getVal('tiempo_perdido_inicial'),
            getVal('tiempo_perdido_final'),
            getVal('tiempo_perdido_total'),
            getVal('tapa_visc_sel'),
            getVal('tapa_visc_reg'),
            getVal('tapa_t_setpoint'),
            getVal('tapa_t_gelatina'),
            getVal('tapa_flujo_sec1'),
            getVal('tapa_t_sec1'),
            getVal('tapa_flujo_sec2'),
            getVal('tapa_t_sec2'),
            getVal('tapa_flujo_sec3'),
            getVal('tapa_t_sec3'),
            getVal('tapa_flujo_sec4'),
            getVal('tapa_t_sec4'),
            getVal('tapa_flujo_acon'),
            getVal('tapa_t_acon'),
            getVal('cuerpo_visc_sel'),
            getVal('cuerpo_visc_reg'),
            getVal('cuerpo_t_setpoint'),
            getVal('cuerpo_t_gelatina'),
            getVal('cuerpo_flujo_sec1'),
            getVal('cuerpo_t_sec1'),
            getVal('cuerpo_flujo_sec2'),
            getVal('cuerpo_t_sec2'),
            getVal('cuerpo_flujo_sec3'),
            getVal('cuerpo_t_sec3'),
            getVal('cuerpo_flujo_sec4'),
            getVal('cuerpo_t_sec4'),
            getVal('cuerpo_flujo_acon'),
            getVal('cuerpo_t_acon'),
            getVal('humedad_relativa'),
            getVal('humedad_uma_mpcd'),
            getVal('t_cuarto'),
            getVal('hora_limpieza')
        ];

        const rowsToSave = [flatRow];
        const googleScriptURL = GOOGLE_SCRIPT_URL;

        // Visual feedback
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Guardando...';
        btnSubmit.disabled = true;

        fetch(googleScriptURL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(rowsToSave),
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        })
            .then(() => {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Guardado exitoso!',
                        text: 'Verifica tu Google Sheet para confirmar los datos.',
                        confirmButtonColor: '#00658b',
                        timer: 3000
                    });
                } else {
                    alert('¡Guardado exitoso!');
                }
                form.reset();

                // Set default date and time after reset
                const now = new Date();
                const dateInput = document.getElementById('fecha');
                if (dateInput) dateInput.value = now.toISOString().split("T")[0];
                const timeInput = document.getElementById('hora_inicio');
                if (timeInput) timeInput.value = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
            })
            .catch((error) => {
                console.error("Error enviando datos:", error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de conexión',
                        text: 'Ocurrió un error al intentar enviar los datos.',
                        confirmButtonColor: '#00658b'
                    });
                } else {
                    alert('Ocurrió un error al intentar enviar los datos.');
                }
            })
            .finally(() => {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            });
    });
});
