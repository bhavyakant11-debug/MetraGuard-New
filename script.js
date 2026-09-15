const fileInput = document.getElementById("file-input");
const fileName = document.getElementById("file-name");
const uploadArea = document.getElementById("upload-area");
const scanButton = document.getElementById("scan-button");
const scanStatus = document.getElementById("scan-status");


// ================================
// FILE SELECTION
// ================================

fileInput.addEventListener("change", () => {

    if (fileInput.files.length > 0) {

        const file = fileInput.files[0];

        fileName.textContent = `✓ ${file.name}`;
        scanStatus.textContent = "Image ready for analysis.";

    }

});


// ================================
// DRAG & DROP
// ================================

uploadArea.addEventListener("dragover", (event) => {

    event.preventDefault();

    uploadArea.style.borderColor = "#5ab5ff";

});


uploadArea.addEventListener("dragleave", () => {

    uploadArea.style.borderColor = "";

});


uploadArea.addEventListener("drop", (event) => {

    event.preventDefault();

    if (event.dataTransfer.files.length > 0) {

        fileInput.files = event.dataTransfer.files;

        const file = fileInput.files[0];

        fileName.textContent = `✓ ${file.name}`;
        scanStatus.textContent = "Image ready for analysis.";

    }

});


// ================================
// SCAN
// ================================

scanButton.addEventListener("click", async () => {

    if (!fileInput.files.length) {

        scanStatus.textContent =
            "Please upload a product label first.";

        return;

    }

    const file = fileInput.files[0];

    const formData = new FormData();

    formData.append("file", file);


    scanButton.disabled = true;
    scanButton.style.opacity = "0.7";

    scanStatus.textContent =
        "✦ AI is analyzing your product...";


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/analyze",
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const result = await response.json();


        console.log(
            "MetraGuard result:",
            result
        );


        scanStatus.textContent =
            `✓ Analysis complete — ${
                result.compliance.compliance_status
            }`;


    } catch (error) {

        console.error(error);

        scanStatus.textContent =
            "✕ Could not connect to the MetraGuard backend.";

    }


    scanButton.disabled = false;
    scanButton.style.opacity = "1";

});