// src/scripts/admin/puppyPackEditor.ts

export function initPuppyPackEditor() {
    const listContainer = document.getElementById('list-sort-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const addSubBtn = document.getElementById('add-sub-btn');
    const saveBtn = document.getElementById('submit-btn');

    if (!listContainer) return;

    // Drag only on drag btn
    listContainer.addEventListener('mouseover', (e) => {
        const target = e.target as HTMLElement;
        const handle = target.closest('.drag-handle-btn');

        if (handle) {
            const row = handle.closest('.item-row-wrapper');
            row?.querySelector('.comp-list-item')?.setAttribute('draggable', 'true');
        }
    });

    listContainer.addEventListener('mouseout', (e) => {
        const target = e.target as HTMLElement;
        const handle = target.closest('.drag-handle-btn');

        if (handle) {
            const row = handle.closest('.item-row-wrapper');
            row?.querySelector('.comp-list-item')?.removeAttribute('draggable');
        }
    });

    // --- HTML5 Drag & Drop Listeners ---
    listContainer.addEventListener('dragstart', (e) => {
        const target = e.target as HTMLElement;
        const itemRow = target.closest('.item-row-wrapper');
        if (!itemRow) return;
        itemRow.classList.add('dragging');
    });

    listContainer.addEventListener('dragend', (e) => {
        const target = e.target as HTMLElement;
        const itemRow = target.closest('.item-row-wrapper');
        if (itemRow) {
            itemRow.classList.remove('dragging');
        }
        evaluateSubItemBtn();
    });

    listContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = listContainer.querySelector('.dragging');
        if (!draggingItem) return;

        const siblings = [...listContainer.querySelectorAll('.item-row-wrapper:not(.dragging)')];
        const nextSibling = siblings.find(sibling => {
            const box = sibling.getBoundingClientRect();
            return e.clientY <= box.top + box.height / 2;
        });

        if (nextSibling) {
            listContainer.insertBefore(draggingItem, nextSibling);
        } else {
            listContainer.appendChild(draggingItem);
        }
    });

    // --- Sub Item Visibility ---
    function evaluateSubItemBtn() {
        if (!addSubBtn) return;
        const rowCount = listContainer!.querySelectorAll('.item-row-wrapper').length;
        addSubBtn.style.display = rowCount >= 1 ? 'inline-flex' : 'none';
    }

    // Initialize button state immediately
    evaluateSubItemBtn();

    // --- Create Rows from Templates ---
    function createNewRowElement(isSubItem = false) {
        const blueprintId = isSubItem ? 'row-template-sub' : 'row-template-item';
        const blueprint = document.getElementById(blueprintId) as HTMLTemplateElement;

        if (!blueprint) {
            console.error(`Required HTML template "${blueprintId}" was not found in the DOM.`);
            return document.createElement('div');
        }

        const clone = blueprint.content.cloneNode(true) as HTMLElement;
        const wrapper = clone.querySelector('.item-row-wrapper') as HTMLDivElement;

        const uniqueId = "new_" + Math.random().toString(36).substr(2, 9);
        wrapper.setAttribute('data-id', uniqueId);

        const innerCard = wrapper.querySelector('.comp-container') || wrapper.querySelector('.comp-list-item');
        const innerInput = wrapper.querySelector('.comp-input') as HTMLInputElement;
        const innerTextarea = wrapper.querySelector('.comp-textarea') as HTMLTextAreaElement;

        if (innerCard) innerCard.setAttribute('data-id', uniqueId);
        if (innerInput) innerInput.value = '';
        if (innerTextarea) innerTextarea.value = '';

        return wrapper;
    }

    // --- Action Button Click Handlers ---
    addItemBtn?.addEventListener('click', () => {
        listContainer.appendChild(createNewRowElement(false));
        evaluateSubItemBtn();
        (listContainer.lastElementChild?.querySelector('.comp-input') as HTMLInputElement)?.focus();
    });

    addSubBtn?.addEventListener('click', () => {
        listContainer.appendChild(createNewRowElement(true));
        evaluateSubItemBtn();
        (listContainer.lastElementChild?.querySelector('.comp-input') as HTMLInputElement)?.focus();
    });

    // --- Event Delegation for Deletions ---
    listContainer.addEventListener('click', (e) => {
        const deleteBtn = (e.target as HTMLElement).closest('.comp-delete-btn');
        if (!deleteBtn) return;

        const row = deleteBtn.closest('.item-row-wrapper');
        if (row) {
            row.remove();
            evaluateSubItemBtn();
        }
    });

    // --- Database API Save Handler ---
    saveBtn?.addEventListener('click', async () => {
        if (saveBtn.hasAttribute('disabled')) return;
        saveBtn.setAttribute('disabled', 'true');
        saveBtn.innerText = "Saving Changes...";

        const rowElements = listContainer.querySelectorAll('.item-row-wrapper');

        const dataPayload: Array<{
            id: string;
            value: string;
            content: string;
            sortOrder: number;
            isSubItem: boolean
        }> = [];

        rowElements.forEach((row, index) => {
            const inputElement = row.querySelector('.comp-input') as HTMLInputElement;
            const textareaElement = row.querySelector('.comp-textarea') as HTMLTextAreaElement;
            const rowId = row.getAttribute('data-id');

            if (inputElement && rowId) {
                dataPayload.push({
                    id: rowId,
                    value: inputElement.value.trim(),
                    content: textareaElement ? textareaElement.value.trim() : '',
                    sortOrder: index,
                    isSubItem: row.classList.contains('is-sub-item')
                });
            }
        });

        try {
            const response = await fetch('/admin/api/save-puppy-pack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: dataPayload })
            });

            const statusData = await response.json() as { success: boolean; message?: string };
            if (response.ok && statusData.success) {
                window.showToast("Puppy pack updated!");

                setTimeout(() => {
                    window.location.href = "/admin/dashboard";
                }, 1000);
            } else {
                window.showToast(`Save failure: ${statusData.message || 'Unknown Error'}`, true);
            }
        } catch (err) {
            window.showToast("Network Connection error", true);
        } finally {
            saveBtn.removeAttribute('disabled');
            saveBtn.innerText = "Save Changes";
        }
    });

}