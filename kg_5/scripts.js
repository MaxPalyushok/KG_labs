document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('coordinateCanvas');
    const ctx = canvas.getContext('2d');
    
    // Buttons
    const drawBtn = document.getElementById('draw-btn');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const saveMatrixBtn = document.getElementById('save-matrix-btn');
    const saveImageBtn = document.getElementById('save-image-btn');
    const resetBtn = document.getElementById('reset-btn');
    const continueBtn = document.getElementById('continue-btn');
    const saveInitialBtn = document.getElementById('save-initial-btn');
    
    // Inputs
    const x1Input = document.getElementById('x1');
    const y1Input = document.getElementById('y1');
    const x2Input = document.getElementById('x2');
    const y2Input = document.getElementById('y2');
    const heightInput = document.getElementById('height');
    const aInput = document.getElementById('A');
    const bInput = document.getElementById('B');
    const cInput = document.getElementById('C');
    const shiftXInput = document.getElementById('shift-x');
    const shiftYInput = document.getElementById('shift-y');
    const unitLengthInput = document.getElementById('unit-length');
    const unitLengthValue = document.getElementById('unit-length-value');
    
    let triangle = null;
    let originalTriangle = null;
    let animationId = null;
    let transformationMatrix = null;
    let reflectedTriangle = null; // Store the initial reflected triangle
    
    // Variables to track total shift
    let totalDx = 0;
    let totalDy = 0;
    // Step size for each animation frame - smaller step for larger values
    const SHIFT_STEP = 0.05;
    
    // Canvas center coordinates
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw coordinate system
    function drawCoordinateSystem() {
        const unitLength = parseInt(unitLengthInput.value) || 50;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw axes
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        
        // Y-axis
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvas.height);
        
        // Arrowheads
        ctx.moveTo(canvas.width - 10, centerY - 5);
        ctx.lineTo(canvas.width, centerY);
        ctx.lineTo(canvas.width - 10, centerY + 5);
        
        ctx.moveTo(centerX - 5, 10);
        ctx.lineTo(centerX, 0);
        ctx.lineTo(centerX + 5, 10);
        
        ctx.stroke();
        
        // Draw axis labels
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText('X', canvas.width - 15, centerY - 10);
        ctx.fillText('Y', centerX + 10, 15);
        ctx.fillText('O', centerX - 15, centerY + 15);
        
        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = centerX % unitLength; x < canvas.width; x += unitLength) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // Add x-coordinate labels
            const xCoord = Math.round((x - centerX) / unitLength);
            if (xCoord !== 0) {
                ctx.fillText(xCoord, x - 5, centerY + 15);
            }
        }
        
        // Horizontal grid lines
        for (let y = centerY % unitLength; y < canvas.height; y += unitLength) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
            
            // Add y-coordinate labels
            const yCoord = -Math.round((y - centerY) / unitLength);
            if (yCoord !== 0) {
                ctx.fillText(yCoord, centerX + 5, y + 4);
            }
        }
    }
    
    // Convert canvas coordinates to mathematical coordinates
    function canvasToMath(x, y) {
        const unitLength = parseInt(unitLengthInput.value) || 50;
        return {
            x: (x - centerX) / unitLength,
            y: (centerY - y) / unitLength
        };
    }
    
    // Convert mathematical coordinates to canvas coordinates
    function mathToCanvas(x, y) {
        const unitLength = parseInt(unitLengthInput.value) || 50;
        return {
            x: centerX + x * unitLength,
            y: centerY - y * unitLength
        };
    }
    
    // Draw triangle
    function drawTriangle(trianglePoints, color = '#0000FF') {
        if (!trianglePoints) return;
        
        ctx.beginPath();
        const unitLength = parseInt(unitLengthInput.value) || 50;
        
        const start = mathToCanvas(trianglePoints[0].x, trianglePoints[0].y);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < trianglePoints.length; i++) {
            const point = mathToCanvas(trianglePoints[i].x, trianglePoints[i].y);
            ctx.lineTo(point.x, point.y);
        }
        
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = color + '33'; // Add transparency
        ctx.fill();
        
        // Draw reflection line if available
        if (aInput.value && bInput.value) {
            drawLine(parseFloat(aInput.value), parseFloat(bInput.value), parseFloat(cInput.value), '#FF0000');
        }
    }
    
    // Draw line from equation Ax + By + C = 0
    function drawLine(A, B, C, color = '#FF0000') {
        if (A === 0 && B === 0) return;
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        // Draw line equation text
        ctx.fillStyle = color;
        ctx.font = '14px Arial';
        ctx.fillText(`${A}x + ${B}y + ${C} = 0`, 10, 20);
        
        if (B === 0) {
            // Vertical line
            const x = -C / A;
            const canvasX = mathToCanvas(x, 0).x;
            ctx.moveTo(canvasX, 0);
            ctx.lineTo(canvasX, canvas.height);
        } else {
            // Non-vertical line
            
            // Calculate y for various x values across the canvas
            // We'll use more points to ensure the line is drawn correctly
            const width = canvas.width;
            const height = canvas.height;
            
            // Calculate points in math coordinates
            const mathPoints = [];
            
            // Use more points for better accuracy
            for (let canvasX = 0; canvasX <= width; canvasX += width / 4) {
                const mathX = canvasToMath(canvasX, 0).x;
                const mathY = (-A * mathX - C) / B;
                mathPoints.push({ x: mathX, y: mathY });
            }
            
            // Convert back to canvas coordinates and draw
            ctx.moveTo(mathToCanvas(mathPoints[0].x, mathPoints[0].y).x, 
                       mathToCanvas(mathPoints[0].x, mathPoints[0].y).y);
            
            for (let i = 1; i < mathPoints.length; i++) {
                const canvasPoint = mathToCanvas(mathPoints[i].x, mathPoints[i].y);
                ctx.lineTo(canvasPoint.x, canvasPoint.y);
            }
        }
        
        ctx.stroke();
    }
    
    // Validate the triangle input
    function validateTriangleInput() {
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);
        const height = parseFloat(heightInput.value);
        
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(height)) {
            alert("Будь ласка, введіть всі координати та висоту.");
            return false;
        }
        
        if (height <= 0) {
            alert("Висота має бути більше 0.");
            return false;
        }
        
        if (x1 === x2 && y1 === y2) {
            alert("Вершини основи не можуть співпадати.");
            return false;
        }
        
        return true;
    }
    
    // Calculate the third vertex of the isosceles triangle
    function calculateThirdVertex(x1, y1, x2, y2, height) {
        // Calculate the midpoint of the base
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Calculate the direction vector perpendicular to the base
        const dirX = -(y2 - y1);
        const dirY = x2 - x1;
        
        // Normalize the direction vector
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        const normDirX = dirX / length;
        const normDirY = dirY / length;
        
        // Calculate the third vertex
        const x3 = midX + normDirX * height;
        const y3 = midY + normDirY * height;
        
        return { x: x3, y: y3 };
    }
    
    // Create isosceles triangle from inputs
    function createTriangle() {
        if (!validateTriangleInput()) return null;
        
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);
        const height = parseFloat(heightInput.value);
        
        const vertex3 = calculateThirdVertex(x1, y1, x2, y2, height);
        
        return [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: vertex3.x, y: vertex3.y }
        ];
    }
    
    // Reflect triangle (only once)
    function reflectTriangle() {
        if (!triangle) return null;
        
        const A = parseFloat(aInput.value) || 0;
        const B = parseFloat(bInput.value) || 0;
        const C = parseFloat(cInput.value) || 0;
        
        if (A === 0 && B === 0) {
            alert("Коефіцієнти A і B не можуть обидва дорівнювати 0.");
            return null;
        }
        
        try {
            // Create reflection matrix
            const reflectionMatrix = Matrix.reflection(A, B, C);
            
            // Apply reflection to each vertex of the triangle
            const reflectedTriangle = [];
            
            for (const vertex of originalTriangle) {
                const homogeneousVertex = Matrix.pointToHomogeneous(vertex.x, vertex.y);
                const transformedVertex = Matrix.multiply(reflectionMatrix, homogeneousVertex);
                const result = Matrix.homogeneousToPoint(transformedVertex);
                
                reflectedTriangle.push(result);
            }
            
            return reflectedTriangle;
        } catch (error) {
            alert("Помилка при обчисленні відображення: " + error.message);
            return null;
        }
    }
    
    // Apply shift to triangle (for animation)
    function shiftTriangle(triangleToShift) {
        if (!triangleToShift) return null;
        
        // Get target shift values from inputs
        const targetDx = parseFloat(shiftXInput.value) || 0;
        const targetDy = parseFloat(shiftYInput.value) || 0;
        
        // Calculate step for this frame (use the smaller of SHIFT_STEP or remaining distance)
        let stepX = Math.sign(targetDx) * Math.min(SHIFT_STEP, Math.abs(targetDx - totalDx));
        let stepY = Math.sign(targetDy) * Math.min(SHIFT_STEP, Math.abs(targetDy - totalDy));
        
        // Update total shift
        totalDx += stepX;
        totalDy += stepY;
        
        // Check if we've reached the target shift (with small epsilon for floating point comparison)
        const epsilon = 0.0001;
        const reachedTarget = (Math.abs(totalDx - targetDx) < epsilon && 
                               Math.abs(totalDy - targetDy) < epsilon);
        
        // Apply shift to each vertex
        const shiftedTriangle = [];
        for (const vertex of reflectedTriangle) {
            shiftedTriangle.push({
                x: vertex.x + totalDx,
                y: vertex.y + totalDy
            });
        }
        
        // If we've reached the target, mark it for the animation to know
        if (reachedTarget) {
            setTimeout(() => {
                // Stop animation when target is reached
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                    stopBtn.disabled = true;
                    startBtn.disabled = false;
                    
                    // Show a message that animation is complete
                    alert("Анімацію завершено: досягнуто заданих значень зсуву.");
                }
            }, 100); // Small delay before stopping
        }
        
        return shiftedTriangle;
    }
    
    // Animation function - modified for better shift animation
    function animate() {
        if (!animationId) return; // Stop if animation was canceled
        
        // Shift the triangle
        const shiftedTriangle = shiftTriangle(triangle);
        
        if (shiftedTriangle) {
            drawCoordinateSystem();
            drawTriangle(originalTriangle, '#0000FF'); // Original in blue
            drawTriangle(reflectedTriangle, '#00FF00'); // Reflected in green
            drawTriangle(shiftedTriangle, '#FF0000'); // Shifted in red
            
            // Update the current triangle position for display purposes
            triangle = shiftedTriangle;
            
            // Request the next frame
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Save matrix to a file - corrected to save accurate transformation
    function saveMatrixToFile() {
        if (!reflectedTriangle) {
            alert("Спочатку почніть рух, щоб створити матрицю трансформації.");
            return;
        }
        
        const A = parseFloat(aInput.value) || 0;
        const B = parseFloat(bInput.value) || 0;
        const C = parseFloat(cInput.value) || 0;
        
        // Use the current shift amount
        const dx = totalDx;
        const dy = totalDy;
        
        // Create the individual matrices
        const reflectionMatrix = Matrix.reflection(A, B, C);
        const translationMatrix = Matrix.translation(dx, dy);
        
        // Combine transformations: first reflect, then translate
        const fullTransformMatrix = Matrix.multiply(translationMatrix, reflectionMatrix);
        
        // Add information about what this matrix represents along with the original points
        const matrixData = {
            matrix: fullTransformMatrix,
            info: {
                reflectionLine: `${A}x + ${B}y + ${C} = 0`,
                currentShift: { x: dx, y: dy },
                targetShift: { 
                    x: parseFloat(shiftXInput.value) || 0, 
                    y: parseFloat(shiftYInput.value) || 0 
                }
            },
            originalTriangle: originalTriangle,
            reflectedTriangle: reflectedTriangle,
            currentTriangle: triangle
        };
        
        const content = JSON.stringify(matrixData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transformation_matrix.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Save image to a file
    function saveImageToFile() {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'triangle_image.png';
        a.click();
    }
    
    // Save initial triangle image to a file
    function saveInitialImage() {
        // Make sure we have an original triangle
        if (!originalTriangle) {
            alert("Спочатку намалюйте трикутник.");
            return;
        }
        
        // Temporarily clear the canvas and only draw the original triangle
        // with coordinate system
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCoordinateSystem();
        drawTriangle(originalTriangle, '#0000FF');
        
        // Save the image
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'initial_triangle.png';
        a.click();
        
        // Redraw everything after saving
        setTimeout(() => {
            redrawAll();
        }, 100);
    }
    
    // Update the unit length value display and redraw with correct scaling
    function updateUnitLengthDisplay() {
        unitLengthValue.textContent = unitLengthInput.value;
        
        // Redraw the coordinate system and all triangles
        redrawAll();
    }
    
    // Redraw everything with current scale
    function redrawAll() {
        drawCoordinateSystem();
        
        // Draw original triangle if it exists
        if (originalTriangle) {
            drawTriangle(originalTriangle, '#0000FF');
        }
        
        // Draw reflected triangle if it exists
        if (reflectedTriangle) {
            drawTriangle(reflectedTriangle, '#00FF00');
        }
        
        // Draw current animated triangle if it's different from the reflected triangle
        if (triangle && triangle !== originalTriangle && triangle !== reflectedTriangle) {
            drawTriangle(triangle, '#FF0000');
        }
    }
    
    // Reset animation to initial state
    function resetAnimation() {
        // Stop any ongoing animation
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Reset shift values
        totalDx = 0;
        totalDy = 0;
        
        // Reset to original triangle
        if (originalTriangle) {
            triangle = JSON.parse(JSON.stringify(originalTriangle));
            drawCoordinateSystem();
            drawTriangle(triangle);
            
            // Reset reflected triangle
            reflectedTriangle = null;
        }
        
        // Reset buttons
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
    
    // Continue animation instead of resetting it
    function continueAnimation() {
        // Only do something if animation is stopped but we have a reflected triangle
        if (!animationId && reflectedTriangle) {
            // No need to reset shift values or recalculate reflection
            
            // Start the animation from the current point
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Set a brief timeout to ensure UI updates
            setTimeout(() => {
                animationId = requestAnimationFrame(animate);
            }, 50);
        } else if (!reflectedTriangle) {
            alert("Спочатку почніть рух, щоб мати можливість продовжити анімацію.");
        }
    }
    
    // Event listeners
    drawBtn.addEventListener('click', function() {
        triangle = createTriangle();
        
        if (triangle) {
            originalTriangle = [...triangle]; // Clone the triangle
            drawCoordinateSystem();
            drawTriangle(triangle);
        }
    });
    
    startBtn.addEventListener('click', function() {
        if (!triangle) {
            alert("Спочатку намалюйте трикутник.");
            return;
        }
        
        if (!aInput.value || !bInput.value) {
            alert("Введіть коефіцієнти прямої Ax+By+C=0.");
            return;
        }
        
        // Reset accumulated shift when starting new animation
        totalDx = 0;
        totalDy = 0;
        
        // First reflect the triangle
        reflectedTriangle = reflectTriangle();
        if (reflectedTriangle) {
            // Draw the original and reflected triangles
            drawCoordinateSystem();
            drawTriangle(originalTriangle, '#0000FF'); // Original in blue
            drawTriangle(reflectedTriangle, '#00FF00'); // Reflected in green
            
            // Set the reflected triangle as the starting point for the animation
            triangle = JSON.parse(JSON.stringify(reflectedTriangle)); // Deep clone
            
            // Start the animation (shifting)
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Clear any existing animation
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Set a brief timeout to ensure UI updates
            setTimeout(() => {
                animationId = requestAnimationFrame(animate);
            }, 50);
        }
    });
    
    stopBtn.addEventListener('click', function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null; // Important to set this to null
        }
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
    
    saveMatrixBtn.addEventListener('click', saveMatrixToFile);
    saveImageBtn.addEventListener('click', saveImageToFile);
    saveInitialBtn.addEventListener('click', saveInitialImage);
    
    continueBtn.addEventListener('click', continueAnimation);
    
    unitLengthInput.addEventListener('input', function() {
        updateUnitLengthDisplay();
    });
    
    // Initial drawing of coordinate system
    drawCoordinateSystem();
    updateUnitLengthDisplay();
    
    // Automatically draw triangle with default values on page load
    setTimeout(function() {
        triangle = createTriangle();
        if (triangle) {
            originalTriangle = JSON.parse(JSON.stringify(triangle)); // Deep clone the triangle
            drawTriangle(triangle);
        }
    }, 500);
});
