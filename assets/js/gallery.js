/* =========================================================
   GALLERY JAVASCRIPT
   Vijay Kumar Chauhan
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const galleryCards =
        document.querySelectorAll(".gallery-card");

    const lightbox =
        document.getElementById("galleryLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxCaption =
        document.getElementById("lightboxCaption");

    const closeButton =
        document.getElementById("lightboxClose");

    const previousButton =
        document.getElementById("lightboxPrev");

    const nextButton =
        document.getElementById("lightboxNext");


    if (
        !lightbox ||
        !lightboxImage ||
        !galleryCards.length
    ) {
        return;
    }


    let currentIndex = 0;

    const images = [];


    /* =====================================================
       COLLECT IMAGES
    ===================================================== */

    galleryCards.forEach(function (card, index) {

        const image =
            card.querySelector("img");

        if (!image) return;


        images.push({

            src: image.src,

            alt:
                image.alt || "Gallery photograph",

            title:
                card.dataset.title ||
                image.alt ||
                "Gallery photograph"

        });


        card.addEventListener(
            "click",
            function () {

                currentIndex = index;

                openLightbox(currentIndex);

            }
        );

    });


    /* =====================================================
       OPEN LIGHTBOX
    ===================================================== */

    function openLightbox(index) {

        if (!images[index]) return;

        currentIndex = index;

        lightboxImage.src =
            images[index].src;

        lightboxImage.alt =
            images[index].alt;

        lightboxCaption.textContent =
            images[index].title;

        lightbox.classList.add("active");

        document.body.style.overflow = "hidden";

        updateNavigation();

    }


    /* =====================================================
       CLOSE LIGHTBOX
    ===================================================== */

    function closeLightbox() {

        lightbox.classList.remove("active");

        document.body.style.overflow = "";

        lightboxImage.src = "";

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function showNext() {

        currentIndex++;

        if (
            currentIndex >= images.length
        ) {
            currentIndex = 0;
        }

        openLightbox(currentIndex);

    }


    /* =====================================================
       PREVIOUS
    ===================================================== */

    function showPrevious() {

        currentIndex--;

        if (currentIndex < 0) {

            currentIndex =
                images.length - 1;

        }

        openLightbox(currentIndex);

    }


    /* =====================================================
       UPDATE NAVIGATION
    ===================================================== */

    function updateNavigation() {

        if (images.length <= 1) {

            previousButton.style.display =
                "none";

            nextButton.style.display =
                "none";

        } else {

            previousButton.style.display =
                "flex";

            nextButton.style.display =
                "flex";

        }

    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    nextButton.addEventListener(
        "click",
        showNext
    );


    previousButton.addEventListener(
        "click",
        showPrevious
    );


    /* =====================================================
       CLICK OUTSIDE IMAGE
    ===================================================== */

    lightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target === lightbox
            ) {

                closeLightbox();

            }

        }
    );


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !lightbox.classList.contains("active")
            ) {
                return;
            }


            if (event.key === "Escape") {

                closeLightbox();

            }


            if (event.key === "ArrowRight") {

                showNext();

            }


            if (event.key === "ArrowLeft") {

                showPrevious();

            }

        }
    );

});