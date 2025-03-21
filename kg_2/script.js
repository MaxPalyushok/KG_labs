let points = [];
let selected_point = null;

let offset_x = 0;
let offset_y = 0;
let scale = 20;

let canvas = document.getElementById("bezier");
let ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", on_mouse_down);
canvas.addEventListener("mousemove", on_mouse_move);
canvas.addEventListener("mouseup", on_mouse_up);


function draw_grid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let half_length = canvas.width / 2;
    let half_height = canvas.height / 2;

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;

    for (let x = -half_length; x <= half_length; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x + half_length, 0);
        ctx.lineTo(x + half_length, canvas.height);
        ctx.stroke();
    }

    for (let y = -half_height; y <= half_height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y + half_height);
        ctx.lineTo(canvas.width, y + half_height);
        ctx.stroke();
    }

    //осі X та Y
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    //вісь X
    ctx.beginPath();
    ctx.moveTo(0, half_height + offset_y);
    ctx.lineTo(canvas.width, half_height + offset_y);
    ctx.stroke();

    //вісь Y
    ctx.beginPath();
    ctx.moveTo(half_length + offset_x, 0);
    ctx.lineTo(half_length + offset_x, canvas.height);
    ctx.stroke();

    //мітки на осях
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

     //мітки на X
    for (let x = -half_length; x <= half_length; x += scale) {
        let labelX = (x / scale).toFixed(0);
        let posX = x + half_length + offset_x;

        if (posX >= 0 && posX <= canvas.width) {
            ctx.fillText(labelX, posX, half_height + offset_y - 5);
        }
    }

    //мітки Y
    for (let y = -half_height; y <= half_height; y += scale) {
        let labelY = (-y / scale).toFixed(0);
        let posY = y + half_height + offset_y;

        if (posY >= 0 && posY <= canvas.height) {
            ctx.fillText(labelY, half_length + offset_x + 15, posY);
        }
    }
}

function add() {
    let x = parseFloat(document.getElementById("input-x").value) * scale;
    let y = parseFloat(document.getElementById("input-y").value) * scale;

    if (Math.abs(x) > 15 * scale || Math.abs(y) > 15 * scale) {
        alert("Точки не повинні виходити за координатну площину!");
        console.log("Недопустимі координати:", x, y);
        return;
    }

    points.push({ x, y });
    draw();
    console.log(points);
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function binomial_coefficient(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function bezier_point(t, points) {
    let n = points.length - 1;
    let x = 0, y = 0;
    for (let i = 0; i <= n; i++) {
        let coef = binomial_coefficient(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
        x += coef * points[i].x;
        y += coef * points[i].y;
    }
    return { x: x + canvas.width / 2, y: -y + canvas.height / 2 };
}

function draw_bezier() {
    if (points.length < 2) return;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let start = bezier_point(0, points);
    ctx.moveTo(start.x, start.y);

    for (let t = 0.01; t <= 1; t += 0.01) {
        let p = bezier_point(t, points);
        ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
}

function draw() {
    draw_grid();
    ctx.fillStyle = "blue";
    for (let p of points) {
        ctx.beginPath();
        ctx.arc(p.x + canvas.width / 2, -p.y + canvas.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    draw_bezier();
}

function clear_grid() {
    points = [];
    draw_grid();
}

draw_grid();

function on_mouse_down(event) {
    let mouseX = event.offsetX - canvas.width / 2;
    let mouseY = -(event.offsetY - canvas.height / 2);
    
    for (let p of points) {
        let dx = mouseX - p.x;
        let dy = mouseY - p.y;
        if (dx * dx + dy * dy < 25) { 
            selected_point = p;
            break;
        }
    }
}

function on_mouse_move(event) {
    if (!selected_point) return;
    selected_point.x = event.offsetX - canvas.width / 2;
    selected_point.y = -(event.offsetY - canvas.height / 2);
    draw();
}

function on_mouse_up() {
    selected_point = null;
}