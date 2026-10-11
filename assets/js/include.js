document.addEventListener("DOMContentLoaded", () => {

    loadComponent("navbar-home", "/components/navbar-home.html");

    loadComponent("navbar-pages", "/components/navbar-pages.html");

    loadComponent("footer", "/components/footer.html");

});

function loadComponent(id, file){

    const target = document.getElementById(id);

    if(!target) return;

    fetch(file)
        .then(response => {

            if(!response.ok){

                throw new Error(file);

            }

            return response.text();

        })
        .then(data => {

            target.innerHTML = data;

        })
        .catch(error => {

            console.error("Cannot load:", file);

        });

}