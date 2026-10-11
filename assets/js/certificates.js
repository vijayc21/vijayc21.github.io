/* ===========================================================
   CERTIFICATE GALLERY
   Vijay Kumar Chauhan
=========================================================== */

const certificateGallery = {

    ml: [

        {
            src: "../../assets/images/certificates/ml1.jpg",
            title: "Supervised Machine Learning"
        },

        {
            src: "../../assets/images/certificates/ml2.jpg",
            title: "Advanced Learning Algorithms"
        }

    ],

    battery: [

        {
            src: "../../assets/images/certificates/battery1.jpg",
            title: "Equivalent Circuit Cell Model Simulation"
        },

        {
            src: "../../assets/images/certificates/battery2.jpg",
            title: "Introduction to Battery Management Systems"
        }

    ],

    python: [

        {
            src: "../../assets/images/certificates/python1.jpg",
            title: "Programming for Everybody (Python)"
        }

    ],

    matlab: [

        {
            src: "../../assets/images/certificates/matlab1.jpg",
            title: "MATLAB Onramp"
        },

        {
            src: "../../assets/images/certificates/matlab2.jpg",
            title: "Simulink Onramp"
        },

        {
            src: "../../assets/images/certificates/matlab3.jpg",
            title: "Optimization Onramp"
        }

    ],

    reviewer: [

        {
            src: "../../assets/images/certificates/reviewer1.jpg",
            title: "Journal of Energy Storage Reviewer"
        },

        {
            src: "../../assets/images/certificates/reviewer2.jpg",
            title: "Applied Thermal Engineering Reviewer"
        }

    ],

    rsd: [

        {
            src: "../../assets/images/certificates/rsd1.jpg",
            title: "Research Scholar Day 2025"
        }

    ]

};


let currentCategory = [];
let currentIndex = 0;

const certificateModal =
new bootstrap.Modal(document.getElementById("certificateModal"));



/* ========================================= */

function openCertificates(category){

    currentCategory = certificateGallery[category];

    currentIndex = 0;

    updateCertificate();

    certificateModal.show();

}



/* ========================================= */

function updateCertificate(){

    document.getElementById("certificateImage").src =
        currentCategory[currentIndex].src;

    document.getElementById("certificateTitle").innerHTML =
        currentCategory[currentIndex].title;

    document.getElementById("certificateCounter").innerHTML =
        (currentIndex+1) + " / " + currentCategory.length;

}



/* ========================================= */

function nextCertificate(){

    currentIndex++;

    if(currentIndex>=currentCategory.length){

        currentIndex=0;

    }

    updateCertificate();

}



/* ========================================= */

function previousCertificate(){

    currentIndex--;

    if(currentIndex<0){

        currentIndex=currentCategory.length-1;

    }

    updateCertificate();

}



/* ========================================= */

document.addEventListener("keydown",function(e){

const modal=document.getElementById("certificateModal");

if(!modal.classList.contains("show")) return;

if(e.key==="ArrowRight"){

nextCertificate();

}

if(e.key==="ArrowLeft"){

previousCertificate();

}

});