/* ==========================================================================
   TYPING INTRO SEQUENCER
   ========================================================================== */
const introLines = [
    "To our respected senior, leader, and mentor...",
    "Sir Mashood ur Rehman...",
    "Wishing you a very special day..."
];

let lineIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 60;   // ms per character
const deletingSpeed = 30; // ms per character
const pauseDuration = 1400; // ms to display completed line

function tickTypewriter() {
    const box = document.getElementById('typing-text');
    if (!box) return;

    const currentText = introLines[lineIndex];

    if (!isDeleting) {
        // Typing state
        box.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentText.length) {
            // Completed typing this line
            if (lineIndex === introLines.length - 1) {
                // If it is the last line, transition immediately
                setTimeout(transitionToCelebration, 1800);
            } else {
                // Otherwise pause and delete
                isDeleting = true;
                setTimeout(tickTypewriter, pauseDuration);
            }
        } else {
            setTimeout(tickTypewriter, typingSpeed);
        }
    } else {
        // Backspacing state
        box.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            isDeleting = false;
            lineIndex++; // move to next line
            setTimeout(tickTypewriter, 300);
        } else {
            setTimeout(tickTypewriter, deletingSpeed);
        }
    }
}

function transitionToCelebration() {
    const typingScreen = document.getElementById('typing-screen');
    const celebrationScreen = document.getElementById('celebration-screen');
    
    // Transition overlay visibility
    if (typingScreen) typingScreen.classList.add('hidden');
    
    setTimeout(() => {
        if (celebrationScreen) {
            celebrationScreen.classList.remove('hidden');
            celebrationScreen.offsetHeight; // Force reflow
            celebrationScreen.classList.add('visible');
        }
        
        // Trigger automated periodic confetti cannons on the celebration page
        setInterval(triggerAutomaticConfetti, 4000);
        triggerAutomaticConfetti(); // trigger initial burst
    }, 500);
}

// Start typewriter on window load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(tickTypewriter, 500);
});


/* ==========================================================================
   HIGH-PERFORMANCE CANVAS ENGINE
   ========================================================================== */
const canvas = document.getElementById('effects-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let balloons = [];
let petals = [];
let snowflakes = [];
let followers = [];      // Floating background bubble followers
let trailParticles = []; // Mouse cursor trail particles
let confetti = [];

// Modern neon candy colors (No gold)
const neonPalette = ['#ff2a5f', '#00f0ff', '#a12cff', '#ff9f00', '#39ff14', '#00ffcc', '#ff00ff'];
const celebratoryColors = [...neonPalette];

// Track Mouse Movements for followers and cursor trailing
let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Spawn trailing bubbles on mouse move
    if (Math.random() > 0.3) {
        trailParticles.push(new TrailParticle(mouse.x, mouse.y));
    }
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        if (Math.random() > 0.3) {
            trailParticles.push(new TrailParticle(mouse.x, mouse.y));
        }
    }
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});


// 1. Stars (Moving Upwards and Downwards)
class Star {
    constructor(w, h) {
        this.reset(w, h, true);
    }
    reset(w, h, scatter = false) {
        this.x = Math.random() * w;
        this.y = scatter ? Math.random() * h : (Math.random() > 0.5 ? -10 : h + 10);
        this.size = Math.random() * 1.5 + 0.3;
        // Direction: half move up, half move down
        this.speedY = (Math.random() * 0.35 + 0.08) * (Math.random() > 0.5 ? 1 : -1);
        this.opacity = Math.random() * 0.6 + 0.15;
        this.twinkleSpeed = Math.random() * 0.015 + 0.005;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    }
    update(w, h) {
        this.y += this.speedY;
        this.opacity += this.twinkleSpeed * this.twinkleDir;
        if (this.opacity > 0.9) this.twinkleDir = -1;
        if (this.opacity < 0.15) this.twinkleDir = 1;

        if (this.y < -15 || this.y > h + 15) {
            this.reset(w, h, false);
        }
    }
    draw() {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 2. Balloons (Rising upwards, increased quantity, vibrant colors)
class Balloon {
    constructor(w, h) {
        this.reset(w, h, true);
    }
    reset(w, h, scatter = false) {
        this.x = Math.random() * w;
        this.y = scatter ? Math.random() * (h + 300) - 100 : h + 150;
        this.size = Math.random() * 16 + 20; // radius
        this.speedY = Math.random() * -1.5 - 0.7; // faster float rate
        this.swaySpeed = Math.random() * 0.014 + 0.004;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swayAmount = Math.random() * 15 + 5;
        this.color = neonPalette[Math.floor(Math.random() * neonPalette.length)];
        this.stringLength = this.size * 2.3;
        this.stringSwaySpeed = Math.random() * 0.035 + 0.015;
    }
    update(w, h) {
        this.y += this.speedY;
        this.swayAngle += this.swaySpeed;
        this.x += Math.sin(this.swayAngle) * 0.45;

        if (this.y < -this.size * 3) {
            this.reset(w, h, false);
        }
    }
    draw() {
        ctx.save();
        const displayX = this.x + Math.sin(this.swayAngle) * this.swayAmount;
        ctx.translate(displayX, this.y);

        // Vibrant 3D neon candy gradient
        const grad = ctx.createRadialGradient(-this.size/4, -this.size/4, this.size/10, 0, 0, this.size);
        grad.addColorStop(0, '#ffffff'); 
        grad.addColorStop(0.3, this.color);
        grad.addColorStop(1, '#050308'); 
        
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = grad;
        
        // Draw balloon shape
        ctx.beginPath();
        ctx.moveTo(0, this.size);
        ctx.bezierCurveTo(-this.size * 1.25, this.size * 0.5, -this.size * 1.25, -this.size * 0.75, 0, -this.size);
        ctx.bezierCurveTo(this.size * 1.25, -this.size * 0.75, this.size * 1.25, this.size * 0.5, 0, this.size);
        ctx.fill();

        // Draw bottom knot
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, this.size - 2);
        ctx.lineTo(-this.size/7, this.size + 8);
        ctx.lineTo(this.size/7, this.size + 8);
        ctx.closePath();
        ctx.fill();

        // Draw string
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, this.size + 8);
        
        const stringWave = Math.sin(this.y * this.stringSwaySpeed) * 7;
        ctx.bezierCurveTo(stringWave, this.size + this.stringLength/3, -stringWave, this.size + (this.stringLength*2)/3, 0, this.size + this.stringLength);
        ctx.stroke();

        ctx.restore();
    }
}

// 3. Floating Flower Petals / Neon Blossoms
class Petal {
    constructor(w, h) {
        this.reset(w, h, true);
    }
    reset(w, h, scatter = false) {
        this.x = Math.random() * w;
        this.y = scatter ? Math.random() * h - 40 : -20;
        this.size = Math.random() * 8 + 5;
        this.speedY = Math.random() * 1.2 + 0.7;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.03 - 0.015;
        // Pinks & purples palette
        this.color = Math.random() > 0.4 ? 
                     `rgba(${235 + Math.floor(Math.random()*20)}, ${140 + Math.floor(Math.random()*40)}, ${200 + Math.floor(Math.random()*40)}, 0.65)` : 
                     `rgba(0, 240, 255, ${Math.random() * 0.3 + 0.4})`; 
        this.swayFreq = Math.random() * 0.025 + 0.01;
        this.swayAngle = Math.random() * Math.PI * 2;
    }
    update(w, h) {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.swayAngle) * 0.3;
        this.angle += this.spinSpeed;
        this.swayAngle += this.swayFreq;

        if (this.y > h + 20) {
            this.reset(w, h, false);
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 4. Snowflake (Glowing snow sparkles)
class Snowflake {
    constructor(w, h) {
        this.reset(w, h, true);
    }
    reset(w, h, scatter = false) {
        this.x = Math.random() * w;
        this.y = scatter ? Math.random() * h - 20 : -10;
        this.size = Math.random() * 2 + 0.6;
        this.speedY = Math.random() * 0.7 + 0.35;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.swayFreq = Math.random() * 0.025 + 0.01;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.25;
    }
    update(w, h) {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.swayAngle) * 0.15;
        this.swayAngle += this.swayFreq;

        if (this.y > h + 10) {
            this.reset(w, h, false);
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 5. Floating Background Followers (Drifting bubble followers that bend toward the cursor)
class Follower {
    constructor(w, h) {
        this.reset(w, h, true);
    }
    reset(w, h, scatter = false) {
        this.x = Math.random() * w;
        this.y = scatter ? Math.random() * h : h + 20;
        this.size = Math.random() * 7 + 4;
        this.speedY = Math.random() * -0.9 - 0.3; // rising slowly
        this.speedX = Math.random() * 0.6 - 0.3;
        this.color = neonPalette[Math.floor(Math.random() * neonPalette.length)];
        this.opacity = Math.random() * 0.38 + 0.18;
    }
    update(w, h) {
        this.y += this.speedY;
        this.x += this.speedX;

        // If mouse is active, check attraction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 280) { // pull boundary
                // Draw bubbles gently toward the mouse cursor
                this.x += (dx / dist) * 0.85;
                this.y += (dy / dist) * 0.85;
            }
        }

        if (this.y < -20 || this.x < -20 || this.x > w + 20) {
            this.reset(w, h, false);
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// 6. Interactive Cursor Trail Particles
class TrailParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 7 + 5;
        this.speedX = Math.random() * 2.5 - 1.25;
        this.speedY = Math.random() * 2.5 - 1.25;
        this.color = neonPalette[Math.floor(Math.random() * neonPalette.length)];
        this.opacity = 1;
        this.fade = Math.random() * 0.03 + 0.015;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.97; // shrink
        this.opacity -= this.fade;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// 7. Confetti Particles (Fired from corner canons automatically)
class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 3;
        this.color = color || celebratoryColors[Math.floor(Math.random() * celebratoryColors.length)];
        this.speedX = Math.random() * 10 - 5;
        this.speedY = Math.random() * -12 - 4;
        this.gravity = 0.32;
        this.friction = 0.98;
        this.spin = Math.random() * 360;
        this.spinSpeed = Math.random() * 8 - 4;
        this.opacity = 1;
        this.fade = Math.random() * 0.015 + 0.007;
        this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    }
    update() {
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.spin += this.spinSpeed;
        this.opacity -= this.fade;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.spin * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.shape === 'rect') {
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        } else {
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Corner Confetti Cannons (with neon colors)
function triggerAutomaticConfetti() {
    const now = audioCtx ? audioCtx.currentTime : null;
    
    // Play dual chime note sequence
    if (audioCtx && musicStarted) {
        playTone(659.25, 0.4, now);       // E5
        playTone(783.99, 0.5, now + 0.08); // G5
    }

    // Left cannon
    for (let i = 0; i < 35; i++) {
        const p = new ConfettiParticle(0, canvas.height);
        p.speedX = Math.random() * 7 + 6;
        p.speedY = Math.random() * -13 - 7;
        confetti.push(p);
    }
    // Right cannon
    for (let i = 0; i < 35; i++) {
        const p = new ConfettiParticle(canvas.width, canvas.height);
        p.speedX = Math.random() * -7 - 6;
        p.speedY = Math.random() * -13 - 7;
        confetti.push(p);
    }
}

// Canvas Initialization
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reset Stars count
    stars = [];
    const starCount = Math.min(Math.floor(window.innerWidth / 12), 120);
    for (let i = 0; i < starCount; i++) stars.push(new Star(canvas.width, canvas.height));

    // Reset Balloons (Doubled Quantity!)
    balloons = [];
    const balloonCount = Math.min(Math.floor(window.innerWidth / 35), 32); // Max 32 balloons floating
    for (let i = 0; i < balloonCount; i++) balloons.push(new Balloon(canvas.width, canvas.height));

    // Reset Petals
    petals = [];
    const petalCount = Math.min(Math.floor(window.innerWidth / 40), 25);
    for (let i = 0; i < petalCount; i++) petals.push(new Petal(canvas.width, canvas.height));

    // Reset Snowflakes
    snowflakes = [];
    const snowCount = Math.min(Math.floor(window.innerWidth / 25), 45);
    for (let i = 0; i < snowCount; i++) snowflakes.push(new Snowflake(canvas.width, canvas.height));

    // Reset Floating Followers
    followers = [];
    const followerCount = Math.min(Math.floor(window.innerWidth / 35), 25);
    for (let i = 0; i < followerCount; i++) followers.push(new Follower(canvas.width, canvas.height));
}

// Animation Loop
function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Parallax Starfields
    stars.forEach(s => {
        s.update(canvas.width, canvas.height);
        s.draw();
    });

    // 2. Draw Floating background followers (bend toward cursor)
    followers.forEach(f => {
        f.update(canvas.width, canvas.height);
        f.draw();
    });

    // 3. Draw Rising Balloons
    balloons.forEach(b => {
        b.update(canvas.width, canvas.height);
        b.draw();
    });

    // 4. Draw Falling Petals & Snowflakes
    petals.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw();
    });

    snowflakes.forEach(s => {
        s.update(canvas.width, canvas.height);
        s.draw();
    });

    // 5. Draw Interactive Cursor Trails
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const t = trailParticles[i];
        t.update();
        t.draw();
        if (t.opacity <= 0 || t.size <= 0.2) {
            trailParticles.splice(i, 1);
        }
    }

    // 6. Draw Confetti overlays
    for (let i = confetti.length - 1; i >= 0; i--) {
        const p = confetti[i];
        p.update();
        p.draw();
        if (p.opacity <= 0) {
            confetti.splice(i, 1);
        }
    }

    requestAnimationFrame(animateCanvas);
}

// Resizing
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(animateCanvas);


/* ==========================================================================
   WEB AUDIO API SOUND ENGINE (AUTOPLAY FALLBACK SYSTEM)
   ========================================================================== */
let audioCtx = null;
let isMusicPlaying = false;
let melodyTimeout = null;
let melodyStep = 0;
let musicStarted = false;

const noteFreqs = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25,
    'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

const birthdayMelody = [
    { note: 'C4', dur: 0.35 }, { note: 'C4', dur: 0.15 }, { note: 'D4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'E4', dur: 1.0 },
    { note: 'C4', dur: 0.35 }, { note: 'C4', dur: 0.15 }, { note: 'D4', dur: 0.5 }, { note: 'C4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 1.0 },
    { note: 'C4', dur: 0.35 }, { note: 'C4', dur: 0.15 }, { note: 'C5', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'D4', dur: 1.0 },
    { note: 'Bb4', dur: 0.35 }, { note: 'Bb4', dur: 0.15 }, { note: 'A4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 1.2 }
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, duration, startTime) {
    if (!audioCtx) return;

    // Sub-Oscillator (Triangle base - warm flute-like)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    
    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    // Over-Oscillator (Sine overtone - bell chime)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.55);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.55);
}

function playMelody() {
    if (!isMusicPlaying || !audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const currentNote = birthdayMelody[melodyStep];
    const freq = noteFreqs[currentNote.note];
    const now = audioCtx.currentTime;

    playTone(freq, currentNote.dur * 1.5, now);

    const stepDurationMs = currentNote.dur * 720; 

    melodyStep = (melodyStep + 1) % birthdayMelody.length;
    melodyTimeout = setTimeout(playMelody, stepDurationMs);
}

function startMusic() {
    initAudio();
    isMusicPlaying = true;
    melodyStep = 0;
    playMelody();
}

// Global click-anywhere to activate audio trigger
function tryStartMusic() {
    if (musicStarted) return;
    initAudio();
    if (audioCtx) {
        musicStarted = true;
        startMusic();
        
        // Clean up action triggers
        document.removeEventListener('click', tryStartMusic);
        document.removeEventListener('touchstart', tryStartMusic);
        document.removeEventListener('keydown', tryStartMusic);
    }
}

document.addEventListener('click', tryStartMusic);
document.addEventListener('touchstart', tryStartMusic);
document.addEventListener('keydown', tryStartMusic);
