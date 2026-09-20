const contenedor =
    document.getElementById("productos");
const botones =
    document.querySelectorAll(".catalog-filter");
const categoriasConSubmenu =
    document.querySelectorAll(".has-submenu");
const navegacion =
    document.querySelector(".category-navigation");
const hero =
    document.querySelector(".hero");
const menuCategorias =
    document.querySelector(".category-menu");
const cartButton =
    document.getElementById("cart-button");
const cartCount =
    document.getElementById("cart-count");
const cartPanel =
    document.getElementById("cart-panel");
const cartOverlay =
    document.getElementById("cart-overlay");
const cartClose =
    document.getElementById("cart-close");
const cartItems =
    document.getElementById("cart-items");
const cartTotal =
    document.getElementById("cart-total");
const clearCartButton =
    document.getElementById("clear-cart");
const checkoutButton =
    document.getElementById("checkout-button");
let carrito = cargarCarrito();
let pistaMovilMostrada = false;
let usuarioTocoMenu = false;
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
        producto.etiqueta ||
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
    const acciones =
        document.createElement("div");
    acciones.className =
        "product-actions";
    const enlace =
        document.createElement("a");
    enlace.href =
        producto.url || "#";
    enlace.textContent =
        "Ver producto";
    enlace.className =
        "product-link";
    enlace.target =
        "_blank";
    enlace.rel =
        "noopener noreferrer";
    const agregar =
        document.createElement("button");
    agregar.type =
        "button";
    agregar.className =
        "add-cart";
    agregar.textContent =
        "Agregar";
    agregar.addEventListener(
        "click",
        () => {
            agregarAlCarrito(producto);
            agregar.textContent =
                "Agregado";
            agregar.classList.add(
                "added"
            );
            setTimeout(() => {
                agregar.textContent =
                    "Agregar";
                agregar.classList.remove(
                    "added"
                );
            }, 900);
        }
    );
    acciones.append(
        enlace,
        agregar
    );
    body.append(
        categoria,
        titulo,
        precio,
        acciones
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
function esMovil() {
    return window.matchMedia(
        "(max-width: 575.98px)"
    ).matches;
}
function esEscritorio() {
    return window.matchMedia(
        "(min-width: 992px)"
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
                usuarioTocoMenu = true;
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
// Conservamos el mismo menú y sus eventos al cambiar de posición.
const heroCategorySlot = document.getElementById("hero-category-slot");
const navigationAnchor = document.getElementById("navigation-anchor");

function actualizarNavegacion() {
    if (!navegacion || !hero || !heroCategorySlot || !navigationAnchor) return;
    if (esEscritorio()) {
        navegacion.classList.remove("is-sticky");
        cartButton?.classList.remove("mobile-nav-active");
        cartButton?.style.removeProperty("--cart-bottom");
        const sticky = hero.getBoundingClientRect().bottom <= 0;
        if (sticky) {
            if (navegacion.parentElement === heroCategorySlot) {
                heroCategorySlot.style.height = navegacion.offsetHeight + "px";
            }
            navegacion.classList.add("desktop-sticky");
            if (navegacion.parentElement !== document.body) document.body.append(navegacion);
        } else {
            navegacion.classList.remove("desktop-sticky");
            if (navegacion.parentElement !== heroCategorySlot) heroCategorySlot.append(navegacion);
            heroCategorySlot.style.height = "";
        }
        return;
    }
    navegacion.classList.remove("desktop-sticky");
    heroCategorySlot.style.height = "";
    if (navigationAnchor.nextElementSibling !== navegacion) navigationAnchor.after(navegacion);
    const navRect = navegacion.getBoundingClientRect();
    const sticky = esMovil() && navRect.top <= 1;
    navegacion.classList.toggle("is-sticky", sticky);
    cartButton?.classList.toggle("mobile-nav-active", sticky);
    if (esMovil() && !sticky) {
        const bottom = Math.max(18, window.innerHeight - navRect.top + 16);
        cartButton?.style.setProperty("--cart-bottom", bottom + "px");
    } else {
        cartButton?.style.removeProperty("--cart-bottom");
    }
    if (sticky) mostrarPistaMenuMovil();
}

function mostrarPistaMenuMovil() {
    if (
        !esMovil() ||
        !menuCategorias ||
        pistaMovilMostrada ||
        usuarioTocoMenu
    ) {
        return;
    }
    if (
        menuCategorias.scrollWidth <=
        menuCategorias.clientWidth
    ) {
        return;
    }
    pistaMovilMostrada = true;
    setTimeout(() => {
        if (usuarioTocoMenu) {
            return;
        }
        menuCategorias.scrollTo({
            left: 55,
            behavior: "smooth"
        });
        setTimeout(() => {
            if (usuarioTocoMenu) {
                return;
            }
            menuCategorias.scrollTo({
                left: 15,
                behavior: "smooth"
            });
            setTimeout(() => {
                if (usuarioTocoMenu) {
                    return;
                }
                menuCategorias.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });
            }, 650);
        }, 700);
    }, 650);
}
if (menuCategorias) {
    const detectarInteraccion = () => {
        usuarioTocoMenu = true;
    };
    menuCategorias.addEventListener(
        "touchstart",
        detectarInteraccion,
        {
            passive: true
        }
    );
    menuCategorias.addEventListener(
        "pointerdown",
        detectarInteraccion,
        {
            passive: true
        }
    );
    menuCategorias.addEventListener(
        "wheel",
        detectarInteraccion,
        {
            passive: true
        }
    );
}
window.addEventListener(
    "scroll",
    actualizarNavegacion,
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
        actualizarNavegacion();
    }
);
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
        if (!dentroDelMenu) {
            cerrarSubmenus();
        }
    }
);
function cargarCarrito() {
    try {
        const guardado =
            localStorage.getItem(
                "dicfa-carrito"
            );
        return guardado
            ? JSON.parse(guardado)
            : [];
    } catch (error) {
        console.error(
            "No se pudo cargar el carrito.",
            error
        );
        return [];
    }
}
function guardarCarrito() {
    localStorage.setItem(
        "dicfa-carrito",
        JSON.stringify(carrito)
    );
}
function crearIdProducto(producto) {
    return (
        producto.url ||
        `${producto.nombre}-${producto.precio}`
    );
}
function precioANumero(precio) {
    if (!precio) {
        return 0;
    }
    const limpio =
        precio
            .replace(/[^\d.,-]/g, "")
            .replace(/,/g, "");
    const numero =
        parseFloat(limpio);
    return Number.isNaN(numero)
        ? 0
        : numero;
}
function formatoMoneda(valor) {
    return new Intl.NumberFormat(
        "es-MX",
        {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0
        }
    ).format(valor);
}
function agregarAlCarrito(producto) {
    const id =
        crearIdProducto(producto);
    const existente =
        carrito.find(
            (item) =>
                item.id === id
        );
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre:
                producto.nombre,
            precio:
                producto.precio,
            precioNumero:
                precioANumero(
                    producto.precio
                ),
            imagen:
                producto.imagen,
            url:
                producto.url || "#",
            cantidad: 1
        });
    }
    guardarCarrito();
    actualizarCarrito();
}
function cambiarCantidad(
    id,
    cambio
) {
    const producto =
        carrito.find(
            (item) =>
                item.id === id
        );
    if (!producto) {
        return;
    }
    producto.cantidad += cambio;
    if (
        producto.cantidad <= 0
    ) {
        eliminarProducto(id);
        return;
    }
    guardarCarrito();
    actualizarCarrito();
}
function eliminarProducto(id) {
    carrito =
        carrito.filter(
            (item) =>
                item.id !== id
        );
    guardarCarrito();
    actualizarCarrito();
}
function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}
function obtenerCantidadTotal() {
    return carrito.reduce(
        (total, producto) =>
            total + producto.cantidad,
        0
    );
}
function obtenerSubtotal() {
    return carrito.reduce(
        (total, producto) => {
            return (
                total +
                producto.precioNumero *
                producto.cantidad
            );
        },
        0
    );
}
function actualizarCarrito() {
    if (
        !cartItems ||
        !cartCount ||
        !cartTotal
    ) {
        return;
    }
    cartCount.textContent =
        obtenerCantidadTotal();
    cartTotal.textContent =
        formatoMoneda(
            obtenerSubtotal()
        );
    if (checkoutButton) {
        checkoutButton.disabled =
            carrito.length === 0;
    }
    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    🛍
                </div>
                <p>
                    Tu carrito está vacío
                </p>
                <span>
                    Agrega algún producto
                    para comenzar.
                </span>
            </div>
        `;
        return;
    }
    cartItems.innerHTML = "";
    carrito.forEach(
        (producto) => {
            const item =
                document.createElement(
                    "article"
                );
            item.className =
                "cart-item";
            const imagen =
                document.createElement(
                    "img"
                );
            imagen.className =
                "cart-item-image";
            imagen.src =
                producto.imagen;
            imagen.alt =
                producto.nombre;
            const info =
                document.createElement(
                    "div"
                );
            info.className =
                "cart-item-info";
            const titulo =
                document.createElement(
                    "h3"
                );
            titulo.textContent =
                producto.nombre;
            const precio =
                document.createElement(
                    "p"
                );
            precio.className =
                "cart-item-price";
            precio.textContent =
                formatoMoneda(
                    producto.precioNumero *
                    producto.cantidad
                );
            const controles =
                document.createElement(
                    "div"
                );
            controles.className =
                "cart-item-controls";
            const cantidad =
                document.createElement(
                    "div"
                );
            cantidad.className =
                "quantity-controls";
            const menos =
                document.createElement(
                    "button"
                );
            menos.type = "button";
            menos.className =
                "quantity-button";
            menos.textContent = "−";
            menos.setAttribute(
                "aria-label",
                `Disminuir ${producto.nombre}`
            );
            const numero =
                document.createElement(
                    "span"
                );
            numero.className =
                "quantity-number";
            numero.textContent =
                producto.cantidad;
            const mas =
                document.createElement(
                    "button"
                );
            mas.type = "button";
            mas.className =
                "quantity-button";
            mas.textContent = "+";
            mas.setAttribute(
                "aria-label",
                `Aumentar ${producto.nombre}`
            );
            const eliminar =
                document.createElement(
                    "button"
                );
            eliminar.type =
                "button";
            eliminar.className =
                "remove-item";
            eliminar.textContent =
                "Eliminar";
            menos.addEventListener(
                "click",
                () => {
                    cambiarCantidad(
                        producto.id,
                        -1
                    );
                }
            );
            mas.addEventListener(
                "click",
                () => {
                    cambiarCantidad(
                        producto.id,
                        1
                    );
                }
            );
            eliminar.addEventListener(
                "click",
                () => {
                    eliminarProducto(
                        producto.id
                    );
                }
            );
            cantidad.append(
                menos,
                numero,
                mas
            );
            controles.append(
                cantidad,
                eliminar
            );
            info.append(
                titulo,
                precio,
                controles
            );
            item.append(
                imagen,
                info
            );
            cartItems.appendChild(
                item
            );
        }
    );
}
function abrirCarrito() {
    if (
        !cartPanel ||
        !cartOverlay
    ) {
        return;
    }
    cartPanel.classList.add(
        "open"
    );
    cartOverlay.classList.add(
        "active"
    );
    cartPanel.setAttribute(
        "aria-hidden",
        "false"
    );
    document.body.classList.add(
        "cart-open"
    );
}
function cerrarCarrito() {
    if (
        !cartPanel ||
        !cartOverlay
    ) {
        return;
    }
    cartPanel.classList.remove(
        "open"
    );
    cartOverlay.classList.remove(
        "active"
    );
    cartPanel.setAttribute(
        "aria-hidden",
        "true"
    );
    document.body.classList.remove(
        "cart-open"
    );
}
if (cartButton) {
    cartButton.addEventListener(
        "click",
        abrirCarrito
    );
}
if (cartClose) {
    cartClose.addEventListener(
        "click",
        cerrarCarrito
    );
}
if (cartOverlay) {
    cartOverlay.addEventListener(
        "click",
        cerrarCarrito
    );
}
if (clearCartButton) {
    clearCartButton.addEventListener(
        "click",
        () => {
            if (
                carrito.length === 0
            ) {
                return;
            }
            vaciarCarrito();
        }
    );
}
if (checkoutButton) {
    checkoutButton.addEventListener(
        "click",
        () => {
            if (
                carrito.length === 0
            ) {
                return;
            }
            alert(
                "La pasarela de pago todavía no está implementada."
            );
        }
    );
}
document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape"
        ) {
            cerrarCarrito();
            cerrarSubmenus();
        }
    }
);
actualizarNavegacion();
actualizarCarrito();
if (contenedor) {
    renderProductos(
        "data/nike_hombre_calzado.csv"
    );
}

window.addEventListener("load", actualizarNavegacion);
