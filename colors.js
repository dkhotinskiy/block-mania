import { darkenColor, lightenColor } from './util.js'

/**
 * Blends two hex colors.
 * @param {string} color1 - The first hex color.
 * @param {string} color2 - The second hex color.
 * @returns {string} The blended hex color.
 */
function blendColors(color1, color2) {
    const num1 = parseInt(color1.slice(1), 16)
    const num2 = parseInt(color2.slice(1), 16)
    const R = ((num1 >> 16) + (num2 >> 16)) >> 1
    const G = ((num1 >> 8 & 0x00FF) + (num2 >> 8 & 0x00FF)) >> 1
    const B = ((num1 & 0x0000FF) + (num2 & 0x0000FF)) >> 1
    return `#${
        (0x1000000 + R * 0x10000 + G * 0x100 + B)
        .toString(16).slice(1).toUpperCase()
    }`
}

const colors = [
    { main: '#e5bf00', hint: blendColors(darkenColor('#e5bf00', 90), lightenColor('#e5bf00', 32.5)) },
    { main: '#ff5733', hint: blendColors(darkenColor('#ff5733', 90), lightenColor('#ff5733', 32.5)) },
    { main: '#33ff57', hint: blendColors(darkenColor('#33ff57', 90), lightenColor('#33ff57', 32.5)) },
    { main: '#ff33a1', hint: blendColors(darkenColor('#ff33a1', 90), lightenColor('#ff33a1', 32.5)) },
    { main: '#33fff5', hint: blendColors(darkenColor('#33fff5', 90), lightenColor('#33fff5', 32.5)) },
    { main: '#a133ff', hint: blendColors(darkenColor('#a133ff', 90), lightenColor('#a133ff', 32.5)) },
    { main: '#ff8c33', hint: blendColors(darkenColor('#ff8c33', 90), lightenColor('#ff8c33', 32.5)) }
]

export default colors