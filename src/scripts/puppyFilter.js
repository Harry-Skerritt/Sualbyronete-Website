// src/scripts/puppyFilter.ts

let currentBreedFilter = "state-one";
let dbPuppies = [];

function getDbData() {
    dbPuppies = window.PUPPY_DATA || [];
}

function renderPuppies() {
    const grid = document.getElementById('puppy-grid');
    if (!grid) return;

    const genderValue = document.getElementById('gender-select')?.value || 'all';
    const colourValue = document.getElementById('colour-select')?.value || 'all';
    const availabilityValue = document.getElementById('availability-select')?.value || 'all';

    const filteredPuppies = dbPuppies.filter(pup => {
        const matchesBreed = pup.breed === currentBreedFilter;
        const matchesGender = genderValue === 'all' || pup.gender.toLowerCase() === genderValue;
        const matchesColour = colourValue === 'all' ||
            pup.colour.toLowerCase().replace(/[^a-z]/g, '') === colourValue.replace(/[^a-z]/g, '');
        const matchesStatus = availabilityValue === 'all' || pup.status.toLowerCase() === availabilityValue;

        return matchesBreed && matchesGender && matchesColour && matchesStatus;
    });

    const countElement = document.querySelector('.result-count');
    if (countElement) {
        countElement.textContent = `Puppies Available: ${filteredPuppies.length}`;
    }

    if (filteredPuppies.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                No puppies match your selected filter criteria.
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredPuppies.map(pup => `
        <div class="puppy-card">
            <h2>${pup.name}</h2>
            <p><strong>Gender:</strong> ${pup.gender}</p>
            <p><strong>Colour:</strong> ${pup.colour}</p>
            <p><strong>Status:</strong> ${pup.status}</p>
        </div>
    `).join('');
}

function initPageLogic() {
    getDbData();
    renderPuppies();

    // Toggle panel view state handler
    const container = document.querySelector('.filter-container');
    const toggleBtn = document.querySelector('.filter-toggle');
    if (container && toggleBtn) {
        toggleBtn.replaceWith(toggleBtn.cloneNode(true)); // Prevents duplicate event listeners on page swap
        document.querySelector('.filter-toggle').addEventListener('click', () => {
            const isExpanded = container.getAttribute('data-expanded') === 'true';
            container.setAttribute('data-expanded', !isExpanded);
        });
    }

    // Reset Button
    const resetBtn = document.querySelector('.reset-button');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Set dropdown selects index back to 0 ("All")
            const selects = document.querySelectorAll('[data-filter-select]');
            selects.forEach(select => {
                select.selectedIndex = 0;
            });

            renderPuppies();
        });
    }

    // Select filtering engines
    const filterSelects = document.querySelectorAll('[data-filter-select]');
    filterSelects.forEach(select => {
        select.addEventListener('change', renderPuppies);
    });

    // Tabbed layout listeners
    window.removeEventListener('breedChange', handleBreedChange);
    window.addEventListener('breedChange', handleBreedChange);
}

function handleBreedChange(e) {
    currentBreedFilter = e.detail.activeBreed;
    renderPuppies();
}

// Kick off scripts cleanly across standard loads and transitions
initPageLogic();
document.addEventListener('astro:page-load', initPageLogic);