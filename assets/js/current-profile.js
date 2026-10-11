/* =========================================================
   BATTERY CURRENT PROFILE GENERATOR
========================================================= */

let generatedData = [];
let currentProfile = "constant";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const profileType =
        document.getElementById("profileType");

    const generateBtn =
        document.getElementById("generateBtn");

    const resetBtn =
        document.getElementById("resetBtn");

    const downloadCsv =
        document.getElementById("downloadCsv");

    const downloadExcel =
        document.getElementById("downloadExcel");


    /* ---------------------------------------------
       Initial setup
    --------------------------------------------- */

    updateProfileParameters();

    updateGenerationMode();

    updateCrate();

    generateProfile();

    createMiniPlots();


    /* ---------------------------------------------
       Profile type
    --------------------------------------------- */

    profileType.addEventListener("change", function () {

        currentProfile = this.value;

        updateProfileParameters();

        updateGenerationMode();

        generateProfile();

    });


    /* ---------------------------------------------
       Generate
    --------------------------------------------- */

    generateBtn.addEventListener(
        "click",
        generateProfile
    );


    /* ---------------------------------------------
       Reset
    --------------------------------------------- */

    resetBtn.addEventListener(
        "click",
        resetGenerator
    );


    /* ---------------------------------------------
       C-rate inputs
    --------------------------------------------- */

    document
        .getElementById("cellCapacity")
        .addEventListener("input", updateCrate);

    document
        .getElementById("peakCurrent")
        .addEventListener("input", updateCrate);


    /* ---------------------------------------------
       Generation mode
    --------------------------------------------- */

    document
        .querySelectorAll(
            'input[name="generationMode"]'
        )
        .forEach(function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    updateGenerationMode();

                    updateCalculatedDuration();

                }
            );

        });


    /* ---------------------------------------------
       Dynamic input listener
    --------------------------------------------- */

    document.addEventListener(
        "input",
        function (event) {

            if (
                event.target.closest(
                    "#profileSpecificParameters"
                ) ||
                event.target.closest(
                    "#generationModeInputs"
                )
            ) {

                updateCalculatedDuration();

            }

        }
    );


    /* ---------------------------------------------
       Downloads
    --------------------------------------------- */

    downloadCsv.addEventListener(
        "click",
        downloadCSV
    );

    downloadExcel.addEventListener(
        "click",
        downloadExcelFile
    );


    /* ---------------------------------------------
       Example profiles
    --------------------------------------------- */

    document
        .querySelectorAll(".example-profile")
        .forEach(function (card) {

            card.addEventListener(
                "click",
                function () {

                    loadExampleProfile(
                        this.dataset.profile
                    );

                }
            );

        });

});



/* =========================================================
   PROFILE PARAMETERS
========================================================= */

function updateProfileParameters() {

    const container =
        document.getElementById(
            "profileSpecificParameters"
        );

    let html = "";


    /* ---------------------------------------------
       CONSTANT
    --------------------------------------------- */

    if (currentProfile === "constant") {

        html = `

            <div class="profile-specific-title">
                Profile Specific Parameters
            </div>

            <div class="dynamic-grid">

                <div class="form-group">

                    <label for="constantCurrent">
                        Current (A)
                    </label>

                    <input
                        type="number"
                        id="constantCurrent"
                        class="form-control"
                        value="5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="constantDuration">
                        Duration (s)
                    </label>

                    <input
                        type="number"
                        id="constantDuration"
                        class="form-control"
                        value="800"
                        min="0.001"
                        step="0.1">

                </div>

            </div>

        `;

    }


    /* ---------------------------------------------
       SQUARE
    --------------------------------------------- */

    else if (currentProfile === "square") {

        html = `

            <div class="profile-specific-title">
                Profile Specific Parameters
            </div>

            <div class="dynamic-grid">

                <div class="form-group">

                    <label for="highCurrent">
                        High Current (A)
                    </label>

                    <input
                        type="number"
                        id="highCurrent"
                        class="form-control"
                        value="5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="lowCurrent">
                        Low Current (A)
                    </label>

                    <input
                        type="number"
                        id="lowCurrent"
                        class="form-control"
                        value="-5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="highDuration">
                        High Duration (s)
                    </label>

                    <input
                        type="number"
                        id="highDuration"
                        class="form-control"
                        value="100"
                        min="0.001"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="lowDuration">
                        Low Duration (s)
                    </label>

                    <input
                        type="number"
                        id="lowDuration"
                        class="form-control"
                        value="100"
                        min="0.001"
                        step="0.1">

                </div>

            </div>

        `;

    }


    /* ---------------------------------------------
       SINE
    --------------------------------------------- */

    else if (currentProfile === "sine") {

        html = `

            <div class="profile-specific-title">
                Profile Specific Parameters
            </div>

            <div class="dynamic-grid">

                <div class="form-group">

                    <label for="sineAmplitude">
                        Amplitude (A)
                    </label>

                    <input
                        type="number"
                        id="sineAmplitude"
                        class="form-control"
                        value="5"
                        min="0"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="sineOffset">
                        Offset (A)
                    </label>

                    <input
                        type="number"
                        id="sineOffset"
                        class="form-control"
                        value="0"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="sinePeriod">
                        Period (s)
                    </label>

                    <input
                        type="number"
                        id="sinePeriod"
                        class="form-control"
                        value="200"
                        min="0.001"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="sinePhase">
                        Phase (°)
                    </label>

                    <input
                        type="number"
                        id="sinePhase"
                        class="form-control"
                        value="0"
                        step="1">

                </div>

            </div>

        `;

    }


    /* ---------------------------------------------
       TRIANGULAR
    --------------------------------------------- */

    else if (currentProfile === "triangular") {

        html = `

            <div class="profile-specific-title">
                Profile Specific Parameters
            </div>

            <div class="dynamic-grid">

                <div class="form-group">

                    <label for="triStart">
                        Start Current (A)
                    </label>

                    <input
                        type="number"
                        id="triStart"
                        class="form-control"
                        value="-5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="triPeak">
                        Peak Current (A)
                    </label>

                    <input
                        type="number"
                        id="triPeak"
                        class="form-control"
                        value="5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="triValley">
                        Valley Current (A)
                    </label>

                    <input
                        type="number"
                        id="triValley"
                        class="form-control"
                        value="-5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="triRampUp">
                        Ramp Up Time (s)
                    </label>

                    <input
                        type="number"
                        id="triRampUp"
                        class="form-control"
                        value="100"
                        min="0.001"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="triRampDown">
                        Ramp Down Time (s)
                    </label>

                    <input
                        type="number"
                        id="triRampDown"
                        class="form-control"
                        value="100"
                        min="0.001"
                        step="0.1">

                </div>

            </div>

        `;

    }


    /* ---------------------------------------------
       TRAPEZOIDAL
    --------------------------------------------- */

    else if (currentProfile === "trapezoidal") {

        html = `

            <div class="profile-specific-title">
                Profile Specific Parameters
            </div>

            <div class="dynamic-grid">

                <div class="form-group">

                    <label for="trapStart">
                        Start Current (A)
                    </label>

                    <input
                        type="number"
                        id="trapStart"
                        class="form-control"
                        value="0"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="trapPeak">
                        Peak Current (A)
                    </label>

                    <input
                        type="number"
                        id="trapPeak"
                        class="form-control"
                        value="5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="trapHoldCurrent">
                        Hold Current (A)
                    </label>

                    <input
                        type="number"
                        id="trapHoldCurrent"
                        class="form-control"
                        value="5"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="trapRestCurrent">
                        Rest Current (A)
                    </label>

                    <input
                        type="number"
                        id="trapRestCurrent"
                        class="form-control"
                        value="0"
                        step="0.01">

                </div>

                <div class="form-group">

                    <label for="trapRampUp">
                        Ramp Up Time (s)
                    </label>

                    <input
                        type="number"
                        id="trapRampUp"
                        class="form-control"
                        value="50"
                        min="0.001"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="trapHold">
                        Hold Time (s)
                    </label>

                    <input
                        type="number"
                        id="trapHold"
                        class="form-control"
                        value="100"
                        min="0"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="trapRampDown">
                        Ramp Down Time (s)
                    </label>

                    <input
                        type="number"
                        id="trapRampDown"
                        class="form-control"
                        value="50"
                        min="0.001"
                        step="0.1">

                </div>

                <div class="form-group">

                    <label for="trapRest">
                        Rest Time (s)
                    </label>

                    <input
                        type="number"
                        id="trapRest"
                        class="form-control"
                        value="100"
                        min="0"
                        step="0.1">

                </div>

            </div>

        `;

    }


    container.innerHTML = html;

}



/* =========================================================
   GENERATION MODE
========================================================= */

function updateGenerationMode() {

    const container =
        document.getElementById(
            "generationModeInputs"
        );

    const mode =
        document.querySelector(
            'input[name="generationMode"]:checked'
        ).value;


    if (mode === "cycles") {

        container.innerHTML = `

            <div class="form-group">

                <label for="numberCycles">
                    Number of Cycles
                </label>

                <input
                    type="number"
                    id="numberCycles"
                    class="form-control"
                    value="4"
                    min="1"
                    step="1">

            </div>

        `;

    }

    else {

        container.innerHTML = `

            <div class="form-group">

                <label for="durationInput">
                    Total Duration (s)
                </label>

                <input
                    type="number"
                    id="durationInput"
                    class="form-control"
                    value="800"
                    min="0.001"
                    step="0.1">

            </div>

        `;

    }

}



/* =========================================================
   CALCULATE TOTAL DURATION
========================================================= */

function calculateCycleDuration() {

    let duration = 0;


    switch (currentProfile) {

        case "constant":

            duration =
                parseFloat(
                    document.getElementById(
                        "constantDuration"
                    ).value
                );

            break;


        case "square":

            duration =
                parseFloat(
                    document.getElementById(
                        "highDuration"
                    ).value
                ) +
                parseFloat(
                    document.getElementById(
                        "lowDuration"
                    ).value
                );

            break;


        case "sine":

            duration =
                parseFloat(
                    document.getElementById(
                        "sinePeriod"
                    ).value
                );

            break;


        case "triangular":

            duration =
                parseFloat(
                    document.getElementById(
                        "triRampUp"
                    ).value
                ) +
                parseFloat(
                    document.getElementById(
                        "triRampDown"
                    ).value
                );

            break;


        case "trapezoidal":

            duration =
                parseFloat(
                    document.getElementById(
                        "trapRampUp"
                    ).value
                ) +
                parseFloat(
                    document.getElementById(
                        "trapHold"
                    ).value
                ) +
                parseFloat(
                    document.getElementById(
                        "trapRampDown"
                    ).value
                ) +
                parseFloat(
                    document.getElementById(
                        "trapRest"
                    ).value
                );

            break;

    }

    return duration || 0;

}



/* =========================================================
   UPDATE CALCULATED DURATION
========================================================= */

function updateCalculatedDuration() {

    const modeElement =
        document.querySelector(
            'input[name="generationMode"]:checked'
        );

    if (!modeElement) return;

    const mode = modeElement.value;


    if (mode === "cycles") {

        const cycleDuration =
            calculateCycleDuration();

        const cyclesElement =
            document.getElementById(
                "numberCycles"
            );

        if (!cyclesElement) return;

        const cycles =
            parseInt(
                cyclesElement.value
            ) || 1;

        const total =
            cycleDuration * cycles;

        document.getElementById(
            "totalTime"
        ).value = total.toFixed(3).replace(
            /\.000$/,
            ""
        );

    }

    else {

        const durationElement =
            document.getElementById(
                "durationInput"
            );

        if (!durationElement) return;

        document.getElementById(
            "totalTime"
        ).value =
            durationElement.value;

    }

}



/* =========================================================
   C-RATE
========================================================= */

function updateCrate() {

    const capacity =
        parseFloat(
            document.getElementById(
                "cellCapacity"
            ).value
        ) || 0;

    const peak =
        Math.abs(
            parseFloat(
                document.getElementById(
                    "peakCurrent"
                ).value
            ) || 0
        );

    const crate =
        capacity > 0
            ? peak / capacity
            : 0;


    document.getElementById(
        "crateInfo"
    ).innerHTML = `

        <i class="bi bi-info-circle-fill"></i>

        <span>
            Peak current of
            <strong>${peak.toFixed(2)} A</strong>
            for a
            <strong>${capacity.toFixed(2)} Ah</strong>
            cell corresponds to
            <strong>${crate.toFixed(2)}C</strong> rate.
        </span>

    `;

}



/* =========================================================
   GENERATE PROFILE
========================================================= */

function generateProfile() {

    updateCalculatedDuration();

    const dt =
        parseFloat(
            document.getElementById(
                "timeStep"
            ).value
        );

    const totalTime =
        parseFloat(
            document.getElementById(
                "totalTime"
            ).value
        );


    if (!dt || dt <= 0) {

        alert("Please enter a valid time step.");

        return;

    }

    if (!totalTime || totalTime <= 0) {

        alert("Please enter a valid duration.");

        return;

    }


    const time = [];
    const current = [];


    /* ---------------------------------------------
       CONSTANT
    --------------------------------------------- */

    if (currentProfile === "constant") {

        const value =
            parseFloat(
                document.getElementById(
                    "constantCurrent"
                ).value
            );


        for (
            let t = 0;
            t <= totalTime + 1e-9;
            t += dt
        ) {

            time.push(t);
            current.push(value);

        }

    }


    /* ---------------------------------------------
       SQUARE
    --------------------------------------------- */

    else if (currentProfile === "square") {

        const high =
            parseFloat(
                document.getElementById(
                    "highCurrent"
                ).value
            );

        const low =
            parseFloat(
                document.getElementById(
                    "lowCurrent"
                ).value
            );

        const highTime =
            parseFloat(
                document.getElementById(
                    "highDuration"
                ).value
            );

        const lowTime =
            parseFloat(
                document.getElementById(
                    "lowDuration"
                ).value
            );

        const cycleTime =
            highTime + lowTime;


        for (
            let t = 0;
            t <= totalTime + 1e-9;
            t += dt
        ) {

            const position =
                t % cycleTime;

            const value =
                position < highTime
                    ? high
                    : low;

            time.push(t);
            current.push(value);

        }

    }


    /* ---------------------------------------------
       SINE
    --------------------------------------------- */

    else if (currentProfile === "sine") {

        const amplitude =
            parseFloat(
                document.getElementById(
                    "sineAmplitude"
                ).value
            );

        const offset =
            parseFloat(
                document.getElementById(
                    "sineOffset"
                ).value
            );

        const period =
            parseFloat(
                document.getElementById(
                    "sinePeriod"
                ).value
            );

        const phase =
            parseFloat(
                document.getElementById(
                    "sinePhase"
                ).value
            ) *
            Math.PI / 180;


        for (
            let t = 0;
            t <= totalTime + 1e-9;
            t += dt
        ) {

            const value =
                offset +
                amplitude *
                Math.sin(
                    (2 * Math.PI * t / period)
                    + phase
                );

            time.push(t);
            current.push(value);

        }

    }


    /* ---------------------------------------------
       TRIANGULAR
    --------------------------------------------- */

    else if (currentProfile === "triangular") {

        const start =
            parseFloat(
                document.getElementById(
                    "triStart"
                ).value
            );

        const peak =
            parseFloat(
                document.getElementById(
                    "triPeak"
                ).value
            );

        const valley =
            parseFloat(
                document.getElementById(
                    "triValley"
                ).value
            );

        const rampUp =
            parseFloat(
                document.getElementById(
                    "triRampUp"
                ).value
            );

        const rampDown =
            parseFloat(
                document.getElementById(
                    "triRampDown"
                ).value
            );

        const cycleTime =
            rampUp + rampDown;


        for (
            let t = 0;
            t <= totalTime + 1e-9;
            t += dt
        ) {

            const position =
                t % cycleTime;

            let value;


            if (position <= rampUp) {

                const fraction =
                    position / rampUp;

                value =
                    start +
                    (peak - start) *
                    fraction;

            }

            else {

                const fraction =
                    (position - rampUp) /
                    rampDown;

                value =
                    peak +
                    (valley - peak) *
                    fraction;

            }


            time.push(t);
            current.push(value);

        }

    }


    /* ---------------------------------------------
       TRAPEZOIDAL
    --------------------------------------------- */

    else if (currentProfile === "trapezoidal") {

        const start =
            parseFloat(
                document.getElementById(
                    "trapStart"
                ).value
            );

        const peak =
            parseFloat(
                document.getElementById(
                    "trapPeak"
                ).value
            );

        const holdCurrent =
            parseFloat(
                document.getElementById(
                    "trapHoldCurrent"
                ).value
            );

        const restCurrent =
            parseFloat(
                document.getElementById(
                    "trapRestCurrent"
                ).value
            );

        const rampUp =
            parseFloat(
                document.getElementById(
                    "trapRampUp"
                ).value
            );

        const hold =
            parseFloat(
                document.getElementById(
                    "trapHold"
                ).value
            );

        const rampDown =
            parseFloat(
                document.getElementById(
                    "trapRampDown"
                ).value
            );

        const rest =
            parseFloat(
                document.getElementById(
                    "trapRest"
                ).value
            );


        const cycleTime =
            rampUp +
            hold +
            rampDown +
            rest;


        for (
            let t = 0;
            t <= totalTime + 1e-9;
            t += dt
        ) {

            const position =
                t % cycleTime;

            let value;


            if (position <= rampUp) {

                const fraction =
                    position / rampUp;

                value =
                    start +
                    (peak - start) *
                    fraction;

            }

            else if (
                position <=
                rampUp + hold
            ) {

                value = holdCurrent;

            }

            else if (
                position <=
                rampUp +
                hold +
                rampDown
            ) {

                const fraction =
                    (
                        position -
                        rampUp -
                        hold
                    ) /
                    rampDown;

                value =
                    holdCurrent +
                    (
                        restCurrent -
                        holdCurrent
                    ) *
                    fraction;

            }

            else {

                value = restCurrent;

            }


            time.push(t);
            current.push(value);

        }

    }


    /* ---------------------------------------------
       Store data
    --------------------------------------------- */

    generatedData =
        time.map(function (t, i) {

            return {
                time: t,
                current: current[i]
            };

        });


    /* ---------------------------------------------
       Plot
    --------------------------------------------- */

    drawMainPlot(
        time,
        current
    );


    /* ---------------------------------------------
       Table
    --------------------------------------------- */

    updateDataTable();


    /* ---------------------------------------------
       Information
    --------------------------------------------- */

    updateProfileInformation();


    /* ---------------------------------------------
       Success
    --------------------------------------------- */

    const success =
        document.getElementById(
            "successMessage"
        );

    success.classList.add("visible");

}



/* =========================================================
   MAIN PLOT
========================================================= */

function drawMainPlot(time, current) {

    const trace = {

        x: time,

        y: current,

        mode: "lines",

        line: {
            width: 2.5
        },

        hovertemplate:
            "Time: %{x:.2f} s<br>" +
            "Current: %{y:.3f} A" +
            "<extra></extra>"

    };


    const layout = {

        title: {
            text:
                getProfileTitle() +
                " Current Profile",

            font: {
                size: 18
            }
        },

        margin: {
            l: 60,
            r: 15,
            t: 45,
            b: 55
        },

        xaxis: {
            title: "Time (s)",
            zeroline: false
        },

        yaxis: {
            title: "Current (A)",
            zeroline: true
        },

        showlegend: false,

        autosize: true,

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)"
    };


    Plotly.newPlot(
        "currentPlot",
        [trace],
        layout,
        {
            responsive: true,
            displaylogo: false
        }
    );

}



/* =========================================================
   PROFILE TITLE
========================================================= */

function getProfileTitle() {

    const names = {

        constant: "Constant (DC)",

        square: "Square (Pulse)",

        sine: "Sine (Sinusoidal)",

        triangular: "Triangular",

        trapezoidal: "Trapezoidal"

    };

    return names[currentProfile];

}



/* =========================================================
   DATA TABLE
========================================================= */

function updateDataTable() {

    const tbody =
        document.querySelector(
            "#dataTable tbody"
        );

    tbody.innerHTML = "";


    generatedData
        .slice(0, 10)
        .forEach(function (row) {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${row.time.toFixed(4)}
                </td>

                <td>
                    ${row.current.toFixed(4)}
                </td>

            `;


            tbody.appendChild(tr);

        });

}



/* =========================================================
   PROFILE INFORMATION
========================================================= */

function updateProfileInformation() {

    const capacity =
        parseFloat(
            document.getElementById(
                "cellCapacity"
            ).value
        );

    const peak =
        Math.max(
            ...generatedData.map(
                row => Math.abs(row.current)
            )
        );

    const crate =
        capacity > 0
            ? peak / capacity
            : 0;


    const mode =
        document.querySelector(
            'input[name="generationMode"]:checked'
        ).value;


    document.getElementById(
        "infoProfileType"
    ).textContent =
        getProfileTitle();


    document.getElementById(
        "infoCapacity"
    ).textContent =
        capacity.toFixed(2) + " Ah";


    document.getElementById(
        "infoPeakCurrent"
    ).textContent =
        peak.toFixed(2) + " A";


    document.getElementById(
        "infoCrate"
    ).textContent =
        crate.toFixed(2) + " C";


    document.getElementById(
        "infoGenerationMode"
    ).textContent =
        mode === "cycles"
            ? "Number of Cycles"
            : "Total Duration";


    document.getElementById(
        "infoTimeStep"
    ).textContent =
        document.getElementById(
            "timeStep"
        ).value + " s";


    document.getElementById(
        "infoTotalTime"
    ).textContent =
        document.getElementById(
            "totalTime"
        ).value + " s";


    document.getElementById(
        "infoDataPoints"
    ).textContent =
        generatedData.length;

}



/* =========================================================
   CSV DOWNLOAD
========================================================= */

function downloadCSV() {

    if (!generatedData.length) {

        alert("Please generate a profile first.");

        return;

    }


    let csv =
        "Time (s),Current (A)\n";


    generatedData.forEach(
        function (row) {

            csv +=
                row.time.toFixed(6) +
                "," +
                row.current.toFixed(6) +
                "\n";

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "battery_current_profile.csv";

    link.click();


    URL.revokeObjectURL(url);

}



/* =========================================================
   EXCEL DOWNLOAD
========================================================= */

function downloadExcelFile() {

    if (!generatedData.length) {

        alert("Please generate a profile first.");

        return;

    }


    const worksheetData = [

        [
            "Time (s)",
            "Current (A)"
        ]

    ];


    generatedData.forEach(
        function (row) {

            worksheetData.push([

                Number(
                    row.time.toFixed(6)
                ),

                Number(
                    row.current.toFixed(6)
                )

            ]);

        }
    );


    const worksheet =
        XLSX.utils.aoa_to_sheet(
            worksheetData
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Current Profile"
    );


    XLSX.writeFile(
        workbook,
        "battery_current_profile.xlsx"
    );

}



/* =========================================================
   RESET
========================================================= */

function resetGenerator() {

    currentProfile = "constant";


    document.getElementById(
        "profileType"
    ).value = "constant";


    document.getElementById(
        "cellCapacity"
    ).value = "2.5";


    document.getElementById(
        "peakCurrent"
    ).value = "5";


    document.getElementById(
        "timeStep"
    ).value = "1";


    document.getElementById(
        "totalTime"
    ).value = "800";


    document.getElementById(
        "cyclesMode"
    ).checked = true;


    updateProfileParameters();

    updateGenerationMode();

    updateCrate();

    generateProfile();

}



/* =========================================================
   LOAD EXAMPLE PROFILE
========================================================= */

function loadExampleProfile(type) {

    currentProfile = type;


    document.getElementById(
        "profileType"
    ).value = type;


    document.getElementById(
        "cellCapacity"
    ).value = "2.5";


    document.getElementById(
        "peakCurrent"
    ).value = "5";


    document.getElementById(
        "timeStep"
    ).value = "1";


    document.getElementById(
        "cyclesMode"
    ).checked = true;


    updateProfileParameters();

    updateGenerationMode();


    /* ---------------------------------------------
       Example values
    --------------------------------------------- */

    if (type === "constant") {

        document.getElementById(
            "constantCurrent"
        ).value = "5";

        document.getElementById(
            "constantDuration"
        ).value = "800";

        document.getElementById(
            "numberCycles"
        ).value = "1";

    }


    else if (type === "square") {

        document.getElementById(
            "highCurrent"
        ).value = "5";

        document.getElementById(
            "lowCurrent"
        ).value = "0";

        document.getElementById(
            "highDuration"
        ).value = "100";

        document.getElementById(
            "lowDuration"
        ).value = "100";

        document.getElementById(
            "numberCycles"
        ).value = "4";

    }


    else if (type === "sine") {

        document.getElementById(
            "sineAmplitude"
        ).value = "5";

        document.getElementById(
            "sineOffset"
        ).value = "0";

        document.getElementById(
            "sinePeriod"
        ).value = "200";

        document.getElementById(
            "sinePhase"
        ).value = "0";

        document.getElementById(
            "numberCycles"
        ).value = "4";

    }


    else if (type === "triangular") {

        document.getElementById(
            "triStart"
        ).value = "-5";

        document.getElementById(
            "triPeak"
        ).value = "5";

        document.getElementById(
            "triValley"
        ).value = "-5";

        document.getElementById(
            "triRampUp"
        ).value = "100";

        document.getElementById(
            "triRampDown"
        ).value = "100";

        document.getElementById(
            "numberCycles"
        ).value = "4";

    }


    else if (type === "trapezoidal") {

        document.getElementById(
            "trapStart"
        ).value = "0";

        document.getElementById(
            "trapPeak"
        ).value = "5";

        document.getElementById(
            "trapHoldCurrent"
        ).value = "5";

        document.getElementById(
            "trapRestCurrent"
        ).value = "0";

        document.getElementById(
            "trapRampUp"
        ).value = "50";

        document.getElementById(
            "trapHold"
        ).value = "100";

        document.getElementById(
            "trapRampDown"
        ).value = "50";

        document.getElementById(
            "trapRest"
        ).value = "100";

        document.getElementById(
            "numberCycles"
        ).value = "4";

    }


    updateCalculatedDuration();

    updateCrate();

    generateProfile();


    /* Highlight selected card */

    document
        .querySelectorAll(".example-profile")
        .forEach(function (card) {

            card.classList.remove(
                "active"
            );

        });


    const selected =
        document.querySelector(
            `.example-profile[data-profile="${type}"]`
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

    }


    /* Scroll */

    document
        .querySelector(
            ".profile-generator-section"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}



/* =========================================================
   MINI PLOTS
========================================================= */

function createMiniPlots() {

    createMiniPlot(
        "miniConstant",
        "constant"
    );

    createMiniPlot(
        "miniSquare",
        "square"
    );

    createMiniPlot(
        "miniSine",
        "sine"
    );

    createMiniPlot(
        "miniTriangular",
        "triangular"
    );

    createMiniPlot(
        "miniTrapezoidal",
        "trapezoidal"
    );

}



/* =========================================================
   MINI PLOT DATA
========================================================= */

function createMiniPlot(id, type) {

    let time = [];
    let current = [];


    /* Constant */

    if (type === "constant") {

        for (let t = 0; t <= 800; t += 10) {

            time.push(t);
            current.push(5);

        }

    }


    /* Square */

    else if (type === "square") {

        for (let t = 0; t <= 800; t += 10) {

            time.push(t);

            current.push(
                Math.floor(t / 100) % 2 === 0
                    ? 5
                    : 0
            );

        }

    }


    /* Sine */

    else if (type === "sine") {

        for (let t = 0; t <= 800; t += 5) {

            time.push(t);

            current.push(
                5 *
                Math.sin(
                    2 * Math.PI * t / 200
                )
            );

        }

    }


    /* Triangular */

    else if (type === "triangular") {

        for (let t = 0; t <= 800; t += 10) {

            const position =
                t % 200;

            let value;

            if (position <= 100) {

                value =
                    -5 +
                    10 *
                    position / 100;

            }

            else {

                value =
                    5 -
                    10 *
                    (position - 100) / 100;

            }

            time.push(t);
            current.push(value);

        }

    }


    /* Trapezoidal */

    else if (type === "trapezoidal") {

        for (let t = 0; t <= 800; t += 10) {

            const position =
                t % 300;

            let value;

            if (position < 50) {

                value =
                    5 *
                    position / 50;

            }

            else if (position < 150) {

                value = 5;

            }

            else if (position < 200) {

                value =
                    5 -
                    5 *
                    (position - 150) / 50;

            }

            else {

                value = 0;

            }

            time.push(t);
            current.push(value);

        }

    }


    const trace = {

        x: time,

        y: current,

        mode: "lines",

        line: {
            width: 2
        },

        hoverinfo: "skip"

    };


    const miniLayout = {

        margin: {
            l: 5,
            r: 5,
            t: 5,
            b: 5
        },

        height: 80,

        xaxis: {
            showgrid: false,
            showticklabels: false,
            zeroline: false
        },

        yaxis: {
            showgrid: false,
            showticklabels: false,
            zeroline: false
        },

        showlegend: false,

        paper_bgcolor:
            "rgba(0,0,0,0)",

        plot_bgcolor:
            "rgba(0,0,0,0)"
    };


    Plotly.newPlot(
        id,
        [trace],
        miniLayout,
        {
            responsive: true,
            displayModeBar: false,
            staticPlot: true
        }
    );

}


