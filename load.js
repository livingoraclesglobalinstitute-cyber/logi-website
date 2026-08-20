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
