/* =========================================================
   BATTERY SOC ESTIMATOR
   Coulomb Counting
   Mode A: Manual Current
   Mode B: Drive Cycle
   Sign convention:
       + current = charge
       - current = discharge
   ========================================================= */

let socMode = "manual";

let uploadedProfile = null;
let currentProfile = null;

/* =========================================================
   MODE CONTROL
   ========================================================= */

function setSOCMode(mode) {
    socMode = mode;

    const manualBtn = document.getElementById("manualModeBtn");
    const driveBtn = document.getElementById("driveCycleModeBtn");
    const manualPanel = document.getElementById("manualInputs");
    const drivePanel = document.getElementById("driveInputs");

    if (mode === "manual") {
        manualBtn.classList.add("active");
        driveBtn.classList.remove("active");

        manualPanel.classList.remove("hidden");
        drivePanel.classList.add("hidden");

        hideCharts();

        setResultNote(
            "Manual mode: enter a signed constant current and calculate SOC."
        );
    } else {
        manualBtn.classList.remove("active");
        driveBtn.classList.add("active");

        manualPanel.classList.add("hidden");
        drivePanel.classList.remove("hidden");

        setResultNote(
            "Drive-cycle mode: the supplied FUDS profile is loaded by default."
        );
    }
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    setSOCMode("manual");

    const fileInput = document.getElementById("profileFile");
    const preset = document.getElementById("drivePreset");
    const chemistry = document.getElementById("chemistry");
    const capacity = document.getElementById("capacity");

    fileInput.addEventListener("change", handleProfileUpload);

    preset.addEventListener("change", function () {
        if (this.value === "FUDS") {
            uploadedProfile = null;
            fileInput.value = "";

            chemistry.value = "LFP";
            capacity.value = "1.0";

            showFUDSInfo();
        } else {
            showDriveInfo(
                "Uploaded profile selected",
                "Upload a CSV or Excel current profile."
            );
        }
    });

    chemistry.addEventListener("change", function () {
        /* Do not automatically overwrite user-selected capacity
           except when explicitly selecting the FUDS preset. */
    });

    showFUDSInfo();
    updateSOCGauge(100);
    updateSOCStatus(100);
});

/* =========================================================
   DEFAULT FUDS
   ========================================================= */

function getFUDSProfile() {

    if (
        !window.FUDS_DRIVE_CYCLE ||
        !Array.isArray(window.FUDS_DRIVE_CYCLE) ||
        window.FUDS_DRIVE_CYCLE.length < 2
    ) {
        throw new Error(
            "The default FUDS dataset could not be loaded."
        );
    }

    return window.FUDS_DRIVE_CYCLE.map(function (row) {
        return {
            time: Number(row[0]),
            current: Number(row[1])
        };
    }).filter(function (row) {
        return Number.isFinite(row.time) &&
               Number.isFinite(row.current);
    });
}

function showFUDSInfo() {

    const info = document.getElementById("driveInfo");

    let profile;

    try {
        profile = getFUDSProfile();
    } catch (error) {
        info.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>
                <strong>FUDS data unavailable</strong>
                <p>Please check fuds-drive-cycle.js.</p>
            </div>
        `;
        return;
    }

    const first = profile[0];
    const last = profile[profile.length - 1];

    info.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <div>
            <strong>FUDS preset loaded</strong>
            <p>
                ${profile.length.toLocaleString()} samples,
                ${formatNumber(last.time - first.time, 1)} s duration,
                1 Ah LFP cell.
            </p>
        </div>
    `;
}

function showDriveInfo(title, message) {

    document.getElementById("driveInfo").innerHTML = `
        <i class="bi bi-info-circle-fill"></i>
        <div>
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;
}

/* =========================================================
   FILE UPLOAD
   ========================================================= */

function handleProfileUpload(event) {

    const file = event.target.files[0];

    if (!file) return;

    if (typeof XLSX === "undefined") {
        showError("Excel/CSV reader could not be loaded.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const workbook = XLSX.read(
                e.target.result,
                {
                    type: "array"
                }
            );

            const firstSheet =
                workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(
                firstSheet,
                {
                    header: 1,
                    raw: true,
                    defval: null
                }
            );

            processUploadedRows(rows);

        } catch (error) {

            console.error(error);

            showError(
                "Unable to read this file. Please use a valid CSV/XLSX/XLS file."
            );
        }
    };

    reader.readAsArrayBuffer(file);
}

/* =========================================================
   PROCESS UPLOADED TABLE
   ========================================================= */

function processUploadedRows(rows) {

    if (!rows || rows.length < 2) {
        showError("The uploaded file does not contain enough data.");
        return;
    }

    const headerRow = rows[0];

    const columnCount = Math.max.apply(
        null,
        rows.map(function (row) {
            return row ? row.length : 0;
        })
    );

    const columns = [];

    for (let i = 0; i < columnCount; i++) {

        let label = "";

        if (
            headerRow &&
            headerRow[i] !== null &&
            headerRow[i] !== undefined
        ) {
            label = String(headerRow[i]).trim();
        }

        if (!label) {
            label = "Column " + (i + 1);
        }

        columns.push({
            index: i,
            label: label
        });
    }

    populateColumnSelect(
        document.getElementById("timeColumn"),
        columns
    );

    populateColumnSelect(
        document.getElementById("currentColumn"),
        columns
    );

    const timeGuess =
        guessColumn(columns, ["time", "seconds", "sec", "t"]);

    const currentGuess =
        guessColumn(
            columns,
            ["current", "current (a)", "i", "ampere", "amps"]
        );

    document.getElementById("timeColumn").value =
        String(
            timeGuess !== null
                ? timeGuess
                : 0
        );

    document.getElementById("currentColumn").value =
        String(
            currentGuess !== null
                ? currentGuess
                : (columnCount > 1 ? 1 : 0)
        );

    document.getElementById("columnMapping")
        .classList.remove("hidden");

    uploadedProfile = {
        rows: rows,
        columns: columns
    };

    document.getElementById("drivePreset").value = "upload";

    showDriveInfo(
        "Profile uploaded",
        "Select the time and current columns, then click Calculate SOC."
    );
}

function populateColumnSelect(select, columns) {

    select.innerHTML = "";

    columns.forEach(function (column) {

        const option =
            document.createElement("option");

        option.value = String(column.index);
        option.textContent =
            column.label;

        select.appendChild(option);
    });
}

function guessColumn(columns, keywords) {

    for (const column of columns) {

        const label =
            column.label.toLowerCase();

        for (const keyword of keywords) {

            if (label === keyword ||
                label.includes(keyword)) {

                return column.index;
            }
        }
    }

    return null;
}

/* =========================================================
   CONVERT UPLOADED TABLE TO TIME-CURRENT PROFILE
   ========================================================= */

function buildUploadedProfile() {

    if (!uploadedProfile) {
        throw new Error(
            "Please upload a current profile first."
        );
    }

    const timeIndex =
        Number(
            document.getElementById("timeColumn").value
        );

    const currentIndex =
        Number(
            document.getElementById("currentColumn").value
        );

    const rows =
        uploadedProfile.rows;

    const profile = [];

    /*
       The first row is treated as a header if it contains
       non-numeric values. If the file has no header, row 0
       is also considered as data.
    */
    let startIndex = 0;

    const firstTime =
        Number(rows[0]?.[timeIndex]);

    const firstCurrent =
        Number(rows[0]?.[currentIndex]);

    if (
        !Number.isFinite(firstTime) ||
        !Number.isFinite(firstCurrent)
    ) {
        startIndex = 1;
    }

    for (let i = startIndex; i < rows.length; i++) {

        const row = rows[i];

        if (!row) continue;

        const time =
            Number(row[timeIndex]);

        const current =
            Number(row[currentIndex]);

        if (
            Number.isFinite(time) &&
            Number.isFinite(current)
        ) {
            profile.push({
                time: time,
                current: current
            });
        }
    }

    if (profile.length < 2) {
        throw new Error(
            "Could not find at least two valid time-current data points."
        );
    }

    /*
       Sort by time so integration always proceeds forward.
    */
    profile.sort(function (a, b) {
        return a.time - b.time;
    });

    return profile;
}

/* =========================================================
   MAIN CALCULATION
   ========================================================= */

function calculateSOC() {

    clearMessage();

    const capacity =
        parseFloat(
            document.getElementById("capacity").value
        );

    const initialSOC =
        parseFloat(
            document.getElementById("initialSOC").value
        );

    if (
        !Number.isFinite(capacity) ||
        capacity <= 0
    ) {
        showError("Please enter a valid battery capacity.");
        return;
    }

    if (
        !Number.isFinite(initialSOC) ||
        initialSOC < 0 ||
        initialSOC > 100
    ) {
        showError("Initial SOC must be between 0 and 100%.");
        return;
    }

    try {

        if (socMode === "manual") {

            calculateManualSOC(
                capacity,
                initialSOC
            );

        } else {

            calculateDriveCycleSOC(
                capacity,
                initialSOC
            );
        }

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Unable to calculate SOC."
        );
    }
}

/* =========================================================
   MODE A — MANUAL CURRENT
   ========================================================= */

function calculateManualSOC(
    capacity,
    initialSOC
) {

    const current =
        parseFloat(
            document.getElementById("current").value
        );

    const timeStep =
        parseFloat(
            document.getElementById("timeStep").value
        );

    if (!Number.isFinite(current)) {
        throw new Error("Please enter a valid current.");
    }

    if (
        !Number.isFinite(timeStep) ||
        timeStep <= 0
    ) {
        throw new Error("Please enter a valid time step.");
    }

    /*
       Coulomb counting:

       SOC(k) = SOC(k-1)
              + I * dt / (3600 * Q) * 100

       +I = charging
       -I = discharging
    */
    const deltaAh =
        current *
        timeStep /
        3600;

    const socChange =
        deltaAh /
        capacity *
        100;

    const finalSOC =
        clampSOC(
            initialSOC +
            socChange
        );

    const profile = [
        {
            time: 0,
            current: current
        },
        {
            time: timeStep,
            current: current
        }
    ];

    const socProfile = [
        initialSOC,
        finalSOC
    ];

    displayResults({
        initialSOC: initialSOC,
        finalSOC: finalSOC,
        representativeCurrent: current,
        capacity: capacity,
        totalTime: timeStep,
        netChargeAh: deltaAh,
        profile: profile,
        socProfile: socProfile,
        isDriveCycle: false
    });

    setResultNote(
        current >= 0
            ? "Manual charging calculation completed: positive current increases SOC."
            : "Manual discharge calculation completed: negative current decreases SOC."
    );
}

/* =========================================================
   MODE B — DRIVE CYCLE
   ========================================================= */

function calculateDriveCycleSOC(
    capacity,
    initialSOC
) {

    let profile;

    const preset =
        document.getElementById("drivePreset").value;

    if (preset === "FUDS") {

        profile = getFUDSProfile();

    } else {

        profile = buildUploadedProfile();
    }

    if (profile.length < 2) {
        throw new Error(
            "At least two profile points are required."
        );
    }

    /*
       Trapezoidal Coulomb counting:

       ΔQ(k) =
       [(I(k-1) + I(k))/2] *
       [t(k)-t(k-1)] / 3600

       This handles a non-uniform uploaded time vector
       correctly and preserves the current sign.
    */

    const socProfile = [initialSOC];

    let soc = initialSOC;
    let netChargeAh = 0;

    for (let k = 1; k < profile.length; k++) {

        const dt =
            profile[k].time -
            profile[k - 1].time;

        if (
            !Number.isFinite(dt) ||
            dt < 0
        ) {
            throw new Error(
                "Time values must be increasing."
            );
        }

        const averageCurrent =
            (
                profile[k - 1].current +
                profile[k].current
            ) / 2;

        const deltaAh =
            averageCurrent *
            dt /
            3600;

        netChargeAh += deltaAh;

        soc +=
            deltaAh /
            capacity *
            100;

        soc = clampSOC(soc);

        socProfile.push(soc);
    }

    const finalSOC =
        socProfile[socProfile.length - 1];

    const firstCurrent =
        profile[0].current;

    const lastCurrent =
        profile[profile.length - 1].current;

    const totalTime =
        profile[profile.length - 1].time -
        profile[0].time;

    displayResults({
        initialSOC: initialSOC,
        finalSOC: finalSOC,
        representativeCurrent: lastCurrent,
        capacity: capacity,
        totalTime: totalTime,
        netChargeAh: netChargeAh,
        profile: profile,
        socProfile: socProfile,
        isDriveCycle: true,
        firstCurrent: firstCurrent,
        lastCurrent: lastCurrent
    });

    setResultNote(
        "Drive-cycle Coulomb counting completed using the signed current profile. Positive current charges the cell; negative current discharges it."
    );
}

/* =========================================================
   DISPLAY RESULTS
   ========================================================= */

function displayResults(result) {

    document.getElementById("socValue").textContent =
        result.finalSOC.toFixed(2);

    document.getElementById("resultInitialSOC").textContent =
        result.initialSOC.toFixed(2) + " %";

    document.getElementById("resultFinalSOC").textContent =
        result.finalSOC.toFixed(2) + " %";

    if (result.isDriveCycle) {

        document.getElementById("resultCurrent").textContent =
            formatSignedCurrent(result.lastCurrent);

    } else {

        document.getElementById("resultCurrent").textContent =
            formatSignedCurrent(result.representativeCurrent);
    }

    document.getElementById("resultCapacity").textContent =
        result.capacity.toFixed(2) + " Ah";

    document.getElementById("resultTime").textContent =
        result.totalTime.toFixed(2) + " s";

    document.getElementById("resultNetCharge").textContent =
        formatSigned(result.netChargeAh, 4) + " Ah";

    updateSOCGauge(result.finalSOC);
    updateSOCStatus(result.finalSOC);

    if (result.isDriveCycle) {

        showCharts(
            result.profile,
            result.socProfile
        );

    } else {

        hideCharts();
    }
}

/* =========================================================
   SOC GAUGE
   ========================================================= */

function updateSOCGauge(soc) {

    const gauge =
        document.getElementById(
            "socGaugeFill"
        );

    if (!gauge) return;

    gauge.style.width =
        clampSOC(soc) + "%";

    if (soc >= 70) {

        gauge.style.background =
            "#22c55e";

    } else if (soc >= 40) {

        gauge.style.background =
            "#eab308";

    } else if (soc >= 20) {

        gauge.style.background =
            "#f97316";

    } else {

        gauge.style.background =
            "#ef4444";
    }
}

/* =========================================================
   SOC STATUS
   ========================================================= */

function updateSOCStatus(soc) {

    const status =
        document.getElementById(
            "socStatus"
        );

    if (!status) return;

    if (soc >= 70) {

        status.textContent = "HIGH SOC";
        status.style.color = "#168047";
        status.style.background = "#eaf8f0";

    } else if (soc >= 40) {

        status.textContent = "MEDIUM SOC";
        status.style.color = "#8a6800";
        status.style.background = "#fff8df";

    } else if (soc >= 20) {

        status.textContent = "LOW SOC";
        status.style.color = "#b45309";
        status.style.background = "#fff1e7";

    } else {

        status.textContent = "CRITICALLY LOW";
        status.style.color = "#b4232a";
        status.style.background = "#fff0f1";
    }
}

/* =========================================================
   PLOTLY CHARTS
   ========================================================= */

function showCharts(profile, socProfile) {

    const section =
        document.getElementById("chartSection");

    section.classList.remove("hidden");

    const time =
        profile.map(function (p) {
            return p.time;
        });

    const current =
        profile.map(function (p) {
            return p.current;
        });

    const commonLayout = {
        margin: {
            l: 52,
            r: 18,
            t: 8,
            b: 42
        },
        font: {
            family: "Poppins, sans-serif",
            size: 10
        },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "#ffffff",
        hovermode: "x unified",
        xaxis: {
            title: "Time (s)",
            gridcolor: "#e6ebf2",
            zeroline: false
        },
        showlegend: false
    };

    Plotly.react(
        "socChart",
        [{
            x: time,
            y: socProfile,
            type: "scatter",
            mode: "lines",
            line: {
                width: 2
            },
            hovertemplate:
                "Time: %{x:.2f} s<br>" +
                "SOC: %{y:.2f} %<extra></extra>"
        }],
        {
            ...commonLayout,
            yaxis: {
                title: "SOC (%)",
                range: [0, 100],
                gridcolor: "#e6ebf2",
                zeroline: false
            }
        },
        {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                "lasso2d",
                "select2d"
            ]
        }
    );

    Plotly.react(
        "currentChart",
        [{
            x: time,
            y: current,
            type: "scatter",
            mode: "lines",
            line: {
                width: 1.6
            },
            hovertemplate:
                "Time: %{x:.2f} s<br>" +
                "Current: %{y:.4f} A<extra></extra>"
        }],
        {
            ...commonLayout,
            yaxis: {
                title: "Current (A)",
                gridcolor: "#e6ebf2",
                zeroline: true,
                zerolinecolor: "#aeb9c8"
            }
        },
        {
            responsive: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                "lasso2d",
                "select2d"
            ]
        }
    );
}

function hideCharts() {

    const section =
        document.getElementById("chartSection");

    section.classList.add("hidden");

    if (
        typeof Plotly !== "undefined"
    ) {
        try {
            Plotly.purge("socChart");
            Plotly.purge("currentChart");
        } catch (error) {
            /* Nothing to purge. */
        }
    }
}

/* =========================================================
   RESET
   ========================================================= */

function resetSOC() {

    document.getElementById("chemistry").value =
        "LFP";

    document.getElementById("capacity").value =
        "1";

    document.getElementById("initialSOC").value =
        "100";

    document.getElementById("current").value =
        "-1";

    document.getElementById("timeStep").value =
        "1";

    document.getElementById("drivePreset").value =
        "FUDS";

    document.getElementById("profileFile").value =
        "";

    document.getElementById("columnMapping")
        .classList.add("hidden");

    uploadedProfile = null;
    currentProfile = null;

    setSOCMode("manual");

    document.getElementById("socValue").textContent =
        "100.00";

    document.getElementById("resultInitialSOC").textContent =
        "100.00 %";

    document.getElementById("resultFinalSOC").textContent =
        "100.00 %";

    document.getElementById("resultCurrent").textContent =
        "−1.00 A";

    document.getElementById("resultCapacity").textContent =
        "1.00 Ah";

    document.getElementById("resultTime").textContent =
        "1.00 s";

    document.getElementById("resultNetCharge").textContent =
        "−0.0007 Ah";

    updateSOCGauge(100);
    updateSOCStatus(100);

    hideCharts();
    clearMessage();

    setResultNote(
        "Enter operating conditions and calculate SOC."
    );

    showFUDSInfo();
}

/* =========================================================
   HELPERS
   ========================================================= */

function clampSOC(soc) {

    return Math.max(
        0,
        Math.min(
            100,
            soc
        )
    );
}

function formatSigned(value, decimals) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return (
        number >= 0 ? "+" : "−"
    ) + Math.abs(number).toFixed(decimals);
}

function formatSignedCurrent(value) {

    return formatSigned(value, 3) + " A";
}

function formatNumber(value, decimals) {

    return Number(value).toFixed(decimals);
}

function clearMessage() {

    const message =
        document.getElementById(
            "socMessage"
        );

    message.textContent = "";
    message.classList.add("hidden");
}

function showError(messageText) {

    const message =
        document.getElementById(
            "socMessage"
        );

    message.textContent =
        messageText;

    message.classList.remove("hidden");
}

function setResultNote(text) {

    const note =
        document.getElementById(
            "resultNote"
        );

    if (note) {
        note.textContent = text;
    }
}