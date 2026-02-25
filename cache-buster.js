// ================================================
// 🔄 CACHE BUSTER - ENSURES FRESH CONTENT ALWAYS
// ================================================

(function() {
    'use strict';

    // ============================================
    // 🔧 DEVELOPER: UPDATE THIS VERSION NUMBER
    // whenever you make changes to the site
    // ============================================
    const SITE_VERSION = '2.0.1';
    const VERSION_KEY = 'visa_tracker_status_version';
    const CACHE_CLEARED_KEY = 'visa_tracker_cache_cleared';
    
    // Get stored version
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const cacheCleared = sessionStorage.getItem(CACHE_CLEARED_KEY);

    console.log(`%c🔄 Cache Buster Active`, 'color: #22c55e; font-weight: bold;');
    console.log(`Current Version: ${SITE_VERSION}`);
    console.log(`Stored Version: ${storedVersion || 'None'}`);

    // Check if version changed or first visit
    if (storedVersion !== SITE_VERSION && !cacheCleared) {
        console.log('%c🗑️ New version detected! Clearing cache...', 'color: #f59e0b; font-weight: bold;');
        
        // Mark that we're clearing cache (prevent infinite loop)
        sessionStorage.setItem(CACHE_CLEARED_KEY, 'true');
        
        // Clear all caches
        clearAllCaches().then(() => {
            // Store new version
            localStorage.setItem(VERSION_KEY, SITE_VERSION);
            
            // Force reload from server
            console.log('%c✅ Cache cleared! Reloading...', 'color: #22c55e; font-weight: bold;');
            window.location.reload(true);
        });
    } else {
        // Version matches, continue normally
        localStorage.setItem(VERSION_KEY, SITE_VERSION);
        console.log('%c✅ Cache is up to date', 'color: #22c55e;');
        
        // Clear the session flag
        sessionStorage.removeItem(CACHE_CLEARED_KEY);
        
        // Hide loading overlay after short delay
        setTimeout(hideLoadingOverlay, 500);
    }

    // Function to clear all caches
    async function clearAllCaches() {
        try {
            // 1. Clear Service Worker caches
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`Deleting cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
                console.log('Service Worker caches cleared');
            }

            // 2. Unregister all Service Workers
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(
                    registrations.map(registration => {
                        console.log('Unregistering Service Worker');
                        return registration.unregister();
                    })
                );
                console.log('Service Workers unregistered');
            }

            // 3. Clear localStorage cache-related items (keep version)
            const keysToKeep = [VERSION_KEY];
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key) && key.startsWith('visa_tracker_cache')) {
                    localStorage.removeItem(key);
                }
            });

            console.log('All caches cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing caches:', error);
            return false;
        }
    }

    // Hide loading overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    // Expose force refresh function globally
    window.forceRefresh = function() {
        console.log('%c🔄 Force refresh initiated...', 'color: #f59e0b; font-weight: bold;');
        
        // Show loading overlay
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('fade-out');
        }

        // Clear version to trigger refresh
        localStorage.removeItem(VERSION_KEY);
        sessionStorage.removeItem(CACHE_CLEARED_KEY);
        
        // Clear caches and reload
        clearAllCaches().then(() => {
            // Add cache-busting parameter and reload
            const url = new URL(window.location.href);
            url.searchParams.set('_cb', Date.now());
            window.location.href = url.toString();
        });
    };

    // Expose clear cache function globally
    window.clearSiteCache = clearAllCaches;

    // Auto-refresh check every 30 minutes
    setInterval(() => {
        console.log('Checking for updates...');
        // Could implement version check from server here
    }, 30 * 60 * 1000);

})();