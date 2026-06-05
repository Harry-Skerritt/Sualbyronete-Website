// src/scripts/parentFilter.ts

let currentParentBreedFilter: string = "yorkie";
let currentParentGenderFilter: string = "female";
let dbAdults = [];

function getParentDbData(): void {
    dbAdults = (window as any).PARENT_DATA || [];
}

function renderParents(): void {
    const cards = document.querySelectorAll('.parent-card-wrapper') as NodeListOf<HTMLElement>
    const noResultsMsg = document.getElementById('no-results-message');

    let visibleCount = 0;

    cards.forEach(card => {
        const cardBreed = (card.getAttribute('data-breed') || '').toLowerCase();
        const cardGender = (card.getAttribute('data-gender') || '').toLowerCase();

        const matchesBreed = cardBreed.includes('york') === currentParentBreedFilter.toLowerCase().includes('york');
        const matchesGender = cardGender === currentParentGenderFilter.toLowerCase()

        if (matchesBreed && matchesGender) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function initParentFilers(): void {
    getParentDbData();

    const breedFilterEl = document.querySelector('.breed-filter');
    const genderFilterEl = document.querySelector('.gender-filter');

    if (breedFilterEl) {
        currentParentBreedFilter = breedFilterEl.getAttribute('data-active-value') || 'yorkie';
    }
    if (genderFilterEl) {
        currentParentGenderFilter = genderFilterEl.getAttribute('data-active-value') || 'female';
    }

    renderParents();

    window.removeEventListener('aBreedChange', handleTabToggleUpdate);
    window.addEventListener('aBreedChange', handleTabToggleUpdate);

    window.removeEventListener('aGenderChange', handleTabToggleUpdate);
    window.addEventListener('aGenderChange', handleTabToggleUpdate);
}

function handleTabToggleUpdate(e: Event): void {
    const customEvent = e as CustomEvent<{ value?: string }>;
    const payload = customEvent.detail;
    if (!payload) return;

    const selectedValue = (payload.value || '').toLowerCase();

    if ((payload.value && (payload.value.includes('york') || payload.value.includes('biew')))) {
        currentParentBreedFilter = selectedValue
    }
    else if ((payload.value && (payload.value === 'male' || payload.value === 'female'))) {
        currentParentGenderFilter = selectedValue
    }

    renderParents();
}

initParentFilers();
document.addEventListener('astro:page-load', initParentFilers);