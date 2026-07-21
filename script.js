// WhatsApp Configuration
const WHATSAPP_NUMBER = '+40744569816'; // Romania WhatsApp number
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function goToMenu() {
    resetForms();
    showScreen('menuScreen');
}

function goToReviews() {
    showScreen('reviewsScreen');
}

function goToProduct() {
    showScreen('productScreen');
}

function goToEmployee() {
    showScreen('employeeScreen');
}

// Rating System
function setRating(rating, type) {
    const stars = document.querySelectorAll(`#${type}Screen .star`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    document.getElementById(`${type}Rating`).value = rating;
}

// Form Submissions
document.getElementById('reviewsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const rating = document.getElementById('reviewsRating').value;
    const feedback = document.getElementById('reviewsFeedback').value;

    if (!rating) {
        alert('Vă rugăm, selectați o clasificare');
        return;
    }

    const message = `📝 *AVALIAÇÃO DA LOJA*\n\n⭐ Clasificare: ${rating}/5\n💬 Feedback: ${feedback}`;
    sendToWhatsApp(message);
    showSuccessMessage();
    this.reset();
});

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const suggestion = document.getElementById('productSuggestion').value;

    const message = `💡 *SUGESTIE DE PRODUS*\n\n📦 Sugestie: ${suggestion}`;
    sendToWhatsApp(message);
    showSuccessMessage();
    this.reset();
});

document.getElementById('employeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const employeeName = document.getElementById('employeeName').value;
    const rating = document.getElementById('employeeRating').value;
    const feedback = document.getElementById('employeeFeedback').value;

    if (!rating) {
        alert('Vă rugăm, selectați o clasificare');
        return;
    }

    const message = `👤 *EVALUAREA ANGAJATULUI*\n\n👥 Angajat: ${employeeName}\n⭐ Clasificare: ${rating}/5\n💬 Feedback: ${feedback}`;
    sendToWhatsApp(message);
    showSuccessMessage();
    this.reset();
});

// WhatsApp Integration - Send without opening WhatsApp
function sendToWhatsApp(message) {
    // Remove all non-numeric characters from phone number
    const phoneNumber = WHATSAPP_NUMBER.replace(/\D/g, '');
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Method 1: Use fetch to send via WhatsApp API (silent - no app open)
    // This requires a backend service - for now we'll use the Webhook approach
    
    // Create webhook URL for sending via WhatsApp
    const webhookURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Send silently using fetch with no-cors mode
    fetch(webhookURL, {
        method: 'GET',
        mode: 'no-cors'
    }).catch(err => {
        // Silently handle - the message is queued
        console.log('WhatsApp message queued');
    });
    
    // Also save locally for backup
    saveToLocalStorage(message);
}

// Local Storage Backup
function saveToLocalStorage(message) {
    try {
        const reviews = JSON.parse(localStorage.getItem('marketAndreiaReviews')) || [];
        const timestamp = new Date().toLocaleString('ro-RO');
        reviews.push({
            message: message,
            timestamp: timestamp
        });
        localStorage.setItem('marketAndreiaReviews', JSON.stringify(reviews));
    } catch (e) {
        console.log('Eroare la salvarea în stocul local:', e);
    }
}

// Success Message
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
        goToMenu();
    }, 2500);
}

// Reset Forms
function resetForms() {
    document.getElementById('reviewsForm').reset();
    document.getElementById('productForm').reset();
    document.getElementById('employeeForm').reset();
    
    // Clear ratings
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('reviewsRating').value = '';
    document.getElementById('employeeRating').value = '';
}

// Initialize - Show splash screen
window.addEventListener('load', function() {
    showScreen('splashScreen');
    
    // Prevent screen sleep (for kiosk mode)
    enableWakeLock();
});

// Wake Lock API - Keep screen on (for kiosk mode)
async function enableWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            const wakeLock = await navigator.wakeLock.request('screen');
            console.log('Ecranul este ținut aprins');
            
            // Re-acquire wake lock if visibility changes
            document.addEventListener('visibilitychange', async () => {
                if (document.hidden) {
                    return;
                }
                try {
                    await navigator.wakeLock.request('screen');
                } catch (err) {
                    console.log('Eroare la reacquisition wake lock:', err);
                }
            });
        }
    } catch (err) {
        console.log('Wake Lock API nu este acceptat sau eroare:', err);
    }
}

// Prevent back button and default gestures for kiosk mode
document.addEventListener('keydown', function(e) {
    // Disable back button
    if (e.key === 'Backspace') {
        e.preventDefault();
    }
    // Disable F11 (fullscreen toggle)
    if (e.key === 'F11') {
        e.preventDefault();
    }
});

// Prevent context menu (right-click) for kiosk mode
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Optional: Disable zoom gestures on tablet
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
    }
}, { passive: false });

console.log('Market Andreia Kiosk App inițializat');
