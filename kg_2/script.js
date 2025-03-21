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
        return;
    }

    if (isNaN(x) || isNaN(y))
    {
        alert("x та y повинні бути заповнені!!!");
        return;
    }

    points.push({ x, y });
    //draw();
    console.log(points);

    draw_points();
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

function de_casteljau(t, points) {
    if (points.length === 1) {
        return points[0];
    }

    let new_points = [];
    for (let i = 0; i < points.length - 1; i++)
    {
        let x = (1 - t) * points[i].x + t * points[i + 1].x;
        let y = (1 - t) * points[i].y + t * points[i + 1].y;

        new_points.push({x, y});
    }

    return de_casteljau(t, new_points);
}

function draw_bezier_parametric() {
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

function draw_bezier_recursive() {
    if (points.length < 2) {
        return;
    }

    ctx.strokeStyle = "chocolate";
    ctx.lineWidth = 2;
    ctx.beginPath();

    let start = de_casteljau(0, points);
    ctx.moveTo(start.x + canvas.width / 2, -start.y + canvas.height / 2);

    for (let t = 0.01; t <= 1; t += 0.01) {
        let p = de_casteljau(t, points);
        ctx.lineTo(p.x + canvas.width / 2, -p.y + canvas.height / 2);
    }

    ctx.stroke();
}

function draw() {
    draw_grid();
    
    if (points.length === 0) {
        alert("Потрібно ввести хочаб 1 точку!!!");
    }

    if (document.getElementById("parametric").checked) {
        draw_bezier_parametric();
    }
    else if (document.getElementById("recursive").checked) {
        draw_bezier_recursive();
    }
    else {
        alert("Виберіть спосіб побудови кривої Безье");
        draw_points();
        return;
    }

    draw_points();
}

function draw_points () {
    ctx.fillStyle = "black";
    let firstPoint = points[0];
    ctx.beginPath();
    ctx.arc(firstPoint.x + canvas.width / 2, -firstPoint.y + canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Малюємо останню точку
    let lastPoint = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x + canvas.width / 2, -lastPoint.y + canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    // Для всіх інших точок використаємо інший колір
    ctx.fillStyle = "blue";  // Встановлюємо синій колір для інших точок
    for (let i = 1; i < points.length - 1; i++) {
        let p = points[i];
        ctx.beginPath();
        ctx.arc(p.x + canvas.width / 2, -p.y + canvas.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function clear_grid() {
    points = [];
    draw_grid();
}

function filter_points() {
    let min_y = parseFloat(document.getElementById("min-y").value);
    let max_y = parseFloat(document.getElementById("max-y").value);

    if (isNaN(min_y) || isNaN(max_y)) {
        alert("Будь ласка, введіть коректні значення для діапазону Y.");
        return;
    }

    let filtered_points = points.filter(p => p.y >= min_y * scale && p.y <= max_y * scale);

    // Виведення результату у повідомленні
    if (filtered_points.length === 0) {
        alert("Немає точок в заданому діапазоні.");
    } else {
        let result = `Точки в діапазоні Y (${min_y}, ${max_y}):\n`;
        filtered_points.forEach(p => {
            result += `(${(p.x / scale).toFixed(2)}, ${(p.y / scale).toFixed(2)})\n`;
        });
        alert(result);  // Виведення результату у повідомленні
    }
}


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

draw_grid();