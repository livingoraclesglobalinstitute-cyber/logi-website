// ==========================================
//   LOGI - COMPONENT LOADER (ULTRA FAST)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {

    // Load all components in parallel
    const headerPromise = loadComponent("header-placeholder", "header.html");
    const footerPromise = loadComponent("footer-placeholder", "footer.html");
    
    // Load hero only if it exists
    const hero = document.getElementById("hero-placeholder");
    const heroPromise = hero ? loadComponent("hero-placeholder", "hero.html") : Promise.resolve();

    // Wait for all components to load, then initialize once
    Promise.all([headerPromise, footerPromise, heroPromise])
        .then(() => {
            // Initialize dropdowns IMMEDIATELY after header loads
            initDropdowns();
            initMobileMenu();
            initNewsletter();
            initQuoteRotation();
        })
        .catch(error => {
            console.error("LOGI: Error loading components:", error);
        });

});

// ==========================================
//   LOAD COMPONENT - RETURNS PROMISE
// ==========================================
function loadComponent(elementId, file) {
    const container = document.getElementById(elementId);

    if (!container) {
        console.warn("LOGI: Element #" + elementId + " not found, skipping " + file);
        return Promise.resolve();
    }

    return fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load " + file + " (Status: " + response.status + ")");
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            // Force immediate DOM update
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    resolve();
                });
            });
        })
        .catch(error => {
            console.error("LOGI Loader Error:", error);
            container.innerHTML = '<p style="color:#8B5353;padding:20px;text-align:center;">⚠️ Could not load component: ' + file + '</p>';
        });
}

// ==========================================
//   DESKTOP DROPDOWNS - FAST INIT
// ==========================================
function initDropdowns() {
    const dropdownParents = document.querySelectorAll('.has-submenu');
    
    // If no dropdowns found, try again after a short delay
    if (dropdownParents.length === 0) {
        console.warn("LOGI: No dropdowns found, retrying...");
        setTimeout(initDropdowns, 100);
        return;
    }

    dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');
        if (!link) return;

        // Remove existing listeners to prevent duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        newLink.addEventListener('click', function(e) {
            const isMobile = window.innerWidth <= 768;

            if (!isMobile) {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                dropdownParents.forEach(otherParent => {
                    if (otherParent !== parent) {
                        otherParent.classList.remove('desktop-dropdown-open');
                    }
                });

                parent.classList.toggle('desktop-dropdown-open');
            } else {
                e.preventDefault();
                parent.classList.toggle('mobile-dropdown-open');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        dropdownParents.forEach(parent => {
            if (!parent.contains(e.target)) {
                parent.classList.remove('desktop-dropdown-open');
                parent.classList.remove('mobile-dropdown-open');
            }
        });
    });
}

// ==========================================
//   MOBILE MENU - FAST INIT
// ==========================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.navigation-menu-bar');

    if (!mobileMenuBtn || !navMenu) {
        setTimeout(initMobileMenu, 100);
        return;
    }

    function openMenu() {
        navMenu.classList.add('mobile-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('mobile-open');
        document.body.style.overflow = '';
        document.querySelectorAll('.mobile-dropdown-open').forEach(el => {
            el.classList.remove('mobile-dropdown-open');
        });
    }

    // Remove old listeners by cloning
    const newBtn = mobileMenuBtn.cloneNode(true);
    mobileMenuBtn.parentNode.replaceChild(newBtn, mobileMenuBtn);

    newBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navMenu.classList.contains('mobile-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (navMenu.classList.contains('mobile-open')) {
                if (!navMenu.contains(e.target) && !newBtn.contains(e.target)) {
                    closeMenu();
                }
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

// ==========================================
//   QUOTE ROTATION
// ==========================================
function initQuoteRotation() {
    const quotes = [
        "A perfect blend of Leadership, Business, Technology & Theology",
        "Empowering the next generation of global transformational leaders",
        "Integrating faith-based principles with practical, real-world skills",
        "Equipping minds and hearts for impactful service worldwide"
    ];

    let currentIndex = 0;
    const quoteElement = document.getElementById('dynamic-quote');

    if (!quoteElement) return;

    // Start immediately with first quote
    quoteElement.textContent = quotes[0];

    setInterval(() => {
        quoteElement.classList.add('quote-hidden');
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % quotes.length;
            quoteElement.textContent = quotes[currentIndex];
            quoteElement.classList.remove('quote-hidden');
        }, 600);
    }, 4000);
}

// ==========================================
//   NEWSLETTER SUBSCRIPTION
// ==========================================
function initNewsletter() {
    const form = document.getElementById('logiFooterSubForm');
    if (!form) return;

    // Remove existing listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const msg = document.getElementById('logiFooterSubMsg');
        const btn = newForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        msg.style.color = '#fff';
        msg.innerText = 'Submitting...';

        const data = new FormData(newForm);

        fetch('https://script.google.com/macros/s/AKfycbzaonAvWoUMo02bfdvyShL52BMtNvVCB-7LIJj63ZXHyh7Ai416yUnBh-P1oC-Bmt9f/exec', {
            method: 'POST',
            body: data
        })
        .then(response => {
            msg.style.color = '#fff';
            msg.innerText = '✅ Success! You have been subscribed.';
            newForm.reset();
            btn.disabled = false;
        })
        .catch(error => {
            msg.style.color = '#ff6b6b';
            msg.innerText = '⚠️ Error submitting. Please try again.';
            btn.disabled = false;
        });
    });
}

// ==========================================
//   EMERGENCY FALLBACK - Force dropdowns
// ==========================================
// If dropdowns still don't work after 2 seconds, force them
setTimeout(function() {
    const dropdownParents = document.querySelectorAll('.has-submenu');
    if (dropdownParents.length > 0) {
        // Check if dropdowns have event listeners
        const firstLink = dropdownParents[0]?.querySelector('a');
        if (firstLink) {
            // If no click handler, re-init
            initDropdowns();
        }
    }
}, 2000);
