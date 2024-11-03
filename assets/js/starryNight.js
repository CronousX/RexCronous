const canvas2D = document.getElementById('cometNight');
const ctx2D = canvas2D.getContext('2d');

const canvasWebGL = document.getElementById('starryNight');
const gl = canvasWebGL.getContext('webgl');

const stars = [];
let starsCount = 816;
const comets = [];
let lastTime = 0;

function resizeCanvas() {
    canvas2D.width = window.innerWidth;
    canvas2D.height = window.innerHeight;
    canvasWebGL.width = window.innerWidth;
    canvasWebGL.height = window.innerHeight;

    starsCount = Math.floor((816 * 0.15) + (canvas2D.width + canvas2D.height) * 0.2 - 35*(1080/canvas2D.width));
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    stars.length = 0;
    initStars();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const cometCooldown = 30000;
let lastCometTime = 0;
const meteorShowerCooldown = 300000;
let lastMeteorShowerTime = Date.now();

const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    varying float v_size;
    varying float v_alpha; // Pass alpha to the fragment shader
    void main() {
        gl_Position = vec4(a_position, 0, 1);
        gl_PointSize = a_size;
        v_alpha = a_size; // Use size as a proxy for alpha
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying float v_alpha;
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha); // White color for stars with alpha
    }
`;

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
}

function createProgram() {
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
}

const program = createProgram();

function Star(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = Math.random();
}

function initStars() {
    for (let i = 0; i < starsCount; i++) {
        const x = Math.random() * canvasWebGL.width;
        const y = Math.random() * canvasWebGL.height;
        const radius = Math.random() * 2.5;
        stars.push(new Star(x, y, radius));
    }
}

function drawStars() {
    for (const star of stars) {
        star.alpha = Math.abs(Math.sin(Date.now() / 5000 + star.x));
    }

    const positions = new Float32Array(stars.map(star => [
        (star.x / canvasWebGL.width) * 2 - 1,
        (star.y / canvasWebGL.height) * -2 + 1
    ]).flat());

    const sizes = new Float32Array(stars.map(star => star.radius * star.alpha));

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const sizeLocation = gl.getAttribLocation(program, "a_size");

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(sizeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, stars.length);
}

function Comet(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = 0;
    this.speed = 60;
    this.fadeInDuration = 250;
    this.startTime = Date.now();

    this.direction = {
        dx: 20,
        dy: 8
    };
}

Comet.prototype.draw = function() {
    const angle = Math.atan2(this.direction.dy, this.direction.dx);
    const cometTailX = this.x - Math.cos(angle) * (Math.random(50) + 150);
    const cometTailY = this.y - Math.sin(angle) * (Math.random(50) + 150);
    
    const gradient = ctx2D.createLinearGradient(this.x, this.y, cometTailX, cometTailY);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
    gradient.addColorStop(1, `rgba(122, 169, 237, 0)`);
    
    ctx2D.beginPath();
    ctx2D.arc(this.x, this.y, this.radius / 2, 0, Math.PI * 2);
    ctx2D.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx2D.fill();
    
    ctx2D.moveTo(this.x, this.y);
    ctx2D.lineTo(cometTailX, cometTailY);
    ctx2D.strokeStyle = gradient;
    ctx2D.lineWidth = this.radius;
    ctx2D.stroke();
};

Comet.prototype.update = function(deltaTime) {
    const distance = this.speed * (deltaTime / 1000);
    this.x += this.direction.dx * distance;
    this.y += this.direction.dy * distance;

    const elapsedTime = Date.now() - this.startTime;
    if (elapsedTime < this.fadeInDuration) {
        this.alpha = (elapsedTime / this.fadeInDuration);
    } else {
        this.alpha = 1;
    }
};

function createRandomComet() {
    const x = Math.random() * canvas2D.width;
    const y = Math.random() * canvas2D.height;
    const radius = Math.random() * 2 + 2;
    comets.push(new Comet(x, y, radius));
}

function createMeteorShower(meteor) {
    const numberOfComets = Math.random() * 5 + meteor;

    for (let i = 0; i < numberOfComets; i++) {
        const delay = Math.random() * 5000;
        setTimeout(createRandomComet, delay);
    }
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    if (lastTime) {
        const deltaTime = timestamp - lastTime;
        ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

        drawStars();

        comets.forEach((comet, index) => {
            comet.update(deltaTime);
            comet.draw();

            if (comet.x < 0 || comet.x > canvas2D.width || comet.y < 0 || comet.y > canvas2D.height) {
                comets.splice(index, 1);
            }
        });
    }
    lastTime = timestamp;

    if (Date.now() - lastCometTime > cometCooldown) {
        createRandomComet();
        lastCometTime = Date.now();
    }

    if (Date.now() - lastMeteorShowerTime > meteorShowerCooldown) {
        createMeteorShower(3);
        lastMeteorShowerTime = Date.now();
    }
}

let lastClickTime = 0;
const cooldown = 2000;

window.addEventListener('click', function(event) {
    const currentTime = Date.now();
    if (currentTime - lastClickTime >= cooldown) {
        lastClickTime = currentTime;

        const x = event.x - 150 - (50 * Math.random());
        const y = event.y - 25 - (25 * Math.random());
        const radius = Math.random() * 2 + 2;
        comets.push(new Comet(x, y, radius));
    }
});

initStars();
animate();