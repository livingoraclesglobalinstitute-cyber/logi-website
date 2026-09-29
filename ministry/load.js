// ==========================================
//   LOGI MINISTRY - COMPONENT LOADER
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    try {

        // ==========================================
        // LOAD SHARED MINISTRY COMPONENTS
        // ==========================================

        const components = [
            loadComponent("header-placeholder", "/ministry/header.html"),
            loadComponent("footer-placeholder", "/ministry/footer.html")
        ];

        // ==========================================
        // LOAD HERO ONLY IF REQUIRED
        // ==========================================

        if (document.getElementById("hero-placeholder")) {
            components.push(
                loadComponent("hero-placeholder", "/ministry/hero.html")
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
        initCookieConsent();

        console.log("LOGI MINISTRY: Components initialized successfully.");

    } catch (error) {
        console.error("LOGI MINISTRY: Website initialization error:", error);
    }

});
