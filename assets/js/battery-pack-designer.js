/* =========================================================
   BATTERY PACK DESIGNER
========================================================= */


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        attachLoadListeners();

        calculateTotalLoad();

        calculateBasicPack();

    }
);


/* =========================================================
   MODE SELECTOR
========================================================= */

function setupModeSelector() {

    const options =
        document.querySelectorAll(
            'input[name="designMode"]'
        );

    options.forEach(
        function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    const mode =
                        this.value;

                    const basic =
                        document.getElementById(
                            "basicMode"
                        );

                    const ev =
                        document.getElementById(
                            "evMode"
                        );

                    const labels =
                        document.querySelectorAll(
                            ".mode-option"
                        );

                    labels.forEach(
                        function (label) {

                            label.classList.remove(
                                "active"
                            );

                        }
                    );

                    this.closest(
                        ".mode-option"
                    ).classList.add(
                        "active"
                    );


                    if (mode === "basic") {

                        basic.classList.remove(
                            "hidden"
                        );

                        ev.classList.add(
                            "hidden"
                        );

                    }
                    else {

                        basic.classList.add(
                            "hidden"
                        );

                        ev.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   BASIC PACK DESIGN
========================================================= */
/* =========================================================
   LOAD CALCULATOR
========================================================= */


/* ---------------------------------------------------------
   CALCULATE TOTAL LOAD
--------------------------------------------------------- */

function calculateTotalLoad() {

    const rows =
        document.querySelectorAll(
            ".load-row"
        );

    let totalLoad = 0;


    rows.forEach(row => {

        const quantity =
            parseFloat(
                row.querySelector(
                    ".load-quantity"
                ).value
            ) || 0;


        const power =
            parseFloat(
                row.querySelector(
                    ".load-power"
                ).value
            ) || 0;


        const rowTotal =
            quantity * power;


        const totalElement =
            row.querySelector(
                ".load-total"
            );


        totalElement.textContent =
            `${rowTotal.toFixed(0)} W`;


        totalLoad += rowTotal;

    });


    const totalElement =
        document.getElementById(
            "totalLoadPower"
        );


    if (totalElement) {

        totalElement.textContent =
            `${totalLoad.toFixed(0)} W`;

    }


    return totalLoad;

}


/* ---------------------------------------------------------
   ADD NEW LOAD
--------------------------------------------------------- */

function addLoadRow(
    name = "",
    quantity = 1,
    power = 0
) {

    const tbody =
        document.getElementById("loadTableBody");

    const row =
        document.createElement("tr");

    row.className = "load-row";

    row.innerHTML = `

        <td>
            <input
                type="text"
                class="load-name"
                value="${name}"
                placeholder="e.g. Fan"
            >
        </td>

        <td>
            <input
                type="number"
                class="load-quantity"
                value="${quantity}"
                min="1"
                step="1"
            >
        </td>

        <td>
            <input
                type="number"
                class="load-power"
                value="${power}"
                min="0"
                step="1"
            >
        </td>

        <td>
            <strong class="load-total">
                ${(quantity * power).toFixed(0)} W
            </strong>
        </td>

        <td>
            <button
                type="button"
                class="remove-load"
                onclick="removeLoadRow(this)"
                title="Remove load"
            >
                <i class="bi bi-trash3"></i>
            </button>
        </td>

    `;

    tbody.appendChild(row);

    attachLoadListeners(row);

    calculateTotalLoad();
}

/* ---------------------------------------------------------
   REMOVE LOAD
--------------------------------------------------------- */

function removeLoadRow(button) {

    const rows =
        document.querySelectorAll(
            ".load-row"
        );


    /*
       Keep at least one load row.
    */

    if (rows.length <= 1) {

        alert(
            "At least one load is required."
        );

        return;

    }


    const row =
        button.closest(
            ".load-row"
        );


    if (row) {

        row.remove();

    }


    calculateTotalLoad();

}


/* ---------------------------------------------------------
   INPUT LISTENERS
--------------------------------------------------------- */

function attachLoadListeners() {

    const inputs =
        document.querySelectorAll(
            ".load-quantity, .load-power"
        );


    inputs.forEach(input => {

        input.removeEventListener(
            "input",
            calculateTotalLoad
        );


        input.addEventListener(
            "input",
            calculateTotalLoad
        );

    });

}


/* ---------------------------------------------------------
   INITIALIZE LOAD CALCULATOR
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        attachLoadListeners();

        calculateTotalLoad();

    }
);
function calculateBasicPack() {

    const Vcell =
        parseFloat(
            document.getElementById(
                "basicCellVoltage"
            ).value
        );

    const Vlower =
        parseFloat(
            document.getElementById(
                "basicLowerCutoff"
            ).value
        );

    const Vupper =
        parseFloat(
            document.getElementById(
                "basicUpperCutoff"
            ).value
        );

    const AhCell =
        parseFloat(
            document.getElementById(
                "basicCellCapacity"
            ).value
        );

    const Icell =
        parseFloat(
            document.getElementById(
                "basicCellCurrent"
            ).value
        );

    const Ns =
        parseInt(
            document.getElementById(
                "basicNs"
            ).value
        );

    const Np =
        parseInt(
            document.getElementById(
                "basicNp"
            ).value
        );

    const loadPower = calculateTotalLoad();

    const peakFactor =
        parseFloat(
            document.getElementById(
                "basicPeakFactor"
            ).value
        );

    const efficiency =
        parseFloat(
            document.getElementById(
                "basicEfficiency"
            ).value
        ) / 100;

    const requiredBackup =
        parseFloat(
            document.getElementById(
                "basicBackupTime"
            ).value
        );


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
        !Number.isFinite(Vcell) ||
        Vcell <= 0 ||

        !Number.isFinite(Vlower) ||
        Vlower <= 0 ||

        !Number.isFinite(Vupper) ||
        Vupper <= 0 ||

        Vlower >= Vupper ||

        !Number.isFinite(AhCell) ||
        AhCell <= 0 ||

        !Number.isFinite(Icell) ||
        Icell <= 0 ||

        !Number.isInteger(Ns) ||
        Ns < 1 ||

        !Number.isInteger(Np) ||
        Np < 1 ||

        !Number.isFinite(loadPower) ||
        loadPower < 0 ||

        !Number.isFinite(peakFactor) ||
        peakFactor < 1 ||

        !Number.isFinite(efficiency) ||
        efficiency <= 0 ||
        efficiency > 1 ||

        !Number.isFinite(requiredBackup) ||
        requiredBackup < 0

    ) {

        alert(
            "Please enter valid battery pack and load parameters."
        );

        return;

    }


    /* =====================================================
       PACK VOLTAGES
    ===================================================== */

    const VpackMin =
        Ns * Vlower;

    const VpackNominal =
        Ns * Vcell;

    const VpackMax =
        Ns * Vupper;


    /* =====================================================
       PACK CAPACITY
    ===================================================== */

    const Ahpack =
        Np * AhCell;


    /* =====================================================
       NOMINAL ENERGY
    ===================================================== */

    const EnergyWh =
        VpackNominal *
        Ahpack;

    const EnergyKWh =
        EnergyWh / 1000;


    /* =====================================================
       USABLE ENERGY

       Here we use the cell voltage window as an
       approximate usable-energy window.

       This is an electrical sizing approximation,
       not an electrochemical energy calculation.
    ===================================================== */

    const usableVoltageFraction =
        Math.max(
            0,
            Math.min(
                1,
                (Vcell - Vlower) /
                (Vupper - Vlower)
            )
        );


    /*
       For pack sizing, use the fraction of the
       nominal energy represented by the voltage
       window.

       This is deliberately labelled approximate.
    */

    const usableEnergyKWh =
        EnergyKWh *
        usableVoltageFraction;


    /* =====================================================
       MAXIMUM PACK CURRENT
    ===================================================== */

    const maxPackCurrent =
        Np * Icell;


    /* =====================================================
       MAXIMUM THEORETICAL POWER
    ===================================================== */

    const maxPackPower =
        (
            VpackNominal *
            maxPackCurrent
        ) / 1000;


    /* =====================================================
       LOAD CURRENT

       Use minimum pack voltage because this gives
       a more conservative battery-side current.
    ===================================================== */

    const loadCurrent =
        loadPower /
        (
            VpackMin *
            efficiency
        );


    /* =====================================================
       PEAK LOAD CURRENT
    ===================================================== */

    const peakLoadPower =
        loadPower *
        peakFactor;


    const peakCurrent =
        peakLoadPower /
        (
            VpackMin *
            efficiency
        );


    /* =====================================================
       ENERGY REQUIRED FOR BACKUP

       Load energy required at battery side.
    ===================================================== */

    const requiredEnergyKWh =
        (
            loadPower *
            requiredBackup
        ) /
        (
            1000 *
            efficiency
        );


    /* =====================================================
       ESTIMATED BACKUP TIME

       More conservative calculation based on
       usable energy.
    ===================================================== */

    let estimatedBackup = 0;

    if (loadPower > 0) {

        estimatedBackup =
            (
                usableEnergyKWh *
                1000 *
                efficiency
            ) /
            loadPower;

    }


    /* =====================================================
       BMS CURRENT REQUIREMENT
    ===================================================== */

    const bmsContinuous =
        loadCurrent;


    const bmsPeak =
        peakCurrent;


    /* =====================================================
       CURRENT CAPABILITY CHECK
    ===================================================== */

    const capabilityStatus =
        document.getElementById(
            "basicCapabilityStatus"
        );

    if (
        peakCurrent <= maxPackCurrent
    ) {

        capabilityStatus.classList.remove(
            "warning"
        );

        capabilityStatus.innerHTML = `

            <i class="bi bi-check-circle-fill"></i>

            <div>

                <strong>
                    Pack current capability is adequate
                </strong>

                <p>
                    Peak calculated current is within
                    the maximum continuous cell-current
                    capability of the selected pack.
                </p>

            </div>

        `;

    }
    else {

        capabilityStatus.classList.add(
            "warning"
        );

        capabilityStatus.innerHTML = `

            <i class="bi bi-exclamation-triangle-fill"></i>

            <div>

                <strong>
                    Parallel cell count may be insufficient
                </strong>

                <p>
                    Peak load current exceeds the
                    calculated maximum pack current.
                    Increase Np or select a higher-current cell.
                </p>

            </div>

        `;

    }


    /* =====================================================
       UPDATE CONFIGURATION
    ===================================================== */

    document.getElementById(
        "basicConfiguration"
    ).textContent =
        `${Ns}S${Np}P`;


    /* =====================================================
       VOLTAGE RESULTS
    ===================================================== */

    document.getElementById(
        "basicPackMinVoltage"
    ).textContent =
        `${VpackMin.toFixed(2)} V`;


    document.getElementById(
        "basicPackVoltage"
    ).textContent =
        `${VpackNominal.toFixed(2)} V`;


    document.getElementById(
        "basicPackMaxVoltage"
    ).textContent =
        `${VpackMax.toFixed(2)} V`;


    /* =====================================================
       PACK RESULTS
    ===================================================== */

    document.getElementById(
        "basicPackCapacity"
    ).textContent =
        `${Ahpack.toFixed(2)} Ah`;


    document.getElementById(
        "basicPackEnergy"
    ).textContent =
        `${EnergyKWh.toFixed(2)} kWh`;


    document.getElementById(
        "basicUsableEnergy"
    ).textContent =
        `${usableEnergyKWh.toFixed(2)} kWh`;


    document.getElementById(
        "basicPackCurrent"
    ).textContent =
        `${maxPackCurrent.toFixed(2)} A`;


    document.getElementById(
        "basicPackPower"
    ).textContent =
        `${maxPackPower.toFixed(2)} kW`;


    document.getElementById(
        "basicTotalCells"
    ).textContent =
        Ns * Np;


    /* =====================================================
       LOAD RESULTS
    ===================================================== */

    document.getElementById(
        "basicLoadCurrent"
    ).textContent =
        `${loadCurrent.toFixed(2)} A`;


    document.getElementById(
        "basicPeakCurrent"
    ).textContent =
        `${peakCurrent.toFixed(2)} A`;


    document.getElementById(
        "basicRequiredEnergy"
    ).textContent =
        `${requiredEnergyKWh.toFixed(2)} kWh`;


    document.getElementById(
        "basicEstimatedBackup"
    ).textContent =
        `${estimatedBackup.toFixed(2)} h`;


    /* =====================================================
       BMS RESULTS
    ===================================================== */

    document.getElementById(
        "basicBMSContinuous"
    ).textContent =
        `≥ ${bmsContinuous.toFixed(2)} A`;


    document.getElementById(
        "basicBMSPeak"
    ).textContent =
        `≥ ${bmsPeak.toFixed(2)} A`;

}


/* =========================================================
   EV PACK DESIGN
========================================================= */

function calculateEVPack() {

    const Vcell =
        parseFloat(
            document.getElementById(
                "evCellVoltage"
            ).value
        );

    const AhCell =
        parseFloat(
            document.getElementById(
                "evCellCapacity"
            ).value
        );

    const Icell =
        parseFloat(
            document.getElementById(
                "evCellCurrent"
            ).value
        );

    const targetVoltage =
        parseFloat(
            document.getElementById(
                "evTargetVoltage"
            ).value
        );

    const targetEnergy =
        parseFloat(
            document.getElementById(
                "evTargetEnergy"
            ).value
        );

    const motorPower =
        parseFloat(
            document.getElementById(
                "evMotorPower"
            ).value
        );

    const efficiency =
        parseFloat(
            document.getElementById(
                "evEfficiency"
            ).value
        ) / 100;

    const consumption =
        parseFloat(
            document.getElementById(
                "evConsumption"
            ).value
        );


    /*
       Validate inputs
    */

    if (
        !Number.isFinite(Vcell) ||
        Vcell <= 0 ||
        !Number.isFinite(AhCell) ||
        AhCell <= 0 ||
        !Number.isFinite(Icell) ||
        Icell <= 0 ||
        !Number.isFinite(targetVoltage) ||
        targetVoltage <= 0 ||
        !Number.isFinite(targetEnergy) ||
        targetEnergy <= 0 ||
        !Number.isFinite(motorPower) ||
        motorPower < 0 ||
        !Number.isFinite(efficiency) ||
        efficiency <= 0 ||
        efficiency > 1 ||
        !Number.isFinite(consumption) ||
        consumption <= 0
    ) {

        return;

    }


    /*
       =====================================================
       SERIES CELL CALCULATION

       Ns is selected so that nominal pack voltage
       reaches or exceeds the target voltage.
       =====================================================
    */

    const Ns =
        Math.ceil(
            targetVoltage /
            Vcell
        );


    /*
       Energy of one cell
    */

    const cellEnergyKWh =
        (
            Vcell *
            AhCell
        ) / 1000;


    /*
       Energy of one series string
    */

    const stringEnergyKWh =
        Ns *
        cellEnergyKWh;


    /*
       Determine number of parallel strings
       required to meet target energy.
    */

    const Np =
        Math.max(
            1,
            Math.ceil(
                targetEnergy /
                stringEnergyKWh
            )
        );


    /*
       =====================================================
       PACK VALUES
       =====================================================
    */

    const Vnom =
        Ns *
        Vcell;


    const Ahpack =
        Np *
        AhCell;


    const EnergyKWh =
        (
            Vnom *
            Ahpack
        ) / 1000;


    /*
       Maximum continuous current
    */

    const Icontinuous =
        Np *
        Icell;


    /*
       Maximum theoretical continuous power
    */

    const Pcontinuous =
        (
            Vnom *
            Icontinuous
        ) / 1000;


    /*
       Motor battery-side power

       Pbattery = Pmotor / efficiency
    */

    const batteryPower =
        motorPower /
        efficiency;


    /*
       Required battery current

       Use nominal pack voltage for preliminary
       calculation.
    */

    const motorCurrent =
        (
            batteryPower *
            1000
        ) / Vnom;


    /*
       Pack C-rate required by motor
    */

    const requiredCRate =
        motorCurrent /
        Ahpack;


    /*
       Actual pack C-rate based on cell
       continuous current capability.
    */

    const availableCRate =
        Icontinuous /
        Ahpack;


    /*
       Estimated driving range

       Energy in Wh / Wh/km
    */

    const range =
        (
            EnergyKWh *
            1000
        ) /
        consumption;


    /*
       Preliminary BMS current requirement

       Use the greater of continuous pack current
       and motor-required current.

       This is NOT a final BMS specification.
    */

    const preliminaryBMSCurrent =
        Math.max(
            Icontinuous,
            motorCurrent
        );


    /*
       Voltage window

       Generic preliminary values.

       These are intentionally based on
       2.5 V minimum and 3.65 V maximum
       for a 3.2 V nominal LFP cell.

       For other chemistries these values should
       be replaced by chemistry-specific limits.
    */

    let VminCell;
    let VmaxCell;

    if (Vcell >= 3.15 && Vcell <= 3.30) {

        /*
           LFP-like cell
        */

        VminCell = 2.50;
        VmaxCell = 3.65;

    }
    else {

        /*
           Generic approximation.

           User should enter chemistry-specific
           limits in a future version.
        */

        VminCell =
            Vcell * 0.80;

        VmaxCell =
            Vcell * 1.14;

    }


    const Vmin =
        Ns *
        VminCell;


    const Vmax =
        Ns *
        VmaxCell;


    /*
       =====================================================
       UPDATE RESULTS
       =====================================================
    */

    document.getElementById(
        "evConfiguration"
    ).textContent =
        `${Ns}S${Np}P`;


    document.getElementById(
        "evVmin"
    ).textContent =
        `${Vmin.toFixed(1)} V`;


    document.getElementById(
        "evVnom"
    ).textContent =
        `${Vnom.toFixed(1)} V`;


    document.getElementById(
        "evVmax"
    ).textContent =
        `${Vmax.toFixed(1)} V`;


    document.getElementById(
        "evPackCapacity"
    ).textContent =
        `${Ahpack.toFixed(1)} Ah`;


    document.getElementById(
        "evPackEnergy"
    ).textContent =
        `${EnergyKWh.toFixed(2)} kWh`;


    document.getElementById(
        "evContinuousCurrent"
    ).textContent =
        `${Icontinuous.toFixed(1)} A`;


    document.getElementById(
        "evContinuousPower"
    ).textContent =
        `${Pcontinuous.toFixed(2)} kW`;


    document.getElementById(
        "evPeakCurrent"
    ).textContent =
        `${motorCurrent.toFixed(1)} A`;


    document.getElementById(
        "evCRate"
    ).textContent =
        `${requiredCRate.toFixed(2)} C`;


    document.getElementById(
        "evRange"
    ).textContent =
        `${range.toFixed(0)} km`;


    document.getElementById(
        "evMotorCurrent"
    ).textContent =
        `${motorCurrent.toFixed(1)} A`;


    document.getElementById(
        "evBMSCurrent"
    ).textContent =
        `≥ ${preliminaryBMSCurrent.toFixed(0)} A`;


    /*
       =====================================================
       CURRENT CAPABILITY CHECK
       =====================================================
    */

    const currentCheck =
        document.getElementById(
            "currentCheck"
        );

    const currentCheckText =
        document.getElementById(
            "currentCheckText"
        );


    if (
        motorCurrent <= Icontinuous
    ) {

        currentCheck.classList.remove(
            "warning"
        );

        currentCheck.classList.add(
            "success"
        );

        currentCheck.querySelector(
            "i"
        ).className =
            "bi bi-check-circle-fill";

        currentCheckText.textContent =
            "Within continuous cell capability";

    }
    else {

        currentCheck.classList.remove(
            "success"
        );

        currentCheck.classList.add(
            "warning"
        );

        currentCheck.querySelector(
            "i"
        ).className =
            "bi bi-exclamation-triangle-fill";

        currentCheckText.textContent =
            "Peak current exceeds continuous capability";

    }

}


/* =========================================================
   BASIC RESET
========================================================= */

function resetBasicPack() {

    document.getElementById(
        "basicCellVoltage"
    ).value = "3.2";


    document.getElementById(
        "basicLowerCutoff"
    ).value = "2.5";


    document.getElementById(
        "basicUpperCutoff"
    ).value = "3.65";


    document.getElementById(
        "basicCellCapacity"
    ).value = "100";


    document.getElementById(
        "basicCellCurrent"
    ).value = "100";


    document.getElementById(
        "basicNs"
    ).value = "8";


    document.getElementById(
        "basicNp"
    ).value = "2";



    document.getElementById(
        "basicPeakFactor"
    ).value = "1.5";


    document.getElementById(
        "basicEfficiency"
    ).value = "90";


    document.getElementById(
        "basicBackupTime"
    ).value = "8";


    calculateBasicPack();

}


/* =========================================================
   EV RESET
========================================================= */

function resetEVPack() {

    document.getElementById(
        "evCellVoltage"
    ).value = "3.2";


    document.getElementById(
        "evCellCapacity"
    ).value = "100";


    document.getElementById(
        "evCellCurrent"
    ).value = "100";


    document.getElementById(
        "evTargetVoltage"
    ).value = "300";


    document.getElementById(
        "evTargetEnergy"
    ).value = "60";


    document.getElementById(
        "evMotorPower"
    ).value = "80";


    document.getElementById(
        "evEfficiency"
    ).value = "92";


    document.getElementById(
        "evConsumption"
    ).value = "150";


    calculateEVPack();

}

/* =========================================================
   DESIGN MODE SWITCHER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const modeOptions =
            document.querySelectorAll(
                'input[name="designMode"]'
            );

        const basicMode =
            document.getElementById(
                "basicMode"
            );

        const evMode =
            document.getElementById(
                "evMode"
            );


        /* -----------------------------------------
           SWITCH DESIGN MODE
        ----------------------------------------- */

        modeOptions.forEach(
            function (radio) {

                radio.addEventListener(
                    "change",
                    function () {

                        /* Remove active state */
                        document
                            .querySelectorAll(
                                ".mode-option"
                            )
                            .forEach(
                                function (option) {

                                    option.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        /* Activate selected option */
                        this.closest(
                            ".mode-option"
                        ).classList.add(
                            "active"
                        );


                        /* ---------------------------------
                           BASIC PACK DESIGN
                        --------------------------------- */

                        if (
                            this.value === "basic"
                        ) {

                            basicMode.classList.remove(
                                "hidden"
                            );

                            evMode.classList.add(
                                "hidden"
                            );


                            /* Recalculate basic pack */

                            calculateTotalLoad();

                            calculateBasicPack();

                        }


                        /* ---------------------------------
                           EV BATTERY PACK DESIGN
                        --------------------------------- */

                        if (
                            this.value === "ev"
                        ) {

                            basicMode.classList.add(
                                "hidden"
                            );

                            evMode.classList.remove(
                                "hidden"
                            );


                            /* Calculate EV pack */

                            calculateEVPack();

                        }

                    }
                );

            }
        );

    }
);