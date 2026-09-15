const API_URL = "https://metraguard-new.onrender.com";

const fileInput = document.getElementById("file-input");
const uploadArea = document.getElementById("upload-area");
const fileName = document.getElementById("file-name");
const scanButton = document.getElementById("scan-button");
const scanStatus = document.getElementById("scan-status");

let selectedFile = null;


// ===============================
// FILE SELECTION
// ===============================

fileInput.addEventListener("change", function () {
    if (fileInput.files.length === 0) {
        return;
    }

    selectedFile = fileInput.files[0];

    showSelectedFile(selectedFile);
});


// ===============================
// SHOW SELECTED FILE
// ===============================

function showSelectedFile(file) {

    fileName.textContent = `Selected: ${file.name}`;

    scanStatus.textContent = "";

    scanButton.disabled = false;
}


// ===============================
// DRAG & DROP
// ===============================

uploadArea.addEventListener("dragover", function (event) {

    event.preventDefault();

    uploadArea.classList.add("dragging");
});


uploadArea.addEventListener("dragleave", function () {

    uploadArea.classList.remove("dragging");
});


uploadArea.addEventListener("drop", function (event) {

    event.preventDefault();

    uploadArea.classList.remove("dragging");

    if (event.dataTransfer.files.length === 0) {
        return;
    }

    selectedFile = event.dataTransfer.files[0];

    showSelectedFile(selectedFile);
});


// ===============================
// SCAN BUTTON
// ===============================

scanButton.addEventListener("click", async function () {

    if (!selectedFile) {

        scanStatus.textContent =
            "Please select a product image first.";

        return;
    }


    scanButton.disabled = true;

    scanStatus.textContent =
        "Analyzing your product label...";


    const formData = new FormData();

    formData.append("file", selectedFile);


    try {

        const response = await fetch(
            `${API_URL}/analyze`,
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data = await response.json();

        displayResults(data);

    }

    catch (error) {

        console.error("MetraGuard error:", error);

        scanStatus.textContent =
            "Could not connect to the MetraGuard backend.";

    }

    finally {

        scanButton.disabled = false;

    }

});


// ===============================
// DISPLAY RESULTS
// ===============================

function displayResults(data) {

    const compliance = data.compliance || {};

    const status =
        compliance.compliance_status || "Unknown";

    const score =
        compliance.compliance_score ?? 0;

    const extractedText =
        data.extracted_text || "No text detected.";

    let violations = compliance.violations || [];


    if (!Array.isArray(violations)) {

        violations = [violations];

    }


    let violationHTML = "";

    if (violations.length === 0) {

        violationHTML =
            "<li>No violations detected.</li>";

    } else {

        violationHTML = violations
            .map(
                violation =>
                    `<li>${escapeHTML(violation)}</li>`
            )
            .join("");

    }


    scanStatus.innerHTML = `
        <div class="analysis-result">

            <h3>Analysis Complete</h3>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(status)}
            </p>

            <p>
                <strong>Compliance Score:</strong>
                ${score}%
            </p>

            <h4>Potential Issues</h4>

            <ul>
                ${violationHTML}
            </ul>

            <h4>Extracted Text</h4>

            <pre>${escapeHTML(extractedText)}</pre>

        </div>
    `;
}


// ===============================
// SECURITY HELPER
// ===============================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}