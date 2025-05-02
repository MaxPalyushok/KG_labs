// Main application code

// DOM elements
const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const selectionCanvas = document.getElementById('selectionCanvas');
const ctx = imageCanvas.getContext('2d');
const selectionCtx = selectionCanvas.getContext('2d');
const pixelInfoElement = document.getElementById('pixelInfo');

// Buttons
const convertToCMYKBtn = document.getElementById('convertToCMYK');
const convertToXYZBtn = document.getElementById('convertToXYZ');
const convertToRGBBtn = document.getElementById('convertToRGB');
const compareImagesBtn = document.getElementById('compareImages');
const yellowModifier = document.getElementById('yellowModifier');
const yellowValueDisplay = document.getElementById('yellowValue');
const saturationModifier = document.getElementById('saturationModifier');
const saturationValueDisplay = document.getElementById('saturationValue');
const applyModificationBtn = document.getElementById('applyModification');
const applyToSelectionBtn = document.getElementById('applyToSelection');
const resetSelectionBtn = document.getElementById('resetSelection');
const saveImageBtn = document.getElementById('saveImage');

// Application state
let originalImage = null;
let originalImageData = null;
let currentColorSpace = 'RGB';
let isSelecting = false;
let selectionStart = { x: 0, y: 0 };
let selection = { x: 0, y: 0, width: 0, height: 0 };

// Event listeners
imageInput.addEventListener('change', loadImage);
imageCanvas.addEventListener('click', showPixelInfo);
imageCanvas.addEventListener('mousedown', startSelection);
imageCanvas.addEventListener('mousemove', updateSelection);
imageCanvas.addEventListener('mouseup', endSelection);
convertToCMYKBtn.addEventListener('click', () => convertColorSpace('CMYK'));
convertToXYZBtn.addEventListener('click', () => convertColorSpace('XYZ'));
convertToRGBBtn.addEventListener('click', () => convertColorSpace('RGB'));
compareImagesBtn.addEventListener('click', compareImages);
yellowModifier.addEventListener('input', updateYellowValue);
saturationModifier.addEventListener('input', updateSaturationValue);
applyModificationBtn.addEventListener('click', applyModification);
applyToSelectionBtn.addEventListener('click', applyModificationToSelection);
resetSelectionBtn.addEventListener('click', clearSelection);
saveImageBtn.addEventListener('click', saveImage);

// Load image from file input
function loadImage(e) {
    const file = e.target.files[0];
    if (!file || !file.type.match('image.*')) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Resize canvas to image dimensions
            imageCanvas.width = img.width;
            imageCanvas.height = img.height;
            selectionCanvas.width = img.width;
            selectionCanvas.height = img.height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Store original image data
            originalImage = img;
            originalImageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
            
            // Reset color space
            currentColorSpace = 'RGB';
            
            // Clear selection
            clearSelection();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Show pixel color information
function showPixelInfo(e) {
    if (!originalImageData) return;
    
    // Get pixel coordinates
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (imageCanvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (imageCanvas.height / rect.height));
    
    // Get pixel data
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const r = pixelData[0];
    const g = pixelData[1];
    const b = pixelData[2];
    
    // Convert to different color spaces
    const cmyk = rgbToCMYK(r, g, b);
    const xyz = rgbToXYZ(r, g, b);
    const hsl = rgbToHSL(r, g, b);
    
    // Display pixel information
    pixelInfoElement.innerHTML = `
        <p>Position: (${x}, ${y})</p>
        <p>RGB: (${r}, ${g}, ${b})</p>
        <p>CMYK: (${cmyk.c.toFixed(2)}, ${cmyk.m.toFixed(2)}, ${cmyk.y.toFixed(2)}, ${cmyk.k.toFixed(2)})</p>
        <p>XYZ: (${xyz.x.toFixed(2)}, ${xyz.y.toFixed(2)}, ${xyz.z.toFixed(2)})</p>
        <p>HSL: (${(hsl.h * 360).toFixed(0)}°, ${(hsl.s * 100).toFixed(0)}%, ${(hsl.l * 100).toFixed(0)}%)</p>
    `;
}

// Convert image to the specified color space
function convertColorSpace(targetColorSpace) {
    if (!originalImageData) return;
    
    // If already in the target color space, skip conversion
    if (currentColorSpace === targetColorSpace) return;
    
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const data = imageData.data;
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let newColor;
        
        if (currentColorSpace === 'RGB' && targetColorSpace === 'CMYK') {
            // Convert RGB to CMYK
            const cmyk = rgbToCMYK(r, g, b);
            // Apply a subtle adjustment to make the conversion visible
            cmyk.c = Math.min(1, cmyk.c * 1.05);
            cmyk.m = Math.min(1, cmyk.m * 1.03);
            // Convert back to RGB for display
            newColor = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
        } else if (currentColorSpace === 'RGB' && targetColorSpace === 'XYZ') {
            // Convert RGB to XYZ
            const xyz = rgbToXYZ(r, g, b);
            // Apply a subtle adjustment to make the conversion visible
            xyz.y = Math.min(1, xyz.y * 1.04);
            // Convert back to RGB for display
            newColor = xyzToRGB(xyz.x, xyz.y, xyz.z);
        } else if (currentColorSpace === 'CMYK' && targetColorSpace === 'RGB') {
            // Get CMYK values (calculated from RGB)
            const cmyk = rgbToCMYK(r, g, b);
            // Convert back to RGB with a slight adjustment
            const rgb = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            newColor = {
                r: Math.min(255, rgb.r * 1.02),
                g: Math.min(255, rgb.g * 1.02),
                b: rgb.b
            };
        } else if (currentColorSpace === 'XYZ' && targetColorSpace === 'RGB') {
            // Get XYZ values (calculated from RGB)
            const xyz = rgbToXYZ(r, g, b);
            // Convert back to RGB with a slight adjustment
            const rgb = xyzToRGB(xyz.x, xyz.y, xyz.z);
            newColor = {
                r: Math.min(255, rgb.r * 1.03),
                g: rgb.g,
                b: Math.min(255, rgb.b * 1.01)
            };
        } else if (currentColorSpace === 'CMYK' && targetColorSpace === 'XYZ') {
            // Get CMYK values
            const cmyk = rgbToCMYK(r, g, b);
            // Apply a subtle adjustment
            cmyk.y = Math.min(1, cmyk.y * 1.04);
            // Convert CMYK to XYZ via RGB
            const rgb = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            const xyz = rgbToXYZ(rgb.r, rgb.g, rgb.b);
            // Convert back to RGB for display
            newColor = xyzToRGB(xyz.x, xyz.y, xyz.z);
        } else if (currentColorSpace === 'XYZ' && targetColorSpace === 'CMYK') {
            // Get XYZ values
            const xyz = rgbToXYZ(r, g, b);
            // Apply a subtle adjustment
            xyz.x = Math.min(1, xyz.x * 1.02);
            // Convert XYZ to RGB
            const rgb = xyzToRGB(xyz.x, xyz.y, xyz.z);
            // Convert to CMYK
            const cmyk = rgbToCMYK(rgb.r, rgb.g, rgb.b);
            // Convert back to RGB for display
            newColor = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
        }
        
        // Update pixel data
        data[i] = Math.round(newColor.r);
        data[i + 1] = Math.round(newColor.g);
        data[i + 2] = Math.round(newColor.b);
    }
    
    // Update canvas with converted image
    ctx.putImageData(imageData, 0, 0);
    
    // Update current color space
    currentColorSpace = targetColorSpace;
}

// Compare original and current image for color differences
function compareImages() {
    if (!originalImageData) return;
    
    const currentImageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const originalData = originalImageData.data;
    const currentData = currentImageData.data;
    
    let differentPixels = 0;
    let totalPixels = originalData.length / 4;
    
    // Compare pixel by pixel
    for (let i = 0; i < originalData.length; i += 4) {
        // Check if RGB values differ by more than a small threshold
        if (
            Math.abs(originalData[i] - currentData[i]) > 0 ||
            Math.abs(originalData[i + 1] - currentData[i + 1]) > 0 ||
            Math.abs(originalData[i + 2] - currentData[i + 2]) > 0
        ) {
            differentPixels++;
        }
    }
    
    const percentDifferent = (differentPixels / totalPixels) * 100;
    
    alert(`Image comparison results:
    - Total pixels: ${totalPixels}
    - Different pixels: ${differentPixels}
    - Percentage different: ${percentDifferent.toFixed(2)}%
    
    ${percentDifferent < 1 ? 'The images are visually similar.' : 'The images have noticeable differences.'}`);
}

// Update yellow value display
function updateYellowValue() {
    const value = yellowModifier.value;
    yellowValueDisplay.textContent = `${value}%`;
}

// Update saturation value display
function updateSaturationValue() {
    const value = saturationModifier.value;
    saturationValueDisplay.textContent = `${value}%`;
}

// Apply color modifications to the entire image
function applyModification() {
    if (!originalImageData) return;
    
    const yellowFactor = yellowModifier.value / 100;
    const saturationFactor = saturationModifier.value / 100;
    
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const data = imageData.data;
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Modify colors based on current color space
        if (currentColorSpace === 'RGB' || currentColorSpace === 'XYZ') {
            // Modify RGB directly
            const hsl = rgbToHSL(r, g, b);
            
            // Modify saturation
            hsl.s *= saturationFactor;
            
            // Check if color is yellowish and modify it
            if (r > 150 && g > 150 && b < 100) {
                // Modify yellow components
                const yellow = { r: 255, g: 255, b: 0 };
                const modified = {
                    r: Math.min(255, r * yellowFactor),
                    g: Math.min(255, g * yellowFactor),
                    b: b
                };
                
                data[i] = modified.r;
                data[i + 1] = modified.g;
                data[i + 2] = modified.b;
            } else {
                // Apply saturation modification
                const rgb = hslToRGB(hsl.h, hsl.s, hsl.l);
                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }
        } else if (currentColorSpace === 'CMYK') {
            // Convert to CMYK, modify, then back to RGB
            const cmyk = rgbToCMYK(r, g, b);
            
            // Modify yellow component
            cmyk.y *= yellowFactor;
            
            // Convert back to RGB
            const rgb = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            
            // Apply saturation modification
            const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
            hsl.s *= saturationFactor;
            const finalRgb = hslToRGB(hsl.h, hsl.s, hsl.l);
            
            data[i] = finalRgb.r;
            data[i + 1] = finalRgb.g;
            data[i + 2] = finalRgb.b;
        }
    }
    
    // Update canvas with modified image
    ctx.putImageData(imageData, 0, 0);
}

// Start selection process
function startSelection(e) {
    if (!originalImageData) return;
    
    isSelecting = true;
    
    const rect = imageCanvas.getBoundingClientRect();
    selectionStart.x = Math.floor((e.clientX - rect.left) * (imageCanvas.width / rect.width));
    selectionStart.y = Math.floor((e.clientY - rect.top) * (imageCanvas.height / rect.height));
    
    // Clear previous selection
    selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
}

// Update selection rectangle during mouse move
function updateSelection(e) {
    if (!isSelecting || !originalImageData) return;
    
    const rect = imageCanvas.getBoundingClientRect();
    const currentX = Math.floor((e.clientX - rect.left) * (imageCanvas.width / rect.width));
    const currentY = Math.floor((e.clientY - rect.top) * (imageCanvas.height / rect.height));
    
    // Calculate selection dimensions
    selection.x = Math.min(selectionStart.x, currentX);
    selection.y = Math.min(selectionStart.y, currentY);
    selection.width = Math.abs(currentX - selectionStart.x);
    selection.height = Math.abs(currentY - selectionStart.y);
    
    // Draw selection rectangle
    selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    selectionCtx.strokeStyle = 'red';
    selectionCtx.lineWidth = 2;
    selectionCtx.setLineDash([5, 5]);
    selectionCtx.strokeRect(selection.x, selection.y, selection.width, selection.height);
}

// End selection process
function endSelection() {
    isSelecting = false;
}

// Apply modifications only to the selected area
function applyModificationToSelection() {
    if (!originalImageData || selection.width === 0 || selection.height === 0) return;
    
    const yellowFactor = yellowModifier.value / 100;
    const saturationFactor = saturationModifier.value / 100;
    
    const imageData = ctx.getImageData(
        selection.x, selection.y, selection.width, selection.height
    );
    const data = imageData.data;
    
    // Process each pixel in the selection
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Same modification logic as in applyModification
        if (currentColorSpace === 'RGB' || currentColorSpace === 'XYZ') {
            const hsl = rgbToHSL(r, g, b);
            hsl.s *= saturationFactor;
            
            if (r > 150 && g > 150 && b < 100) {
                const modified = {
                    r: Math.min(255, r * yellowFactor),
                    g: Math.min(255, g * yellowFactor),
                    b: b
                };
                
                data[i] = modified.r;
                data[i + 1] = modified.g;
                data[i + 2] = modified.b;
            } else {
                const rgb = hslToRGB(hsl.h, hsl.s, hsl.l);
                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
            }
        } else if (currentColorSpace === 'CMYK') {
            const cmyk = rgbToCMYK(r, g, b);
            cmyk.y *= yellowFactor;
            
            const rgb = cmykToRGB(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
            const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
            hsl.s *= saturationFactor;
            const finalRgb = hslToRGB(hsl.h, hsl.s, hsl.l);
            
            data[i] = finalRgb.r;
            data[i + 1] = finalRgb.g;
            data[i + 2] = finalRgb.b;
        }
    }
    
    // Update canvas with modified selection
    ctx.putImageData(imageData, selection.x, selection.y);
}

// Clear selection
function clearSelection() {
    selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    selection = { x: 0, y: 0, width: 0, height: 0 };
}

// Save current image to file
function saveImage() {
    if (!originalImageData) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = 'modified_image.png';
    link.href = imageCanvas.toDataURL('image/png');
    
    // Simulate click to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
