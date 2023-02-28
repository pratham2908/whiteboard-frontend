const socket = io("https://whiteboard-server.onrender.com");
socket.on("connect", () => {
    console.log("connected");
});
socket.on("newData", ({ prevX, prevY, x, y, color, width }) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y);
    ctx.stroke();
});


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const cursor = document.querySelector('#cursor');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight - 100;
let time = performance.now();

let interval = 0;
let colorInterval = 0;
let prevX = 0;
let prevY = 0;
let x = 0;
let y = 0;
let elapsed = performance.now();


const data = { color: "#000", width: 1 };
const colors = document.querySelectorAll(".colors .color");
const sizes = document.querySelectorAll(".sizes .size");
const eraser = document.querySelector("#eraser");
const shapes = document.querySelectorAll(".shapes .shape");



window.addEventListener('mousemove', (e) => {
    if (performance.now() - time < 10) return;
    prevX = x;
    prevY = y;
    x = e.offsetX;
    y = e.offsetY;
    time = performance.now();
})

canvas.addEventListener('mousedown', () => {
    if (Array.from(shapes).some(shape => shape.classList.contains("active"))) return;
    interval = setInterval(() => drawLine(), 10);
})

canvas.addEventListener('mouseup', () => {
    if (Array.from(shapes).some(shape => shape.classList.contains("active"))) return;
    clearInterval(interval);
})

canvas.addEventListener("mouseleave", () => {
    clearInterval(interval);
})


function drawLine() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("newData", { prevX, prevY, x, y, color: data.color, width: data.width });
}


colors.forEach((color, index) => {
    color.addEventListener("click", () => {
        clearInterval(colorInterval);
        colors.forEach(color => color.classList.remove("active"));
        color.classList.add("active");
        eraser.classList.remove("active");
        if (index == colors.length - 1) {
            changeContinuous();
        } else {
            data.color = getComputedStyle(color).getPropertyValue("--color");
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
        }
    })
})

sizes.forEach(size => {
    size.addEventListener("click", () => {
        sizes.forEach(size => size.classList.remove("active"));
        size.classList.add("active");
        eraser.classList.remove("active");
        data.width = getComputedStyle(size).getPropertyValue("--width");
        ctx.lineWidth = data.width;
        ctx.strokeStyle = data.color;
    })
})

function changeContinuous() {
    colorInterval = setInterval(() => {
        ctx.strokeStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    }, 300);
}

const clearScreenBtn = document.querySelector("#clearScreen");
clearScreenBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, width, height);
});

eraser.addEventListener("click", () => {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 20;
    data.color = "#fff";
    data.width = 20;
    eraser.classList.add("active");
    sizes.forEach(size => size.classList.remove("active"));
    colors.forEach(color => color.classList.remove("active"));
    shapes.forEach(shape => shape.classList.remove("active"));
    clearInterval(colorInterval);
})


const triangle = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];

shapes.forEach(shape => {
    shape.addEventListener("click", () => {
        shapes.forEach(shape => shape.classList.remove("active"));
        shape.classList.add("active");
        eraser.classList.remove("active");
        sizes.forEach(size => size.classList.remove("active"));
        colors.forEach(color => color.classList.remove("active"));
        clearInterval(colorInterval);

        canvas.addEventListener("mousedown", (e) => {
            triangle[0].x = e.offsetX;
            triangle[1].y = e.offsetY;

            canvas.addEventListener("mousemove", drawShape)

            canvas.addEventListener("mouseup", () => {
                canvas.removeEventListener("mousemove", drawShape);
                canvas.removeEventListener("mouseup", () => { });
                drawTriangle();

            })
        })
    })
})

function drawShape(e) {
    triangle[0].y = e.offsetY;
    triangle[2].x = e.offsetX;
    triangle[2].y = e.offsetY;
    triangle[1].x = (triangle[0].x + triangle[2].x) / 2;
}


function drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.lineTo(triangle[0].x, triangle[0].y);
    ctx.stroke();
}







