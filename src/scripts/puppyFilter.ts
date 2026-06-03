// src/scripts/puppyFilter.ts


let currentBreedFilter = "state-one";
let dbPuppies = [];

function getDbData() {
    dbPuppies = (window as any).PUPPY_DATA || [];
}

function renderPuppies() {
    const cards = document.querySelectorAll('.puppy-card-wrapper') as NodeListOf<HTMLElement>;
    const noResultsMsg = document.getElementById('no-results-message');

    const genderValue = (document.getElementById('gender-select') as HTMLSelectElement)?.value || 'all';
    const colourValue = (document.getElementById('colour-select') as HTMLSelectElement)?.value || 'all';
    const availabilityValue = (document.getElementById('availability-select') as HTMLSelectElement)?.value || 'all';

    let visibleCount = 0;

    // Send data for cards
    cards.forEach(card => {
        const cardBreed = card.getAttribute('data-breed');
        const cardGender = card.getAttribute('data-gender');
        const cardColour = card.getAttribute('data-colour');
        const cardStatus = card.getAttribute('data-status');

        const matchesBreed = cardBreed === currentBreedFilter;
        const matchesGender = genderValue === 'all' || cardGender === genderValue;
        const matchesColour = colourValue === 'all' || cardColour === colourValue.replace(/[^a-z]/g, '');
        const matchesStatus = availabilityValue === 'all' || cardStatus === availabilityValue;

        if (matchesBreed && matchesGender && matchesColour && matchesStatus) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Update active item counter
    const countElement = document.querySelector('.result-count');
    if (countElement) {
        countElement.textContent = `Puppies Available: ${visibleCount}`;
    }

    // Handle fallback display text visibility loops
    if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function initPageLogic() {
    getDbData();
    renderPuppies();

    // Toggle panel view state handler
    const container = document.querySelector('.filter-container');
    const toggleBtn = document.querySelector('.filter-toggle');
    if (container && toggleBtn) {
        toggleBtn.replaceWith(toggleBtn.cloneNode(true)); // Prevents duplicate event listeners on page swap
        document.querySelector('.filter-toggle')?.addEventListener('click', () => {
            const isExpanded = container.getAttribute('data-expanded') === 'true';
            container.setAttribute('data-expanded', String(!isExpanded));
        });
    }

    // Reset Button
    const resetBtn = document.querySelector('.reset-button');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Set dropdown selects index back to 0 ("All")
            const selects = document.querySelectorAll('[data-filter-select]') as NodeListOf<HTMLSelectElement>;
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

function handleBreedChange(e: Event) {
    const customEvent = e as CustomEvent<{ activeBreed: string }>;

    if(customEvent.detail && customEvent.detail.activeBreed) {
        currentBreedFilter = customEvent.detail.activeBreed;
        renderPuppies();
    }

}

initPageLogic();
document.addEventListener('astro:page-load', initPageLogic);