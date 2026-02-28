// ================================================
// VISA TRACKER STATUS PAGE v2.0.2
// With Cache Busting & Countdown Timer
// ================================================

(function() {
    'use strict';

    // ============================================
    // 🔧 DEVELOPER: CHANGE THESE AS NEEDED
    // ============================================
    const SITE_VERSION = '2.0.2';
    const LAST_UPDATE = "2026-02-26T22:30:00";   // Format: YYYY-MM-DDTHH:MM:SS
    const NEXT_UPDATE = "2026-02-28T22:00:00";   // Must be FUTURE date!
    // ============================================

    const VERSION_KEY = 'visa_status_version';
    
    // Platform URLs
    const platforms = {
        netlify: 'https://69a07e7abe58d3008daef3c6--cheery-froyo-61cd3f.netlify.app/',
        vercel: 'https://visa-tracker-71dvbi1jo-jahed200525s-projects.vercel.app/',
        cloudflare: 'https://ba45925c.visa-tracker-ehu.pages.dev'
    };

    // ================================================
    // CACHE BUSTER
    // ================================================
    
    function checkVersion() {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        
        console.log(`%c🔄 Version Check`, 'color: #22c55e; font-weight: bold;');
        console.log(`Current: ${SITE_VERSION} | Stored: ${storedVersion || 'None'}`);
        
        if (storedVersion !== SITE_VERSION) {
            console.log('%c🗑️ New version! Clearing cache...', 'color: #f59e0b;');
            localStorage.setItem(VERSION_KEY, SITE_VERSION);
            clearCaches();
        } else {
            hideLoadingOverlay();
        }
    }

    async function clearCaches() {
        try {
            if ('caches' in window) {
                const names = await caches.keys();
                await Promise.all(names.map(name => caches.delete(name)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(r => r.unregister()));
            }
            console.log('%c✅ Caches cleared!', 'color: #22c55e;');
            hideLoadingOverlay();
        } catch (e) {
            console.error('Cache clear error:', e);
            hideLoadingOverlay();
        }
    }

    function hideLoadingOverlay() {
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.style.display = 'none', 300);
            }
        }, 500);
    }

    // ================================================
    // FORCE REFRESH (Global Function)
    // ================================================
    
    window.forceRefresh = function() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('fade-out');
        }
        
        localStorage.removeItem(VERSION_KEY);
        
        clearCaches().then(() => {
            const url = new URL(window.location.href);
            url.searchParams.set('_cb', Date.now());
            window.location.href = url.toString();
        });
    };

    // ================================================
    // DATE FORMATTING
    // ================================================

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function formatNow() {
        return new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
    }

    // ================================================
    // COUNTDOWN TIMER
    // ================================================

    function padZero(num) {
        return String(num).padStart(2, '0');
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const target = new Date(NEXT_UPDATE).getTime();
        const diff = target - now;

        const countdownTimer = document.getElementById('countdownTimer');
        const expiredText = document.getElementById('expiredText');
        const nextUpdateCard = document.getElementById('nextUpdateCard');
        const nextUpdateBadge = document.getElementById('nextUpdateBadge');
        const badgeText = document.getElementById('badgeText');

        if (diff <= 0) {
            // Timer expired
            if (countdownTimer) countdownTimer.style.display = 'none';
            if (expiredText) expiredText.style.display = 'flex';
            if (nextUpdateCard) nextUpdateCard.classList.add('expired');
            if (nextUpdateBadge) {
                nextUpdateBadge.classList.remove('badge-upcoming');
                nextUpdateBadge.classList.add('badge-expired');
            }
            if (badgeText) badgeText.textContent = 'Pending';
            return;
        }

        // Show timer, hide expired text
        if (countdownTimer) countdownTimer.style.display = 'flex';
        if (expiredText) expiredText.style.display = 'none';
        if (nextUpdateCard) nextUpdateCard.classList.remove('expired');

        // Calculate
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Update display
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = padZero(days);
        if (hoursEl) hoursEl.textContent = padZero(hours);
        if (minutesEl) minutesEl.textContent = padZero(minutes);
        if (secondsEl) secondsEl.textContent = padZero(seconds);
    }

    // ================================================
    // STATUS CHECK
    // ================================================

    window.checkStatus = async function() {
        const refreshBtn = document.querySelector('.refresh-btn');
        const refreshIcon = refreshBtn?.querySelector('i');
        
        if (refreshIcon) refreshIcon.classList.add('spinning');
        if (refreshBtn) refreshBtn.disabled = true;
        
        await new Promise(r => setTimeout(r, 1500));
        
        document.querySelectorAll('.platform-status').forEach(badge => {
            badge.classList.remove('offline');
            badge.classList.add('online');
            badge.innerHTML = '<i class="bi bi-check-circle-fill"></i><span>Online</span>';
        });
        
        updateLastChecked();
        
        if (refreshIcon) refreshIcon.classList.remove('spinning');
        if (refreshBtn) refreshBtn.disabled = false;
        
        showNotification('Status refreshed!', 'success');
    };

    // ================================================
    // DISPLAY UPDATES
    // ================================================

    function updateLastUpdateDisplay() {
        const el = document.getElementById('lastUpdateDisplay');
        if (el) el.textContent = formatDate(LAST_UPDATE);
    }

    function updateLastChecked() {
        const el = document.getElementById('lastUpdated');
        if (el) el.textContent = formatNow();
    }

    // ================================================
    // NOTIFICATIONS
    // ================================================

    function showNotification(message, type = 'info') {
        document.querySelector('.notification')?.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 24px;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(59, 130, 246, 0.95)'};
            color: white;
            border-radius: 12px;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ================================================
    // INITIALIZATION
    // ================================================

    document.addEventListener('DOMContentLoaded', () => {
        console.log('%c🇦🇺 Visa Tracker Status Page', 'color: #FFD700; font-size: 18px; font-weight: bold;');
        console.log(`Version: ${SITE_VERSION}`);
        
        // Check version / cache
        checkVersion();
        
        // Update displays
        updateLastUpdateDisplay();
        updateLastChecked();
        updateCountdown();
        
        // Start countdown
        setInterval(updateCountdown, 1000);
        
        // Version badge click
        const versionBadge = document.getElementById('versionBadge');
        if (versionBadge) {
            versionBadge.addEventListener('click', window.forceRefresh);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                window.forceRefresh();
            } else if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                window.checkStatus();
            }
        });
    });

    // ================================================
    // INJECT CSS ANIMATIONS
    // ================================================

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100px); opacity: 0; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .spinning {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

})();
