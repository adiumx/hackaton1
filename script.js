const contenedor =
    document.getElementById("productos");

const botones =
    document.querySelectorAll(".catalog-filter");

const categoriasConSubmenu =
    document.querySelectorAll(".has-submenu");

const navegacion =
    document.querySelector(".category-navigation");


// Catálogo

function parseCSV(texto) {

    const filas = [];

    let filaActual = [];
    let valorActual = "";
    let dentroDeComillas = false;


    for (let i = 0; i < texto.length; i++) {

        const caracter = texto[i];
        const siguiente = texto[i + 1];


        if (caracter === '"') {

            if (
                dentroDeComillas &&
                siguiente === '"'
            ) {

                valorActual += '"';
                i++;

            } else {

                dentroDeComillas =
                    !dentroDeComillas;

            }

        } else if (
            caracter === "," &&
            !dentroDeComillas
        ) {

            filaActual.push(valorActual);

            valorActual = "";

        } else if (
            (
                caracter === "\n" ||
                caracter === "\r"
            ) &&
            !dentroDeComillas
        ) {

            if (
                caracter === "\r" &&
                siguiente === "\n"
            ) {
                i++;
            }


            filaActual.push(valorActual);


            if (
                filaActual.some(
                    (celda) =>
                        celda.trim() !== ""
                )
            ) {

                filas.push(filaActual);

            }


            filaActual = [];
            valorActual = "";

        } else {

            valorActual += caracter;

        }

    }


    if (
        valorActual.length > 0 ||
        filaActual.length > 0
    ) {

        filaActual.push(valorActual);


        if (
            filaActual.some(
                (celda) =>
                    celda.trim() !== ""
            )
        ) {

            filas.push(filaActual);

        }

    }


    return filas;
}


function crearCard(producto) {

    const card =
        document.createElement("article");

    card.className = "card";


    const imagen =
        document.createElement("img");

    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.className = "card-img-top";
    imagen.loading = "lazy";


    const body =
        document.createElement("div");

    body.className = "card-body";


    const categoria =
        document.createElement("small");

    categoria.textContent =
        producto.categoria ||
        "Colección";


    const titulo =
        document.createElement("h3");

    titulo.textContent =
        producto.nombre;


    const precio =
        document.createElement("p");

    precio.className = "precio";

    precio.textContent =
        producto.precio;


    const enlace =
        document.createElement("a");

    enlace.href =
        producto.url || "#";

    enlace.textContent =
        "Ver producto";

    enlace.target = "_blank";

    enlace.rel =
        "noopener noreferrer";


    body.append(
        categoria,
        titulo,
        precio,
        enlace
    );


    card.append(
        imagen,
        body
    );


    return card;
}


function renderProductos(csvPath) {

    if (!contenedor) {

        console.error(
            "No se encontró el contenedor #productos."
        );

        return;
    }


    contenedor.innerHTML = "";


    fetch(csvPath)

        .then((response) => {

            if (!response.ok) {

                throw new Error(
                    "No se pudo cargar el archivo CSV."
                );

            }


            return response.text();

        })

        .then((csv) => {

            const filas =
                parseCSV(csv);


            if (filas.length < 2) {

                throw new Error(
                    "El CSV no tiene datos válidos."
                );

            }


            const cabeceras =
                filas[0].map(
                    (columna) =>
                        columna.trim()
                );


            const productos =
                filas
                    .slice(1)
                    .map((fila) => {

                        const producto = {};


                        cabeceras.forEach(
                            (
                                cabecera,
                                indice
                            ) => {

                                producto[cabecera] =
                                    (
                                        fila[indice] ||
                                        ""
                                    ).trim();

                            }
                        );


                        return producto;

                    });


            const registrosValidos =
                productos.filter(
                    (producto) =>
                        producto.nombre &&
                        producto.imagen
                );


            if (
                registrosValidos.length === 0
            ) {

                contenedor.innerHTML = `
                    <div
                        class="alert alert-warning"
                        role="alert"
                    >
                        No hay productos disponibles
                        en esta categoría.
                    </div>
                `;

                return;
            }


            registrosValidos.forEach(
                (producto) => {

                    contenedor.appendChild(
                        crearCard(producto)
                    );

                }
            );

        })

        .catch((error) => {

            console.error(error);


            contenedor.innerHTML = `
                <div
                    class="alert alert-danger"
                    role="alert"
                >
                    No se pudo cargar el catálogo
                    desde CSV.
                </div>
            `;

        });

}


// Filtros

botones.forEach((boton) => {

    boton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const archivo =
                boton.dataset.file;


            if (!archivo) {
                return;
            }


            renderProductos(archivo);

            cerrarSubmenus();


            const catalogo =
                document.getElementById(
                    "catalogo"
                );


            if (catalogo) {

                setTimeout(() => {

                    catalogo.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 100);

            }

        }
    );

});


// Menú móvil

function esMovil() {

    return window.matchMedia(
        "(max-width: 575.98px)"
    ).matches;

}


function cerrarSubmenus(
    excepcion = null
) {

    categoriasConSubmenu.forEach(
        (categoria) => {

            if (
                categoria === excepcion
            ) {
                return;
            }


            categoria.classList.remove(
                "mobile-open"
            );


            const enlace =
                categoria.querySelector(
                    ":scope > .category-link"
                );


            if (enlace) {

                enlace.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


categoriasConSubmenu.forEach(
    (categoria) => {

        const enlace =
            categoria.querySelector(
                ":scope > .category-link"
            );


        if (!enlace) {
            return;
        }


        enlace.addEventListener(
            "click",
            (event) => {

                if (!esMovil()) {
                    return;
                }


                event.preventDefault();


                const estabaAbierto =
                    categoria.classList.contains(
                        "mobile-open"
                    );


                cerrarSubmenus(categoria);


                if (estabaAbierto) {

                    categoria.classList.remove(
                        "mobile-open"
                    );

                    enlace.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                } else {

                    categoria.classList.add(
                        "mobile-open"
                    );

                    enlace.setAttribute(
                        "aria-expanded",
                        "true"
                    );


                    enlace.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center"
                    });

                }

            }
        );

    }
);


// Detecta cuando el navbar llegó arriba

function actualizarNavbar() {

    if (!navegacion) {
        return;
    }


    if (!esMovil()) {

        navegacion.classList.remove(
            "is-sticky"
        );

        return;
    }


    const posicion =
        navegacion.getBoundingClientRect();


    if (posicion.top <= 1) {

        navegacion.classList.add(
            "is-sticky"
        );

    } else {

        navegacion.classList.remove(
            "is-sticky"
        );

    }

}


window.addEventListener(
    "scroll",
    actualizarNavbar,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    () => {

        if (!esMovil()) {
            cerrarSubmenus();
        }


        actualizarNavbar();

    }
);


actualizarNavbar();


// Cierra el submenú al tocar fuera

document.addEventListener(
    "click",
    (event) => {

        if (!esMovil()) {
            return;
        }


        const dentroDelMenu =
            event.target.closest(
                ".category-navigation"
            );


        const dentroDelSubmenu =
            event.target.closest(
                ".submenu"
            );


        if (
            !dentroDelMenu &&
            !dentroDelSubmenu
        ) {

            cerrarSubmenus();

        }

    }
);


// Catálogo inicial

if (contenedor) {

    renderProductos(
        "data/nike_hombre_calzado.csv"
    );

}