// src/scripts/ageCalculator.ts

export function calculateAge(dobString: string): string {
    const dob = new Date(dobString);
    const now = new Date();

    // Safeguard against invalid dates or future dates
    if (isNaN(dob.getTime()) || dob > now) {
        return "Newborn";
    }

    // Calculate absolute differences
    const diffTime = Math.abs(now.getTime() - dob.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    // If the puppy is under 8 weeks old, show strictly in weeks
    if (diffWeeks < 8) {
        return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'}`;
    }

    // Detailed breakdown for months and years
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();

    // Adjust if the current month is before the birth month in the calendar year
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
        years--;
        months += 12;
    }

    // Adjust fine-grain day mismatch within the month anchor
    if (now.getDate() < dob.getDate() && months > 0) {
        months--;
    }

    const totalMonths = (years * 12) + months;

    // If under 1 year old, show strictly in months
    if (years < 1) {
        return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
    }

    // If 1 year or older, show years, and conditionally add months if it's a partial year
    const yearString = `${years} ${years === 1 ? 'year' : 'years'}`;
    const monthString = months > 0 ? `, ${months} ${months === 1 ? 'month' : 'months'}` : '';

    return `${yearString}${monthString}`;
}