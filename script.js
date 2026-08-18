/* ==================================
   PANEL LATERAL
   ================================== */

const panelLateral = document.getElementById("panel-lateral");
const panelOverlay = document.getElementById("panel-overlay");
const cerrarPanelBtn = document.getElementById("cerrar-panel");
const panelTitulo = document.getElementById("panel-titulo");
const panelContenido = document.getElementById("panel-contenido");
const botonesPanel = document.querySelectorAll(".panel-btn");

let ultimoBotonPanel = null;

const contenidosPanel = {
  perfil: {
    titulo: "Mi perfil",
    contenido: `
      <div class="contenido-perfil">
        <i class="fas fa-circle-user panel-icono" aria-hidden="true"></i>

        <h3>Bienvenido a DICFA SPORT</h3>

        <p>
          Inicia sesión para consultar tus datos personales,
          pedidos y direcciones de envío.
        </p>

        <button class="panel-accion" type="button">
          Iniciar sesión
        </button>
      </div>
    `,
  },

  favoritos: {
    titulo: "Mis favoritos",
    contenido: `
      <div class="contenido-favoritos">
        <i class="fas fa-heart panel-icono" aria-hidden="true"></i>

        <h3>Tus productos favoritos</h3>

        <p>
          Todavía no has agregado productos a tu lista de favoritos.
        </p>

        <a
          class="panel-accion cerrar-al-navegar"
          href="#productos"
        >
          Explorar productos
        </a>
      </div>
    `,
  },

  carrito: {
    titulo: "Mi carrito",
    contenido: `
      <div class="contenido-carrito">
        <i
          class="fas fa-shopping-cart panel-icono"
          aria-hidden="true"
        ></i>

        <h3>Tu carrito está vacío</h3>

        <p>
          Agrega productos al carrito para comenzar tu compra.
        </p>

        <a
          class="panel-accion cerrar-al-navegar"
          href="#productos"
        >
          Ver productos
        </a>
      </div>
    `,
  },
};

function abrirPanel(tipo, botonPresionado) {
  const datos = contenidosPanel[tipo];

  if (!datos) {
    return;
  }

  ultimoBotonPanel = botonPresionado;

  panelTitulo.textContent = datos.titulo;
  panelContenido.innerHTML = datos.contenido;

  panelLateral.classList.add("abierto");
  panelOverlay.classList.add("visible");
  document.body.classList.add("panel-abierto");

  panelLateral.setAttribute("aria-hidden", "false");

  cerrarPanelBtn.focus();
}

function cerrarPanel() {
  const estabaAbierto = panelLateral.classList.contains("abierto");

  panelLateral.classList.remove("abierto");
  panelOverlay.classList.remove("visible");
  document.body.classList.remove("panel-abierto");

  panelLateral.setAttribute("aria-hidden", "true");

  if (estabaAbierto && ultimoBotonPanel) {
    ultimoBotonPanel.focus();
  }
}

botonesPanel.forEach((boton) => {
  boton.addEventListener("click", () => {
    abrirPanel(boton.dataset.panel, boton);
  });
});

cerrarPanelBtn.addEventListener("click", cerrarPanel);
panelOverlay.addEventListener("click", cerrarPanel);

document.addEventListener("keydown", (evento) => {
  if (
    evento.key === "Escape" &&
    panelLateral.classList.contains("abierto")
  ) {
    cerrarPanel();
  }
});

panelContenido.addEventListener("click", (evento) => {
  if (evento.target.closest(".cerrar-al-navegar")) {
    cerrarPanel();
  }
});

/* ==================================
   CATÁLOGO DE PRODUCTOS
   ================================== */

const contenedor = document.getElementById("productos");
const botones = document.querySelectorAll(".filter-btn");

function parseCSV(texto) {
  const filas = [];
  let filaActual = [];
  let valorActual = "";
  let dentroDeComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i];
    const siguiente = texto[i + 1];

    if (caracter === '"') {
      if (dentroDeComillas && siguiente === '"') {
        valorActual += '"';
        i++;
      } else {
        dentroDeComillas = !dentroDeComillas;
      }
    } else if (caracter === "," && !dentroDeComillas) {
      filaActual.push(valorActual);
      valorActual = "";
    } else if (
      (caracter === "\n" || caracter === "\r") &&
      !dentroDeComillas
    ) {
      if (caracter === "\r" && siguiente === "\n") {
        i++;
      }

      filaActual.push(valorActual);

      if (filaActual.some((celda) => celda.trim() !== "")) {
        filas.push(filaActual);
      }

      filaActual = [];
      valorActual = "";
    } else {
      valorActual += caracter;
    }
  }

  if (valorActual.length > 0 || filaActual.length > 0) {
    filaActual.push(valorActual);

    if (filaActual.some((celda) => celda.trim() !== "")) {
      filas.push(filaActual);
    }
  }

  return filas;
}

function crearCard(producto) {
  const card = document.createElement("article");
  card.className = "card";

  const imagen = document.createElement("img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;
  imagen.className = "card-img-top";
  imagen.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card-body";

  const categoria = document.createElement("small");
  categoria.textContent = producto.categoria || "Colección";

  const titulo = document.createElement("h3");
  titulo.textContent = producto.nombre;

  const precio = document.createElement("p");
  precio.className = "precio";
  precio.textContent = producto.precio || "Precio no disponible";

  const enlace = document.createElement("a");
  enlace.href =  "#";
  enlace.textContent = "Ver producto";

  if (producto.url) {
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
  }

  body.append(categoria, titulo, precio, enlace);
  card.append(imagen, body);

  return card;
}

function mostrarMensajeCarga() {
  contenedor.innerHTML = `
    <div class="alert alert-secondary grid-column-completa" role="status">
      Cargando productos...
    </div>
  `;
}

function mostrarError(mensaje) {
  contenedor.innerHTML = "";

  const alerta = document.createElement("div");
  alerta.className = "alert alert-danger";
  alerta.setAttribute("role", "alert");
  alerta.textContent = mensaje;

  contenedor.appendChild(alerta);
}

function renderProductos(csvPath) {
  if (!contenedor || !csvPath) {
    return;
  }

  mostrarMensajeCarga();

  fetch(csvPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `No se pudo cargar el archivo CSV: ${csvPath}`
        );
      }

      return response.text();
    })
    .then((csv) => {
      const filas = parseCSV(csv);

      if (filas.length < 2) {
        throw new Error("El CSV no tiene datos válidos.");
      }

      const cabeceras = filas[0].map((columna) =>
        columna.replace(/^\uFEFF/, "").trim()
      );

      const productos = filas.slice(1).map((fila) => {
        const producto = {};

        cabeceras.forEach((cabecera, indice) => {
          producto[cabecera] = (fila[indice] || "").trim();
        });

        return producto;
      });

      const registrosValidos = productos.filter(
        (producto) => producto.nombre && producto.imagen
      );

      contenedor.innerHTML = "";

      if (registrosValidos.length === 0) {
        mostrarError("No se encontraron productos en el archivo.");
        return;
      }

      const fragmento = document.createDocumentFragment();

      registrosValidos.forEach((producto) => {
        fragmento.appendChild(crearCard(producto));
      });

      contenedor.appendChild(fragmento);
    })
    .catch((error) => {
      console.error(error);

      mostrarError(
        "No se pudo cargar el catálogo desde el archivo CSV."
      );
    });
}

if (!contenedor) {
  console.error(
    "No se encontró el contenedor #productos en el HTML."
  );
} else {
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      botones.forEach((btn) => {
        btn.classList.remove("active");
      });

      boton.classList.add("active");

      renderProductos(boton.dataset.file);
    });
  });

  renderProductos("data/nike_hombre_calzado.csv");
}