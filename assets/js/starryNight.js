const canvas = document.getElementById('starryNight');
const ctx = canvas.getContext('2d');

const stars = [];
let starsCount = 816;
const comets = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    starsCount = Math.floor((816*0.2) + (canvas.width + canvas.height)*0.3 - 16);
    stars.length = 0;
    init();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Base direction in which all stars will move
const baseDx = 0.015;
const baseDy = 0;

const now = Date.now();
const cometCooldown = 30000; // 1 minute in milliseconds
let lastCometTime = 0; // Timestamp of the last comet creation
const meteorShowerCooldown = 300000; // 5 minutes in milliseconds
let lastMeteorShowerTime = now; // Timestamp of the last meteor shower

function Star(x, y, radius, alpha, velocity, blinkSpeed) {
    this.x = x;
    this.y = y;
    this.initialRadius = radius;
    this.radius = radius;
    this.alpha = alpha;
    this.velocity = velocity;
    this.blinkSpeed = blinkSpeed;
    this.blinkOffset = Math.random() * Math.PI * 2; // Randomize the blinking phase
}

Star.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
};

Star.prototype.update = function() {
    this.x += baseDx * this.velocity;
    this.y += baseDy * this.velocity;

    // If the star moves out of the canvas, reposition it to the opposite side
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    // Update the star's radius to create a blinking effect
    this.radius = this.initialRadius + Math.sin(Date.now() * this.blinkSpeed + this.blinkOffset) * this.initialRadius * 0.5;

    this.draw();
};

function Comet(x, y, radius, speed, length) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.length = length;
    this.trail = [];
}

Comet.prototype.draw = function() {
    for (let i = 0; i < this.trail.length; i++) {
        const trailSegment = this.trail[i];
        // Interpolate color from blue-white (115, 185, 255) to light blue (173, 216, 230)
        const r = 195 + (0 - 195) * (1 - trailSegment.alpha);
        const g = 225 + (0 - 225) * (1 - trailSegment.alpha);
        const b = 255 + (255 - 255) * (1 - trailSegment.alpha);
        ctx.beginPath();
        ctx.arc(trailSegment.x, trailSegment.y, trailSegment.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailSegment.alpha})`;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(225, 225, 255, 1)';
    ctx.fill();
};

Comet.prototype.update = function() {
    const prevX = this.x;
    const prevY = this.y;

    this.x += this.speed.dx;
    this.y += this.speed.dy;

    const segmentsToAdd = 4; // Number of segments to add for smoother trail
    for (let i = 1; i <= segmentsToAdd; i++) {
        const interpolatedX = prevX + (this.x - prevX) * (i / segmentsToAdd);
        const interpolatedY = prevY + (this.y - prevY) * (i / segmentsToAdd);
        this.trail.push({ x: interpolatedX, y: interpolatedY, radius: this.radius, alpha: 1 });
    }
    
    if (this.trail.length > this.length) {
        this.trail.splice(0, this.trail.length - this.length); // Remove the oldest segments to maintain trail length
    }

    
    for (let i = 0; i < this.trail.length; i++) {
        this.trail[i].alpha -= 1 / this.length; // Adjust alpha based on total length
        this.trail[i].radius *= 0.9; // Decrease radius to create a tapering effect
    }

    this.draw();
};


Comet.prototype.reset = function() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.trail = [];
};

function init() {
    for (let i = 0; i < starsCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5;
        const alpha = Math.random();
        const velocity = radius + Math.random() * 0.5; // Larger radius means higher velocity, with some randomness
        const blinkSpeed = Math.random() * 0.001 + 0.0005; // Random blink speed
        stars.push(new Star(x, y, radius, alpha, velocity, blinkSpeed));
    }
}

function createRandomComet() {
    const x = Math.random() * canvas.width - 20;
    const y = Math.random() * canvas.height - 5 ;
    const radius = Math.random() * 2 + 1; // Random size for the comet
    const speed = {
        dx: 16, // Horizontal speed
        dy: 4 // Vertical speed
    };
    const length = Math.random() * 20 + 20; // Random trail length
    comets.push(new Comet(x, y, radius, speed, length));
}

function createMeteorShower(meteor) {
    const numberOfComets = Math.random() * 5 + meteor;

    for (let i = 0; i < numberOfComets; i++) {
        const delay = Math.random() * 5000;
        setTimeout(createRandomComet, delay);
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => star.update());

    comets.forEach((comet, index) => {
        comet.update();
        if (comet.x < -200 || comet.x > canvas.width + 200 || comet.y < -200 || comet.y > canvas.height + 200) {
            comets.splice(index, 1);
        }
    });
    
    const now = Date.now();

    if (now - lastCometTime > cometCooldown) {
        createRandomComet();
        lastCometTime = now;
    }

    if (now - lastMeteorShowerTime > meteorShowerCooldown) {
        createMeteorShower(10);
        lastMeteorShowerTime = now;
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
        const radius = Math.random() * 2 + 1;
        const speed = {
            dx: 16,
            dy: 4 + Math.random() * 4
        };
        const length = Math.random() * 20 + 15;
        comets.push(new Comet(x, y, radius, speed, length));
    }
});


init();
animate();