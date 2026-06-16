// src/scripts/admin/geneticsFormController.ts

interface GeneticTestingConfig {
    name: string;
    about: string;
    externalUri: string;
    id: string;
}

interface LoadedDetails {
    id?: string;
    dogEffects?: string;
}

document.addEventListener("DOMContentLoaded", () => {
    const formEl = document.getElementById("genetics-management-form") as HTMLFormElement;
    if (!formEl) return;

    // Load Conditions
    const registryEl = document.getElementById("master-conditions-registry");
    const masterTests: GeneticTestingConfig[] = registryEl ? JSON.parse(registryEl.getAttribute("data-json") || "[]") : [];
    const totalMasterCount = masterTests.length;

    // Target Count Inputs
    const atRiskInput = document.getElementById("at-risk-count") as HTMLInputElement;
    const carrierInput = document.getElementById("carrier-count") as HTMLInputElement;
    const clearInput = document.getElementById("clear-count") as HTMLInputElement;

    // --- Tab Switching ---
    const tabNav = document.getElementById("genetics-tab-navigation");
    const switchTab = (targetPaneId: string) => {
        const triggers = tabNav?.querySelectorAll(".tab-trigger");
        triggers?.forEach((t) => {
            if (t.getAttribute("data-target") === targetPaneId) t.classList.add("active");
            else t.classList.remove("active");
        });
        document.querySelectorAll(".tab-pane").forEach((p) => {
            if (p.id === targetPaneId) p.classList.add("active");
            else p.classList.remove("active");
        });
    };

    // Dynamic Tab Lock
    const evaluateGeneticConditionTab = () => {
        if (!tabNav || !atRiskInput || !carrierInput) return;

        const atRiskNum = parseInt(atRiskInput.value, 10) || 0;
        const carrierNum = parseInt(carrierInput.value, 10) || 0;
        const totalActiveConditions = atRiskNum + carrierNum;

        const conditionTabButton = tabNav.querySelector('[data-target="pane-conditions"]') as HTMLButtonElement || null;
        if (!conditionTabButton) return;

        if (totalActiveConditions < 1) {
            conditionTabButton.classList.add("disabled-tab");
            conditionTabButton.setAttribute("disabled", "true");

            const currentActivePane = document.querySelector(".tab-pane.active");
            if (currentActivePane && currentActivePane.id === "pane-conditions") {
                switchTab("pane-summary");
            }
        } else {
            conditionTabButton.classList.remove("disabled-tab");
            conditionTabButton.removeAttribute("disabled");
        }
    }

    if (tabNav) {
        tabNav.querySelectorAll(".tab-trigger").forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const paneId = trigger.getAttribute("data-target");
                if (paneId) switchTab(paneId);
            });
        });
    }

    // --- Calculation & Injection ---
    const syncCalcsAndSlots = (
        groupType: 'at-risk' | 'carrier',
        loadedData: LoadedDetails[] = []
    ) => {
        const atRiskNum = parseInt(atRiskInput.value, 10) || 0;
        const carrierNum = parseInt(carrierInput.value, 10) || 0;

        // Dynamic Bounds
        if (atRiskInput) {
            const maxAllowedAtRisk = totalMasterCount - carrierNum;
            atRiskInput.setAttribute("max", maxAllowedAtRisk.toString());
        }
        if (carrierNum) {
            const maxAllowedCarrier = totalMasterCount - atRiskNum;
            carrierInput.setAttribute("max", maxAllowedCarrier.toString());
        }

        // Calculate the clear count value
        const clearNum = Math.max(0, totalMasterCount - (atRiskNum + carrierNum));
        if (clearInput) clearInput.value = clearNum.toString();

        evaluateGeneticConditionTab();

        // Target DOM slots
        const container = document.getElementById(`slots-container-${groupType}`);
        const feedback = document.getElementById(`feedback-${groupType}`);
        if (!container || !feedback) return;

        const targetSlotsCount = groupType === "at-risk" ? atRiskNum : carrierNum;
        feedback.innerText = `Allocated Conditions: ${targetSlotsCount}`;

        // Scrape current UI entry states before cleaning container innerHTML
        const currentSelections: LoadedDetails[] = [];
        container.querySelectorAll(".allocated-slot-card").forEach((card) => {
            const select = card.querySelector(".slot-dropdown-select") as unknown as HTMLSelectElement;
            const textarea = card.querySelector(".cond-effect") as HTMLTextAreaElement;
            if (select && textarea && select.value) {
                currentSelections.push({
                    id: select.value,
                    dogEffects: textarea.value
                });
            }
        });

        const operationalSource = loadedData.length > 0 ? loadedData : currentSelections;
        container.innerHTML = "";

        for (let i = 0; i < targetSlotsCount; i++) {
            const savedItem = operationalSource[i] || null;
            const card = document.createElement("div");
            card.className = `allocated-slot-card allocated-${groupType}`;

            let optionsHTML = `<option value="">-- Click to Choose Condition (Slot ${i + 1}) --</option>`;
            masterTests.forEach(test => {
                const isSelected = savedItem && (savedItem.id === test.id);
                optionsHTML += `<option value="${test.id}" ${isSelected ? 'selected' : ''}>${test.name}</option>`;
            });

            card.innerHTML = `
                <select class="slot-dropdown-select" required>
                    ${optionsHTML}
                </select>
                <div class="textarea-wrapper ${savedItem ? 'active' : ''}">
                    <label style="font-family:var(--font-secondary); font-weight:700; font-size:1.05rem; display:block; margin: 0.6rem 0 0.3rem 0; color:var(--colour-dark);">Effect on Dog / Symptoms Description:</label>
                    <textarea class="cond-effect" placeholder="Document specific symptomatic profiles, clinical impacts, or breeding tracking notes..." ${savedItem ? 'required' : ''}>${savedItem ? savedItem.dogEffects : ''}</textarea>
                </div>
            `;

            const selectEl = card.querySelector(".slot-dropdown-select") as unknown as HTMLSelectElement;
            const wrapperEl = card.querySelector(".textarea-wrapper") as HTMLDivElement;
            const textareaEl = card.querySelector(".cond-effect") as HTMLTextAreaElement;

            if (selectEl && wrapperEl && textareaEl) {
                selectEl.addEventListener("change", () => {
                    if (selectEl.value) {
                        wrapperEl.classList.add("active");
                        textareaEl.setAttribute("required", "true");
                    } else {
                        wrapperEl.classList.remove("active");
                        textareaEl.removeAttribute("required");
                    }
                });
            }

            container.appendChild(card);
        }
    };


    // --- Bind Event Listeners ---
    if (atRiskInput && carrierInput) {
        ['input', 'change', 'keyup'].forEach(ev => {
            atRiskInput.addEventListener(ev, () =>  {
                syncCalcsAndSlots('at-risk');
                evaluateGeneticConditionTab();
            });
            carrierInput.addEventListener(ev, () => {
                syncCalcsAndSlots('carrier');
                evaluateGeneticConditionTab();
            });
        });
    }

    // 'Rehydration'
    const atRiskContainer = document.getElementById("slots-container-at-risk");
    const carrierContainer = document.getElementById("slots-container-carrier");

    const initialAtRiskRaw = atRiskContainer?.getAttribute("data-current-json");
    const initialCarrierRaw = carrierContainer?.getAttribute("data-current-json");

    const loadedAtRisk: LoadedDetails[] = initialAtRiskRaw ? JSON.parse(initialAtRiskRaw) : [];
    const loadedCarrier: LoadedDetails[] = initialCarrierRaw ? JSON.parse(initialCarrierRaw) : [];

    syncCalcsAndSlots('at-risk', loadedAtRisk);
    syncCalcsAndSlots('carrier', loadedCarrier);
    evaluateGeneticConditionTab();

    // --- Submission ---
    formEl.addEventListener("submit", async (e) => {
        e.preventDefault();

        const mode = formEl.getAttribute("data-mode") || "add";
        const adultId = formEl.getAttribute("data-adult-id") || "";

        let slotValidationError = false;
        const harvestAllocatedSlotData = (containerId: string) => {
            const container = document.getElementById(containerId);
            if (!container) return [];
            const cards = container.querySelectorAll(".allocated-slot-card");

            return Array.from(cards).map(card => {
                const select = card.querySelector(".slot-dropdown-select") as unknown as HTMLSelectElement;
                const textarea = card.querySelector(".cond-effect") as HTMLTextAreaElement;

                if (!select || !select.value) { slotValidationError = true; }

                window.showToast(select ? select.value : "");

                return {
                    id: select ? select.value : "",
                    dogEffects: textarea ? textarea.value : ""
                };
            });
        };

        const atRiskDetails = harvestAllocatedSlotData("slots-container-at-risk");
        const carrierDetails = harvestAllocatedSlotData("slots-container-carrier");

        if (slotValidationError) {
            window.showToast("⚠️ Allocation Warning: You have empty condition's! Please assign conditions to all available slots before saving.");
            switchTab("pane-conditions");
            return;
        }

        const activeSelectedIds = new Set([
            ...atRiskDetails.map(item => item.id),
            ...carrierDetails.map(item => item.id)
        ]);

        const clearDetails = masterTests
            .filter(testItem => !activeSelectedIds.has(testItem.id))
            .map(testItem => ({
                id: testItem.id,
                dogEffects: ""
            }));

        const tupleRows = formEl.querySelectorAll(".tuple-row");
        const breedGeneticsSummary = Array.from(tupleRows).map(row => ({
            breed: (row.querySelector(".tuple-breed") as HTMLInputElement).value,
            value: (row.querySelector(".tuple-value") as HTMLInputElement).value,
        }));

        const payload = {
            adultId,
            atRiskCount: atRiskDetails.length,
            carrierCount: carrierDetails.length,
            clearCount: clearDetails.length,
            dogCoI: (document.getElementById("dog-coi") as HTMLInputElement).value,
            breedAverage: (document.getElementById("breed-average") as HTMLInputElement).value || null,
            coiHistory: {
                generations: (document.getElementById("coi-generations") as HTMLInputElement).value,
                complete: (document.getElementById("coi-complete") as HTMLInputElement).value,
            },
            atRiskDetails,
            carrierDetails,
            clearDetails,
            breedGeneticsSummary,
        };

        const submitBtn = formEl.querySelector(".submit-btn") as HTMLButtonElement | null;
        if (submitBtn) submitBtn.disabled = true;

        const targetApiEndpoint = mode === "edit"
            ? "/admin/api/genetics-submit?action=edit"
            : "/admin/api/genetics-submit?action=add";

        try {
            const response = await fetch(targetApiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json() as { success: boolean; message?: string };

            if (response.ok && result.success) {
                if (typeof window.showToast === "function") window.showToast("Genetics records committed successfully!", false);
                setTimeout(() => window.location.href = "/admin/edit?type=parents", 1000);
            } else {
                throw new Error(result.message || "Failed execution transaction payload submission.");
            }
        } catch (err: any) {
            if (typeof window.showToast === "function") window.showToast(`Error: ${err.message}`, true);
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});