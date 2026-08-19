// ==========================================
//   LOAD HEADER, HERO, AND FOOTER
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // Load Header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // Re-initialize mobile menu after header loads
            initMobileMenu();
            initDropdowns();
        })
        .catch(error => console.error('Error loading header:', error));

    // Load Hero (only if hero-placeholder exists - for index page)
    if (document.getElementById('hero-placeholder')) {
        fetch('hero.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('hero-placeholder').innerHTML = data;
                initQuoteRotation();
            })
            .catch(error => console.error('Error loading hero:', error));
    }

    // Load Footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
            // Re-initialize newsletter subscription after footer loads
            initNewsletter();
        })
        .catch(error => console.error('Error loading footer:', error));
});

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

    mobileMenuBtn.addEventListener('click', function(e) {
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
                if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
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
//   QUOTE ROTATION (for hero)
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

    setInterval(() => {
        quoteElement.classList.add('quote-hidden');
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % quotes.length;
            quoteElement.innerHTML = quotes[currentIndex];
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
            msg.innerText = 'Success! You have been subscribed.';
            form.reset();
            btn.disabled = false;
        })
        .catch(error => {
            msg.style.color = '#c62828';
            msg.innerText = '⚠️ Error submitting. Please try again.';
            btn.disabled = false;
        });
    });
}