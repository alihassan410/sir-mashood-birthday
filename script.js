/* ==========================================================================
   PARTICLE & CONFETTI ENGINE
   ========================================================================== */
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
const ambientCanvas = document.getElementById('ambient-canvas');
const ambientCtx = ambientCanvas.getContext('2d');

let confettiParticles = [];
let ambientParticles = [];

// Color Palettes
const goldPalette = ['#bf953f', '#fcf6ba', '#b38728', '#fbf5b7', '#aa771c', '#ffdf00', '#d4af37'];
const celebratoryColors = [...goldPalette, '#e2e8f0', '#cbd5e1', '#38bdf8', '#818cf8', '#ec4899', '#10b981'];

class ConfettiParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 7 + 4;
        this.color = color || celebratoryColors[Math.floor(Math.random() * celebratoryColors.length)];
        this.speedX = Math.random() * 12 - 6;
        this.speedY = Math.random() * -14 - 6; // Initial upward force
        this.gravity = 0.35;
        this.friction = 0.97;
        this.spin = Math.random() * 360;
        this.spinSpeed = Math.random() * 8 - 4;
        this.opacity = 1;
        this.fade = Math.random() * 0.015 + 0.008;
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.spin * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.shape === 'rect') {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class AmbientParticle {
    constructor(w, h) {
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.reset(true);
    }

    reset(scatterY = false) {
        this.x = Math.random() * this.canvasWidth;
        this.y = scatterY ? Math.random() * this.canvasHeight : this.canvasHeight + 10;
        this.size = Math.random() * 2 + 0.6;
        this.speedY = Math.random() * -0.6 - 0.2; // Slow upward float
        this.speedX = Math.random() * 0.4 - 0.2; // Slight drift
        this.opacity = Math.random() * 0.5 + 0.1;
        this.pulse = Math.random() * 0.015 + 0.005;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
    }

    update(w, h) {
        this.canvasWidth = w;
        this.canvasHeight = h;
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Twinkling effect
        this.opacity += this.pulse * this.pulseDir;
        if (this.opacity > 0.7) {
            this.pulseDir = -1;
        } else if (this.opacity < 0.1) {
            this.pulseDir = 1;
        }

        // Reset if offscreen
        if (this.y < -10 || this.x < -10 || this.x > this.canvasWidth + 10) {
            this.reset(false);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffdf00';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#d4af37';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function resizeCanvases() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
    initAmbient();
}

function initAmbient() {
    ambientParticles = [];
    const count = Math.min(Math.floor(window.innerWidth / 18), 70);
    for (let i = 0; i < count; i++) {
        ambientParticles.push(new AmbientParticle(ambientCanvas.width, ambientCanvas.height));
    }
}

// Confetti Blast creators
function createExplosion(x, y, colorSet, count = 50) {
    for (let i = 0; i < count; i++) {
        const color = colorSet ? colorSet[Math.floor(Math.random() * colorSet.length)] : null;
        confettiParticles.push(new ConfettiParticle(x, y, color));
    }
}

function streamConfetti() {
    // Blast from left
    createExplosion(0, window.innerHeight * 0.8, goldPalette, 8);
    // Blast from right
    createExplosion(window.innerWidth, window.innerHeight * 0.8, goldPalette, 8);
}

// Animation Loop
function animate() {
    // Clear Confetti Canvas
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw(confettiCtx);
        if (p.opacity <= 0) {
            confettiParticles.splice(i, 1);
        }
    }

    // Clear Ambient Canvas
    ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
    ambientParticles.forEach(p => {
        p.update(ambientCanvas.width, ambientCanvas.height);
        p.draw(ambientCtx);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvases);


/* ==========================================================================
   WEB AUDIO API SOUND ENGINE (MUSIC BOX STYLE CHIME)
   ========================================================================== */
let audioCtx = null;
let isMusicPlaying = false;
let melodyTimeout = null;
let melodyStep = 0;

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

    // Sub-Oscillator (Triangle base - warm, flute-like)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    
    // Envelope for triangle base
    gain1.gain.setValueAtTime(0, startTime);
    gain1.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    // Over-Oscillator (Sine overtone - bell chime)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // One octave higher
    
    // Envelope for bell chime
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.5); // decays much quicker
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc1.start(startTime);
    osc1.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.5);
}

function playMelody() {
    if (!isMusicPlaying || !audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const currentNote = birthdayMelody[melodyStep];
    const freq = noteFreqs[currentNote.note];
    const now = audioCtx.currentTime;

    // Play synthesized bell chime
    playTone(freq, currentNote.dur * 1.6, now);

    // Dynamic timing based on tempo
    const stepDurationMs = currentNote.dur * 700; 

    melodyStep = (melodyStep + 1) % birthdayMelody.length;
    melodyTimeout = setTimeout(playMelody, stepDurationMs);
}

function startMusic() {
    initAudio();
    isMusicPlaying = true;
    melodyStep = 0;
    document.getElementById('music-toggle').classList.add('playing');
    playMelody();
}

function stopMusic() {
    isMusicPlaying = false;
    if (melodyTimeout) {
        clearTimeout(melodyTimeout);
        melodyTimeout = null;
    }
    document.getElementById('music-toggle').classList.remove('playing');
}

// Play UI feedbacks (individual chimes)
function playInteractionChime(higher = false) {
    initAudio();
    if (audioCtx) {
        const now = audioCtx.currentTime;
        const frequencies = higher ? [523.25, 659.25, 783.99] : [329.63, 392.00, 523.25]; // chord chimes
        frequencies.forEach((freq, idx) => {
            playTone(freq, 1.2, now + idx * 0.06);
        });
    }
}


/* ==========================================================================
   APP TRANSITIONS & DYNAMIC INTERACTION
   ========================================================================== */
const introScreen = document.getElementById('intro-screen');
const mainScreen = document.getElementById('main-screen');
const unwrapBtn = document.getElementById('unwrap-btn');
const envelopeWrapper = document.querySelector('.envelope-wrapper');

// 1. Entrance / Envelope click transitions
function openEnvelope() {
    envelopeWrapper.classList.add('open');
    unwrapBtn.style.opacity = '0';
    unwrapBtn.style.transform = 'translateY(10px)';
    
    // Play transition sounds
    setTimeout(() => {
        playInteractionChime(false);
    }, 450);

    // Smooth page reveal after envelope completes animation
    setTimeout(() => {
        introScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        // Simple micro-delay to let display value apply, then fade-in opacity
        setTimeout(() => {
            mainScreen.classList.add('visible');
            startMusic();
            // Start ambient particles
            initAmbient();
            // Initial mini confetti burst to start main page
            createExplosion(window.innerWidth / 2, window.innerHeight * 0.35, goldPalette, 40);
        }, 50);
    }, 1500);
}

unwrapBtn.addEventListener('click', openEnvelope);
envelopeWrapper.addEventListener('click', openEnvelope);


// 2. Music Player Controls
const musicToggle = document.getElementById('music-toggle');
musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});


// 3. Manual Confetti Cannon Button
const manualConfettiBtn = document.getElementById('manual-confetti');
manualConfettiBtn.addEventListener('click', (e) => {
    // Generate a chime and random confetti blasts
    playInteractionChime(true);
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.2;
    createExplosion(randomX, randomY, celebratoryColors, 60);
});


// 4. Interactive Cake Candle Blowing
const candles = document.querySelectorAll('.candle');
const successMsg = document.getElementById('cake-success-msg');
const resetBtn = document.getElementById('reset-candles-btn');

let blownCount = 0;
let confettiInterval = null;

candles.forEach(candle => {
    candle.addEventListener('click', () => {
        if (!candle.classList.contains('blown')) {
            candle.classList.add('blown');
            blownCount++;
            
            // Extract coordinate of the click to launch localized sparkles
            const bbox = candle.getBoundingClientRect();
            const flameX = bbox.left + bbox.width / 2;
            const flameY = bbox.top;
            
            // Soft spark / smoke puff
            createExplosion(flameX, flameY, ['#e2e8f0', '#ff7f3f', '#fcf6ba'], 12);
            
            // Small chime feedack
            if (audioCtx) {
                const toneFreq = 400 + blownCount * 100;
                playTone(toneFreq, 0.4, audioCtx.currentTime);
            }

            // Check if all candles blown out
            if (blownCount === candles.length) {
                celebrateBirthdayComplete();
            }
        }
    });
});

function celebrateBirthdayComplete() {
    // Big chord chime
    playInteractionChime(true);
    
    // Show wishes/success overlay
    setTimeout(() => {
        successMsg.classList.add('active');
        // Center screen massive explosion
        createExplosion(window.innerWidth / 2, window.innerHeight / 2, celebratoryColors, 150);
        // Repeat confetti bursts
        confettiInterval = setInterval(streamConfetti, 1000);
        
        // Stop stream after 6 seconds to prevent lag
        setTimeout(() => {
            if (confettiInterval) {
                clearInterval(confettiInterval);
                confettiInterval = null;
            }
        }, 6000);
    }, 500);
}

// Reset candles button
resetBtn.addEventListener('click', () => {
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }
    
    blownCount = 0;
    candles.forEach(candle => {
        candle.classList.remove('blown');
    });
    
    successMsg.classList.remove('active');
    playInteractionChime(false);
    
    // Micro initial burst
    createExplosion(window.innerWidth / 2, window.innerHeight * 0.6, goldPalette, 20);
});


// Initialization call
resizeCanvases();
animate();
