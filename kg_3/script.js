let offset_x = 0;
let offset_y = 0;
let scale = 20;

let canvas = document.getElementById("fractal");
let ctx = canvas.getContext("2d");

// Zoom settings
const MIN_SCALE = 5;
const MAX_SCALE = 250;
const ZOOM_SPEED = 1.1;

// Fractal parameters
let FRACTAL_DEPTH = 3;
let currentFractal = null;
let maxIterations = 15;
let escapeRadius = 10;
let cReal = -0.6;
let cImag = 0.4;

function minkowskiCurve(x1, y1, x2, y2, iterations) {
    if (iterations === 0) {
        return [[x1, y1], [x2, y2]];
    }

    const points = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;
    const perpX = -unitY;
    const perpY = unitX;

    const steps = [
        [0.25, 0], [0, -0.25], [0.25, 0], [0, 0.25],
        [0, 0.25], [0.25, 0], [0, -0.25], [0.25, 0]
    ];

    const pathPoints = [[0, 0]];
    let currentX = 0;
    let currentY = 0;

    steps.forEach(step => {
        currentX += step[0];
        currentY += step[1];
        pathPoints.push([currentX, currentY]);
    });

    for (let i = 0; i < pathPoints.length - 1; i++) {
        const startX = x1 + pathPoints[i][0] * length * unitX + pathPoints[i][1] * length * perpX;
        const startY = y1 + pathPoints[i][0] * length * unitY + pathPoints[i][1] * length * perpY;

        const endX = x1 + pathPoints[i+1][0] * length * unitX + pathPoints[i+1][1] * length * perpX;
        const endY = y1 + pathPoints[i+1][0] * length * unitY + pathPoints[i+1][1] * length * perpY;

        const subPoints = minkowskiCurve(startX, startY, endX, endY, iterations - 1);

        if (i < pathPoints.length - 2) {
            points.push(...subPoints.slice(0, -1));
        } else {
            points.push(...subPoints);
        }
    }

    return points;
}

function draw_square() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = scale * 10;
    let centerX = canvas.width / 2 + offset_x - size / 2;
    let centerY = canvas.height / 2 + offset_y - size / 2;

    const topLeft = [centerX, centerY];
    const topRight = [centerX + size, centerY];
    const bottomRight = [centerX + size, centerY + size];
    const bottomLeft = [centerX, centerY + size];

    const topSide = minkowskiCurve(topLeft[0], topLeft[1], topRight[0], topRight[1], FRACTAL_DEPTH);
    const rightSide = minkowskiCurve(topRight[0], topRight[1], bottomRight[0], bottomRight[1], FRACTAL_DEPTH);
    const bottomSide = minkowskiCurve(bottomRight[0], bottomRight[1], bottomLeft[0], bottomLeft[1], FRACTAL_DEPTH);
    const leftSide = minkowskiCurve(bottomLeft[0], bottomLeft[1], topLeft[0], topLeft[1], FRACTAL_DEPTH);

    ctx.beginPath();
    ctx.moveTo(topSide[0][0], topSide[0][1]);

    [...topSide, ...rightSide.slice(1), ...bottomSide.slice(1), ...leftSide.slice(1)].forEach(p => {
        ctx.lineTo(p[0], p[1]);
    });

    ctx.closePath();

    let fill_color = document.getElementById("inside_color").value;
    ctx.fillStyle = fill_color;
    ctx.fill();

    let border_color = document.getElementById("border_color").value;
    ctx.strokeStyle = border_color;
    ctx.stroke();
}

function draw_line() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const length = scale * 10;
    const startX = canvas.width / 2 - length / 2 + offset_x;
    const startY = canvas.height / 2 + offset_y;
    const endX = canvas.width / 2 + length / 2 + offset_x;
    const endY = canvas.height / 2 + offset_y;

    const points = minkowskiCurve(startX, startY, endX, endY, FRACTAL_DEPTH);

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.forEach(p => {
        ctx.lineTo(p[0], p[1]);
    });

    let border_color = document.getElementById("border_color").value;
    ctx.strokeStyle = border_color;
    ctx.stroke();
}

// Complex functions for cotangent fractal
function complexCotangent(real, imag) {
    // Handle the special case where z is close to zero
    if (Math.abs(real) < 1e-8 && Math.abs(imag) < 1e-8) {
        return [1e10, 0]; // Return a large value to simulate the pole
    }
    
    // Use the identity: cot(z) = i * (e^(iz) + e^(-iz)) / (e^(iz) - e^(-iz))
    // cot(z) = i * (e^(2iz) + 1) / (e^(2iz) - 1)
    
    // Calculate 2iz = 2i(x+iy) = -2y + 2ix
    const expTerm = Math.exp(-2 * imag); // e^(-2y)
    
    // Calculate e^(2iz) = e^(-2y) * (cos(2x) + i*sin(2x))
    const exp2izReal = expTerm * Math.cos(2 * real);
    const exp2izImag = expTerm * Math.sin(2 * real);
    
    // Calculate numerator = e^(2iz) + 1
    const numReal = exp2izReal + 1;
    const numImag = exp2izImag;
    
    // Calculate denominator = e^(2iz) - 1
    const denReal = exp2izReal - 1;
    const denImag = exp2izImag;
    
    // Calculate i * numerator / denominator
    const denomSquared = denReal * denReal + denImag * denImag;
    
    // Check for near-zero denominator (singularity)
    if (denomSquared < 1e-10) {
        return [1e6 * (Math.random() - 0.5), 1e6 * (Math.random() - 0.5)]; // Return large random value
    }
    
    // Multiply by i and divide: i * (a+bi)/(c+di) = (-b+ai)/(c+di) = (-bc-ad)/denom² + i(ac-bd)/denom²
    const cotReal = (numImag * denReal - numReal * denImag) / denomSquared;
    const cotImag = (numReal * denReal + numImag * denImag) / denomSquared;
    
    // Check for NaN or Infinity
    if (!isFinite(cotReal) || !isFinite(cotImag)) {
        return [0, 0]; // Return origin for invalid results
    }
    
    return [cotReal, cotImag];
}

function getColor(iterations, maxIterations) {
    if (iterations === maxIterations) {
        return [0, 0, 0]; // Black for points in the set
    } else {
        // Create smooth coloring based on iteration count
        // Using HSL color model converted to RGB
        const hue = (iterations / maxIterations * 360) % 360;
        const saturation = 0.8;
        const lightness = 0.5;
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness - c / 2;
        
        let r, g, b;
        if (hue < 60) {
            [r, g, b] = [c, x, 0];
        } else if (hue < 120) {
            [r, g, b] = [x, c, 0];
        } else if (hue < 180) {
            [r, g, b] = [0, c, x];
        } else if (hue < 240) {
            [r, g, b] = [0, x, c];
        } else if (hue < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    }
}

function draw_cotangent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get parameters from UI
    updateCotangensParameters();
    
    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const pixels = imageData.data;
    
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Map canvas coordinates to complex plane
            const zReal = (x - canvas.width / 2) / (scale * 5) + offset_x / scale;
            const zImag = (y - canvas.height / 2) / (scale * 5) + offset_y / scale;
            
            // Perform fractal iteration
            let iterationCount = 0;
            let currentReal = zReal;
            let currentImag = zImag;
            let sqrMagnitude = 0;
            
            // Check for singularities (poles of cotangent)
            const isOnSingularity = (Math.abs(Math.PI * Math.round(currentReal / Math.PI)) < 0.01) && 
                                   (Math.abs(currentImag) < 0.01);
            
            if (isOnSingularity) {
                // Points on singularities are considered part of the set
                iterationCount = maxIterations;
            } else {
                // Normal iterations
                while (iterationCount < maxIterations && sqrMagnitude < escapeRadius * escapeRadius) {
                    // Get cotangent of z
                    let [cotReal, cotImag] = complexCotangent(currentReal, currentImag);
                    
                    // Calculate ctg²(z)
                    let cotSquaredReal = cotReal * cotReal - cotImag * cotImag;
                    let cotSquaredImag = 2 * cotReal * cotImag;
                    
                    // Add c: ctg²(z) + c
                    currentReal = cotSquaredReal + cReal;
                    currentImag = cotSquaredImag + cImag;
                    
                    // Check for NaN or Infinity
                    if (!isFinite(currentReal) || !isFinite(currentImag)) {
                        break;
                    }
                    
                    sqrMagnitude = currentReal * currentReal + currentImag * currentImag;
                    iterationCount++;
                    
                    // Prevent potential infinite loops from numerical errors
                    if (sqrMagnitude > 1e12) {
                        break;
                    }
                }
            }
            
            // Get color based on iteration count
            const [red, green, blue] = getColor(iterationCount, maxIterations);
            
            // Set pixel color
            const pixelIndex = (y * canvas.width + x) * 4;
            pixels[pixelIndex] = red;       // Red
            pixels[pixelIndex + 1] = green; // Green
            pixels[pixelIndex + 2] = blue;  // Blue
            pixels[pixelIndex + 3] = 255;   // Alpha
        }
    }
    
    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
}

function updateCotangensParameters() {
    // Get iteration value from UI
    const cotIterInput = document.querySelector('input[type="range"][name="cot_size"]');
    maxIterations = parseInt(cotIterInput.value);
    
    // Get C value from UI
    const realCInput = document.querySelector('input[type="range"][name="real_c"]');
    const imgCInput = document.querySelector('input[type="range"][name="img_c"]');
    cReal = parseFloat(realCInput.value);
    cImag = parseFloat(imgCInput.value);
    
    // Get escape radius from UI
    const escapeRadiusInput = document.querySelector('input[type="range"][name="escape_radius"]');
    escapeRadius = parseInt(escapeRadiusInput.value);
}

function drawFractal() {
    if (!currentFractal) {
        alert("Please select a fractal type and click 'Draw fractal'.");
        return;
    }

    switch (currentFractal) {
        case "minkowski_square":
            draw_square();
            break;
        case "minkowski_line":
            draw_line();
            break;
        case "cotangens":
            draw_cotangent();
            break;
        default:
            alert("Unknown fractal type.");
            break;
    }
}

function saveFractalImage() {
    const link = document.createElement('a');
    
    let filename;

    if (currentFractal === "minkowski_square") {
        const iterations = document.querySelector('input[type="range"][name="minkowski_size"]').value;
        filename = `minkowski-square-fractal-iter(${iterations}).png`;
    } else if (currentFractal === "minkowski_line") {
        const iterations = document.querySelector('input[type="range"][name="minkowski_size"]').value;
        filename = `minkowski-line-fractal-iter(${iterations}).png`;
    } else if (currentFractal === "cotangens") {
        const iterations = document.querySelector('input[type="range"][name="cot_size"]').value;
        const real = document.querySelector('input[type="range"][name="real_c"]').value;
        const img = document.querySelector('input[type="range"][name="img_c"]').value;
        filename = `cotangens-fractal-c(${real},${img})-iter(${iterations}).png`;
    } else {
        alert("Unknown fractal type.");
        return;
    }
    
    const dataURL = canvas.toDataURL('image/png');
    
    link.href = dataURL;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Zoom
canvas.addEventListener('wheel', function(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const delta = event.deltaY > 0 ? -1 : 1;
    const newScale = scale * (delta > 0 ? ZOOM_SPEED : 1 / ZOOM_SPEED);

    if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        if (currentFractal === "cotangens") {
            // For cotangent, we want to zoom toward mouse position
            const zoomPoint = {
                x: (mouseX - canvas.width / 2) / (scale * 5) + offset_x / scale,
                y: (mouseY - canvas.height / 2) / (scale * 5) + offset_y / scale
            };
            
            offset_x = (offset_x / scale + zoomPoint.x * (1 - newScale / scale)) * newScale;
            offset_y = (offset_y / scale + zoomPoint.y * (1 - newScale / scale)) * newScale;
        } else {
            // For Minkowski fractals, use original zoom behavior
            offset_x -= (mouseX - canvas.width / 2) * (newScale - scale) / scale;
            offset_y -= (mouseY - canvas.height / 2) * (newScale - scale) / scale;
        }
        
        scale = newScale;
        drawFractal();
    }
});

// Drag to move
let isDragging = false;
let lastX, lastY;

canvas.addEventListener('mousedown', function(event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
});

canvas.addEventListener('mousemove', function(event) {
    if (!isDragging) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    offset_x += deltaX;
    offset_y += deltaY;
    lastX = event.clientX;
    lastY = event.clientY;
    drawFractal();
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

window.onload = function () {
    canvas = document.getElementById("fractal");
    ctx = canvas.getContext("2d");

    // Minkowski iterations slider
    const minkowski_slider = document.getElementById("minkowski_value");
    const iterationInput = document.querySelector('input[type="range"][name="minkowski_size"]');
    iterationInput.addEventListener('input', function () {
        FRACTAL_DEPTH = parseInt(this.value);
        minkowski_slider.textContent = FRACTAL_DEPTH;
        if (currentFractal === "minkowski_line" || currentFractal === "minkowski_square") {
            drawFractal();
        }
    });

    // Cotangent iterations slider
    const cot_slider_iter = document.getElementById("cot_value");
    const cot_iter_input = document.querySelector('input[type="range"][name="cot_size"]');
    cot_iter_input.addEventListener('input', function () {
        cot_slider_iter.textContent = this.value;
        if (currentFractal === "cotangens") {
            drawFractal();
        }
    });

    // C value sliders for cotangent
    const real_c_value = document.getElementById("real_c_value");
    const real_c_input = document.querySelector('input[type="range"][name="real_c"]');
    real_c_input.addEventListener('input', function () {
        real_c_value.textContent = this.value;
        if (currentFractal === "cotangens") {
            drawFractal();
        }
    });

    const img_c_value = document.getElementById("img_c_value");
    const img_c_input = document.querySelector('input[type="range"][name="img_c"]');
    img_c_input.addEventListener('input', function () {
        img_c_value.textContent = this.value;
        if (currentFractal === "cotangens") {
            drawFractal();
        }
    });

    // Escape radius slider
    const escape_radius_value = document.getElementById("escape_radius_value");
    const escape_radius_input = document.querySelector('input[type="range"][name="escape_radius"]');
    escape_radius_input.addEventListener('input', function () {
        escape_radius_value.textContent = this.value;
        if (currentFractal === "cotangens") {
            drawFractal();
        }
    });

    // Draw button
    const drawButton = document.getElementById("draw_button");
    drawButton.addEventListener('click', function () {
        const selectedType = document.querySelector('input[name="fractal_type"]:checked');
        if (!selectedType) {
            alert("Please select a fractal type.");
            return;
        }
        currentFractal = selectedType.value;
        drawFractal();
    });

    // Redraw button
    document.getElementById("redraw_button").addEventListener("click", function() {
        offset_x = 0;
        offset_y = 0;
        scale = 20;
        drawFractal();
    });

    // Save image button
    document.getElementById("save_img").addEventListener("click", saveFractalImage);

    // Radio button listeners
    const radioButtons = document.querySelectorAll('input[name="fractal_type"]');
    radioButtons.forEach(button => {
        button.addEventListener('change', function() {
            // Show/hide appropriate controls when changing fractal type
            const minkowskiControls = document.querySelector(".minkovski_controls");
            const cotangensControls = document.querySelector(".cotangens_controls");
            
            if (this.value === "minkowski_line" || this.value === "minkowski_square") {
                minkowskiControls.style.display = "block";
                cotangensControls.style.display = "none";
            } else if (this.value === "cotangens") {
                minkowskiControls.style.display = "none";
                cotangensControls.style.display = "block";
            }
        });
    });

    // Initialize control visibility based on default selection
    const initialFractalType = document.querySelector('input[name="fractal_type"]:checked').value;
    const minkowskiControls = document.querySelector(".minkovski_controls");
    const cotangensControls = document.querySelector(".cotangens_controls");
    
    if (initialFractalType === "minkowski_line" || initialFractalType === "minkowski_square") {
        minkowskiControls.style.display = "block";
        cotangensControls.style.display = "none";
    } else if (initialFractalType === "cotangens") {
        minkowskiControls.style.display = "none";
        cotangensControls.style.display = "block";
    }
};