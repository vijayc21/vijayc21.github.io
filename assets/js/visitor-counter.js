
(() => {
    const API =
        "https://vijay-visitor-stats.vijaydinanathchauhan02016.workers.dev";

    async function updateVisitorStats() {
        const visitorEl = document.getElementById("visitor-count");
        const countryEl = document.getElementById("country-count");
        const pageViewEl = document.getElementById("page-view-count");

        // Run only on pages containing the visitor-statistics cards.
        if (!visitorEl || !countryEl || !pageViewEl) return;

        try {
            // Create or reuse a persistent visitor ID.
            let visitorId = localStorage.getItem("vijay_visitor_id");

            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem("vijay_visitor_id", visitorId);
            }

            // Record this page view.
            const trackResponse = await fetch(`${API}/track`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    visitorId,
                    path: window.location.pathname
                }),
                keepalive: true
            });

            if (!trackResponse.ok) {
                throw new Error("Could not record this visit");
            }

            // Retrieve the latest statistics after tracking.
            const response = await fetch(`${API}/stats`, {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error("Could not load visitor statistics");
            }

            const stats = await response.json();

            visitorEl.textContent =
                Number(stats.visitors ?? 0).toLocaleString();

            countryEl.textContent =
                Number(stats.countries ?? 0).toLocaleString();

            pageViewEl.textContent =
                Number(stats.pageViews ?? 0).toLocaleString();

            // Render the country-wise visitor list.
            renderCountryBreakdown(stats.countryBreakdown || []);

        } catch (error) {
            console.error("Visitor counter:", error);
            // Keep existing placeholder values if the service fails.
        }
    }

    function getCountryName(code) {
        try {
            return new Intl.DisplayNames(["en"], {
                type: "region"
            }).of(code) || code;
        } catch {
            return code;
        }
    }

    function getCountryFlag(code) {
        if (!/^[A-Z]{2}$/.test(code)) {
            return "🌐";
        }

        return String.fromCodePoint(
            ...[...code].map(
                char => 127397 + char.charCodeAt(0)
            )
        );
    }

    function renderCountryBreakdown(countryBreakdown) {
        const container = document.getElementById("country-list");

        if (!container) return;

        container.replaceChildren();

        const validCountries = (countryBreakdown || [])
            .filter(item =>
                item &&
                typeof item.country_code === "string" &&
                /^[A-Z]{2}$/.test(item.country_code) &&
                item.country_code !== "XX"
            )
            .sort(
                (a, b) =>
                    Number(b.visitors || 0) -
                    Number(a.visitors || 0)
            );

        if (validCountries.length === 0) {
            const message = document.createElement("p");
            message.className = "country-loading";
            message.textContent =
                "Country statistics will appear as visits are recorded.";

            container.appendChild(message);
            return;
        }

        validCountries.forEach(item => {
            const row = document.createElement("div");
            row.className = "country-row";

            const flag = document.createElement("span");
            flag.className = "country-flag";
            flag.textContent = getCountryFlag(item.country_code);
            flag.setAttribute("aria-hidden", "true");

            const name = document.createElement("span");
            name.className = "country-name";
            name.textContent = getCountryName(item.country_code);

            const count = document.createElement("span");
            count.className = "country-visitors";

            const visitorCount = Number(item.visitors) || 0;
            count.textContent =
                `${visitorCount.toLocaleString()} ` +
                `${visitorCount === 1 ? "visitor" : "visitors"}`;

            row.append(flag, name, count);
            container.appendChild(row);
        });
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
