// src/scripts/admin/puppyFormController.ts

document.addEventListener("DOMContentLoaded", () => {
    const contextEl = document.getElementById("puppy-form-context");
    const formEl = document.getElementById("puppy-add-form") as unknown as HTMLFormElement | null;
    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("pup-image-file") as unknown as HTMLInputElement;
    const imgPreview = document.getElementById("image-preview") as unknown as HTMLImageElement;
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
        console.error("Failed to initialize form controller: Missing DOM elements.");
        return;
    }

    const cameraIcon = dropzone?.querySelector(".camera-icon") as HTMLElement | null;
    const uploadBtn = dropzone?.querySelector(".upload-button") as HTMLElement | null;

    // --- Dynamic Colour Selection ---
    const rawColours = contextEl.getAttribute("data-colours");
    const puppyColours = rawColours ? JSON.parse(rawColours) as Array<{ value: string; label: string; breed: string }> : [];

    const populateColoursForBreed = (breedValue: string) => {
        const selectedBreed = breedValue.toLowerCase().trim();
        colourSelect.innerHTML = '<option value="">Choose Colour</option>';

        if (!selectedBreed) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">Choose a breed first...</option>';
            return false;
        }

        const matchingColours = puppyColours.filter(
            item => item.breed.toLowerCase() === selectedBreed.toLowerCase()
        );

        if (matchingColours.length === 0) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">No colors found for this breed...</option>';
            return false;
        }

        colourSelect.disabled = false;
        matchingColours.forEach((item) => {
            const opt = document.createElement("option");
            opt.value = item.value;
            opt.textContent = item.label;
            colourSelect.appendChild(opt);
        });
        return true;
    };

    breedSelect.addEventListener("change", () => {
        populateColoursForBreed(breedSelect.value);
    });

    const isEditMode = formEl.getAttribute("data-edit-mode") === "true";
    const savedColourCode = formEl.getAttribute("data-existing-colour");

    if (isEditMode && breedSelect.value) {
        const successfullyPopulated = populateColoursForBreed(breedSelect.value);
        if (successfullyPopulated && savedColourCode) {
            colourSelect.value = savedColourCode;
        }
    }

    // --- Photo Preview Processing ---
    const handleFilePreview = (file: File) => {
        if (!file.type.startsWith("image/")) {
            window.showToast("Please select a valid image file!", true);
            return;
        }

        const objectURL = URL.createObjectURL(file);

        if (imgPreview) {
            imgPreview.src = objectURL;
            imgPreview.style.display = "block";
        }

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

        const mode = formEl.getAttribute("data-mode") || "add";
        const puppyId = formEl.getAttribute("data-id") || "";

        if (mode === "add" && (!fileInput.files || fileInput.files.length === 0)) {
            window.showToast("A puppy photo is required!", true);
            return;
        }

        if (mode === "edit" && (!puppyId || puppyId === "...")) {
            window.showToast("Submission Error: Missing profile identifier target ID", true);
            return;
        }

        const submitBtn = formEl.querySelector('.submit-btn') as HTMLButtonElement | null;
        const originalBtnText = submitBtn ? submitBtn.textContent : (mode === "edit" ? "Save Changes" : "Add Puppy");

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

        if (fileInput.files && fileInput.files.length > 0) {
            formData.append("puppyImage", fileInput.files[0]);
        }

        let targetUrl = "/admin/api/add-submit?type=puppy";
        if (mode === "edit") {
            formData.append("id", puppyId);
            targetUrl = "/admin/api/edit-submit?type=puppy";
        }

        try {
            const response = await fetch(targetUrl, {
                method: "POST",
                body: formData
            });

            const result = await response.json() as { success: boolean; generatedId?: string; message?: string };

            if (response.ok && result.success) {
                const toastMessage = mode === "edit"
                    ? "Success! Changes saved cleanly."
                    : `Success! Puppy registered as System ID: ${result.generatedId}`;

                window.showToast(toastMessage, false);

                setTimeout(() => {
                    window.location.href = "/admin/dashboard";
                }, 1000);
            } else {
                throw new Error(result.message || "Failed to save data record mapping entries");
            }
        } catch (err: any) {
            window.showToast(`Submission Error: ${err.message}`, true);

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
    });

    /* Discard Modal */
    const modalEl = document.getElementById("discard-confirm-modal");
    const discardTriggerBtn = document.getElementById("discard-trigger-btn");
    const confirmDiscardBtn = document.getElementById("confirm-discard-btn");

    if (modalEl && discardTriggerBtn && confirmDiscardBtn) {
        discardTriggerBtn.addEventListener("click", () => {
            modalEl.classList.add("is-active");
            modalEl.removeAttribute("aria-hidden");
        });

        modalEl.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                modalEl.classList.remove("is-active");
                modalEl.setAttribute("aria-hidden", "true");
            });
        });

        confirmDiscardBtn.addEventListener("click", () => {
            window.location.href = "/admin/dashboard";
        });
    }
});