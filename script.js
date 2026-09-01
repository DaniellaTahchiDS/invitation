/**
 * Angela-Maria Farhat's Floral RSVP Application
 * Front-end Logic & Google Apps Script API Bridge
 */

// ==========================================================================
// CONFIGURATION
// Replace the URL below with your published Google Apps Script Web App URL
// ==========================================================================

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJBgSD9e5OiC1MukFvveKUVwVc3BTJpUgCkq3Vn1yTcPhonjMJxhcOW5VMo-Bc4cxGvA/exec';


// Global Application State
const state = {
    guestName: '',
    rsvpStatus: ''
};

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
    initPetals();
    checkStoredGuest();
    initCountdown();
});

/**
 * Check if the entered guest name belongs to Angela
 */
function isAngelaName(name) {
    if (!name) return false;
    const normalized = name.trim().toLowerCase();
    return normalized === 'angela' ||
        normalized === 'angela farhat' ||
        normalized === 'angela-maria' ||
        normalized === 'angela maria' ||
        normalized === 'angela-maria farhat' ||
        normalized === 'angela maria farhat';
}

/**
 * Live Countdown Timer to Party Date (Sep 12, 2026 8:00 PM)
 */
function initCountdown() {
    const eventDate = new Date('2026-09-12T20:00:00').getTime();

    function updateClock() {
        const now = new Date().getTime();
        const diff = eventDate - now;

        if (diff <= 0) {
            if (document.getElementById('cd-days')) document.getElementById('cd-days').textContent = '00';
            if (document.getElementById('cd-hours')) document.getElementById('cd-hours').textContent = '00';
            if (document.getElementById('cd-mins')) document.getElementById('cd-mins').textContent = '00';
            if (document.getElementById('cd-secs')) document.getElementById('cd-secs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const dElem = document.getElementById('cd-days');
        const hElem = document.getElementById('cd-hours');
        const mElem = document.getElementById('cd-mins');
        const sElem = document.getElementById('cd-secs');

        if (dElem) dElem.textContent = days < 10 ? '0' + days : days;
        if (hElem) hElem.textContent = hours < 10 ? '0' + hours : hours;
        if (mElem) mElem.textContent = minutes < 10 ? '0' + minutes : minutes;
        if (sElem) sElem.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Handle Landing Page Name Submission
 */
function handleNameSubmit() {
    const input = document.getElementById('guest-name-input');
    const errorMsg = document.getElementById('name-error');
    const name = input.value.trim();

    if (!name) {
        errorMsg.hidden = false;
        input.focus();
        return;
    }

    errorMsg.hidden = true;
    state.guestName = name;

    // Store in LocalStorage for session convenience
    localStorage.setItem('invitation_guest_name', name);

    // Update personalized display name
    document.getElementById('display-guest-name').textContent = name;

    // Show or Hide Secret Wish Box based on whether the guest is Angela
    const wishContainer = document.getElementById('secret-wish-container');
    if (wishContainer) {
        if (isAngelaName(name)) {
            wishContainer.style.display = 'none';
        } else {
            wishContainer.style.display = 'block';
        }
    }

    // Transition to View 2 (Invitation)
    switchView('view-invitation');
}

/**
 * Handle RSVP Choice (Attending / Declining) and Post to Google Apps Script
 */
async function submitRSVP(status) {
    if (!state.guestName) {
        switchView('view-landing');
        return;
    }

    state.rsvpStatus = status;

    // UI Loading state
    const buttons = document.querySelectorAll('.rsvp-buttons button');
    const spinner = document.getElementById('loading-spinner');

    buttons.forEach(btn => btn.disabled = true);
    spinner.hidden = false;

    // Read optional secret wish note
    const wishInput = document.getElementById('secret-wish-input');
    const wishText = wishInput ? wishInput.value.trim() : '';

    // Single Combined Payload to send to Google Apps Script
    const payload = {
        name: state.guestName,
        status: status,
        wish: wishText,
        timestamp: new Date().toLocaleString()
    };

    console.log("Submitting Combined RSVP Payload:", payload);

    try {
        // Only fire HTTP request if valid URL is provided
        if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
        } else {
            console.warn("Google Apps Script URL not configured yet. Simulation mode active.");
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    } catch (error) {
        console.error("Error submitting RSVP to Google Apps Script:", error);
    } finally {
        buttons.forEach(btn => btn.disabled = false);
        spinner.hidden = true;
        renderConfirmation(status);
        switchView('view-confirmation');

        // Fire festive confetti on acceptance!
        if (status === 'Attending') {
            launchConfetti();
        }
    }
}

/**
 * Render Confirmation Screen based on Attendance choice
 */
function renderConfirmation(status) {
    const badge = document.getElementById('conf-badge');
    const title = document.getElementById('conf-title');
    const message = document.getElementById('conf-message');
    const eventInfo = document.getElementById('conf-event-info');

    if (status === 'Attending') {
        badge.textContent = '💐';
        title.textContent = 'Joyfully Confirmed!';
        message.innerHTML = `Dearest <strong>${escapeHtml(state.guestName)}</strong>, thank you for accepting! We are thrilled to celebrate Angela-Maria Farhat's special occasion with you.`;
        eventInfo.innerHTML = `
            <p class="conf-highlight">✨ We can't wait to see you!</p>
            <p class="conf-sub">Date: Saturday, Sep 12, 2026 | 8:00 PM</p>
            <p class="conf-sub">Venue: <a href="https://maps.app.goo.gl/vDAxCuTVHn1hJBo96" target="_blank" rel="noopener noreferrer" class="location-link">Farhat's Villa, Delbta 📍</a></p>
        `;
    } else {
        badge.textContent = '🌸';
        title.textContent = 'Warmly Received';
        message.innerHTML = `Dearest <strong>${escapeHtml(state.guestName)}</strong>, thank you for letting us know. You will be missed in body, but present in our warm thoughts!`;
        eventInfo.innerHTML = `
            <p class="conf-highlight">💕 Sending Warm Wishes</p>
            <p class="conf-sub">Should your plans change, feel free to update your response below anytime.</p>
        `;
    }
}

/**
 * Reset response and return to View 2
 */
function editResponse() {
    switchView('view-invitation');
}

/**
 * Smooth View Switching Function
 */
function switchView(targetViewId) {
    const views = document.querySelectorAll('.view');

    views.forEach(view => {
        if (view.id === targetViewId) {
            view.classList.remove('view-hidden');
            setTimeout(() => {
                view.classList.add('view-active');
            }, 10);
        } else {
            view.classList.remove('view-active');
            view.classList.add('view-hidden');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Check if name was previously entered in local storage
 */
function checkStoredGuest() {
    const savedName = localStorage.getItem('invitation_guest_name');
    if (savedName) {
        document.getElementById('guest-name-input').value = savedName;
    }
}

/**
 * Dynamically Generate Falling Background Petals
 */
function initPetals() {
    const container = document.getElementById('petalsContainer');
    if (!container) return;

    const petalGradients = [
        'radial-gradient(circle, rgba(229, 152, 155, 0.75) 0%, rgba(181, 101, 118, 0.3) 100%)',
        'radial-gradient(circle, rgba(200, 138, 110, 0.7) 0%, rgba(139, 94, 67, 0.25) 100%)',
        'radial-gradient(circle, rgba(42, 91, 90, 0.5) 0%, rgba(82, 121, 111, 0.2) 100%)'
    ];

    const numberOfPetals = 22;
    for (let i = 0; i < numberOfPetals; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';

        // Sizing, position, and animation timing
        const size = Math.random() * 14 + 10;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 7; // 7s to 15s
        // Negative delay ensures petals are ALREADY falling immediately on page load
        const delay = -Math.random() * duration;
        const bgGradient = petalGradients[i % petalGradients.length];

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.4}px`;
        petal.style.left = `${left}%`;
        petal.style.background = bgGradient;
        petal.style.animationDelay = `${delay}s`;
        petal.style.animationDuration = `${duration}s`;

        container.appendChild(petal);
    }
}

/**
 * Utility: HTML Escaper to prevent XSS
 */
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

/**
 * Lightweight Festive Confetti Burst Animation
 */
function launchConfetti() {
    let canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#E5989B', '#B56576', '#2A5B5A', '#C88A6E', '#F4EAD3'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2 + 50,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.75) * 16,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach(p => {
            if (p.opacity <= 0) return;
            activeParticles++;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.32; // Gravity
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.014;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (activeParticles > 0) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    render();
}
