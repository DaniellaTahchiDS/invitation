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
});

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

    // Payload to send to Google Apps Script
    const payload = {
        name: state.guestName,
        status: status,
        timestamp: new Date().toLocaleString()
    };

    console.log("Submitting RSVP:", payload);

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
            // Simulate brief network delay
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    } catch (error) {
        console.error("Error submitting RSVP to Google Apps Script:", error);
    } finally {
        buttons.forEach(btn => btn.disabled = false);
        spinner.hidden = true;
        renderConfirmation(status);
        switchView('view-confirmation');
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
            <p class="conf-sub">Date: Saturday, Oct 24, 2026 | 6:30 PM</p>
            <p class="conf-sub">Venue: The Grand Botanical Garden</p>
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
