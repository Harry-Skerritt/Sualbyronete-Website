// src/scripts/admin/adultFormController.ts

document.addEventListener("DOMContentLoaded", () => {
    const contextEl = document.getElementById("parent-form-context");
    const formEl = document.getElementById("parent-add-form") as unknown as HTMLFormElement | null;
    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("parent-image-file") as unknown as HTMLInputElement;
    const imgPreview = document.getElementById("image-preview") as unknown as HTMLImageElement;

    const parentNameInput = document.getElementById("parent-name") as unknown as HTMLInputElement;
    const parentBioInput = document.getElementById("parent-bio") as unknown as HTMLTextAreaElement;
    const breedSelect = document.getElementById("breed-select") as unknown as HTMLSelectElement;
    const parentDobInput = document.getElementById("parent-dob") as unknown as HTMLInputElement;
    const parentForSaleSelect = document.getElementById("parent-for-sale") as unknown as HTMLSelectElement;
    const colourSelect = document.getElementById("colour-select") as unknown as HTMLSelectElement;
    const genderSelect = document.getElementById("gender-select") as unknown as HTMLSelectElement;
    const parentRefInput = document.getElementById("parent-ref") as unknown as HTMLInputElement;
    const parentIdInput = document.getElementById("parent-id") as unknown as HTMLInputElement;

    const parentDeadSelect = document.getElementById("parent-dead") as unknown as HTMLSelectElement;
    const parentDodInput = document.getElementById("parent-dod") as unknown as HTMLInputElement;
    const dodWrapper = document.getElementById("dod-wrapper") as unknown as HTMLElement;

    if (
        !contextEl || !fileInput || !imgPreview || !breedSelect || !colourSelect || !formEl ||
        !parentNameInput || !parentBioInput || !parentDobInput || !parentForSaleSelect ||
        !genderSelect || !parentRefInput || !parentIdInput
    ) {
        console.error("Failed to initialize parent form controller: Missing elements.");
        return;
    }

    if (!parentDeadSelect || !parentDodInput || !dodWrapper) {
        console.error("Missing elements for deceased layout tracking configuration.");
        return;
    }

    // Death
    const toggleDodState = () => {
        const isDeceased = parentDeadSelect.value === "true";
        if (isDeceased) {
            dodWrapper.style.display = "flex";
            parentDodInput.required = true;
            parentDodInput.disabled = false;

            if (!parentDodInput.value) {
                const today = new Date().toISOString().split("T")[0];
                parentDodInput.value = today;
            }
        } else {
            dodWrapper.style.display = "none";
            parentDodInput.required = false;
            parentDodInput.disabled = true;
            parentDodInput.value = "";
        }
    };

    parentDeadSelect.addEventListener("change", toggleDodState);
    toggleDodState();

    const cameraIcon = dropzone?.querySelector(".camera-icon") as HTMLElement | null;
    const uploadBtn = dropzone?.querySelector(".upload-button") as HTMLElement | null;

    // --- Dynamic Colour Selection ---
    const rawColours = contextEl.getAttribute("data-colours");
    const puppyColours = rawColours ? JSON.parse(rawColours) as Array<{ value: string; label: string; breed: string }> : [];

    const updateMockIdPreview = () => {
        const isEditMode = formEl.getAttribute("data-edit-mode") === "true";
        if (isEditMode) return;

        const breed = breedSelect.value.toLowerCase().trim();
        const gender = genderSelect.value.toLowerCase().trim();

        if (!breed) {
            parentIdInput.value = "...";
            return;
        }

        const breedCode = breed === 'yorkie' ? 'YT' : 'BT';
        let genderCode = "???";
        if (gender === 'female') genderCode = "???-D";
        if (gender === 'male') genderCode = "???-S";

        parentIdInput.value = `${breedCode}${genderCode}`;
    };

    const populateColoursForBreed = (breedValue: string) => {
        const selectedBreed = breedValue.toLowerCase().trim();
        colourSelect.innerHTML = '<option value="">Choose Colour</option>';
        updateMockIdPreview();

        if (!selectedBreed) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">Choose a breed first...</option>';
            return false;
        }

        const matchingColours = puppyColours.filter(
            item => item.breed.toLowerCase() === selectedBreed
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

    genderSelect.addEventListener("change", updateMockIdPreview);

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

        const mode = formEl.getAttribute("data-mode") || "add";
        const parentId = formEl.getAttribute("data-id") || "";

        if (mode === "add" && (!fileInput.files || fileInput.files.length === 0)) {
            window.showToast("A parent photo is required!", true);
            return;
        }

        if (mode === "edit" && (!parentId || parentId === "...")) {
            window.showToast("Submission Error: Missing profile identifier target ID", true);
            return;
        }

        const submitBtn = formEl.querySelector('.submit-btn') as HTMLButtonElement | null;
        const originalBtnText = submitBtn ? submitBtn.textContent : "Add Parent";

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.cursor = "not-allowed";
        }

        const formData = new FormData();
        formData.append("name", parentNameInput.value);
        formData.append("breed", breedSelect.value);
        formData.append("bio", parentBioInput.value);
        formData.append("dob", parentDobInput.value);
        formData.append("forSale", parentForSaleSelect.value === "true" ? "true" : "false");
        formData.append("colour", colourSelect.value);
        formData.append("gender", genderSelect.value);

        formData.append("isDead", parentDeadSelect.value === "true" ? "true" : "false");
        formData.append("deathDate", parentDodInput.value || "");

        const regIdVal = parentRefInput.value;
        formData.append("regID", regIdVal.trim() ? regIdVal : "#0000");

        if (fileInput.files && fileInput.files.length > 0) {
            formData.append("parentImage", fileInput.files[0]);
        }

        let targetUrl = "/admin/api/add-submit?type=adult";
        if (mode === "edit") {
            formData.append("id", parentId);
            targetUrl = "/admin/api/edit-submit?type=adult";
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
                    : `Success! Parent registered as System ID: ${result.generatedId}`;

                window.showToast(toastMessage, false);

                setTimeout(() => {
                    window.location.href = "/admin/dashboard";
                }, 1000);
            } else {
                throw new Error(result.message || "Failed to save parent entry records");
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