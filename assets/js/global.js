(function () {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function ordinal(n) {
        const v = n % 100;
        if (v >= 11 && v <= 13) return n + "th";

        switch (n % 10) {
            case 1: return n + "st";
            case 2: return n + "nd";
            case 3: return n + "rd";
            default: return n + "th";
        }
    }

    function calculateYearsAgo(year, month, day) {
        const today = new Date();
        let age = today.getFullYear() - year;

        if (month && day) {
            const birthdayPassed =
                today.getMonth() + 1 > month ||
                (
                    today.getMonth() + 1 === month &&
                    today.getDate() >= day
                );

            if (!birthdayPassed) age--;
        }

        return age;
    }

    function calculateElapsed(year, month, day) {
        if (!month || !day) return null;

        const today = new Date();
        const start = new Date(year, month - 1, day);

        let years = today.getFullYear() - start.getFullYear();
        let months = today.getMonth() - start.getMonth();
        let days = today.getDate() - start.getDate();

        if (days < 0) {
            months--;

            const prevMonth = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            );

            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    }

    function formatDate(input) {
        const parts = input.trim().split("-");

        const year = parseInt(parts[0], 10);
        const month = parts[1] ? parseInt(parts[1], 10) : null;
        const day = parts[2] ? parseInt(parts[2], 10) : null;

        let display;

        if (year && month && day) {
            display = `${monthNames[month - 1]} ${ordinal(day)} ${year}`;
        } else if (year && month) {
            display = `${monthNames[month - 1]} ${year}`;
        } else {
            display = `${year}`;
        }

        return {
            display,
            yearsAgo: calculateYearsAgo(year, month, day),
            elapsed: calculateElapsed(year, month, day)
        };
    }

    document.querySelectorAll(".date-age").forEach(el => {
        const rawDate = el.textContent.trim();
        const format = el.dataset.format || "";

        const result = formatDate(rawDate);

        if (format === "person") {
            el.textContent =
                `${result.display} (aged ${result.yearsAgo})`;
        } else if (format === "format-days" && result.elapsed) {
            const { years, months, days } = result.elapsed;

            let ageText;

            if (years > 0) {
                ageText =
                    months > 0
                        ? `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""} ago`
                        : `${years} year${years !== 1 ? "s" : ""} ago`;
            } else if (months > 0) {
                ageText =
                    `${months} month${months !== 1 ? "s" : ""}, ${days} day${days !== 1 ? "s" : ""} ago`;
            } else {
                ageText =
                    `${days} day${days !== 1 ? "s" : ""} ago`;
            }

            el.textContent = `${result.display} (${ageText})`;
        } else {
            el.textContent =
                `${result.display} (${result.yearsAgo} years ago)`;
        }
    });
})();

// Lightbox functionality
class Lightbox {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.overlay = null;
        this.container = null;
        this.img = null;
        this.closeBtn = null;
        this.prevBtn = null;
        this.nextBtn = null;
    }

    init() {
        this.createLightboxElements();
        this.collectImages();
        this.attachImageListeners();
        this.attachOverlayListeners();
    }

    createLightboxElements() {
        // Create overlay
        this.overlay = document.createElement("div");
        this.overlay.className = "lightbox-overlay";

        // Create container
        this.container = document.createElement("div");
        this.container.className = "lightbox-container";

        // Create image
        this.img = document.createElement("img");
        this.img.className = "lightbox-image";

        // Create close button
        this.closeBtn = document.createElement("button");
        this.closeBtn.className = "lightbox-close";
        this.closeBtn.textContent = "×";
        this.closeBtn.addEventListener("click", () => this.close());

        // Create navigation buttons
        this.prevBtn = document.createElement("button");
        this.prevBtn.className = "lightbox-nav prev";
        this.prevBtn.textContent = "❮";
        this.prevBtn.addEventListener("click", () => this.prev());

        this.nextBtn = document.createElement("button");
        this.nextBtn.className = "lightbox-nav next";
        this.nextBtn.textContent = "❯";
        this.nextBtn.addEventListener("click", () => this.next());

        // Assemble
        this.container.appendChild(this.img);
        this.container.appendChild(this.closeBtn);
        this.container.appendChild(this.prevBtn);
        this.container.appendChild(this.nextBtn);
        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
    }

    collectImages() {
        // Collect all images except those that are already links or have class 'no-lightbox'
        document.querySelectorAll("img").forEach((img) => {
            if (!img.closest("a") && !img.classList.contains("no-lightbox")) {
                this.images.push(img.src);
            }
        });
    }

    attachImageListeners() {
        document.querySelectorAll("img").forEach((img) => {
            if (!img.closest("a") && !img.classList.contains("no-lightbox")) {
                img.style.cursor = "pointer";
                img.addEventListener("click", () => {
                    const index = this.images.indexOf(img.src);
                    if (index !== -1) {
                        this.currentIndex = index;
                        this.open();
                    }
                });
            }
        });
    }

    attachOverlayListeners() {
        this.overlay.addEventListener("click", (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (!this.overlay.classList.contains("active")) return;

            if (e.key === "Escape") this.close();
            if (e.key === "ArrowLeft") this.prev();
            if (e.key === "ArrowRight") this.next();
        });
    }

    open() {
        this.img.src = this.images[this.currentIndex];
        this.overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    close() {
        this.overlay.classList.remove("active");
        document.body.style.overflow = "auto";
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.img.src = this.images[this.currentIndex];
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.img.src = this.images[this.currentIndex];
    }
}

// other
async function loadComponent(elementId, file) {
    const container = document.getElementById(elementId);

    if (!container) return;

    try {
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(
                `Failed to load ${file}`
            );
        }

        const html = await response.text();

        container.innerHTML = html;
    }
    catch(error) {
        console.error(error);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await Promise.all([
            loadComponent(
                "header-container",
                "https://pheosjournal.github.io/assets/html/header.html"
            ),
            loadComponent(
                "sidebar-container",
                "https://pheosjournal.github.io/assets/html/sidebar.html"
            ),
            loadComponent(
                "footer-container",
                "https://pheosjournal.github.io/assets/html/footer.html"
            )
        ]);

        initializeSearch();
        initializeTOC();
        
        // Initialize lightbox
        const lightbox = new Lightbox();
        lightbox.init();
    }
);

// Run once when the page loads
function addFavicon(url) {
    let link = document.querySelector("link[rel*='icon']");

    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }

    link.href = url;
}

addFavicon("https://pheosjournal.github.io/images/icon.png");

function initializeSearch() {

    const form =
        document.querySelector(".search-form");

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const query =
                document
                .getElementById("wiki-search")
                .value
                .trim();

            if (!query) return;

            window.location.href =
                `/search.html?q=${encodeURIComponent(query)}`;
        }
    );
}

function initializeTOC() {

    document
        .querySelectorAll(".toc a")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const target =
                        document.querySelector(
                            link.getAttribute("href")
                        );

                    if (target) {

                        target.scrollIntoView({
                            behavior: "smooth"
                        });
                    }
                }
            );
        });
}
