/**
 * Darkens a hex color by a given percentage.
 * @param {string} color - The hex color to darken.
 * @param {number} percent - The percentage to darken the color.
 * @returns {string} The darkened hex color.
 */
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) - amt
    const G = (num >> 8 & 0x00FF) - amt
    const B = (num & 0x0000FF) - amt
    return `#${
        (
            0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
            (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
            (B < 0 ? 0 : B > 255 ? 255 : B)
        ).toString(16).slice(1).toUpperCase()
    }`
}

/**
 * Lightens a hex color by a given percentage.
 * @param {string} color - The hex color to lighten.
 * @param {number} percent - The percentage to lighten the color.
 * @returns {string} The lightened hex color.
 */
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return `#${
        (
            0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 +
            (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 +
            (B < 0 ? 0 : B > 255 ? 255 : B)
        ).toString(16).slice(1).toUpperCase()
    }`
}

export { darkenColor, lightenColor }