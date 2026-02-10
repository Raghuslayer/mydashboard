// Constants
export const EXPECTED_LIFETIME_YEARS = 60;
export const COLLEGE_PERIOD_YEARS = 4;
export const DAYS_PER_YEAR = 365.25; // Account for leap years
export const MILESTONE_DAYS = [7, 30, 60, 100, 365, 730]; // Achievement thresholds
export const WEEKS_PER_YEAR = 52;

/**
 * Calculate the number of days from a date of birth to now
 * @param {Date|string} dob - Date of birth
 * @returns {number} Days since birth
 */
export function calculateDaysSinceBirth(dob) {
    const birthDate = new Date(dob);
    const now = new Date();
    const diffTime = Math.abs(now - birthDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Calculate days remaining until a point in the future
 * @param {Date} startDate - Starting date (usually now)
 * @param {number} years - Number of years in the future
 * @returns {number} Days remaining
 */
export function calculateDaysToFuture(startDate, years) {
    const start = new Date(startDate);
    const future = new Date(start);
    future.setFullYear(future.getFullYear() + years);
    const diffTime = Math.abs(future - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Calculate total expected lifetime days
 * @param {Date|string} dob - Date of birth
 * @param {number} expectedAge - Expected age in years (default 60)
 * @returns {number} Total expected days
 */
export function calculateLifetimeDays(dob, expectedAge = EXPECTED_LIFETIME_YEARS) {
    return Math.floor(expectedAge * DAYS_PER_YEAR);
}

/**
 * Calculate progress percentage
 * @param {number} completed - Completed amount
 * @param {number} total - Total amount
 * @returns {number} Percentage (0-100)
 */
export function calculateProgressPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
    const birthDate = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Calculate weeks since birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Weeks since birth
 */
export function calculateWeeksSinceBirth(dob) {
    const days = calculateDaysSinceBirth(dob);
    return Math.floor(days / 7);
}

/**
 * Calculate total expected weeks in lifetime
 * @param {number} expectedAge - Expected age in years (default 60)
 * @returns {number} Total expected weeks
 */
export function calculateLifetimeWeeks(expectedAge = EXPECTED_LIFETIME_YEARS) {
    return Math.floor(expectedAge * WEEKS_PER_YEAR);
}

/**
 * Format days into a human-readable string
 * @param {number} days - Number of days
 * @returns {string} Formatted string (e.g., "2 years, 3 months")
 */
export function formatDaysToReadable(days) {
    const years = Math.floor(days / DAYS_PER_YEAR);
    const remainingDays = days % DAYS_PER_YEAR;
    const months = Math.floor(remainingDays / 30);
    const finalDays = Math.floor(remainingDays % 30);

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (finalDays > 0 && years === 0) parts.push(`${finalDays} day${finalDays > 1 ? 's' : ''}`);

    return parts.join(', ') || '0 days';
}

/**
 * Validate date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateDOB(dob) {
    if (!dob) {
        return { valid: false, error: 'Date of birth is required' };
    }

    const birthDate = new Date(dob);
    const now = new Date();

    if (isNaN(birthDate.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }

    if (birthDate > now) {
        return { valid: false, error: 'Date of birth cannot be in the future' };
    }

    const age = calculateAge(dob);
    if (age < 0 || age > 150) {
        return { valid: false, error: 'Please enter a valid date of birth' };
    }

    return { valid: true };
}

/**
 * Calculate college days using custom start and end dates
 * @param {Date|string} collegeStart - College start date
 * @param {Date|string} collegeEnd - College end date  
 * @returns {{total: number, remaining: number, percentage: number}} College period stats
 */
export function calculateCollegePeriodCustom(collegeStart, collegeEnd) {
    if (!collegeStart || !collegeEnd) {
        // Fallback to 4-year default from now
        const now = new Date();
        const total = Math.floor(COLLEGE_PERIOD_YEARS * DAYS_PER_YEAR);
        return { total, remaining: total, percentage: 0 };
    }

    const start = new Date(collegeStart);
    const end = new Date(collegeEnd);
    const now = new Date();

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    if (now < start) {
        // College hasn't started yet
        return { total: totalDays, remaining: totalDays, percentage: 0 };
    } else if (now > end) {
        // College has ended
        return { total: totalDays, remaining: 0, percentage: 100 };
    } else {
        // Currently in college
        const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const remaining = totalDays - elapsed;
        const percentage = Math.round((elapsed / totalDays) * 100);
        return { total: totalDays, remaining, percentage };
    }
}

/**
 * Check if currently in college period
 * @param {Date|string} collegeStart - College start date
 * @param {Date|string} collegeEnd - College end date
 * @returns {boolean} True if currently in college
 */
export function isInCollege(collegeStart, collegeEnd) {
    if (!collegeStart || !collegeEnd) return false;

    const start = new Date(collegeStart);
    const end = new Date(collegeEnd);
    const now = new Date();

    return now >= start && now <= end;
}

/**
 * Get milliseconds until end of day
 * @returns {number} Milliseconds until midnight
 */
export function getMillisecondsUntilEndOfDay() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    return tomorrow - now;
}
