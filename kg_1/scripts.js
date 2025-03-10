let offset_x = 0;
let offset_y = 0;
let scale = 20;
let rombs = [];

let canvas = document.getElementById("romb");
let ctx = canvas.getContext("2d");

function draw_romb() {
    let length = document.getElementById("horizontal_diag_input").value * scale;
    let height = document.getElementById("vertical_diag_input").value * scale;
    let center = document.getElementById("dot_input").value.split(",");
    let romb_col = document.getElementById("romb_color").value;
    let circle_col = document.getElementById("circle_color").value;

    if (center.length !== 2 || isNaN(center[0]) || isNaN(center[1])) {
        alert("Помилка: введіть координати у форматі 'число,число' (наприклад, 1,1)");
    return;
    }

    if (length < 0 || height < 0) {
        alert("Помилка: довжина діагоналей повинна бути додатньою!");
    return;
    }

    let center_x = parseInt(center[0]) * scale;
    let center_y = parseInt(center[1]) * scale;

    let half_length = length / 2;
    let half_height = height / 2;

    //зміщення координатної системи
    center_x += canvas.width / 2 + offset_x;
    center_y = canvas.height / 2 - center_y + offset_y;

    //обмеження ромба
    if (center_x - half_length < canvas.width / 2 ||
        center_x + half_length > canvas.width ||
        center_y - half_height < 0 ||
        center_y + half_height > canvas.height / 2)
    {
        alert("Ромб повинен бути у першій чверті! та не виходити за межі графіка!!!");
        return;
    }
    
    rombs.push({ center_x, center_y, half_length, half_height, romb_col, circle_col });

    redraw();
}


function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_grid();

    for (let romb of rombs) {
        draw_single_romb(romb);
    }
}

function draw_single_romb({ center_x, center_y, half_length, half_height, romb_col, circle_col }) {
    let left_x = center_x - half_length;
    let right_x = center_x + half_length;
    let top_y = center_y - half_height;
    let bottom_y = center_y + half_height;

    //коло
    let radius = (half_length * 2 * half_height * 2) / (2 * Math.sqrt((half_length * 2) ** 2 + (half_height * 2) ** 2));
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = circle_col;
    ctx.fill();
    ctx.closePath();

    //ромб
    ctx.beginPath();
    ctx.moveTo(center_x, top_y);
    ctx.lineTo(right_x, center_y);
    ctx.lineTo(center_x, bottom_y);
    ctx.lineTo(center_x, top_y);
    ctx.lineTo(left_x, center_y);
    ctx.lineTo(right_x, center_y);
    ctx.moveTo(center_x, bottom_y);
    ctx.lineTo(left_x, center_y);
    ctx.closePath();
    ctx.strokeStyle = romb_col;
    ctx.stroke();
}

// сітка
function draw_grid() {
    let half_length = canvas.width / 2;
    let half_height = canvas.height / 2;

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;

    //вертикальні лінії
    for (let x = -half_length; x <= half_length; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x + half_length + offset_x, 0);
        ctx.lineTo(x + half_length + offset_x, canvas.height);
        ctx.stroke();
    }

    //горизонтальні лінії
    for (let y = -half_height; y <= half_height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y + half_height + offset_y);
        ctx.lineTo(canvas.width, y + half_height + offset_y);
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

function clear_romb() {
    rombs = [];
    redraw();
}

draw_grid();