let offset_x = 0;
let offset_y = 0;
let scale = 20;

let canvas = document.getElementById("fractal");
let ctx = canvas.getContext("2d");

// Zoom settings
const MIN_SCALE = 5;
const MAX_SCALE = 1000;
const ZOOM_SPEED = 1.1;

// Початкова глибина
let FRACTAL_DEPTH = 3;

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
    ctx.strokeStyle = "black";
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

    ctx.strokeStyle = "black";
    ctx.stroke();
}


function drawFractal() {
    const selectedType = document.querySelector('input[name="fractal_type"]:checked');
    switch (selectedType?.value) {
        case "minkowski_square":
            draw_square();
            break;
        case "minkowski_line":
            draw_line();
            break;
        case "cotangens":
            alert("не робе котангенс");
            break;
        default:
            alert("Please select a fractal type.");
            break;
    }
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
        offset_x -= (mouseX - canvas.width / 2) * (newScale - scale) / scale;
        offset_y -= (mouseY - canvas.height / 2) * (newScale - scale) / scale;
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

    const iterationInput = document.querySelector('input[type="range"][name="size"]');
    iterationInput.addEventListener('input', function () {
        FRACTAL_DEPTH = parseInt(this.value);
        drawFractal();
    });

    const radioButtons = document.querySelectorAll('input[name="fractal_type"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            drawFractal();
        });
    });

    drawFractal();
};
