
(() => {
    const API =
        "https://vijay-visitor-stats.vijaydinanathchauhan02016.workers.dev";

    async function updateVisitorStats() {
        const visitorEl = document.getElementById("visitor-count");
        const countryEl = document.getElementById("country-count");
        const pageViewEl = document.getElementById("page-view-count");

        // Do nothing on pages without the visitor cards.
        if (!visitorEl || !countryEl || !pageViewEl) return;

        try {
            let visitorId = localStorage.getItem("vijay_visitor_id");

            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem("vijay_visitor_id", visitorId);
            }

            // Record this page view.
            const trackResponse = await fetch(`${API}/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    visitorId,
                    path: window.location.pathname
                }),
                keepalive: true
            });

            if (!trackResponse.ok) {
                throw new Error("Could not record this visit");
            }

            // Retrieve the updated totals.
            const response = await fetch(`${API}/stats`, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Could not load visitor statistics");
            }

            const stats = await response.json();

            visitorEl.textContent =
                Number(stats.visitors).toLocaleString();

            countryEl.textContent =
                Number(stats.countries).toLocaleString();

            pageViewEl.textContent =
                Number(stats.pageViews).toLocaleString();

        } catch (error) {
            console.error("Visitor counter:", error);
            // Keep the existing dash if the service is unavailable.
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            updateVisitorStats,
            { once: true }
        );
    } else {
        updateVisitorStats();
    }
})();
