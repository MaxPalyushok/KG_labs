// Color space conversion functions

// RGB to CMYK conversion
function rgbToCMYK(r, g, b) {
    // Normalize RGB values
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    
    // Calculate K (black)
    const k = 1 - Math.max(normalizedR, normalizedG, normalizedB);
    
    // Prevent division by zero
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 1 };
    }
    
    // Calculate C, M, Y
    const c = (1 - normalizedR - k) / (1 - k);
    const m = (1 - normalizedG - k) / (1 - k);
    const y = (1 - normalizedB - k) / (1 - k);
    
    return { c, m, y, k };
}

// CMYK to RGB conversion
function cmykToRGB(c, m, y, k) {
    // Calculate RGB values
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    
    return { 
        r: Math.round(r), 
        g: Math.round(g), 
        b: Math.round(b) 
    };
}

// RGB to XYZ conversion
function rgbToXYZ(r, g, b) {
    // Normalize RGB values
    let normalizedR = r/255;
    let normalizedG = g / 255;
    let normalizedB = b / 255;
    
    // Apply gamma correction (sRGB)
    normalizedR = normalizedR > 0.04045 ? Math.pow((normalizedR + 0.055) / 1.055, 2.4) : normalizedR / 12.92;
    normalizedG = normalizedG > 0.04045 ? Math.pow((normalizedG + 0.055) / 1.055, 2.4) : normalizedG / 12.92;
    normalizedB = normalizedB > 0.04045 ? Math.pow((normalizedB + 0.055) / 1.055, 2.4) : normalizedB / 12.92;
    
    // Convert to XYZ using the sRGB matrix
    const x = normalizedR * 0.4124 + normalizedG * 0.3576 + normalizedB * 0.1805;
    const y = normalizedR * 0.2126 + normalizedG * 0.7152 + normalizedB * 0.0722;
    const z = normalizedR * 0.0193 + normalizedG * 0.1192 + normalizedB * 0.9505;
    
    return { x, y, z };
}

// XYZ to RGB conversion
function xyzToRGB(x, y, z) {
    // Convert from XYZ to linear RGB using the inverse sRGB matrix
    let linearR = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let linearG = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let linearB = x * 0.0557 + y * -0.2040 + z * 1.0570;
    
    // Apply gamma correction
    let r = linearR > 0.0031308 ? 1.055 * Math.pow(linearR, 1/2.4) - 0.055 : 12.92 * linearR;
    let g = linearG > 0.0031308 ? 1.055 * Math.pow(linearG, 1/2.4) - 0.055 : 12.92 * linearG;
    let b = linearB > 0.0031308 ? 1.055 * Math.pow(linearB, 1/2.4) - 0.055 : 12.92 * linearB;
    
    // Clamp values to [0, 1] range
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    b = Math.max(0, Math.min(1, b));
    
    // Convert to 8-bit range
    return { 
        r: Math.round(r * 255), 
        g: Math.round(g * 255), 
        b: Math.round(b * 255) 
    };
}

// RGB to HSL conversion (for saturation modification)
function rgbToHSL(r, g, b) {
    // Normalize RGB values
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        // Achromatic (gray)
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return { h, s, l };
}

// HSL to RGB conversion
function hslToRGB(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        // Achromatic (gray)
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return { 
        r: Math.round(r * 255), 
        g: Math.round(g * 255), 
        b: Math.round(b * 255) 
    };
}

// CMYK to XYZ conversion (via RGB)
function cmykToXYZ(c, m, y, k) {
    const rgb = cmykToRGB(c, m, y, k);
    return rgbToXYZ(rgb.r, rgb.g, rgb.b);
}

// XYZ to CMYK conversion (via RGB)
function xyzToCMYK(x, y, z) {
    const rgb = xyzToRGB(x, y, z);
    return rgbToCMYK(rgb.r, rgb.g, rgb.b);
}
