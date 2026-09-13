// ==========================================
//   LOGI - COMPONENT LOADER
//   Shared Header / Footer / Hero
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    try {

        // ==========================================
        // LOAD SHARED COMPONENTS
        // ==========================================

        const components = [
            loadComponent("header-placeholder", "header.html"),
            loadComponent("footer-placeholder", "footer.html")
        ];

        // ==========================================
        // LOAD HERO ONLY IF REQUIRED
        // ==========================================

        if (document.getElementById("hero-placeholder")) {
            components.push(
                loadComponent("hero-placeholder", "hero.html")
            );
        }

        // Wait for components to finish loading
        await Promise.all(components);

        // ==========================================
        // INITIALIZE WEBSITE FEATURES
        // ==========================================

        initDropdowns();
        initMobileMenu();
        initNewsletter();
        initQuoteRotation();
        initCookieConsent();   // ← NEW: Cookie consent

        console.log(
            "LOGI: Website components initialized successfully."
        );

    } catch (error) {

        console.error(
            "LOGI: Website initialization error:",
            error
        );

    }

});


// ==========================================
//   LOAD COMPONENT
// ==========================================

async function loadComponent(elementId, file) {

    const container =
        document.getElementById(elementId);

    if (!container) {

        console.log(
            "LOGI: #" +
            elementId +
            " not found. Skipping " +
            file
        );

        return;
    }

    try {

        // No ?v=7, ?v=8, ?v=2, etc.
        const response = await fetch(file, {
            cache: "no-cache"
        });

        if (!response.ok) {

            throw new Error(
                "Failed to load " +
                file +
                " (HTTP " +
                response.status +
                ")"
            );

        }

        const html = await response.text();

        container.innerHTML = html;

        console.log(
            "LOGI: Loaded " + file
        );

    } catch (error) {

        console.error(
            "LOGI Loader Error:",
            error
        );

        container.innerHTML =
            '<div style="' +
            'color:#8B5353;' +
            'padding:20px;' +
            'text-align:center;' +
            '">' +
            '⚠️ Could not load ' +
            file +
            '</div>';

        throw error;
    }

}


// ==========================================
//   DESKTOP + MOBILE DROPDOWNS
//   Supports Nested Dropdowns
// ==========================================

function initDropdowns() {

    const dropdownParents =
        document.querySelectorAll(".has-submenu");

    if (!dropdownParents.length) {

        console.warn(
            "LOGI: No dropdown menus found."
        );

        return;
    }


    dropdownParents.forEach(function (parent) {

        // Get ONLY the direct link
        // belonging to this dropdown.
        const link =
            parent.querySelector(":scope > a");

        if (!link) return;


        // Prevent duplicate initialization
        if (
            link.dataset.logiDropdownReady ===
            "true"
        ) {
            return;
        }

        link.dataset.logiDropdownReady =
            "true";


        // ==========================================
        // DROPDOWN CLICK
        // ==========================================

        link.addEventListener(
            "click",
            function (e) {

                const isMobile =
                    window.innerWidth <= 768;

                e.preventDefault();
                e.stopPropagation();


                // ==========================================
                // MOBILE DROPDOWN
                // ==========================================

                if (isMobile) {

                    // Close sibling dropdowns only
                    const siblings =
                        parent.parentElement.querySelectorAll(
                            ":scope > .has-submenu"
                        );

                    siblings.forEach(
                        function (sibling) {

                            if (
                                sibling !== parent
                            ) {

                                sibling.classList.remove(
                                    "mobile-dropdown-open"
                                );

                            }

                        }
                    );


                    parent.classList.toggle(
                        "mobile-dropdown-open"
                    );

                }


                // ==========================================
                // DESKTOP DROPDOWN
                // ==========================================

                else {

                    // Close sibling dropdowns only
                    const siblings =
                        parent.parentElement.querySelectorAll(
                            ":scope > .has-submenu"
                        );

                    siblings.forEach(
                        function (sibling) {

                            if (
                                sibling !== parent
                            ) {

                                sibling.classList.remove(
                                    "desktop-dropdown-open"
                                );

                            }

                        }
                    );


                    parent.classList.toggle(
                        "desktop-dropdown-open"
                    );

                }

            }
        );

    });


    // ==========================================
    // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    // ==========================================

    if (
        !window.logiDropdownOutsideHandler
    ) {

        document.addEventListener(
            "click",
            function (e) {

                if (
                    !e.target.closest(
                        ".has-submenu"
                    )
                ) {

                    document
                        .querySelectorAll(
                            ".desktop-dropdown-open"
                        )
                        .forEach(
                            function (element) {

                                element.classList.remove(
                                    "desktop-dropdown-open"
                                );

                            }
                        );


                    document
                        .querySelectorAll(
                            ".mobile-dropdown-open"
                        )
                        .forEach(
                            function (element) {

                                element.classList.remove(
                                    "mobile-dropdown-open"
                                );

                            }
                        );

                }

            }
        );

        window.logiDropdownOutsideHandler =
            true;
    }

}


// ==========================================
//   MOBILE MENU
// ==========================================

function initMobileMenu() {

    const mobileMenuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );

    const navMenu =
        document.querySelector(
            ".navigation-menu-bar"
        );


    if (
        !mobileMenuBtn ||
        !navMenu
    ) {

        console.warn(
            "LOGI: Mobile menu elements not found."
        );

        return;
    }


    // ==========================================
    // OPEN MOBILE MENU
    // ==========================================

    function openMenu() {

        navMenu.classList.add(
            "mobile-open"
        );

        document.body.style.overflow =
            "hidden";

    }


    // ==========================================
    // CLOSE MOBILE MENU
    // ==========================================

    function closeMenu() {

        navMenu.classList.remove(
            "mobile-open"
        );

        document.body.style.overflow =
            "";


        // Close all mobile dropdowns
        document
            .querySelectorAll(
                ".mobile-dropdown-open"
            )
            .forEach(
                function (element) {

                    element.classList.remove(
                        "mobile-dropdown-open"
                    );

                }
            );

    }


    // ==========================================
    // PREVENT DUPLICATE INITIALIZATION
    // ==========================================

    if (
        mobileMenuBtn.dataset.logiMenuReady ===
        "true"
    ) {

        return;
    }

    mobileMenuBtn.dataset.logiMenuReady =
        "true";


    // ==========================================
    // MOBILE BUTTON
    // ==========================================

    mobileMenuBtn.addEventListener(
        "click",
        function (e) {

            e.preventDefault();
            e.stopPropagation();


            if (
                navMenu.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    // ==========================================
    // CLOSE MOBILE MENU OUTSIDE
    // ==========================================

    document.addEventListener(
        "click",
        function (e) {

            if (
                window.innerWidth <= 768
            ) {

                if (
                    navMenu.classList.contains(
                        "mobile-open"
                    )
                ) {

                    if (
                        !navMenu.contains(
                            e.target
                        ) &&
                        !mobileMenuBtn.contains(
                            e.target
                        )
                    ) {

                        closeMenu();

                    }

                }

            }

        }
    );


    // ==========================================
    // ESCAPE KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        function (e) {

            if (
                e.key === "Escape"
            ) {

                closeMenu();

            }

        }
    );

}


// ==========================================
//   QUOTE ROTATION
// ==========================================

function initQuoteRotation() {

    const quoteElement =
        document.getElementById(
            "dynamic-quote"
        );

    if (!quoteElement) {
        return;
    }


    const quotes = [

        "A perfect blend of Leadership, Business, Technology & Theology",

        "Empowering the next generation of global transformational leaders",

        "Integrating faith-based principles with practical, real-world skills",

        "Equipping minds and hearts for impactful service worldwide"

    ];


    let currentIndex = 0;


    // First quote
    quoteElement.textContent =
        quotes[0];


    // Rotate quotes
    setInterval(
        function () {

            quoteElement.classList.add(
                "quote-hidden"
            );


            setTimeout(
                function () {

                    currentIndex =
                        (
                            currentIndex + 1
                        ) %
                        quotes.length;


                    quoteElement.textContent =
                        quotes[
                            currentIndex
                        ];


                    quoteElement.classList.remove(
                        "quote-hidden"
                    );

                },
                600
            );

        },
        4000
    );

}


// ==========================================
//   NEWSLETTER SUBSCRIPTION
// ==========================================

function initNewsletter() {

    const form =
        document.getElementById(
            "logiFooterSubForm"
        );

    if (!form) {
        return;
    }


    // ==========================================
    // PREVENT DUPLICATE INITIALIZATION
    // ==========================================

    if (
        form.dataset.logiNewsletterReady ===
        "true"
    ) {

        return;
    }

    form.dataset.logiNewsletterReady =
        "true";


    // ==========================================
    // SUBMIT NEWSLETTER
    // ==========================================

    form.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const msg =
                document.getElementById(
                    "logiFooterSubMsg"
                );


            const btn =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (
                !msg ||
                !btn
            ) {

                return;
            }


            btn.disabled = true;

            msg.style.color =
                "#fff";

            msg.innerText =
                "Submitting...";


            const data =
                new FormData(form);


            fetch(
                "https://script.google.com/macros/s/AKfycbzaonAvWoUMo02bfdvyShL52BMtNvVCB-7LIJj63ZXHyh7Ai416yUnBh-P1oC-Bmt9f/exec",
                {
                    method: "POST",
                    body: data
                }
            )
            .then(
                function () {

                    msg.style.color =
                        "#fff";

                    msg.innerText =
                        "✅ Success! You have been subscribed.";

                    form.reset();

                    btn.disabled = false;

                }
            )
            .catch(
                function (error) {

                    console.error(
                        "LOGI Newsletter Error:",
                        error
                    );

                    msg.style.color =
                        "#ff6b6b";

                    msg.innerText =
                        "⚠️ Error submitting. Please try again.";

                    btn.disabled = false;

                }
            );

        }
    );

}


// ==========================================
//   COOKIE CONSENT BANNER
//   Auto-injects CSS + Banner into every page
// ==========================================

function initCookieConsent() {

    // ==========================================
    // STEP 1: INJECT COOKIE BANNER CSS
    // ==========================================

    if (!document.getElementById('logiCookieStyles')) {

        const cookieStyles = document.createElement('style');
        cookieStyles.id = 'logiCookieStyles';
        cookieStyles.innerHTML = `
            .cookie-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(26, 26, 46, 0.97);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: #ffffff;
                padding: 20px;
                z-index: 99999;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
                display: none;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                animation: logiCookieSlideUp 0.4s ease;
            }

            @keyframes logiCookieSlideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }

            .cookie-banner.show {
                display: block;
            }

            .cookie-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 30px;
                flex-wrap: wrap;
            }

            .cookie-text {
                flex: 1;
                min-width: 280px;
            }

            .cookie-text h3 {
                color: #ffffff;
                font-size: 16px;
                margin: 0 0 8px 0;
                font-weight: 700;
            }

            .cookie-text p {
                color: #d4d0c8;
                font-size: 13px;
                line-height: 1.6;
                margin: 0 0 6px 0;
            }

            .cookie-text a {
                color: #c9a86c;
                font-size: 12px;
                text-decoration: none;
                font-weight: 600;
            }

            .cookie-text a:hover {
                text-decoration: underline;
            }

            .cookie-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                font-family: inherit;
            }

            .cookie-btn-accept {
                background: #8B5353;
                color: #ffffff;
            }

            .cookie-btn-accept:hover {
                background: #6d3d3d;
                transform: translateY(-1px);
            }

            .cookie-btn-deny {
                background: transparent;
                color: #d4d0c8;
                border: 1px solid #555;
            }

            .cookie-btn-deny:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }

            .cookie-btn-customize {
                background: transparent;
                color: #c9a86c;
                border: 1px solid #c9a86c;
            }

            .cookie-btn-customize:hover {
                background: rgba(201, 168, 108, 0.1);
            }

            @media (max-width: 768px) {
                .cookie-content {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }
                .cookie-buttons {
                    flex-direction: column;
                }
                .cookie-btn {
                    width: 100%;
                    text-align: center;
                }
            }
        `;
        document.head.appendChild(cookieStyles);
    }


    // ==========================================
    // STEP 2: INJECT COOKIE BANNER HTML
    // ==========================================

    if (!document.getElementById('cookieConsent')) {

        const bannerHTML = `
            <div id="cookieConsent" class="cookie-banner">
                <div class="cookie-content">
                    <div class="cookie-text">
                        <h3>🍪 We Respect Your Privacy</h3>
                        <p>By clicking "Accept All", you consent to our use of cookies to enable essential site functionality, serve personalized content, and analyze traffic to improve your experience. You can customize your settings or click "Deny All" to decline anything not strictly necessary.</p>
                        <a href="/privacy-policy" target="_blank">View Privacy Policy →</a>
                    </div>
                    <div class="cookie-buttons">
                        <button class="cookie-btn cookie-btn-customize" onclick="logiCustomizeCookies()">Customize</button>
                        <button class="cookie-btn cookie-btn-deny" onclick="logiDenyCookies()">Deny All</button>
                        <button class="cookie-btn cookie-btn-accept" onclick="logiAcceptCookies()">Accept All</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHTML);
    }


    // ==========================================
    // STEP 3: SHOW BANNER (if no choice stored)
    // ==========================================

    if (!localStorage.getItem('cookieConsent')) {

        setTimeout(function () {

            const banner = document.getElementById('cookieConsent');

            if (banner) {
                banner.classList.add('show');
            }

        }, 1000);

    }


    // ==========================================
    // STEP 4: DEFINE GLOBAL COOKIE FUNCTIONS
    // ==========================================

    window.logiAcceptCookies = function () {

        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());

        const banner = document.getElementById('cookieConsent');

        if (banner) {
            banner.classList.remove('show');
        }

        logiEnableAnalytics();

    };


    window.logiDenyCookies = function () {

        localStorage.setItem('cookieConsent', 'denied');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());

        const banner = document.getElementById('cookieConsent');

        if (banner) {
            banner.classList.remove('show');
        }

        logiDisableNonEssential();

    };


    window.logiCustomizeCookies = function () {

        // Option A: Redirect to settings page
        window.location.href = '/cookie-settings';

        // Option B: Just accept essential cookies
        // logiDenyCookies();

    };

}


// ==========================================
//   COOKIE HELPER FUNCTIONS
// ==========================================

function logiEnableAnalytics() {

    console.log('✅ LOGI: Analytics enabled');

    // Add your Google Analytics 4 (GA4) code here
    // Example:
    // const script = document.createElement('script');
    // script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
    // document.head.appendChild(script);

}


function logiDisableNonEssential() {

    console.log('🔒 LOGI: Non-essential cookies disabled');

    // Clear any non-essential cookies here if needed

}
