// ==========================================
// LOGI - COMPONENT LOADER
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    try {
        // Load shared components
        await Promise.all([
            loadComponent("header-placeholder", "header.html"),
            loadComponent("footer-placeholder", "footer.html"),
            loadHero()
        ]);

        // Initialize after header has been inserted
        initDropdowns();
        initMobileMenu();
        initNewsletter();
        initQuoteRotation();

    } catch (error) {
        console.error("LOGI: Component loading error:", error);
    }
});


// ==========================================
// LOAD COMPONENT
// ==========================================

async function loadComponent(elementId, file) {

    const container = document.getElementById(elementId);

    if (!container) {
        console.warn(
            "LOGI: #" + elementId + " not found. Skipping " + file
        );
        return;
    }

    try {

        const response = await fetch(file, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                "Failed to load " + file +
                " (HTTP " + response.status + ")"
            );
        }

        const html = await response.text();

        container.innerHTML = html;

        console.log("LOGI: Loaded " + file);

    } catch (error) {

        console.error("LOGI: Error loading " + file, error);

        container.innerHTML = `
            <p style="
                color:#8B5353;
                padding:20px;
                text-align:center;
            ">
                ⚠️ Could not load ${file}
            </p>
        `;

        throw error;
    }
}


// ==========================================
// LOAD HERO ONLY WHEN NEEDED
// ==========================================

async function loadHero() {

    const hero = document.getElementById("hero-placeholder");

    if (!hero) {
        return;
    }

    await loadComponent("hero-placeholder", "hero.html");
}


// ==========================================
// DESKTOP + MOBILE DROPDOWNS
// ==========================================

function initDropdowns() {

    const dropdownParents =
        document.querySelectorAll(".has-submenu");

    if (!dropdownParents.length) {
        console.warn("LOGI: No .has-submenu elements found.");
        return;
    }

    dropdownParents.forEach(parent => {

        const link = parent.querySelector(":scope > a");

        if (!link) return;

        // Prevent duplicate initialization
        if (link.dataset.dropdownInitialized === "true") {
            return;
        }

        link.dataset.dropdownInitialized = "true";

        link.addEventListener("click", function (e) {

            const isMobile = window.innerWidth <= 768;

            if (isMobile) {

                e.preventDefault();
                e.stopPropagation();

                // Close other mobile dropdowns
                dropdownParents.forEach(other => {

                    if (other !== parent) {
                        other.classList.remove(
                            "mobile-dropdown-open"
                        );
                    }

                });

                parent.classList.toggle(
                    "mobile-dropdown-open"
                );

            } else {

                e.preventDefault();
                e.stopPropagation();

                // Close other desktop dropdowns
                dropdownParents.forEach(other => {

                    if (other !== parent) {
                        other.classList.remove(
                            "desktop-dropdown-open"
                        );
                    }

                });

                parent.classList.toggle(
                    "desktop-dropdown-open"
                );
            }
        });
    });


    // Close dropdown when clicking outside
    if (!window.logiDropdownOutsideHandler) {

        document.addEventListener("click", function (e) {

            dropdownParents.forEach(parent => {

                if (!parent.contains(e.target)) {

                    parent.classList.remove(
                        "desktop-dropdown-open"
                    );

                    parent.classList.remove(
                        "mobile-dropdown-open"
                    );
                }

            });

        });

        window.logiDropdownOutsideHandler = true;
    }
}


// ==========================================
// MOBILE MENU
// ==========================================

function initMobileMenu() {

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const navMenu =
        document.querySelector(".navigation-menu-bar");

    if (!mobileMenuBtn || !navMenu) {

        console.warn(
            "LOGI: Mobile menu elements not found."
        );

        return;
    }

    function openMenu() {

        navMenu.classList.add("mobile-open");

        document.body.style.overflow = "hidden";
    }

    function closeMenu() {

        navMenu.classList.remove("mobile-open");

        document.body.style.overflow = "";

        document
            .querySelectorAll(".mobile-dropdown-open")
            .forEach(el => {
                el.classList.remove(
                    "mobile-dropdown-open"
                );
            });
    }


    // Avoid duplicate listener
    if (mobileMenuBtn.dataset.menuInitialized === "true") {
        return;
    }

    mobileMenuBtn.dataset.menuInitialized = "true";


    mobileMenuBtn.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        if (
            navMenu.classList.contains("mobile-open")
        ) {
            closeMenu();
        } else {
            openMenu();
        }

    });


    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape") {
            closeMenu();
        }

    });
}


// ==========================================
// QUOTE ROTATION
// ==========================================

function initQuoteRotation() {

    const quoteElement =
        document.getElementById("dynamic-quote");

    if (!quoteElement) return;

    const quotes = [
        "A perfect blend of Leadership, Business, Technology & Theology",
        "Empowering the next generation of global transformational leaders",
        "Integrating faith-based principles with practical, real-world skills",
        "Equipping minds and hearts for impactful service worldwide"
    ];

    let currentIndex = 0;

    quoteElement.textContent = quotes[0];

    setInterval(() => {

        quoteElement.classList.add("quote-hidden");

        setTimeout(() => {

            currentIndex =
                (currentIndex + 1) % quotes.length;

            quoteElement.textContent =
                quotes[currentIndex];

            quoteElement.classList.remove(
                "quote-hidden"
            );

        }, 600);

    }, 4000);
}


// ==========================================
// NEWSLETTER
// ==========================================

function initNewsletter() {

    const form =
        document.getElementById("logiFooterSubForm");

    if (!form) return;

    if (form.dataset.newsletterInitialized === "true") {
        return;
    }

    form.dataset.newsletterInitialized = "true";

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const msg =
            document.getElementById("logiFooterSubMsg");

        const btn =
            form.querySelector(
                'button[type="submit"]'
            );

        if (!msg || !btn) return;

        btn.disabled = true;

        msg.style.color = "#fff";
        msg.innerText = "Submitting...";

        const data = new FormData(form);

        fetch(
            "https://script.google.com/macros/s/AKfycbzaonAvWoUMo02bfdvyShL52BMtNvVCB-7LIJj63ZXHyh7Ai416yUnBh-P1oC-Bmt9f/exec",
            {
                method: "POST",
                body: data
            }
        )
        .then(() => {

            msg.style.color = "#fff";

            msg.innerText =
                "✅ Success! You have been subscribed.";

            form.reset();

            btn.disabled = false;

        })
        .catch(() => {

            msg.style.color = "#ff6b6b";

            msg.innerText =
                "⚠️ Error submitting. Please try again.";

            btn.disabled = false;

        });

    });
}
