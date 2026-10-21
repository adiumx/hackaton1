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
    // Conserva los términos de búsqueda sin mostrar la descripción en la tarjeta.
    card.dataset.search = `${producto.nombre} ${producto.categoria || producto.etiqueta || ""}`;
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
        document.createElement("button");
    enlace.type = "button";
    enlace.textContent =
        "Ver producto";
    enlace.className =
        "product-link";
    enlace.addEventListener("click", () => mostrarProducto(producto));
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
let solicitudCatalogo = 0;
async function cargarCatalogo(csvPath) {
    const copiaLocal = window.DICFA_CATALOGOS?.[csvPath];
    // Los navegadores bloquean fetch al abrir un HTML directamente desde la carpeta.
    if (window.location.protocol === "file:" && copiaLocal !== undefined) return copiaLocal;
    try {
        const respuesta = await fetch(csvPath);
        if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo.");
        return await respuesta.text();
    } catch (error) {
        if (copiaLocal !== undefined) return copiaLocal;
        throw error;
    }
}
function renderProductos(csvPath) {
    const solicitud = ++solicitudCatalogo;
    if (!contenedor) {
        console.error(
            "No se encontró el contenedor #productos."
        );
        return;
    }
    contenedor.innerHTML = "";
    cargarCatalogo(csvPath)
        .then((csv) => {
            if (solicitud !== solicitudCatalogo) return;
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
            if (solicitud !== solicitudCatalogo) return;
            console.error(error);
            contenedor.innerHTML = `
                <div
                    class="alert alert-danger"
                    role="alert"
                >
                    No pudimos mostrar esta categoría. Intenta volver a seleccionarla.
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
            const categoria = boton.closest(".category-item")?.querySelector(".category-name")?.textContent.trim();
            document.getElementById("catalog-category").textContent = `Viendo: ${categoria ? categoria + " · " : ""}${boton.textContent.trim()}`;
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
        "(max-width: 991.98px)"
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
                event.preventDefault();
                if (!esMovil()) {
                    return;
                }
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
                    menuCategorias.scrollTo({
                        left: menuCategorias.scrollLeft + enlace.getBoundingClientRect().left - menuCategorias.getBoundingClientRect().left - (menuCategorias.clientWidth - enlace.offsetWidth) / 2,
                        behavior: "smooth",
                    });
                }
            }
        );
    }
);
// Conservamos el mismo menú y sus eventos al cambiar de posición.
const heroCategorySlot = document.getElementById("hero-category-slot");
const navigationAnchor = document.getElementById("navigation-anchor");
const searchHeader = document.getElementById("search-header");

let estadoNavegacion = "";
function actualizarNavegacion() {
    if (!navegacion || !hero || !heroCategorySlot || !navigationAnchor) return;
    const headerHeight = searchHeader.offsetHeight;
    const alto = headerHeight + "px";
    if (document.documentElement.style.getPropertyValue("--search-height") !== alto) {
        document.documentElement.style.setProperty("--search-height", alto);
    }
    const escritorio = esEscritorio();
    const limite = escritorio ? hero.getBoundingClientRect().bottom : navigationAnchor.getBoundingClientRect().top;
    const fijo = limite <= headerHeight;
    const nuevoEstado = (escritorio ? "desktop" : "mobile") + (fijo ? "-fixed" : "-hero");
    if (nuevoEstado === estadoNavegacion) return;

    // Cambiamos de lugar el menú solo al cruzar el límite del hero.
    if (escritorio) {
        navigationAnchor.style.height = "";
        if (fijo && navegacion.parentElement === heroCategorySlot) {
            heroCategorySlot.style.height = navegacion.offsetHeight + "px";
        }
        if (!fijo) heroCategorySlot.style.height = "";
    } else {
        heroCategorySlot.style.height = "";
        navigationAnchor.style.height = fijo ? "58px" : "";
    }
    navegacion.classList.toggle("desktop-sticky", escritorio && fijo);
    navegacion.classList.toggle("is-sticky", !escritorio && fijo);
    if (fijo) document.body.append(navegacion);
    else if (escritorio) heroCategorySlot.append(navegacion);
    else navigationAnchor.after(navegacion);
    estadoNavegacion = nuevoEstado;
    if (!escritorio && fijo) mostrarPistaMenuMovil();
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
        const datos = guardado ? JSON.parse(guardado) : [];
        return Array.isArray(datos) ? datos.filter(item => item && typeof item.id === "string" && Number.isFinite(item.cantidad) && item.cantidad > 0 && Number.isFinite(item.precioNumero)) : [];
    } catch (error) {
        console.error(
            "No se pudo cargar el carrito.",
            error
        );
        return [];
    }
}
function guardarCarrito() {
    try { localStorage.setItem("dicfa-carrito", JSON.stringify(carrito)); }
    catch (error) { console.error("No se pudo guardar el carrito.", error); }
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
    cartPanel.inert = false;
    cartButton?.setAttribute("aria-expanded", "true");
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
    cartClose.focus({ preventScroll: true });
}
function cerrarCarrito() {
    if (
        !cartPanel ||
        !cartOverlay
    ) {
        return;
    }
    const estabaAbierto = cartPanel.classList.contains("open");
    cartPanel.inert = true;
    cartButton?.setAttribute("aria-expanded", "false");
    if (estabaAbierto) cartButton?.focus({preventScroll:true});
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
            mostrarResumenDemo();
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

// Búsqueda dentro de la categoría actual.
const searchInput = document.getElementById("product-search");
const searchStatus = document.getElementById("search-status");
function filtrarBusqueda() {
    const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const consulta = normalizar(searchInput.value.trim());
    let visibles = 0;
    contenedor.querySelectorAll(".card").forEach(card => {
        card.hidden = !normalizar(card.dataset.search || card.querySelector("h3").textContent).includes(consulta);
        if (!card.hidden) visibles++;
    });
    searchStatus.hidden = !consulta;
    searchStatus.textContent = visibles + " productos encontrados en esta categoría.";
}
document.getElementById("header-search").addEventListener("submit", event => {
    event.preventDefault();
    filtrarBusqueda();
    document.getElementById("catalogo").scrollIntoView({behavior:"smooth", block:"start"});
});
searchInput.addEventListener("input", filtrarBusqueda);
new MutationObserver(filtrarBusqueda).observe(contenedor, {childList:true});
new ResizeObserver(actualizarNavegacion).observe(searchHeader);

// Recorridos de demostración: todo permanece dentro del sitio.
const productDialog = document.getElementById("product-dialog");
const checkoutDialog = document.getElementById("checkout-dialog");
let productoEnVista = null;

function mostrarProducto(producto) {
    productoEnVista = producto;
    const imagen = document.getElementById("product-detail-image");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    document.getElementById("product-dialog-title").textContent = producto.nombre;
    document.getElementById("product-detail-category").textContent = producto.categoria || producto.etiqueta || "Colección";
    document.getElementById("product-detail-price").textContent = producto.precio;
    document.getElementById("product-detail-status").textContent = "";
    productDialog.showModal();
}

document.getElementById("product-detail-add").addEventListener("click", () => {
    if (!productoEnVista) return;
    agregarAlCarrito(productoEnVista);
    document.getElementById("product-detail-status").textContent = "Producto agregado. Puedes seguir explorando o abrir tu carrito.";
});

function mostrarResumenDemo() {
    const lista = document.getElementById("demo-order-items");
    lista.replaceChildren();
    carrito.forEach(producto => {
        const fila = document.createElement("li");
        const nombre = document.createElement("span");
        const importe = document.createElement("strong");
        nombre.textContent = `${producto.nombre} × ${producto.cantidad}`;
        importe.textContent = formatoMoneda(producto.precioNumero * producto.cantidad);
        fila.append(nombre, importe);
        lista.append(fila);
    });
    document.getElementById("demo-order-total").textContent = formatoMoneda(obtenerSubtotal());
    document.getElementById("demo-order-status").hidden = true;
    document.getElementById("simulate-order").disabled = false;
    cerrarCarrito();
    checkoutDialog.showModal();
}

document.getElementById("simulate-order").addEventListener("click", event => {
    event.currentTarget.disabled = true;
    const estado = document.getElementById("demo-order-status");
    estado.textContent = "¡Simulación completada! Este es un pedido ficticio: no se guardó ni se envió a ninguna tienda. Tu carrito sigue disponible para continuar probando.";
    estado.hidden = false;
    estado.focus();
});

document.querySelectorAll("[data-close-dialog]").forEach(boton => {
    boton.addEventListener("click", () => boton.closest("dialog").close());
});
checkoutDialog.addEventListener("close", () => cartButton.focus({ preventScroll: true }));
document.getElementById("footer-cart").addEventListener("click", abrirCarrito);

// Evita que el teclado salga del panel del carrito mientras está abierto.
document.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !cartPanel.classList.contains("open")) return;
    const controles = [...cartPanel.querySelectorAll("button:not(:disabled), a[href], input:not(:disabled), [tabindex='0']")];
    const primero = controles[0];
    const ultimo = controles[controles.length - 1];
    if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault(); ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault(); primero.focus();
    }
});
