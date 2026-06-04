// src/scripts/admin/adultFormController.ts

document.addEventListener("DOMContentLoaded", () => {
    const contextEl = document.getElementById("parent-form-context");
    const formEl = document.getElementById("parent-add-form") as unknown as HTMLFormElement | null;
    const dropzone = document.getElementById("upload-dropzone");
    const fileInput = document.getElementById("parent-image-file") as unknown as HTMLInputElement;
    const imgPreview = document.getElementById("image-preview") as unknown as HTMLImageElement;
    const alertBanner = document.getElementById("form-alert-banner");

    const parentNameInput = document.getElementById("parent-name") as unknown as HTMLInputElement;
    const parentBioInput = document.getElementById("parent-bio") as unknown as HTMLTextAreaElement;
    const breedSelect = document.getElementById("breed-select") as unknown as HTMLSelectElement;
    const parentDobInput = document.getElementById("parent-dob") as unknown as HTMLInputElement;
    const parentForSaleSelect = document.getElementById("parent-for-sale") as unknown as HTMLSelectElement;
    const colourSelect = document.getElementById("colour-select") as unknown as HTMLSelectElement;
    const genderSelect = document.getElementById("gender-select") as unknown as HTMLSelectElement;
    const parentRefInput = document.getElementById("parent-ref") as unknown as HTMLInputElement;
    const parentIdInput = document.getElementById("parent-id") as unknown as HTMLInputElement;

    if (
        !contextEl || !fileInput || !imgPreview || !breedSelect || !colourSelect || !formEl ||
        !parentNameInput || !parentBioInput || !parentDobInput || !parentForSaleSelect ||
        !genderSelect || !parentRefInput || !parentIdInput
    ) {
        console.error("Failed to initialize parent form controller: Missing elements.");
        return;
    }

    const cameraIcon = dropzone?.querySelector(".camera-icon") as HTMLElement | null;
    const uploadBtn = dropzone?.querySelector(".upload-button") as HTMLElement | null;

    const rawColours = contextEl.getAttribute("data-colours");
    const puppyColours = rawColours ? JSON.parse(rawColours) as Array<{ value: string; label: string; breed: string }> : [];

    const updateMockIdPreview = () => {
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

    breedSelect.addEventListener("change", () => {
        const selectedBreed = breedSelect.value.toLowerCase().trim();
        colourSelect.innerHTML = '<option value="">Choose Colour</option>';
        updateMockIdPreview();

        if (!selectedBreed) {
            colourSelect.disabled = true;
            colourSelect.innerHTML = '<option value="">Choose a breed first...</option>';
            return;
        }

        const matchingColours = puppyColours.filter(
            item => item.breed.toLowerCase() === selectedBreed
        );

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

    genderSelect.addEventListener("change", updateMockIdPreview);

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

    formEl.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideAlert();

        if (!fileInput.files || fileInput.files.length === 0) {
            showAlert("A parent photo is required!", "red");
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
        formData.append("forSale", parentForSaleSelect.value);
        formData.append("colour", colourSelect.value);
        formData.append("gender", genderSelect.value);

        const regIdVal = parentRefInput.value;
        formData.append("regID", regIdVal.trim() ? regIdVal : "#0000");
        formData.append("parentImage", fileInput.files[0]);

        try {
            const response = await fetch("/admin/adult/add-submit", {
                method: "POST",
                body: formData
            });

            const result = await response.json() as { success: boolean; generatedId?: string; message?: string };

            if (response.ok && result.success) {
                showAlert(`Success! Parent registered as System ID: ${result.generatedId}`, "green");
                setTimeout(() => {
                    window.location.href = "/admin/dashboard";
                }, 2000);
            } else {
                throw new Error(result.message || "Failed to save parent entry records");
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