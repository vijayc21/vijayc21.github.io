/* ===========================================================
   Conference Gallery
   Vijay Kumar Chauhan Academic Website
=========================================================== */

const images = [

    "../../assets/images/conferences/imesd2023/photo1.jpg",
    "../../assets/images/conferences/imesd2023/photo2.jpg",
    "../../assets/images/conferences/imesd2023/photo3.jpg",
    "../../assets/images/conferences/imesd2023/photo4.jpg",
    "../../assets/images/conferences/imesd2023/photo5.jpg",
    "../../assets/images/conferences/imesd2023/photo6.jpg",
    "../../assets/images/conferences/imesd2023/photo7.jpg",
    "../../assets/images/conferences/imesd2023/photo8.jpg"

];

const captions = [

    "IMESD-2023 • Conference Venue",
    "IMESD-2023 • Registration",
    "IMESD-2023 • Technical Session",
    "IMESD-2023 • Poster Presentation",
    "IMESD-2023 • Research Interaction",
    "IMESD-2023 • Conference Activities",
    "IMESD-2023 • Group Photograph",
    "IMESD-2023 • Closing Ceremony"

];

let currentImage = 0;

const modal = new bootstrap.Modal(
    document.getElementById("galleryModal")
);



/* ===========================================================
   OPEN IMAGE
=========================================================== */

function openGallery(index){

    currentImage = index;

    updateGallery();

    modal.show();

}



/* ===========================================================
   UPDATE IMAGE
=========================================================== */

function updateGallery(){

    document.getElementById("galleryImage").src =
        images[currentImage];

    document.getElementById("imageTitle").innerHTML =
        captions[currentImage];

    document.getElementById("imageCounter").innerHTML =
        (currentImage + 1) + " / " + images.length;

}



/* ===========================================================
   NEXT IMAGE
=========================================================== */

function nextImage(){

    currentImage++;

    if(currentImage >= images.length){

        currentImage = 0;

    }

    updateGallery();

}



/* ===========================================================
   PREVIOUS IMAGE
=========================================================== */

function previousImage(){

    currentImage--;

    if(currentImage < 0){

        currentImage = images.length - 1;

    }

    updateGallery();

}



/* ===========================================================
   KEYBOARD NAVIGATION
=========================================================== */

document.addEventListener("keydown", function(event){

    const modalOpen =
        document.getElementById("galleryModal")
        .classList.contains("show");

    if(!modalOpen) return;

    if(event.key === "ArrowRight"){

        nextImage();

    }

    if(event.key === "ArrowLeft"){

        previousImage();

    }

});



/* ===========================================================
   SWIPE SUPPORT (Mobile)
=========================================================== */

let startX = 0;

const modalImage = document.getElementById("galleryImage");

modalImage.addEventListener("touchstart", function(e){

    startX = e.touches[0].clientX;

});

modalImage.addEventListener("touchend", function(e){

    let endX = e.changedTouches[0].clientX;

    if(startX - endX > 60){

        nextImage();

    }

    if(endX - startX > 60){

        previousImage();

    }

});