//Function to interpolate between two RGB colors
export function interpolateColor(color1, color2, steps) {
    //Calculating an intermediate value between "start" and "end" value. It interpolate each color component (red, green, blue) separately
    const interpolateComponent = (start, end, step) => start + Math.round((end - start) * step);
    //Converting colors from hexadecimal format to an array of three integers representing the red, green, and blue 
    const rgb1 = color1.match(/\w\w/g).map(hex => parseInt(hex, 16));
    const rgb2 = color2.match(/\w\w/g).map(hex => parseInt(hex, 16));

    const colors = [];
    for (let i = 0; i <= steps ; i++) { //calculating intermediate values for red, green, and blue inside the loop
        const r = interpolateComponent(rgb1[0], rgb2[0], i / steps);
        const g = interpolateComponent(rgb1[1], rgb2[1], i / steps);
        const b = interpolateComponent(rgb1[2], rgb2[2], i / steps);
        colors.push(`rgb(${r},${g},${b})`); //Interpolated RGB values combined into an RGB string
    }
    return colors;
};
