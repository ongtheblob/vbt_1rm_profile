
"use strict";

// ========================================
// 1. REFERENCE DATA
// ========================================

const V1RM_DATA = {
    "Bench Press": 0.17,
    "Prone Bench Pull": 0.50,
    "Pull-Up": 0.23,
    "Seated Military Press": 0.19,
    "Lat Pulldown": 0.47,
    "Seated Cable Row": 0.40,
    "Squat": 0.30,
    "Deadlift": 0.15,
    "Hip Thrust": 0.25,
    "Leg Press": 0.21
};

const STORAGE_KEY = "vbt_athlete_testing_history";

let velocityChart = null;
let progressChart = null;
let comparisonChart = null;
let lastCalculation = null;
let alreadySaved = false;


// ========================================
// 2. ELEMENT REFERENCES
// ========================================

const $ = id => document.getElementById(id);

const exerciseSelect = $("exercise");
const v1rmValue = $("v1rmValue");
const numPoints = $("numPoints");
const pointCount = $("pointCount");
const dataInputs = $("dataInputs");

const calculateBtn = $("calculateBtn");
const saveBtn = $("saveBtn");
const resetBtn = $("resetBtn");


// ========================================
// 3. DATE INITIALISATION
// ========================================

function getLocalDate() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

$("testDate").value = getLocalDate();


// ========================================
// 4. STORAGE FUNCTIONS
// ========================================

function getHistory() {

    try {

        const records = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(records) ? records : [];

    } catch (error) {

        console.error("Unable to read history:", error);

        return [];

    }

}

function saveHistory(history) {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(history)
        );

        return true;

    } catch (error) {

        console.error("Unable to save history:", error);

        $("exportMessage").textContent =
            "Unable to save. Browser storage may be full or unavailable.";

        return false;

    }

}


// ========================================
// 5. REFERENCE TABLE
// ========================================

function displayReferenceTable() {

    const table = $("referenceTable");

    table.innerHTML = "";

    Object.entries(V1RM_DATA).forEach(([exercise, velocity]) => {

        const row = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = exercise;

        const value = document.createElement("td");
        value.textContent = velocity.toFixed(2);

        row.append(name, value);

        table.appendChild(row);

    });

}

function updateExercise() {

    const exercise = exerciseSelect.value;

    v1rmValue.textContent =
        V1RM_DATA[exercise].toFixed(2) + " m/s";

    $("results").hidden = true;

    lastCalculation = null;
    alreadySaved = false;

    updateHistory();

}

exerciseSelect.addEventListener("change", updateExercise);


// ========================================
// 6. DYNAMIC DATA INPUTS
// ========================================

function generateInputs() {

    const previousLoads = [];
    const previousVelocities = [];

    document.querySelectorAll(".load-input").forEach(input => {
        previousLoads.push(input.value);
    });

    document.querySelectorAll(".velocity-input").forEach(input => {
        previousVelocities.push(input.value);
    });

    const count = Number(numPoints.value);

    pointCount.textContent = count;

    dataInputs.innerHTML = "";

    for (let i = 0; i < count; i++) {

        const row = document.createElement("div");
        row.className = "data-row";

        const heading = document.createElement("h4");
        heading.textContent = `Data Point ${i + 1}`;

        const loadGroup = document.createElement("div");

        const loadLabel = document.createElement("label");
        loadLabel.className = "input-label";
        loadLabel.textContent = "Load (kg)";

        const loadInput = document.createElement("input");

        loadInput.type = "number";
        loadInput.className = "load-input";
        loadInput.min = "1";
        loadInput.step = "2.5";
        loadInput.placeholder = "e.g. 40";
        loadInput.value = previousLoads[i] || "";

        loadGroup.append(loadLabel, loadInput);


        const velocityGroup = document.createElement("div");

        const velocityLabel = document.createElement("label");
        velocityLabel.className = "input-label";
        velocityLabel.textContent = "Velocity (m/s)";

        const velocityInput = document.createElement("input");

        velocityInput.type = "number";
        velocityInput.className = "velocity-input";
        velocityInput.min = "0.05";
        velocityInput.step = "0.01";
        velocityInput.placeholder = "e.g. 0.85";
        velocityInput.value = previousVelocities[i] || "";

        velocityGroup.append(velocityLabel, velocityInput);

        row.append(heading, loadGroup, velocityGroup);

        dataInputs.appendChild(row);

    }

    lastCalculation = null;
    alreadySaved = false;
    $("results").hidden = true;

}

numPoints.addEventListener("input", generateInputs);


// ========================================
// 7. ATHLETE INFORMATION
// ========================================

function getAthleteInformation() {

    const name = $("athleteName").value.trim();

    const bodyWeightText = $("bodyWeight").value.trim();
    const bodyWeight = bodyWeightText === ""
        ? null
        : Number(bodyWeightText);

    const date = $("testDate").value;

    if (!name) {
        throw new Error("Please enter the athlete's name.");
    }

    if (
        bodyWeight !== null &&
        (!Number.isFinite(bodyWeight) || bodyWeight <= 0)
    ) {
        throw new Error("Please enter a valid body weight.");
    }

    if (!date || Number.isNaN(Date.parse(date + "T00:00:00"))) {
        throw new Error("Please select a valid testing date.");
    }

    return {
        athleteName: name,
        bodyWeight,
        date
    };

}


// ========================================
// 8. GET LOAD-VELOCITY DATA
// ========================================

function getInputData() {

    const loadInputs =
        document.querySelectorAll(".load-input");

    const velocityInputs =
        document.querySelectorAll(".velocity-input");

    const loads = [];
    const velocities = [];

    for (let i = 0; i < loadInputs.length; i++) {

        const loadText = loadInputs[i].value.trim();
        const velocityText = velocityInputs[i].value.trim();

        const load = Number(loadText);
        const velocity = Number(velocityText);

        if (
            loadText === "" ||
            velocityText === "" ||
            !Number.isFinite(load) ||
            !Number.isFinite(velocity) ||
            load < 1 ||
            velocity < 0.05
        ) {

            throw new Error(
                `Please enter valid values for Data Point ${i + 1}.`
            );

        }

        loads.push(load);
        velocities.push(velocity);

    }

    if (new Set(loads).size < 2) {

        throw new Error(
            "Please enter at least two different load values."
        );

    }

    if (new Set(velocities).size < 2) {

        throw new Error(
            "Please enter at least two different velocity values."
        );

    }

    return { loads, velocities };

}


// ========================================
// 9. LINEAR REGRESSION + R SQUARED
// ========================================

// Model:
// Load = slope * Velocity + intercept

function linearRegression(velocities, loads) {

    const n = velocities.length;

    const meanVelocity =
        velocities.reduce((sum, value) => sum + value, 0) / n;

    const meanLoad =
        loads.reduce((sum, value) => sum + value, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {

        numerator +=
            (velocities[i] - meanVelocity) *
            (loads[i] - meanLoad);

        denominator +=
            Math.pow(velocities[i] - meanVelocity, 2);

    }

    if (denominator === 0) {

        throw new Error(
            "Velocity values must be different."
        );

    }

    const slope = numerator / denominator;

    const intercept = meanLoad - slope * meanVelocity;

    // Calculate R squared

    let residualSumSquares = 0;
    let totalSumSquares = 0;

    for (let i = 0; i < n; i++) {

        const predicted =
            slope * velocities[i] + intercept;

        residualSumSquares +=
            Math.pow(loads[i] - predicted, 2);

        totalSumSquares +=
            Math.pow(loads[i] - meanLoad, 2);

    }

    const rSquared = totalSumSquares === 0
        ? 1
        : Math.max(
            0,
            Math.min(
                1,
                1 - residualSumSquares / totalSumSquares
            )
        );

    return {
        slope,
        intercept,
        rSquared
    };

}


// ========================================
// 10. R SQUARED INTERPRETATION
// ========================================

function getFitQuality(rSquared) {

    if (rSquared >= 0.90) {
        return "Strong fit";
    }

    if (rSquared >= 0.75) {
        return "Moderate fit";
    }

    return "Weak fit";

}


// ========================================
// 11. CALCULATE PROFILE
// ========================================

function calculateProfile() {

    hideError();

    $("saveMessage").hidden = true;

    try {

        const athlete = getAthleteInformation();

        const { loads, velocities } = getInputData();

        const exercise = exerciseSelect.value;

        const v1rm = V1RM_DATA[exercise];

        const {
            slope,
            intercept,
            rSquared
        } = linearRegression(velocities, loads);

        const estimated1RM =
            slope * v1rm + intercept;

        if (!Number.isFinite(estimated1RM)) {

            throw new Error(
                "Unable to calculate 1RM. Please check your data."
            );

        }

        const result = {

            ...athlete,

            exercise,
            v1rm,

            loads,
            velocities,

            slope,
            intercept,
            rSquared,

            estimated1RM,

            dataPoints: loads.length,

            bodyWeightRatio: athlete.bodyWeight
                ? estimated1RM / athlete.bodyWeight
                : null

        };

        lastCalculation = result;
        alreadySaved = false;

        // Display results

        $("estimated1RM").textContent =
            estimated1RM.toFixed(1) + " kg";

        $("slope").textContent =
            slope.toFixed(1);

        $("intercept").textContent =
            intercept.toFixed(1);

        $("rSquared").textContent =
            rSquared.toFixed(3);

        $("fitQuality").textContent =
            getFitQuality(rSquared);

        $("results").hidden = false;

        drawVelocityChart(result);

        $("results").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        showError(error.message);

    }

}

calculateBtn.addEventListener("click", calculateProfile);


// ========================================
// 12. LOAD-VELOCITY CHART
// ========================================

function drawVelocityChart(result) {

    const {
        velocities,
        loads,
        slope,
        intercept,
        v1rm,
        estimated1RM,
        exercise
    } = result;

    if (velocityChart) {
        velocityChart.destroy();
    }

    const minVelocity = Math.min(...velocities);
    const maxVelocity = Math.max(...velocities);

    const regressionPoints = [

        {
            x: minVelocity * 0.8,
            y: slope * (minVelocity * 0.8) + intercept
        },

        {
            x: maxVelocity * 1.2,
            y: slope * (maxVelocity * 1.2) + intercept
        }

    ];

    const measuredPoints = velocities.map(
        (velocity, index) => ({
            x: velocity,
            y: loads[index]
        })
    );

    velocityChart = new Chart($("velocityChart"), {

        type: "scatter",

        data: {

            datasets: [

                {
                    label: "Measured Lifts",
                    data: measuredPoints,
                    backgroundColor: "#38bdf8",
                    pointRadius: 7
                },

                {
                    label: "Regression Line",
                    data: regressionPoints,
                    type: "line",
                    borderColor: "#a78bfa",
                    borderWidth: 3,
                    pointRadius: 0
                },

                {
                    label: "Estimated 1RM",
                    data: [{ x: v1rm, y: estimated1RM }],
                    backgroundColor: "#ef4444",
                    pointRadius: 9
                }

            ]

        },

        options: chartOptions(
            exercise + " Load–Velocity Profile",
            "Mean Concentric Velocity (m/s)",
            "Load (kg)"
        )

    });

}


// ========================================
// 13. CHART OPTIONS
// ========================================

function chartOptions(title, xTitle, yTitle) {

    return {

        responsive: true,
        maintainAspectRatio: true,

        plugins: {

            title: {
                display: true,
                text: title,
                color: "#ffffff"
            },

            legend: {
                labels: {
                    color: "#cbd5e1"
                }
            }

        },

        scales: {

            x: {
                title: {
                    display: true,
                    text: xTitle,
                    color: "#cbd5e1"
                },

                ticks: {
                    color: "#94a3b8"
                },

                grid: {
                    color: "#334155"
                }
            },

            y: {
                title: {
                    display: true,
                    text: yTitle,
                    color: "#cbd5e1"
                },

                ticks: {
                    color: "#94a3b8"
                },

                grid: {
                    color: "#334155"
                }
            }

        }

    };

}


// ========================================
// 14. SAVE ATHLETE TEST
// ========================================

function saveTest() {

    if (!lastCalculation) {

        showError("Please calculate a profile first.");

        return;

    }

    if (alreadySaved) {

        $("saveMessage").textContent =
            "This testing result has already been saved.";

        $("saveMessage").hidden = false;

        return;

    }

    const history = getHistory();

    const record = {

        ...lastCalculation,

        id: crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,

        savedAt: new Date().toISOString()

    };

    history.push(record);

    if (!saveHistory(history)) {
        return;
    }

    alreadySaved = true;

    $("saveMessage").textContent =
        "✓ Athlete testing result saved successfully!";

    $("saveMessage").hidden = false;

    updateHistory();

}

saveBtn.addEventListener("click", saveTest);


// ========================================
// 15. PROGRESS EXERCISE SELECTOR
// ========================================

function initialiseProgressSelector() {

    const selector = $("progressExercise");

    selector.innerHTML = "";

    Object.keys(V1RM_DATA).forEach(exercise => {

        const option = document.createElement("option");

        option.value = exercise;
        option.textContent = exercise;

        selector.appendChild(option);

    });

    selector.addEventListener("change", updateHistory);

}


// ========================================
// 16. DISPLAY HISTORY TABLE
// ========================================

function updateHistory() {

    const history = getHistory();

    const athleteName =
        $("athleteName").value.trim().toLowerCase();

    // Blank athlete name shows all saved athletes.
    const filtered = athleteName
        ? history.filter(record =>
            record.athleteName.toLowerCase() === athleteName
        )
        : history;

    const table = $("historyTable");

    table.innerHTML = "";

    // Latest testing records first
    const sorted = [...filtered].sort((a, b) =>
        b.date.localeCompare(a.date) ||
        String(b.savedAt || "").localeCompare(String(a.savedAt || ""))
    );

    sorted.forEach(record => {

        const row = document.createElement("tr");

        const values = [
            record.date,
            record.exercise,
            Number(record.estimated1RM).toFixed(1),
            Number(record.rSquared).toFixed(3)
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

    $("historyMessage").textContent =
        filtered.length === 0
            ? "No saved testing records found for this athlete."
            : `${filtered.length} saved testing record(s).`;

    drawProgressChart(filtered);
    drawComparisonChart(filtered);

}


// ========================================
// 17. ATHLETE PROGRESS CHART
// ========================================

function drawProgressChart(history) {

    if (progressChart) {
        progressChart.destroy();
        progressChart = null;
    }

    const exercise = $("progressExercise").value;

    const records = history
        .filter(record => record.exercise === exercise)
        .sort((a, b) => a.date.localeCompare(b.date));

    if (records.length === 0) {
        return;
    }

    progressChart = new Chart($("progressChart"), {

        type: "line",

        data: {

            labels: records.map(record => record.date),

            datasets: [{

                label: "Estimated 1RM (kg)",

                data: records.map(record =>
                    Number(record.estimated1RM)
                ),

                borderColor: "#38bdf8",
                backgroundColor: "#38bdf8",

                pointRadius: 6,
                tension: 0.2

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    labels: {
                        color: "#cbd5e1"
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#334155"
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "Estimated 1RM (kg)",
                        color: "#cbd5e1"
                    },
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#334155"
                    }
                }

            }

        }

    });

}


// ========================================
// 18. EXERCISE COMPARISON CHART
// ========================================

function drawComparisonChart(history) {

    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }

    const latestByExercise = {};

    // Get latest saved test for each exercise
    history.forEach(record => {

        const existing = latestByExercise[record.exercise];

        if (
            !existing ||
            record.date > existing.date ||
            (
                record.date === existing.date &&
                String(record.savedAt || "") >
                String(existing.savedAt || "")
            )
        ) {

            latestByExercise[record.exercise] = record;

        }

    });

    const exercises = Object.keys(latestByExercise);

    if (exercises.length === 0) {
        return;
    }

    comparisonChart = new Chart($("comparisonChart"), {

        type: "bar",

        data: {

            labels: exercises,

            datasets: [{

                label: "Latest Estimated 1RM (kg)",

                data: exercises.map(exercise =>
                    Number(latestByExercise[exercise].estimated1RM)
                ),

                backgroundColor: "#38bdf8"

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    labels: {
                        color: "#cbd5e1"
                    }
                }

            },

            scales: {

                x: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#334155"
                    }
                },

                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Estimated 1RM (kg)",
                        color: "#cbd5e1"
                    },
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "#334155"
                    }
                }

            }

        }

    });

}


// ========================================
// 19. CSV EXPORT
// ========================================

function exportCSV() {

    const history = getHistory();

    if (history.length === 0) {

        $("exportMessage").textContent =
            "No saved records available to export.";

        return;

    }

    const headers = [

        "Athlete Name",
        "Body Weight (kg)",
        "Testing Date",
        "Exercise",
        "V1RM (m/s)",
        "Estimated 1RM (kg)",
        "1RM / Body Weight",
        "Slope",
        "Intercept",
        "R Squared",
        "Data Points",
        "Loads (kg)",
        "Velocities (m/s)"

    ];

    const rows = history.map(record => [

        record.athleteName,
        record.bodyWeight ?? "",
        record.date,
        record.exercise,
        record.v1rm,
        Number(record.estimated1RM).toFixed(2),
        record.bodyWeightRatio === null
            ? ""
            : Number(record.bodyWeightRatio).toFixed(3),
        record.slope,
        record.intercept,
        record.rSquared,
        record.dataPoints,
        record.loads.join("; "),
        record.velocities.join("; ")

    ]);

    function escapeCSV(value) {

        const text = String(value ?? "");

        return `"${text.replace(/"/g, '""')}"`;

    }

    const csv = [
        headers,
        ...rows
    ].map(row =>
        row.map(escapeCSV).join(",")
    ).join("\r\n");

    // UTF-8 BOM helps Excel display text correctly
    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "VBT_Athlete_Testing_Results.csv";

    link.click();

    URL.revokeObjectURL(url);

    $("exportMessage").textContent =
        "CSV export generated successfully.";

}

$("csvBtn").addEventListener("click", exportCSV);


// ========================================
// 20. PDF EXPORT
// ========================================

function exportPDF() {

    if (getHistory().length === 0) {

        $("exportMessage").textContent =
            "Save at least one testing record before exporting.";

        return;

    }

    $("exportMessage").textContent =
        "Choose 'Save as PDF' in your browser's print window.";

    window.print();

}

$("pdfBtn").addEventListener("click", exportPDF);


// ========================================
// 21. REFRESH HISTORY
// ========================================

$("refreshHistoryBtn").addEventListener(
    "click",
    updateHistory
);

$("athleteName").addEventListener(
    "input",
    updateHistory
);


// ========================================
// 22. CLEAR SAVED RECORDS
// ========================================

function clearHistory() {

    const confirmed = window.confirm(
        "Are you sure you want to permanently delete ALL saved athlete testing records from this browser?"
    );

    if (!confirmed) {
        return;
    }

    if (!saveHistory([])) {
        return;
    }

    lastCalculation = null;
    alreadySaved = false;

    $("results").hidden = true;
    $("saveMessage").hidden = true;

    updateHistory();

    $("exportMessage").textContent =
        "All saved testing records have been cleared.";

}

$("clearHistoryBtn").addEventListener(
    "click",
    clearHistory
);


// ========================================
// 23. RESET CURRENT PROFILE
// ========================================

function resetProfile() {

    numPoints.value = 4;

    generateInputs();

    $("results").hidden = true;
    $("saveMessage").hidden = true;

    hideError();

    lastCalculation = null;
    alreadySaved = false;

    if (velocityChart) {

        velocityChart.destroy();
        velocityChart = null;

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

resetBtn.addEventListener("click", resetProfile);


// ========================================
// 24. ERROR HANDLING
// ========================================

function showError(message) {

    $("errorMessage").textContent = message;
    $("errorMessage").hidden = false;

}

function hideError() {

    $("errorMessage").textContent = "";
    $("errorMessage").hidden = true;

}


// ========================================
// 25. INITIALISE APPLICATION
// ========================================

function initialiseApp() {

    displayReferenceTable();

    updateExercise();

    generateInputs();

    initialiseProgressSelector();

    updateHistory();

}

initialiseApp();
