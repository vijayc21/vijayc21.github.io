/* =========================================================
   TRAVEL MEMORIES
   Vijay Kumar Chauhan
========================================================= */

let currentGallery = [];
let currentPhotoIndex = 0;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initTravelGallery();

});


function initTravelGallery() {

    setupCategoryButtons();

    createLightbox();

    setupMemoryButtons();

    updatePhotoCounts();

}


/* =========================================================
   NATIONAL / INTERNATIONAL CATEGORY
========================================================= */

function setupCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            ".travel-category-btn"
        );

    const categories =
        document.querySelectorAll(
            ".travel-category"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const target =
                    button.dataset.category;


                /* Remove active button */

                buttons.forEach(function (btn) {

                    btn.classList.remove(
                        "active"
                    );

                });


                /* Activate selected button */

                button.classList.add(
                    "active"
                );


                /* Hide all categories */

                categories.forEach(function (category) {

                    category.classList.remove(
                        "active-category"
                    );

                });


                /* Show selected category */

                const selectedCategory =
                    document.getElementById(
                        target
                    );


                if (selectedCategory) {

                    selectedCategory.classList.add(
                        "active-category"
                    );

                }

            }
        );

    });

}


/* =========================================================
   VIEW MEMORIES BUTTONS
========================================================= */

function setupMemoryButtons() {

    /*
       Event delegation makes the buttons reliable
       even if the page content is changed dynamically.
    */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".view-memory-btn"
                );


            if (!button) {
                return;
            }


            event.preventDefault();

            event.stopPropagation();


            const tripCard =
                button.closest(
                    ".trip-card"
                );


            if (!tripCard) {
                return;
            }


            openTripGallery(
                tripCard
            );

        }
    );

}


/* =========================================================
   COLLECT TRIP IMAGES
========================================================= */

function getTripImages(tripCard) {

    const images =
        tripCard.querySelectorAll(
            ".trip-image img"
        );


    const gallery = [];


    images.forEach(function (image) {

        const source =
            image.getAttribute("src");


        if (
            source &&
            source.trim() !== ""
        ) {

            gallery.push({

                src: source,

                alt:
                    image.getAttribute("alt")
                    || "Travel memory"

            });

        }

    });


    return gallery;

}


/* =========================================================
   OPEN TRIP GALLERY
========================================================= */

function openTripGallery(tripCard) {

    currentGallery =
        getTripImages(tripCard);


    if (
        !currentGallery ||
        currentGallery.length === 0
    ) {

        alert(
            "No travel photos are available for this trip."
        );

        return;

    }


    currentPhotoIndex = 0;


    const lightbox =
        document.getElementById(
            "travelLightbox"
        );


    if (!lightbox) {

        console.error(
            "Travel lightbox was not created."
        );

        return;

    }


    updateLightbox();


    lightbox.classList.add(
        "active"
    );


    document.body.classList.add(
        "travel-lightbox-open"
    );

}


/* =========================================================
   CREATE LIGHTBOX
========================================================= */

function createLightbox() {

    /*
       Prevent duplicate lightboxes.
    */

    if (
        document.getElementById(
            "travelLightbox"
        )
    ) {

        return;

    }


    const lightbox =
        document.createElement(
            "div"
        );


    lightbox.id =
        "travelLightbox";


    lightbox.className =
        "travel-lightbox";


    lightbox.innerHTML = `

        <div
            class="travel-lightbox-overlay">
        </div>


        <div
            class="travel-lightbox-content"
            role="dialog"
            aria-modal="true"
            aria-label="Travel memories gallery"
        >

            <!-- CLOSE -->

            <button
                type="button"
                class="lightbox-close"
                aria-label="Close gallery"
            >

                <i class="bi bi-x-lg"></i>

            </button>


            <!-- PREVIOUS -->

            <button
                type="button"
                class="lightbox-prev"
                aria-label="Previous photo"
            >

                <i class="bi bi-chevron-left"></i>

            </button>


            <!-- IMAGE -->

            <div
                class="lightbox-image-wrapper"
            >

                <img
                    id="lightboxImage"
                    src=""
                    alt="Travel memory"
                >

            </div>


            <!-- NEXT -->

            <button
                type="button"
                class="lightbox-next"
                aria-label="Next photo"
            >

                <i class="bi bi-chevron-right"></i>

            </button>


            <!-- INFORMATION -->

            <div class="lightbox-info">

                <div
                    id="lightboxCounter"
                    class="lightbox-counter"
                >
                    1 / 1
                </div>


                <div
                    id="lightboxCaption"
                    class="lightbox-caption"
                >
                    Travel memory
                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        lightbox
    );


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    const closeButton =
        lightbox.querySelector(
            ".lightbox-close"
        );


    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    const previousButton =
        lightbox.querySelector(
            ".lightbox-prev"
        );


    previousButton.addEventListener(
        "click",
        showPreviousPhoto
    );


    const nextButton =
        lightbox.querySelector(
            ".lightbox-next"
        );


    nextButton.addEventListener(
        "click",
        showNextPhoto
    );


    const overlay =
        lightbox.querySelector(
            ".travel-lightbox-overlay"
        );


    overlay.addEventListener(
        "click",
        closeLightbox
    );

}


/* =========================================================
   UPDATE LIGHTBOX
========================================================= */

function updateLightbox() {

    if (
        !currentGallery.length
    ) {

        return;

    }


    const image =
        document.getElementById(
            "lightboxImage"
        );


    const counter =
        document.getElementById(
            "lightboxCounter"
        );


    const caption =
        document.getElementById(
            "lightboxCaption"
        );


    const photo =
        currentGallery[
            currentPhotoIndex
        ];


    if (!photo) {
        return;
    }


    image.src =
        photo.src;


    image.alt =
        photo.alt;


    counter.textContent =
        `${currentPhotoIndex + 1} / ${currentGallery.length}`;


    caption.textContent =
        photo.alt;


    updateNavigationButtons();

}


/* =========================================================
   IMAGE ERROR HANDLING
========================================================= */

document.addEventListener(
    "error",
    function (event) {

        const element =
            event.target;


        if (
            element &&
            element.tagName === "IMG"
        ) {

            /*
               Do NOT hide broken images.
               This makes incorrect file paths easier
               to identify while developing.
            */

            console.error(
                "Image failed to load:",
                element.src
            );

        }

    },
    true
);


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

function updateNavigationButtons() {

    const previous =
        document.querySelector(
            ".lightbox-prev"
        );


    const next =
        document.querySelector(
            ".lightbox-next"
        );


    if (
        !previous ||
        !next
    ) {

        return;

    }


    if (
        currentGallery.length > 1
    ) {

        previous.style.visibility =
            "visible";

        next.style.visibility =
            "visible";

    }
    else {

        previous.style.visibility =
            "hidden";

        next.style.visibility =
            "hidden";

    }

}


/* =========================================================
   NEXT PHOTO
========================================================= */

function showNextPhoto() {

    if (
        currentGallery.length === 0
    ) {

        return;

    }


    currentPhotoIndex++;


    if (
        currentPhotoIndex >=
        currentGallery.length
    ) {

        currentPhotoIndex = 0;

    }


    updateLightbox();

}


/* =========================================================
   PREVIOUS PHOTO
========================================================= */

function showPreviousPhoto() {

    if (
        currentGallery.length === 0
    ) {

        return;

    }


    currentPhotoIndex--;


    if (
        currentPhotoIndex < 0
    ) {

        currentPhotoIndex =
            currentGallery.length - 1;

    }


    updateLightbox();

}


/* =========================================================
   CLOSE LIGHTBOX
========================================================= */

function closeLightbox() {

    const lightbox =
        document.getElementById(
            "travelLightbox"
        );


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "travel-lightbox-open"
    );


    setTimeout(function () {

        const image =
            document.getElementById(
                "lightboxImage"
            );


        if (image) {

            image.src = "";

        }

    }, 250);

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const lightbox =
            document.getElementById(
                "travelLightbox"
            );


        if (
            !lightbox ||
            !lightbox.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            event.key === "Escape"
        ) {

            closeLightbox();

        }


        else if (
            event.key === "ArrowRight"
        ) {

            showNextPhoto();

        }


        else if (
            event.key === "ArrowLeft"
        ) {

            showPreviousPhoto();

        }

    }
);


/* =========================================================
   PHOTO COUNT
========================================================= */

function updatePhotoCounts() {

    const tripCards =
        document.querySelectorAll(
            ".trip-card"
        );


    tripCards.forEach(function (card) {

        const images =
            card.querySelectorAll(
                ".trip-image img"
            );


        const count =
            images.length;


        const countElement =
            card.querySelector(
                ".photo-count"
            );


        if (
            countElement &&
            count > 0
        ) {

            countElement.textContent =
                `${count} photos`;

        }

    });

}