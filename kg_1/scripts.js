function draw_romb() {
    let length = document.getElementById('horizontal_diag_input').value * 20;
    let height = document.getElementById('vertical_diag_input').value * 20;
    let center = document.getElementById('dot_input').value.split(',');

    let center_x = parseInt(center[0]) * 20;
    let center_y = parseInt(center[1]) * 20;

    let raw_center_x = parseInt(center[0]);
    let raw_center_y = parseInt(center[1]);

    let canvas = document.getElementById('romb');
    let ctx = canvas.getContext('2d');

    if (center_x === 0 && center_y === 0) {
        center_x = canvas.width / 2;
        center_y = canvas.height / 2;
    } else {
        center_x = canvas.width / 2 + center_x;
        center_y = canvas.height / 2 - center_y;
    }

    if (raw_center_x >= 0 && raw_center_y >= 0 && center_x <= canvas.width && center_y <= canvas.height) {
        let half_length = length / 2;
        let half_height = height / 2;
    
        // Малюємо ромб
        ctx.beginPath();
        ctx.moveTo(center_x, center_y - half_height);
        ctx.lineTo(center_x + half_length, center_y);
        ctx.lineTo(center_x, center_y + half_height);
        ctx.lineTo(center_x - half_length, center_y);
        ctx.strokeStyle = 'blue';
        ctx.closePath();
        ctx.stroke();
    
        // Малюємо коло
        let radius = (length * height) / (2 * Math.sqrt(length ** 2 + height ** 2));
    
        ctx.beginPath();
        ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    } else {
        // Якщо координати не в першій чверті, показуємо попередження
        alert("Координати повинні бути в першій чверті (x > 0 та y > 0).");
    }
    
}
 