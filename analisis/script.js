// script.js

// I. Valores Iniciales de los Parámetros (Inputs)
const initialParams = {
    C0: 1900, c1: 0.8, T0: 0, t: 0.2, TR0: 2000, I0: 4600, b: 30, G0: 3000, n: 0, z: 0,
    X0: 5000, IM0: 500, m: 0.24, k: 1, h: 100, Mp: 24500
};

let currentBaseParams = { ...initialParams };
let baseResults = {};

// V. Requisitos Adicionales: Validación de inputs
function validateParams(params) {
    const errors = [];
    if (params.c1 < 0 || params.c1 > 1) {
        errors.push("c1 (Propensión Marginal a Consumir) debe estar entre 0 y 1.");
    }
    if (params.t < 0 || params.t > 1) {
        errors.push("t (Tasa Impositiva) debe estar entre 0 y 1.");
    }
    if (params.h < 0) {
        errors.push("h (Sensibilidad de L a r) debe ser positivo (>= 0).");
    }
    if (params.b < 0) {
        errors.push("b (Sensibilidad de I a r) debe ser positivo (>= 0).");
    }
    
    const rho = 1 - params.c1 * (1 - params.t) - params.n - params.z + params.m;
    if (rho <= 0) {
        errors.push("El denominador del multiplicador (rho) debe ser positivo. Revise las propensiones.");
    }
    
    // Denominador IS-LM: D = h * rho + b * k
    const Denominator = params.h * rho + params.b * params.k;
    if (Denominator === 0) {
         errors.push("El denominador del equilibrio general (h*rho + b*k) es cero. El sistema no tiene solución.");
    }
    
    return errors;
}

// III. Lógica de Cálculo (Función Principal)
function calculateEquilibrium(params) {
    const { C0, c1, T0, t, TR0, I0, z, b, G0, n, X0, IM0, m, k, h, Mp } = params;

    // 1. Cálculo de Componentes Intermedios
    
    // A0 = C0 + c1(TR0 - T0) + I0 + G0 + (X0 - IM0)
    const A0 = C0 + c1 * (TR0 - T0) + I0 + G0 + (X0 - IM0); // A0 (Gasto Autónomo Agregado)

    // rho = 1 - c1(1-t) + n + m
    const rho = 1 - c1 * (1 - t) - n - z + m; // rho (Propensión Marginal Agregada al Ahorro y Fugas)
    
    // alpha = 1 / rho
    const alpha = 1 / rho; // alpha (Multiplicador Simple de Gasto)

    // Denominador para el cálculo de Y: D_calc = h * rho + b * k
    const Denominator_calc = h * rho + b * k;
    
    // Denominador estándar para los multiplicadores: D_std = h + alpha * b * k
    const Denominator_std = h + alpha * b * k; 

    // 2. Cálculo de Resultados de Equilibrio
    
    // Y_e = (h * A0 + b * M/P) / D_calc (La fórmula más precisa)
    const Y = (h * A0 + b * Mp) / Denominator_calc; // Renta de Equilibrio (Y_e)

    // r_e
    const r = (h === 0) ? (k * Y - Mp) / b : (k / h) * Y - (Mp / h); // Tipo de Interés de Equilibrio (r_e)

    // Definición estándar de los multiplicadores para visualización
    const gamma = (alpha * h) / Denominator_std; // gamma = (alpha * h) / (h + alpha * b * k)
    const beta = (alpha * b) / Denominator_std; // beta = (alpha * b) / (h + alpha * b * k)

    // 3. Cálculo de Variables de Gasto y Saldos Sectoriales
    const C = C0 + c1 * (Y - (T0 + t * Y) + TR0); // Consumo (C)
    const I = I0 - b * r + z * Y; // Inversión (I)
    const G = G0 + n * Y; // Gasto Público (G)
    const Sp = -C0 + (1 - c1) * (Y - (T0 + t * Y) + TR0); // Ahorro Privado (S_p)
    const SSP = (T0 + t * Y) - (G0 + n * Y) - TR0; // Saldo Sector Público (SSP)
    const SSE = (X0 - IM0) - m * Y; // Saldo Sector Exterior (SSE)
    
    // V. Requisitos Adicionales: Redondeo a dos decimales
    const round = (num) => Math.round(num * 100) / 100;

    return {
        Y: round(Y), r: round(r), A0: round(A0), rho: round(rho), alpha: round(alpha), 
        gamma: round(gamma), beta: round(beta), C: round(C), I: round(I), 
        G: round(G), Sp: round(Sp), SSP: round(SSP), SSE: round(SSE), 
        params: params // Devolver los parámetros para la simulación
    };
}

// Función para mostrar los resultados en la interfaz (fragmento)
function displayInitialResults(results) {
    document.getElementById('Y-initial').textContent = results.Y.toFixed(2);
    document.getElementById('r-initial').textContent = results.r.toFixed(2);
    document.getElementById('A0-initial').textContent = results.A0.toFixed(2);
    document.getElementById('rho-initial').textContent = results.rho.toFixed(2);
    document.getElementById('alpha-initial').textContent = results.alpha.toFixed(2);
    document.getElementById('gamma-initial').textContent = results.gamma.toFixed(2);
    document.getElementById('beta-initial').textContent = results.beta.toFixed(2);
    document.getElementById('C-initial').textContent = results.C.toFixed(2);
    document.getElementById('I-initial').textContent = results.I.toFixed(2);
    document.getElementById('G-initial').textContent = results.G.toFixed(2);
    document.getElementById('Sp-initial').textContent = results.Sp.toFixed(2);
    document.getElementById('SSP-initial').textContent = results.SSP.toFixed(2);
    document.getElementById('SSE-initial').textContent = results.SSE.toFixed(2);
}

// Función para mostrar la tabla de shocks y el mecanismo (fragmento)
function displayShockComparison(base, shock, shockedParam, isIncrease) {
    const tableBody = document.getElementById('shock-table-body');
    tableBody.innerHTML = '';
    
    const variables = {
        Y: 'Renta (Y_e)', r: 'Interés (r_e)', C: 'Consumo (C)', I: 'Inversión (I)', 
        G: 'Gasto P. (G)', Sp: 'Ahorro P. (S_p)', SSP: 'Saldo P. (SSP)', SSE: 'Saldo E. (SSE)'
    };
    
    for (const key in variables) {
        const baseValue = base[key];
        const shockValue = shock[key];
        const change = shockValue - baseValue;
        
        let percentChange = 0;
        if (Math.abs(baseValue) > 0.001) {
             percentChange = ((change / baseValue) * 100);
        } else if (Math.abs(change) > 0.001) {
            percentChange = change > 0 ? Infinity : -Infinity;
        }

        let changeClass = 'text-gray-700';
        let sign = '';
        if (change > 0.001) { 
            changeClass = 'positive-change font-bold';
            sign = '▲ ';
        } else if (change < -0.001) {
            changeClass = 'negative-change font-bold';
            sign = '▼ ';
        }

        const row = `
            <tr>
                <td class="p-3 border-b font-semibold">${variables[key]}</td>
                <td class="p-3 border-b text-center">${baseValue.toFixed(2)}</td>
                <td class="p-3 border-b text-center">${shockValue.toFixed(2)}</td>
                <td class="p-3 border-b text-center ${changeClass}">${sign}${percentChange.toFixed(2)}%</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    }
    
    // Mostrar Mecanismo de Transmisión (VI)
    const mechanism = getTransmissionMechanism(shockedParam, isIncrease);
    document.getElementById('transmission-title').textContent = mechanism.title;
    document.getElementById('transmission-text').innerHTML = mechanism.text; // <-- USAR innerHTML
    
    document.getElementById('shocks-results').classList.remove('hidden');
}


// VI. Mecanismos de Transmisión de Shocks (COMPLETAMENTE REVISADO EN HTML DETALLADO)
function getTransmissionMechanism(shockedParam, isIncrease) {
    // Función auxiliar para generar los textos HTML detallados.
    const createMechanismHtml = (shockedParam, isIncrease) => {
        const change = isIncrease ? "Aumento (↑)" : "Disminución (↓)";
        const sign = isIncrease ? "↑" : "↓";
        const signInv = isIncrease ? "↓" : "↑";
        
        // --- Shocks de Desplazamiento de la Curva IS (Fiscales y Autónomos) ---
        if (['G0', 'I0', 'C0', 'TR0', 'T0'].includes(shockedParam)) 
        {
            // Determinar si el shock es expansivo (desplazamiento a la derecha)
            let isExpansive;
            if (['G0', 'I0', 'C0', 'TR0'].includes(shockedParam)) {
                isExpansive = isIncrease; // ↑G0, ↑I0, ↑C0, ↑TR0 son expansivos
            } else if (shockedParam === 'T0') {
                isExpansive = !isIncrease; // ↑T0 es contractivo (↓Y), por lo tanto, una ↓T0 es expansiva
            }

            const curveShift = isExpansive ? "derecha" : "izquierda";
            const initialDAEffect = shockedParam === 'G0' ? `el Gasto Público (G0)` :
                                    shockedParam === 'I0' ? `la Inversión Autónoma (I0)` :
                                    shockedParam === 'C0' ? `el Consumo Autónomo (C0)` :
                                    shockedParam === 'TR0' ? `las Transferencias (TR0), lo que afecta al Consumo (C=c1*ΔTR0)` :
                                    `el Impuesto Autónomo (T0), lo que afecta al Consumo (C=-c1*ΔT0)`;
                                    
            const effect = isExpansive ? 'aumenta' : 'reduce';
            const ed = isExpansive ? 'Exceso de Demanda' : 'Exceso de Oferta';
            const ed_eo = isExpansive ? 'ED' : 'EO';
            const crowding = isExpansive ? 'Crowding-Out' : 'Estímulo de Inversión';
            const moderates = isExpansive ? 'modera' : 'amplifica';
            
            return `
                <p><b>Mecanismo de Transmisión del ${change} en ${shockedParam}</b></p>
                <p>Este shock fiscal/autónomo modifica el Gasto Agregado, desplazando la curva <b>IS</b> a la ${curveShift}, lo que afecta a ambos mercados.</p>
                <p><b>Secuencia Causal Detallada:</b></p>
                <ul>
                    <li><b>Paso 1: Impacto Inicial en el Gasto Agregado (DA) y la curva IS:</b><br>
                    El cambio en ${shockedParam} ${effect} directamente ${initialDAEffect}. Esto ${effect} el Gasto Agregado (DA), generando un <b>${ed} de Bienes (${ed_eo})</b>. La curva <b>IS se desplaza hacia la ${curveShift}</b>.</li>
                    <li><b>Paso 2: Equilibrio Transitorio en el Mercado de Bienes:</b><br>
                    El desequilibrio de la demanda estimula o contrae la producción, resultando en un <b>${isExpansive ? '↑Y' : '↓Y'}</b>.</li>
                    <li><b>Paso 3: El Efecto de Retroalimentación IS-LM (Mercado Monetario):</b><br>
                    El <b>${isExpansive ? '↑Y' : '↓Y'}</b> resultante incrementa (o reduce) la <b>Demanda de Dinero (L)</b> por transacción (L(Y)), creando un <b>Exceso de Demanda/Oferta de Dinero (EDL/EOL)</b>. Para restablecer el equilibrio, el <b>Tipo de Interés (r) debe ${isExpansive ? '↑r' : '↓r'}</b>.</li>
                    <li><b>Paso 4: El Ajuste Final del Mercado de Bienes (Efecto ${crowding}):</b><br>
                    El <b>${isExpansive ? '↑r' : '↓r'}</b> impacta la <b>Inversión Privada (I)</b> (I = I<sub>0</sub> - b*r), resultando en un <b>${isExpansive ? '↓I' : '↑I'}</b>. Esta caída/subida de I ${moderates} el impacto inicial sobre Y.</li>
                    <li><b>Paso 5: Conclusión del Nuevo Equilibrio Conjunto (Y*, r*):</b><br>
                    El sistema converge con un <b>${isExpansive ? '↑Y*' : '↓Y*'}</b> y un <b>${isExpansive ? '↑r*' : '↓r*'}</b>.</li>
                </ul>
            `;
        }
        
        // --- Shock de Desplazamiento de la Curva LM (Monetario) ---
        else if (shockedParam === 'Mp') {
            const curveShift = isIncrease ? "derecha" : "izquierda";
            const ed_eol = isIncrease ? 'Exceso de Oferta de Dinero (EOL)' : 'Exceso de Demanda de Dinero (EDL)';
            const effect = isIncrease ? 'estímulo' : 'contracción';

            return `
                <p><b>Mecanismo de Transmisión del ${change} en M/P (Oferta Monetaria Real)</b></p>
                <p>Este shock monetario inicia una secuencia causal que desplaza la curva <b>LM</b> a la ${curveShift}, alterando el Tipo de Interés.</p>
                <p><b>Secuencia Causal Detallada:</b></p>
                <ul>
                    <li><b>Paso 1: Impacto Inicial en el Mercado Monetario (LM):</b><br>
                    El ${change} en la Oferta Monetaria Real (M/P) genera un <b>${ed_eol}</b>. Los agentes ${isIncrease ? 'compran' : 'venden'} bonos, lo que obliga al <b>Tipo de Interés (r) a ${signInv}r</b>. La curva <b>LM se desplaza hacia la ${curveShift}</b>.</li>
                    <li><b>Paso 2: Equilibrio Transitorio en el Mercado de Dinero:</b><br>
                    El ${signInv}r se establece para igualar la Demanda de Dinero (L) a la nueva M/P, alcanzando un punto provisional.</li>
                    <li><b>Paso 3: El Efecto de Retroalimentación LM-IS (Mercado de Bienes):</b><br>
                    El <b>${signInv}r</b> provoca una <b>${sign}I</b> (Inversión, I = I0 - b*r). Este cambio en I genera un ${effect} en el Gasto Agregado (DA), creando un <b>Exceso de Demanda/Oferta de Bienes</b>.</li>
                    <li><b>Paso 4: El Ajuste Final del Mercado de Bienes (Efecto Multiplicador):</b><br>
                    El desequilibrio de la demanda provoca que la Renta comience a <b>${sign}Y</b>. Este ${sign}Y, a su vez, aumenta (o reduce) la demanda de dinero (L(Y)), lo que <b>mitiga parcialmente el ${signInv}r inicial</b> (movimiento a lo largo de la LM).</li>
                    <li><b>Paso 5: Conclusión del Nuevo Equilibrio Conjunto (Y*, r*):</b><br>
                    El nuevo equilibrio se establece con un <b>${sign}Y*</b> y un <b>${signInv}r*</b>.</li>
                </ul>
            `;
        }
        
        // --- Shocks Estructurales (Pendiente/Rotación) ---
        else if (['b', 'k', 'm', 'c1', 't', 'h'].includes(shockedParam)) {
            let details = {};
            let isSlopeChange = true; // Para diferenciar de c1, t que afectan ρ y el multiplicador

            if (shockedParam === 'b') {
                details.curve = 'IS'; details.slope = isIncrease ? 'más plana' : 'más vertical';
                details.slopeEq = '-rho/b'; details.shiftText = isIncrease ? 'mayor' : 'menor';
                details.efectivenessMonetary = isIncrease ? 'mayor' : 'menor';
                details.crowdingEffect = isIncrease ? 'mayor Crowding-Out' : 'menor Crowding-Out';
                details.Y = 'dependerá de la posición inicial del equilibrio';
                
            } else if (shockedParam === 'k') {
                details.curve = 'LM'; details.slope = isIncrease ? 'más vertical' : 'más plana';
                details.slopeEq = 'k/h'; details.shiftText = isIncrease ? 'menor' : 'mayor';
                details.efectivenessMonetary = isIncrease ? 'menor' : 'mayor';
                details.crowdingEffect = isIncrease ? 'mayor Crowding-Out' : 'menor Crowding-Out';
                details.Y = 'dependerá de la posición inicial del equilibrio';

            } else if (shockedParam === 'h') {
                details.curve = 'LM'; details.slope = isIncrease ? 'más plana' : 'más vertical';
                details.slopeEq = 'k/h'; details.shiftText = isIncrease ? 'mayor' : 'menor';
                details.efectivenessMonetary = isIncrease ? 'mayor' : 'menor';
                details.crowdingEffect = isIncrease ? 'menor Crowding-Out' : 'mayor Crowding-Out';
                details.Y = 'dependerá de la posición inicial del equilibrio';

            } else if (shockedParam === 'm' || shockedParam === 'c1' || shockedParam === 't') {
                isSlopeChange = false;
                const ρ_effect = (shockedParam === 'm' || (shockedParam === 't' && isIncrease)) ? 'incrementa' : 'reduce';
                const α_effect = ρ_effect === 'incrementa' ? 'reduce' : 'aumenta';
                const slope_change = ρ_effect === 'incrementa' ? 'más vertical' : 'más plana';

                details.shift = isIncrease ? '↑' : '↓';
                details.Y = (α_effect === 'reduce') ? '↓Y*' : '↑Y*';
                details.r = (α_effect === 'reduce') ? '↓r*' : '↑r*';
                
                return `
                    <p><b>Mecanismo de Transmisión del ${change} en ${shockedParam} (Impacto Estructural)</b></p>
                    <p>Este shock afecta la Propensión Marginal Agregada a las Fugas (ρ) y, por lo tanto, tanto el multiplicador simple (α) como la pendiente de la curva <b>IS</b>.</p>
                    <p><b>Secuencia Causal Detallada:</b></p>
                    <ul>
                        <li><b>Paso 1: Impacto en Fugas (ρ) y Multiplicador (α):</b><br>
                        El ${change} en ${shockedParam} ${ρ_effect} la Propensión Marginal a las Fugas (ρ = 1 - c1(1-t) + n + m). Esto, a su vez, ${α_effect} el <b>Multiplicador simple (α)</b>.</li>
                        <li><b>Paso 2: Impacto en la Pendiente y Desplazamiento de la IS:</b><br>
                        El cambio en ρ hace que la <b>IS rote</b> y se vuelva ${slope_change}. Además, la IS se desplaza, ya que el multiplicador de todos los componentes autónomos cambia.</li>
                        <li><b>Paso 3: Efecto de Amplificación:</b><br>
                        Un multiplicador ${α_effect} significa que cualquier cambio autónomo (incluyendo I0, G0, etc.) tendrá un efecto total ${α_effect} sobre la renta.</li>
                        <li><b>Paso 4: Efectividad de Políticas:</b><br>
                        La política fiscal y la monetaria verán su efectividad alterada debido al cambio en la pendiente de la IS.</li>
                        <li><b>Paso 5: Conclusión del Nuevo Equilibrio Conjunto (Y*, r*):</b><br>
                        En general, el equilibrio se establece con <b>${details.Y}</b> (si A0 > 0) y <b>${details.r}</b> (debido a que el cambio en α afecta el denominador IS-LM).</li>
                    </ul>
                `;
            }
            
            // Caso para b, k, h (Rotación)
            if (isSlopeChange) {
                return `
                    <p><b>Mecanismo de Transmisión del ${change} en ${shockedParam} (Impacto Estructural)</b></p>
                    <p>Este shock afecta la <b>pendiente de la curva ${details.curve}</b>, alterando la forma en que los mercados interactúan y la efectividad de las políticas.</p>
                    <p><b>Secuencia Causal Detallada:</b></p>
                    <ul>
                        <li><b>Paso 1: Impacto en la Pendiente de la Curva ${details.curve}:</b><br>
                        El ${change} en <b>${shockedParam}</b> modifica la pendiente de la ${details.curve} (${details.slopeEq}), haciendo que se vuelva <b>${details.slope}</b>. La curva rota sobre un punto fijo (la LM sobre el origen, la IS sobre el punto <b>r=0</b>).</li>
                        <li><b>Paso 2: Efectividad de la Política Monetaria (IS-LM):</b><br>
                        La política monetaria tiene una <b>${details.efectivenessMonetary} efectividad</b>. Un desplazamiento de la LM causa un ΔY mayor/menor debido a la ${details.curve} ${details.slope}.</li>
                        <li><b>Paso 3: Efectividad de la Política Fiscal (IS-LM):</b><br>
                        La política fiscal resulta en un <b>${details.crowdingEffect}</b>. Un desplazamiento de la IS causa un Δr ${details.shiftText} que resulta en un ΔI de sentido opuesto.</li>
                        <li><b>Paso 4: Nuevo Equilibrio:</b><br>
                        El nuevo equilibrio <b>Y*</b> y <b>r*</b> generalmente ${details.Y}, pero el impacto principal es en la sensibilidad del modelo a futuros shocks.</li>
                    </ul>
                `;
            }
        }
        
        // --- Shock no identificado ---
        else {
            return `<p><b>Mecanismo No Identificado</b></p><p>El parámetro <b>${shockedParam}</b> fue modificado, pero el mecanismo de transmisión detallado no está disponible en la base de datos de la calculadora.</p>`;
        }
    };
    
    // Devolver el objeto final, usando el HTML generado como el 'text'
    const htmlMechanism = createMechanismHtml(shockedParam, isIncrease);
    
    // El 'title' se mantiene simple ya que es solo el encabezado visible en el panel.
    const change = isIncrease ? "Aumento (↑)" : "Disminución (↓)";
    let title;
    let curve;
    if (shockedParam === 'Mp') curve = 'LM';
    else if (['G0', 'T0', 'TR0', 'I0', 'C0'].includes(shockedParam)) curve = 'IS';
    else if (['b', 'k', 'm', 'c1', 't', 'h'].includes(shockedParam)) curve = 'IS/LM (Estructural)';
    else curve = 'Desconocida';
    
    title = `${change} de ${shockedParam}. Curva afectada: ${curve}.`;

    return { title: title, text: htmlMechanism };
}


// VII. Lógica de Reestablecimiento de Saldos - CORREGIDA
function calculateBalancedEquilibrium() {
    const target = document.getElementById('target-balance').value;
    const policy = document.getElementById('policy-variable').value;
    const { C0, c1, T0, t, TR0, I0, b, G0, n, X0, IM0, m, k, h, Mp } = currentBaseParams;

    // Componentes Base
    const NX_aut = X0 - IM0;
    const A0_original = C0 + c1 * (TR0 - T0) + I0 + G0 + NX_aut;
    const rho = 1 - c1 * (1 - t) - n - z + m; 
    const Y_e_denom = h * rho + b * k; // D = h*rho + b*k
    
    let Y_star;
    let X_star = 0;
    let title = "";

    try {
        // Validaciones iniciales
        if (Y_e_denom === 0) throw new Error("Denominador IS-LM es cero. El sistema no tiene solución.");
        
        // Obtener gamma y beta originales
        const { gamma, beta } = baseResults;

        // --------------------------------------------------------
        // CASO 1: Objetivo Saldo Sector Exterior (NX = 0)
        // --------------------------------------------------------
        if (target === 'NX') {
            title = `Equilibrio forzado para NX = 0 (Ajuste de ${policy})`;
            if (m === 0) throw new Error("m no puede ser cero para NX=0.");
            
            // Paso 1: Renta Objetivo: Y* = NX_aut / m
            Y_star = NX_aut / m; 
            
            // Fórmula IS-LM despejando el numerador: h*A_aut* + b*M/P* = Y* * D
            const ISLM_numerator_required = Y_star * Y_e_denom;

            if (policy === 'Mp') {
                // Paso 2 y 3: X = M/P: M/P* = [Y* * D - h * A0] / b
                if (b === 0) throw new Error("b no puede ser cero si se ajusta M/P.");
                X_star = (ISLM_numerator_required - h * A0_original) / b;
            } else {
                // Paso 2 y 3: X = Fiscal: A_aut* = [Y* * D - b * M/P] / h
                if (h === 0) throw new Error("h no puede ser cero si se ajusta la política fiscal.");
                const A_aut_req = (ISLM_numerator_required - b * Mp) / h;
                
                // Paso 3: Despejar X* de A_aut_req
                if (policy === 'G0') {
                    const A_fixed = C0 + c1 * (TR0 - T0) + I0 + NX_aut; 
                    X_star = A_aut_req - A_fixed; // G0*
                } else if (policy === 'TR0') {
                    if (c1 === 0) throw new Error("c1 no puede ser cero para ajustar TR0.");
                    const A_fixed = C0 - c1 * T0 + I0 + G0 + NX_aut;
                    X_star = (A_aut_req - A_fixed) / c1; // TR0*
                } else if (policy === 'T0') {
                    if (c1 === 0) throw new Error("c1 no puede ser cero para ajustar T0.");
                    const A_fixed = C0 + c1 * TR0 + I0 + G0 + NX_aut;
                    X_star = (A_fixed - A_aut_req) / c1; // T0*
                }
            }
        } 
        
        // --------------------------------------------------------
        // CASO 2: Objetivo Saldo Sector Público (SSP = 0)
        // --------------------------------------------------------
        else if (target === 'SSP') {
            title = `Equilibrio forzado para SSP = 0 (Ajuste de ${policy})`;
            
            // Subcaso C.1: Política Monetaria (X = M/P) - Las variables fiscales son fijas
            if (policy === 'Mp') {
                const denom_t_n = t - n;
                if (denom_t_n === 0) throw new Error("t debe ser distinto de n para SSP=0.");
                
                // Paso 1: Renta Objetivo: Y* = (G0 + TR0 - T0) / (t - n)
                Y_star = (G0 + TR0 - T0) / denom_t_n; 
                
                // Paso 2 y 3: M/P* de IS-LM con Y*
                if (b === 0) throw new Error("b no puede ser cero si se ajusta M/P.");
                X_star = (Y_star * Y_e_denom - h * A0_original) / b;
            } 
            
            // Subcaso C.2: Política Fiscal (X = G0, T0, TR0) - LÓGICA CORREGIDA
            else { 
                let A_aut_fijo; // Término autónomo fijo A_aut^Fijo
                let multiplier_denom; // Denominador 1 - gamma * (∂A0/∂Y)

                // Paso 1 y 2: Determinar A_aut_Fijo y el denominador del multiplicador final
                if (policy === 'G0') {
                    // A_aut^Fijo(G0) = C0 + I0 + NX_aut + T0(1 - c1) - TR0(1 - c1)
                    A_aut_fijo = C0 + I0 + NX_aut + T0 * (1 - c1) - TR0 * (1 - c1);
                    multiplier_denom = 1 - gamma * (t - n - z);
                    
                } else if (policy === 'TR0' || policy === 'T0') {
                    // A_aut^Fijo(TR0/T0) = C0 + I0 + G0(1 - c1) + NX_aut
                    A_aut_fijo = C0 + I0 + G0 * (1 - c1) + NX_aut;
                    multiplier_denom = 1 - gamma * c1 * (t - n - z);
                }

                if (multiplier_denom === 0) throw new Error("El denominador del multiplicador final es cero. No hay equilibrio.");
                
                // Paso 4: Hallar la nueva Renta de Equilibrio (Y*)
                // Y* = [1 / multiplier_denom] * [gamma * A_aut^Fijo + beta * M/P]
                Y_star = (1 / multiplier_denom) * (gamma * A_aut_fijo + beta * Mp);

                // Paso 5: Volver a SSP=0 para hallar X*
                const ssp_Y_term = (t - n) * Y_star;
                
                if (policy === 'G0') {
                    X_star = T0 - TR0 + ssp_Y_term; // G0*
                } else if (policy === 'TR0') {
                    X_star = T0 - G0 + ssp_Y_term; // TR0*
                } else if (policy === 'T0') {
                    X_star = G0 + TR0 - ssp_Y_term; // T0*
                }
            }
        }

        // CÁLCULO FINAL DE r* (usando el nuevo Y* y el M/P que aplique)
        const Mp_final = (policy === 'Mp' && target !== 'NX') ? X_star : Mp; 
        const r_star = (h === 0) ? (k * Y_star - Mp_final) / b : (k / h) * Y_star - (Mp_final / h);

        // Paso 6: Mostrar Resultados
        const round = (num) => Math.round(num * 100) / 100;
        const adjustText = policy === 'Mp' ? 'M/P' : policy;
        const originalValue = currentBaseParams[policy];
        const deltaX = round(X_star - originalValue);

        document.getElementById('balanced-results').classList.remove('hidden');
        document.getElementById('Y-star').textContent = round(Y_star).toFixed(2);
        document.getElementById('r-star').textContent = round(r_star).toFixed(2);
        
        let deltaClass = (deltaX > 0) ? 'positive-change' : (deltaX < 0) ? 'negative-change' : 'text-gray-700';

        document.getElementById('delta-X').innerHTML = `Δ${adjustText} = <span class="${deltaClass}">${deltaX.toFixed(2)}</span> (Valor original: ${originalValue.toFixed(2)})`;
        document.getElementById('X-star').textContent = `${adjustText}* = ${round(X_star).toFixed(2)}`;
        document.getElementById('balanced-results').querySelector('h3').textContent = `Resultados: ${title}`;

    } catch (error) {
        document.getElementById('balanced-results').classList.remove('hidden');
        document.getElementById('balanced-results').innerHTML = `<h3 class="text-xl font-bold text-yellow-700 mb-4">Resultados: ${title}</h3><p class="p-4 bg-red-100 text-red-700 font-bold border-l-4 border-red-500">ERROR de Cálculo en Equilibrio Forzado: ${error.message}</p>`;
    }
}

// ---------------------------------------------------------------------------------
// MANEJO DE EVENTOS
// ---------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar inputs con valores base
    Object.keys(currentBaseParams).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = currentBaseParams[key];
    });

    // Calcular y mostrar el escenario base al inicio
    const initialValidationErrors = validateParams(currentBaseParams);
    if (initialValidationErrors.length > 0) {
        document.getElementById('validation-errors-base').textContent = "ERROR BASE: " + initialValidationErrors.join(' ');
        document.getElementById('validation-errors-base').classList.remove('hidden');
    } else {
        baseResults = calculateEquilibrium(currentBaseParams);
        displayInitialResults(baseResults);
    }
    
    // 1. Botón de Recálculo de Equilibrio Base
    document.getElementById('calculate-base-btn').addEventListener('click', () => {
        const newBaseParams = {};
        
        Object.keys(currentBaseParams).forEach(key => {
            const input = document.getElementById(key);
            newBaseParams[key] = parseFloat(input.value);
        });

        const validationErrors = validateParams(newBaseParams);
        if (validationErrors.length > 0) {
            document.getElementById('validation-errors-base').textContent = "ERROR EN PARÁMETROS BASE: " + validationErrors.join(' ');
            document.getElementById('validation-errors-base').classList.remove('hidden');
            return;
        } else {
            document.getElementById('validation-errors-base').classList.add('hidden');
            currentBaseParams = newBaseParams;
            baseResults = calculateEquilibrium(currentBaseParams);
            displayInitialResults(baseResults);
            document.getElementById('shocks-results').classList.add('hidden'); 
            document.getElementById('balanced-results').classList.add('hidden');
        }
    });

    // 2. Manejar la simulación de Shock
    document.getElementById('simulate-shock-btn').addEventListener('click', () => {
        const shockForm = document.getElementById('shock-form');
        let newParams = { ...currentBaseParams };
        let shockedParam = null;
        let isIncrease = null;

        const allInputs = Array.from(shockForm.querySelectorAll('input'));
        
        for (const input of allInputs) {
            if (input.value !== "") {
                const paramName = input.id.replace('shock-', '');
                const shockValue = parseFloat(input.value);
                
                if (!isNaN(shockValue)) {
                    // Sólo se aplica si el valor ha cambiado
                    if (shockValue !== currentBaseParams[paramName]) {
                        newParams[paramName] = shockValue;
                        
                        // Si es el primer shock identificado, lo registramos
                        if (shockedParam === null) {
                            shockedParam = paramName; 
                            isIncrease = shockValue > currentBaseParams[paramName];
                        }
                    }
                }
            }
        }
        
        const shockValidationErrors = validateParams(newParams);
        if (shockValidationErrors.length > 0) {
            document.getElementById('validation-errors-shock').textContent = "ERROR EN SIMULACIÓN: " + shockValidationErrors.join(' ');
            document.getElementById('validation-errors-shock').classList.remove('hidden');
            document.getElementById('shocks-results').classList.add('hidden');
            return;
        } else {
            document.getElementById('validation-errors-shock').classList.add('hidden');
        }

        const shockResults = calculateEquilibrium(newParams);
        displayShockComparison(baseResults, shockResults, shockedParam, isIncrease);
        
        // CORRECCIÓN DEL BUG: Resetea el formulario de shock para la próxima simulación
        shockForm.reset();
    });

    // 3. Manejar el Reestablecimiento de Saldos
    document.getElementById('calculate-balanced-btn').addEventListener('click', calculateBalancedEquilibrium);
});