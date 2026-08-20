// ==========================================
//   LOGI - COMPONENT LOADER (OPTIMIZED)
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
            // Initialize all components once after everything is loaded
            initializeComponents();
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
        })
        .catch(error => {
            console.error("LOGI Loader Error:", error);
            container.innerHTML = '<p style="color:#8B5353;padding:20px;text-align:center;">⚠️ Could not load component: ' + file + '</p>';
        });
}

// ==========================================
//   INITIALIZE ALL COMPONENTS AFTER LOAD
// ==========================================
function initializeComponents() {
    initMobileMenu();
    initDropdowns();
    initNewsletter();
    initQuoteRotation();
}

// ==========================================
//   MOBILE MENU
// ==========================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.navigation-menu-bar');

    if (!mobileMenuBtn || !navMenu) return;

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
//   DESKTOP DROPDOWNS
// ==========================================
function initDropdowns() {
    const dropdownParents = document.querySelectorAll('.has-submenu');

    dropdownParents.forEach(parent => {
        const link = parent.querySelector('a');

        link.addEventListener('click', function(e) {
            const isMobile = window.innerWidth <= 768;

            if (!isMobile) {
                e.preventDefault();
                e.stopPropagation();

                const parentUl = parent.closest('ul');
                if (parentUl) {
                    const siblings = parentUl.querySelectorAll('.has-submenu');
                    siblings.forEach(sibling => {
                        if (sibling !== parent) {
                            sibling.classList.remove('desktop-dropdown-open');
                        }
                    });
                }

                parent.classList.toggle('desktop-dropdown-open');
            } else {
                e.preventDefault();
                parent.classList.toggle('mobile-dropdown-open');
            }
        });
    });

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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const msg = document.getElementById('logiFooterSubMsg');
        const btn = form.querySelector('button[type="submit"]');

        btn.disabled = true;
        msg.style.color = '#fff';
        msg.innerText = 'Submitting...';

        const data = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbzaonAvWoUMo02bfdvyShL52BMtNvVCB-7LIJj63ZXHyh7Ai416yUnBh-P1oC-Bmt9f/exec', {
            method: 'POST',
            body: data
        })
        .then(response => {
            msg.style.color = '#fff';
            msg.innerText = '✅ Success! You have been subscribed.';
            form.reset();
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
//   FALLBACK: FOR PAGES WITH OLD LOADER
// ==========================================
// This ensures backward compatibility with pages that
// expect the old loading behavior
if (typeof loadComponentOld === 'undefined') {
    // Keep the old function name for compatibility
    window.loadComponentOld = loadComponent;
}
