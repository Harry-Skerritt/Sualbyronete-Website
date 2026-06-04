// src/scripts/admin/puppyFormController.ts

document.addEventListener("DOMContentLoaded", () => {
    const contextEl = document.getElementById("puppy-form-context");
    const formEl = document.getElementById("puppy-add-form") as unknown as HTMLFormElement | null;
    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("pup-image-file") as unknown as HTMLInputElement;
    const imgPreview = document.getElementById("image-preview") as unknown as HTMLImageElement;
    const alertBanner = document.getElementById("form-alert-banner");
    const discardBtn = document.getElementById("discard-form-btn");

    const pupNameInput = document.getElementById("pup-name") as unknown as HTMLInputElement;
    const pupBioInput = document.getElementById("pup-bio") as unknown as HTMLTextAreaElement;
    const pupStatusSelect = document.getElementById("pup-status") as unknown as HTMLSelectElement;
    const breedSelect = document.getElementById("breed-select") as unknown as HTMLSelectElement;
    const pupDobInput = document.getElementById("pup-dob") as unknown as HTMLInputElement;
    const pupAvailableInput = document.getElementById("pup-available") as unknown as HTMLInputElement;
    const colourSelect = document.getElementById("colour-select") as unknown as HTMLSelectElement;
    const genderSelect = document.getElementById("gender-select") as unknown as HTMLSelectElement;
    const motherSelect = document.getElementById("mother-select") as unknown as HTMLSelectElement;
    const fatherSelect = document.getElementById("father-select") as unknown as HTMLSelectElement;
    const pupRefInput = document.getElementById("pup-ref") as unknown as HTMLInputElement;

    // validation barrier
    if (
        !contextEl || !fileInput || !imgPreview || !breedSelect || !colourSelect || !formEl ||
        !pupNameInput || !pupBioInput || !pupStatusSelect || !pupDobInput || !pupAvailableInput ||
        !genderSelect || !motherSelect || !fatherSelect || !pupRefInput
    ) {
        console.error("❌ Failed to initialize form controller: Missing DOM elements.");
        return;
    }

    const cameraIcon = dropzone?.querySelector(".camera-icon") as HTMLElement | null;
    const uploadBtn = dropzone?.querySelector(".upload-button") as HTMLElement | null;

    // --- Dynamic Colour Selection Logic ---
    const rawColours = contextEl.getAttribute("data-colours");
    const puppyColours = rawColours ? JSON.parse(rawColours) as Array<{ value: string; label: string; breed: string }> : [];

    breedSelect.addEventListener("change", () => {
        const selectedBreed = breedSelect.value.toLowerCase().trim();
        colourSelect.innerHTML = '<option value="">Choose Colour</option>';

        if (!selectedBreed) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">Choose a breed first...</option>';
            return;
        }

        const matchingColours = puppyColours.filter(
            item => item.breed.toLowerCase() === selectedBreed.toLowerCase()
        )

        if (matchingColours.length === 0) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">No colors found for this breed...</option>';
            return;
        }

        colourSelect.disabled = false;
        matchingColours.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.value;
            opt.textContent = item.label;
            colourSelect.appendChild(opt);
        });
    });

    // --- Photo Preview Processing ---
    const handleFilePreview = (file: File) => {
        if (!file.type.startsWith("image/")) {
            showAlert("Please select a valid image file.", "red");
            return;
        }
        const objectURL = URL.createObjectURL(file);
        imgPreview.src = objectURL;
        imgPreview.style.display = "block";
        if (cameraIcon) cameraIcon.style.display = "none";
        if (uploadBtn) uploadBtn.style.display = "none";
    };

    dropzone?.addEventListener("click", (e) => {
        if (e.target !== fileInput) fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file) handleFilePreview(file);
    });

    dropzone?.addEventListener("dragover", (e) => { e.preventDefault(); if (dropzone) dropzone.style.backgroundColor = "rgba(0, 0, 0, 0.08)"; });
    dropzone?.addEventListener("dragleave", () => { if (dropzone) dropzone.style.backgroundColor = ""; });
    dropzone?.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        if (dropzone) dropzone.style.backgroundColor = "";
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFilePreview(e.dataTransfer.files[0]);
        }
    });

    // --- Form Transmission ---
    formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        if (!fileInput.files || fileInput.files.length === 0) {
            showAlert("A puppy photo is required.", "red");
            return;
        }

        const submitBtn = formEl.querySelector('.submit-btn') as HTMLButtonElement | null;
        const originalBtnText = submitBtn ? submitBtn.textContent : "Add Puppy";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.cursor = "not-allowed";
        }

        const formData = new FormData();
        formData.append("name", pupNameInput.value);
        formData.append("breed", breedSelect.value);
        formData.append("bio", pupBioInput.value);
        formData.append("status", pupStatusSelect.value);
        formData.append("gender", genderSelect.value);
        formData.append("mother", motherSelect.value);
        formData.append("father", fatherSelect.value);
        formData.append("dob", pupDobInput.value);
        formData.append("availableFrom", pupAvailableInput.value);
        formData.append("colour", colourSelect.value);

        const regIdVal = pupRefInput.value;
        formData.append("regID", regIdVal.trim() ? regIdVal : "#0000");
        formData.append("puppyImage", fileInput.files[0]);

        try {
            const response = await fetch("/admin/puppy/add-submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json() as { success: boolean; generatedId?: string; message?: string };

            if (response.ok && result.success) {
                showAlert(`✔ Success! Puppy registered safely as System ID: ${result.generatedId}`, "green");
                setTimeout(() => {
                    window.location.href = "/admin/dashboard";
                }, 2000);
            } else {
                throw new Error(result.message || "Failed to save data record mapping entries");
            }
        } catch (err: any) {
            showAlert(`Submission Error: ${err.message}`, "red");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                submitBtn.style.opacity = "";
                submitBtn.style.cursor = "";
            }
        }
    });

    discardBtn?.addEventListener("click", () => {
        formEl.reset();
        imgPreview.style.display = "none";
        imgPreview.src = "";
        if (cameraIcon) cameraIcon.style.display = "block";
        if (uploadBtn) uploadBtn.style.display = "block";
        colourSelect.disabled = true;
        colourSelect.innerHTML = '<option value="">Choose a breed first...</option>';
        hideAlert();
    });

    function showAlert(msg: string, color: "red" | "green") {
        if (!alertBanner) return;
        alertBanner.textContent = msg;
        alertBanner.style.display = "block";
        alertBanner.style.backgroundColor = color === "red" ? "#fef2f2" : "#f0fdf4";
        alertBanner.style.color = color === "red" ? "#991b1b" : "#166534";
        alertBanner.style.border = color === "red" ? "1.5px solid #f87171" : "1.5px solid #4ade80";
    }
    function hideAlert() { if (alertBanner) alertBanner.style.display = "none"; }
});