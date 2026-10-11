/* =========================================================
   BATTERY HGR PREDICTOR
   Phase 1
========================================================= */


const HGR_MODELS = {

    LFP: {
        capacity: 1.0,
        minC: 0.5,
        maxC: 6.0,
        minT: 10,
        maxT: 60,

        // Visualization reference only
        visualMax: 6.0
    },

    NMC: {
        capacity: 2.5,
        minC: 0.5,
        maxC: 8.0,
        minT: 10,
        maxT: 60,

        // Visualization reference only
        visualMax: 16.0
    },

    LCO: {
        capacity: 2.6,
        minC: 0.5,
        maxC: 5.0,
        minT: 10,
        maxT: 60,

        // Visualization reference only
        visualMax: 10.0
    }

};



/* =========================================================
   LFP COR RELATION
   Equation (16)
========================================================= */

function calculateLFP_HGR(C, I, D, T) {

    const a0 = 2.5293524;
    const a1 = 0.6289797;
    const a2 = 0.59593695;
    const a3 = -0.10941234;
    const a4 = 0.13735075;
    const a5 = 0.025670875;


    const term1 =

        (a0 - a1 * D)

        *

        (
            C /
            (T + I + a2)
        )

        *

        a3

        *

        Math.sqrt(I);


    const term2 =

        C /

        (
            T -
            Math.sqrt(a4 * D)
        );


    const HGR =
        term1 +
        term2 -
        a5;


    return HGR;

}



/* =========================================================
   NMC HGR CORRELATION
   Equation (14) from the manuscript
   ========================================================= */

function calculateNMC_HGR(C, I, D, T) {

    const b0 = -0.093846105;
    const b1 =  0.002619058;
    const b2 =  0.6424564;
    const b3 = -0.54009145;
    const b4 =  0.04576035;
    const b5 = -0.06274791;

    const numerator =
        (b1 * D * I) *
        (
            (C / b2) +
            Math.cos(T) +
            Math.sin(Math.tan(T))
        );

    const denominator =
        (
            Math.tan(I) *
            Math.sin(b3 * T)
        ) -
        T;

    if (
        !Number.isFinite(numerator) ||
        !Number.isFinite(denominator)
    ) {
        return null;
    }

    if (Math.abs(denominator) < 1e-6) {
        return null;
    }

    const symbolicTerm =
        (
            (numerator / denominator) +
            b4
        ) *
        Math.log(T);

    const HGR =
        (
            b0 * I +
            symbolicTerm
        ) *
        Math.tanh(b5 * D);

    if (!Number.isFinite(HGR)) {
        return null;
    }

    return HGR;
}
/* =========================================================
   NMC HGR DIAGNOSTIC
   Used to identify unstable correlation conditions
   ========================================================= */

function diagnoseNMC_HGR(C, I, D, T) {

    const b0 = -0.093846105;
    const b1 =  0.002619058;
    const b2 =  0.6424564;
    const b3 = -0.54009145;
    const b4 =  0.04576035;
    const b5 = -0.06274791;


    /* -----------------------------------------------------
       Numerator
       ----------------------------------------------------- */

    const numerator =
        (b1 * D * I) *
        (
            (C / b2) +
            Math.cos(T) +
            Math.sin(Math.tan(T))
        );


    /* -----------------------------------------------------
       Denominator
       ----------------------------------------------------- */

    const denominator =
        (
            Math.tan(I) *
            Math.sin(b3 * T)
        ) -
        T;


    let symbolicTerm = null;
    let HGR = null;


    /* -----------------------------------------------------
       Validity check
       ----------------------------------------------------- */

    if (
        Number.isFinite(numerator) &&
        Number.isFinite(denominator) &&
        Math.abs(denominator) >= 1e-6 &&
        T > 0
    ) {

        /*
           Equation (14):

           [ numerator / denominator + b4 ] × ln(T)
        */

        symbolicTerm =
            (
                (numerator / denominator) +
                b4
            ) *
            Math.log(T);


        HGR =
            (
                b0 * I +
                symbolicTerm
            ) *
            Math.tanh(b5 * D);
    }


    return {

        C: C,

        current: I,

        DOD: D,

        temperature: T,

        numerator: numerator,

        denominator: denominator,

        symbolicTerm: symbolicTerm,

        HGR: HGR,

        valid:
            HGR !== null &&
            Number.isFinite(HGR),

        unstable:
            !Number.isFinite(denominator) ||
            Math.abs(denominator) < 1e-6
    };
}

/* =========================================================
   LCO HGR CORRELATION
   Equation (1) from the LCO manuscript
   ========================================================= */

function calculateLCO_HGR(C, I, D, T) {

    // Published LCO coefficients
    const a0 = 0.09882616;
    const a1 = 1.8190366;
    const a2 = 0.45524344;
    const a3 = 1.2983198;

    /*
     * -----------------------------------------------------
     * Numerator
     * -----------------------------------------------------
     *
     * [(a0 × I × D) + a1] × C
     */

    const numerator =
        ((a0 * I * D) + a1) * C;


    /*
     * -----------------------------------------------------
     * Denominator
     * -----------------------------------------------------
     *
     * sqrt{
     *     T × sqrt[e^(1-D) + a2×D]
     *     +
     *     [I - ln(I-a3)]
     * }
     */

    const logArgument = I - a3;

    /*
     * ln(I-a3) is defined only when I-a3 > 0
     */

    if (logArgument <= 0) {
        return null;
    }


    const denominatorInside =
        T *
        Math.sqrt(
            Math.exp(I - D) +
            a2 * D
        )
        +
        (
            I -
            Math.log(logArgument)
        );


    /*
     * Square-root domain check
     */

    if (denominatorInside <= 0) {
        return null;
    }


    const denominator =
        Math.sqrt(
            denominatorInside
        );


    /*
     * Numerical validity check
     */

    if (
        !Number.isFinite(numerator) ||
        !Number.isFinite(denominator) ||
        denominator === 0
    ) {
        return null;
    }


    /*
     * -----------------------------------------------------
     * Final HGR
     * -----------------------------------------------------
     */

    const HGR =
        numerator / denominator;


    /*
     * Final numerical validity check
     */

    if (!Number.isFinite(HGR)) {
        return null;
    }


    return HGR;
}


/* =========================================================
   UPDATE CURRENT
========================================================= */

function updateCurrent() {

    const chemistry =
        document.getElementById(
            "chemistry"
        ).value;


    const C =
        parseFloat(
            document.getElementById(
                "cRate"
            ).value
        );


    const model =
        HGR_MODELS[chemistry];


    if (!Number.isFinite(C)) {

        document.getElementById(
            "currentValue"
        ).textContent = "—";

        return;

    }


    const current =
        C * model.capacity;


    document.getElementById(
        "currentValue"
    ).textContent =
        current.toFixed(3);


    /* Update cell information */

    document.getElementById(
        "cellModelInfo"
    ).textContent =

        `${chemistry} 18650 · ` +
        `${model.capacity.toFixed(1)} Ah`;


    /* Update C-rate range */

    document.getElementById(
        "crateRange"
    ).textContent =

        `Validated range: ` +
        `${model.minC}C – ${model.maxC}C`;

}



/* =========================================================
   VALIDATION
========================================================= */

function validateInputs(
    chemistry,
    C,
    D,
    T
) {

    const model =
        HGR_MODELS[chemistry];


    if (!Number.isFinite(C)) {

        return {
            valid: false,
            message:
                "Please enter a valid C-rate."
        };

    }


    if (!Number.isFinite(D)) {

        return {
            valid: false,
            message:
                "Please enter a valid DOD."
        };

    }


    if (!Number.isFinite(T)) {

        return {
            valid: false,
            message:
                "Please enter a valid temperature."
        };

    }


    if (
        C < model.minC ||
        C > model.maxC
    ) {

        return {
            valid: false,
            message:
                `${chemistry} correlation is validated ` +
                `from ${model.minC}C to ` +
                `${model.maxC}C.`
        };

    }


    if (
        T < model.minT ||
        T > model.maxT
    ) {

        return {
            valid: false,
            message:
                `${chemistry} correlation is validated ` +
                `from ${model.minT}°C to ` +
                `${model.maxT}°C.`
        };

    }


    if (
        D < 0 ||
        D > 100
    ) {

        return {
            valid: false,
            message:
                "DOD must be between 0 and 100%."
        };

    }


    return {
        valid: true
    };

}



/* =========================================================
   DISPLAY MESSAGE
========================================================= */

function showMessage(
    message
) {

    const box =
        document.getElementById(
            "hgrMessage"
        );


    box.textContent = message;

    box.className =
        "hgr-message show error";

}



/* =========================================================
   CLEAR MESSAGE
========================================================= */

function clearMessage() {

    const box =
        document.getElementById(
            "hgrMessage"
        );


    box.textContent = "";

    box.className =
        "hgr-message";

}



/* =========================================================
   DISPLAY RESULT
========================================================= */

function displayHGR(
    chemistry,
    C,
    I,
    D,
    T,
    HGR
) {

    document.getElementById(
        "hgrValue"
    ).textContent =
        HGR.toFixed(4);


    document.getElementById(
        "resultChemistry"
    ).textContent =
        chemistry;


    document.getElementById(
        "resultC"
    ).textContent =
        C.toFixed(2) + " C";


    document.getElementById(
        "resultCurrent"
    ).textContent =
        I.toFixed(3) + " A";


    document.getElementById(
        "resultDOD"
    ).textContent =
        D.toFixed(1) + " %";


    document.getElementById(
        "resultTemp"
    ).textContent =
        T.toFixed(1) + " °C";


    updateHeatVisual(
        chemistry,
        HGR
    );


    const status =
        document.getElementById(
            "validityStatus"
        );


    status.innerHTML = `

        <i class="bi bi-check-circle-fill"></i>

        <div>

            <strong>
                Prediction within correlation domain
            </strong>

            <p>
                The selected operating condition
                is within the correlation domain.
            </p>

        </div>

    `;

}



/* =========================================================
   HGR HEAT VISUALIZATION
   Green → Yellow → Orange → Red → Dark Red
   ========================================================= */

function updateHeatVisual(chemistry, HGR) {

    const visual =
        document.getElementById("heatVisual");

    const level =
        document.getElementById("heatLevel");

    const icon =
        document.querySelector(".heat-icon i");

    const model =
        HGR_MODELS[chemistry];


    /* -----------------------------------------------------
       Safety check
    ----------------------------------------------------- */

    if (!visual || !level || !model) {

        console.error(
            "HGR visualization elements/model not found.",
            {
                visual: visual,
                level: level,
                model: model
            }
        );

        return;
    }


    /* -----------------------------------------------------
       Validate HGR
    ----------------------------------------------------- */

    if (!Number.isFinite(HGR)) {

        console.error(
            "Invalid HGR value:",
            HGR
        );

        return;
    }


    /* -----------------------------------------------------
       Normalize HGR for visualization
       
       This is ONLY for the visual scale.
       It does not modify the HGR value.
    ----------------------------------------------------- */

    let intensity =
        Math.abs(HGR) /
        model.visualMax;


    intensity =
        Math.max(
            0,
            Math.min(
                1,
                intensity
            )
        );


    /* -----------------------------------------------------
       DEBUG
    ----------------------------------------------------- */

    console.log(
        "HGR Visualization:",
        {
            chemistry: chemistry,
            HGR: HGR,
            visualMax: model.visualMax,
            intensity: intensity
        }
    );


    /* -----------------------------------------------------
       Color transition

       0.00–0.20 → Green
       0.20–0.40 → Yellow
       0.40–0.60 → Orange
       0.60–0.80 → Red
       0.80–1.00 → Dark Red
    ----------------------------------------------------- */

    let color;

    if (intensity < 0.20) {

        color = "#22c55e";

    }
    else if (intensity < 0.40) {

        color = "#eab308";

    }
    else if (intensity < 0.60) {

        color = "#f97316";

    }
    else if (intensity < 0.80) {

        color = "#ef4444";

    }
    else {

        color = "#991b1b";

    }


    /* -----------------------------------------------------
       Dynamic radial gradient
    ----------------------------------------------------- */

    visual.style.background = `
        radial-gradient(
            circle at 50% 45%,
            #ffffff 0%,
            ${color} 42%,
            ${darkenColor(color, 25)} 100%
        )
    `;


    /* -----------------------------------------------------
       Dynamic glow
    ----------------------------------------------------- */

    visual.style.boxShadow = `
        0 0 ${25 + intensity * 45}px
        ${hexToRgba(
            color,
            0.30 + intensity * 0.25
        )}
    `;


    /* -----------------------------------------------------
       Slight size response
    ----------------------------------------------------- */

    visual.style.transform =
        `scale(${1 + intensity * 0.04})`;


    /* -----------------------------------------------------
       Icon color
    ----------------------------------------------------- */

    if (icon) {

        icon.style.color =
            color;

    }


    /* -----------------------------------------------------
       HGR level
    ----------------------------------------------------- */

    if (intensity < 0.20) {

        level.textContent =
            "LOW";

    }
    else if (intensity < 0.40) {

        level.textContent =
            "MODERATE";

    }
    else if (intensity < 0.60) {

        level.textContent =
            "ELEVATED";

    }
    else if (intensity < 0.80) {

        level.textContent =
            "HIGH";

    }
    else {

        level.textContent =
            "VERY HIGH";

    }


    /* -----------------------------------------------------
       Level text color
    ----------------------------------------------------- */

    level.style.color =
        color;

}
/* =========================================================
   COLOR UTILITIES
========================================================= */

function hexToRgba(hex, alpha) {

    hex = hex.replace("#", "");

    const r =
        parseInt(hex.substring(0, 2), 16);

    const g =
        parseInt(hex.substring(2, 4), 16);

    const b =
        parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function darkenColor(hex, amount) {

    hex = hex.replace("#", "");

    let r =
        parseInt(hex.substring(0, 2), 16);

    let g =
        parseInt(hex.substring(2, 4), 16);

    let b =
        parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);

    return `
        rgb(${r}, ${g}, ${b})
    `;
}



/* =========================================================
   CALCULATE HGR
========================================================= */

function calculateHGR() {

    clearMessage();


    const chemistry =
        document.getElementById(
            "chemistry"
        ).value;


    const C =
        parseFloat(
            document.getElementById(
                "cRate"
            ).value
        );


    const D =
        parseFloat(
            document.getElementById(
                "dod"
            ).value
        );


    const T =
        parseFloat(
            document.getElementById(
                "temperature"
            ).value
        );


    const validation =
        validateInputs(
            chemistry,
            C,
            D,
            T
        );


    if (!validation.valid) {

        showMessage(
            validation.message
        );

        return;

    }


    const model =
        HGR_MODELS[chemistry];


    const I =
        C * model.capacity;


    let HGR;

if (chemistry === "LFP") {

    HGR = calculateLFP_HGR(
        C,
        I,
        D,
        T
    );

} else if (chemistry === "NMC") {

    HGR = calculateNMC_HGR(
        C,
        I,
        D,
        T
    );

} else if (chemistry === "LCO") {

    HGR = calculateLCO_HGR(
        C,
        I,
        D,
        T
    );

}

    if (
        !Number.isFinite(HGR)
    ) {

        showMessage(
            "The correlation produced an invalid result for this combination of inputs."
        );

        return;

    }


    displayHGR(
        chemistry,
        C,
        I,
        D,
        T,
        HGR
    );

}



/* =========================================================
   RESET
========================================================= */

function resetHGR() {

    document.getElementById(
        "chemistry"
    ).value = "LFP";


    document.getElementById(
        "cRate"
    ).value = "2";


    document.getElementById(
        "dod"
    ).value = "80";


    document.getElementById(
        "temperature"
    ).value = "25";


    clearMessage();


    document.getElementById(
        "hgrValue"
    ).textContent =
        "0.0000";


    document.getElementById(
        "resultChemistry"
    ).textContent =
        "LFP";


    document.getElementById(
        "resultC"
    ).textContent =
        "2.00 C";


    document.getElementById(
        "resultCurrent"
    ).textContent =
        "2.000 A";


    document.getElementById(
        "resultDOD"
    ).textContent =
        "80 %";


    document.getElementById(
        "resultTemp"
    ).textContent =
        "25 °C";


    updateCurrent();


    const visual =
        document.getElementById(
            "heatVisual"
        );


    visual.style.background =
        `radial-gradient(
            circle,
            #ffffff 0%,
            #eef2f6 42%,
            #cfd6df 100%
        )`;


    visual.style.boxShadow =
        "0 0 25px rgba(0,0,0,0.08)";


    visual.style.transform =
        "scale(1)";


    document.getElementById(
        "heatLevel"
    ).textContent =
        "READY";


    document.getElementById(
        "validityStatus"
    ).innerHTML = `

        <i class="bi bi-info-circle-fill"></i>

        <div>

            <strong>
                Correlation Ready
            </strong>

            <p>
                Enter operating conditions
                and calculate HGR.
            </p>

        </div>

    `;

}





/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        updateCurrent();


        document.getElementById(
            "chemistry"
        ).addEventListener(
            "change",
            updateCurrent
        );


        document.getElementById(
            "cRate"
        ).addEventListener(
            "input",
            updateCurrent
        );


        document.getElementById(
            "calculateHGR"
        ).addEventListener(
            "click",
            calculateHGR
        );


        document.getElementById(
            "resetHGR"
        ).addEventListener(
            "click",
            resetHGR
        );

    }
    
);

/* =========================================================
   CORRELATION TABS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const tabs =
            document.querySelectorAll(
                ".correlation-tab"
            );

        const panels =
            document.querySelectorAll(
                ".correlation-panel"
            );


        tabs.forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        const target =
                            this.dataset.target;


                        /* Remove active state */

                        tabs.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        panels.forEach(
                            function (panel) {

                                panel.classList.remove(
                                    "active"
                                );

                            }
                        );


                        /* Activate selected tab */

                        this.classList.add(
                            "active"
                        );


                        const selectedPanel =
                            document.getElementById(
                                target
                            );


                        if (selectedPanel) {

                            selectedPanel.classList.add(
                                "active"
                            );


                            /*
                             * MathJax may need to typeset
                             * the newly visible equation.
                             */

                            if (
                                window.MathJax &&
                                window.MathJax.typesetPromise
                            ) {

                                window.MathJax
                                    .typesetPromise(
                                        [selectedPanel]
                                    );

                            }

                        }

                    }
                );

            }
        );

    }
);

/* =========================================================
   HGR EXPLORER / HEATMAP
========================================================= */

function generateHGRHeatmap() {

    const chemistry =
        document.getElementById(
            "explorerChemistry"
        ).value;


    const D =
        parseFloat(
            document.getElementById(
                "explorerDOD"
            ).value
        );


    const Cmin =
        parseFloat(
            document.getElementById(
                "explorerCMin"
            ).value
        );


    const Cmax =
        parseFloat(
            document.getElementById(
                "explorerCMax"
            ).value
        );


    const Tmin =
        parseFloat(
            document.getElementById(
                "explorerTMin"
            ).value
        );


    const Tmax =
        parseFloat(
            document.getElementById(
                "explorerTMax"
            ).value
        );


    const model =
        HGR_MODELS[chemistry];


    /* =========================================
       VALIDATE
    ========================================== */

    if (!Number.isFinite(D) ||
        D < 0 ||
        D > 100) {

        alert(
            "DOD must be between 0 and 100%."
        );

        return;

    }


    if (!Number.isFinite(Cmin) ||
        !Number.isFinite(Cmax) ||
        Cmin >= Cmax) {

        alert(
            "Please enter a valid C-rate range."
        );

        return;

    }


    if (
        Cmin < model.minC ||
        Cmax > model.maxC
    ) {

        alert(
            `${chemistry} correlation domain: ` +
            `${model.minC}C – ${model.maxC}C.`
        );

        return;

    }


    if (!Number.isFinite(Tmin) ||
        !Number.isFinite(Tmax) ||
        Tmin >= Tmax) {

        alert(
            "Please enter a valid temperature range."
        );

        return;

    }


    if (
        Tmin < model.minT ||
        Tmax > model.maxT
    ) {

        alert(
            `${chemistry} correlation domain: ` +
            `${model.minT}–${model.maxT} °C.`
        );

        return;

    }


 /* =========================================
   CREATE AXES
========================================== */

/*
 * NMC:
 * Use experimentally evaluated C-rate points.
 * Use temperature points at 5 °C intervals.
 *
 * This avoids artificial intermediate C-rates
 * such as 3.15 C.
 */

let cRates = [];
let temperatures = [];


if (chemistry === "NMC") {

    cRates = [
        0.5,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
    ];

    temperatures = [
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        55,
        60
    ];

}
else if (chemistry === "LCO") {

    cRates = [
        0.5,
        1,
        2,
        3,
        4,
        5
    ];

    temperatures = [
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        55,
        60
    ];

}
else {

    // Existing LFP grid

    const numberCPoints = 35;
    const numberTPoints = 26;

    for (
        let i = 0;
        i < numberCPoints;
        i++
    ) {

        const C =
            Cmin +
            (Cmax - Cmin) *
            i /
            (numberCPoints - 1);

        cRates.push(C);
    }


    for (
        let j = 0;
        j < numberTPoints;
        j++
    ) {

        const T =
            Tmin +
            (Tmax - Tmin) *
            j /
            (numberTPoints - 1);

        temperatures.push(T);
    }

}
/* =========================================================
   CALCULATE HGR MATRIX
========================================================= */

const z = [];

for (let j = 0; j < temperatures.length; j++) {

    const row = [];
    const T = temperatures[j];

    for (let i = 0; i < cRates.length; i++) {

        const C = cRates[i];

        // Current calculated from C-rate and cell capacity
        const I = C * model.capacity;

let HGR;

if (chemistry === "LFP") {

    HGR = calculateLFP_HGR(
        C,
        I,
        D,
        T
    );

} else if (chemistry === "NMC") {

    HGR = calculateNMC_HGR(
        C,
        I,
        D,
        T
    );

} else if (chemistry === "LCO") {

    HGR = calculateLCO_HGR(
        C,
        I,
        D,
        T
    );

}
        /* -------------------------------------------------
           NUMERICAL VALIDATION
           ------------------------------------------------- */

        // Only replace invalid numerical results.
        // DO NOT modify valid negative HGR values.
        if (!Number.isFinite(HGR)) {
            HGR = null;
        }

        row.push(HGR);
    }

    z.push(row);
}

    /* =========================================
       HEATMAP
    ========================================== */

    const trace = {

        x: cRates,

        y: temperatures,

        z: z,

        type: "heatmap",

        colorscale: [
    [0.00, "#15803d"],   // Green
    [0.15, "#22c55e"],   // Green
    [0.30, "#84cc16"],   // Lime
    [0.45, "#facc15"],   // Yellow
    [0.60, "#f59e0b"],   // Orange
    [0.75, "#f97316"],   // Orange-red
    [0.90, "#ef4444"],   // Red
    [1.00, "#7f1d1d"]    // Dark red
],

        colorbar: {

    title: {
        text: "HGR (W)"
    },

    titleside: "right",

    thickness: 16,

    len: 0.82,

    outlinewidth: 0,

    tickfont: {
        size: 11
    }

},

        hovertemplate:

            "C-rate: %{x:.2f} C" +

            "<br>" +

            "Temperature: %{y:.1f} °C" +

            "<br>" +

            "<b>HGR: %{z:.4f} W</b>" +

            "<extra>" +

            chemistry +

            "</extra>"

    };


    const layout = {

        title: {

            text:
                `${chemistry} HGR Distribution ` +
                `(DOD = ${D.toFixed(0)}%)`,

            font: {
                size: 18
            }

        },


        xaxis: {

            title:
                "C-rate (C)",

            showgrid: false

        },


        yaxis: {

            title:
                "Temperature (°C)",

            showgrid: false

        },


        margin: {

            l: 75,

            r: 80,

            t: 60,

            b: 65

        },


        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "white",

        font: {

            family:
                "Poppins, sans-serif"

        }

    };


    const config = {

        responsive: true,

        displaylogo: false,

        modeBarButtonsToRemove: [

            "lasso2d",

            "select2d"

        ]

    };


    Plotly.newPlot(

        "hgrHeatmap",

        [trace],

        layout,

        config

    );


    /* =========================================
       UPDATE INFORMATION
    ========================================== */

    document.getElementById(
        "heatmapFixedDOD"
    ).textContent =

        `DOD = ${D.toFixed(1)} %`;


    document.getElementById(
        "heatmapStatus"
    ).innerHTML = `

        <i class="bi bi-check-circle-fill"></i>

        <span>

            ${chemistry} heatmap generated for
            DOD = ${D.toFixed(1)}%,
            C-rate = ${Cmin.toFixed(1)}–${Cmax.toFixed(1)} C,
            and temperature =
            ${Tmin.toFixed(0)}–${Tmax.toFixed(0)} °C.

        </span>

    `;

}



/* =========================================================
   HGR EXPLORER INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const chemistrySelect =
            document.getElementById(
                "explorerChemistry"
            );


        const cMax =
            document.getElementById(
                "explorerCMax"
            );


        /*
         * Update maximum C-rate
         * when chemistry changes.
         */

        chemistrySelect.addEventListener(
            "change",
            function () {

                const model =
                    HGR_MODELS[
                        this.value
                    ];


                cMax.value =
                    model.maxC;

            }
        );


        /*
         * Generate heatmap button
         */

        document.getElementById(
            "generateHeatmap"
        ).addEventListener(
            "click",
            generateHGRHeatmap
        );


        /*
         * Generate initial heatmap
         */

        generateHGRHeatmap();

    }
);

console.log(
    "NMC HGR TEST 1:",
    diagnoseNMC_HGR(1, 2.5, 70, 20)
);

console.log(
    "NMC HGR TEST 2:",
    diagnoseNMC_HGR(2, 5, 50, 10)
);

console.log(
    "NMC HGR TEST 3:",
    diagnoseNMC_HGR(3, 7.5, 20, 10)
);

