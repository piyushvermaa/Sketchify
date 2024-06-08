const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const toolBtns = document.querySelectorAll('.tool');
const fillColor = document.querySelector('#fill-color');
const sizeSlider = document.querySelector('#penSize');
const colorPicker = document.querySelector('#penColor');
const bgColorPicker = document.querySelector('#bgColor');
const clearCanvas = document.querySelector('.clear-canvas');
const saveImg = document.querySelector('.save-img');
const changeBgButton = document.querySelector('.change-bg');

let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = 'brush',
    brushWidth = 5,
    selectedColor = '#000',
    bgColor = '#ffffff';

const setCanvasBackground = () => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}

window.addEventListener('load', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawShape = (e, shape) => {
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = fillColor.checked ? selectedColor : 'transparent';

    switch (shape) {
        case 'rectangle':
            ctx.rect(prevMouseX, prevMouseY, e.offsetX - prevMouseX, e.offsetY - prevMouseY);
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
            ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
            break;
        case 'ellipse':
            const ellipseX = (prevMouseX + e.offsetX) / 2;
            const ellipseY = (prevMouseY + e.offsetY) / 2;
            const ellipseRadiusX = Math.abs(e.offsetX - prevMouseX) / 2;
            const ellipseRadiusY = Math.abs(e.offsetY - prevMouseY) / 2;
            ctx.ellipse(ellipseX, ellipseY, ellipseRadiusX, ellipseRadiusY, 0, 0, 2 * Math.PI);
            break;
        case 'triangle':
            ctx.moveTo(prevMouseX + (e.offsetX - prevMouseX) / 2, prevMouseY);
            ctx.lineTo(prevMouseX, e.offsetY);
            ctx.lineTo(e.offsetX, e.offsetY);
            break;
        case 'line':
            ctx.moveTo(prevMouseX, prevMouseY);
            ctx.lineTo(e.offsetX, e.offsetY);
            break;
        case 'arrow':
            const angle = Math.atan2(e.offsetY - prevMouseY, e.offsetX - prevMouseX);
            const headLength = 15;
            ctx.moveTo(prevMouseX, prevMouseY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.lineTo(e.offsetX - headLength * Math.cos(angle - Math.PI / 6), e.offsetY - headLength * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(e.offsetX, e.offsetY);
            ctx.lineTo(e.offsetX - headLength * Math.cos(angle + Math.PI / 6), e.offsetY - headLength * Math.sin(angle + Math.PI / 6));
            break;
    }

    ctx.closePath();
    ctx.stroke();
    if (fillColor.checked) ctx.fill();
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if (!isDrawing) return;
    ctx.globalCompositeOperation = selectedTool === 'eraser' ? 'source-over' : 'source-over'; // No change to globalCompositeOperation
    switch (selectedTool) {
        case 'brush':
        case 'eraser':
            ctx.strokeStyle = selectedTool == 'eraser' ? bgColor : selectedColor;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            break;
        case 'rectangle':
        case 'circle':
        case 'ellipse':
        case 'triangle':
        case 'line':
        case 'arrow':
            drawShape(e, selectedTool);
            break;
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toolBtns.forEach(tool => tool.classList.remove('active'));
        btn.classList.add('active');
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener('input', () => brushWidth = sizeSlider.value);

colorPicker.addEventListener('change', () => {
    selectedColor = colorPicker.value;
    document.querySelector('.option.tool.active').style.color = selectedColor;
});

clearCanvas.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});

saveImg.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `sketchify-${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

changeBgButton.addEventListener('click', () => {
    bgColor = bgColorPicker.value;
    setCanvasBackground();
});

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false); // To stop drawing when mouse leaves canvas
