const contenedor = document.getElementById("productos");

if (!contenedor) {
  console.error("No se encontró el contenedor #productos en el HTML.");
} else {
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
      } else if ((caracter === "\n" || caracter === "\r") && !dentroDeComillas) {
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

    const body = document.createElement("div");
    body.className = "card-body";

    const categoria = document.createElement("small");
    categoria.textContent = producto.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = producto.precio;

    const enlace = document.createElement("a");
    // enlace.href = producto.url;
    enlace.textContent = "Ver producto";
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    body.append(categoria, titulo, precio, enlace);
    card.append(imagen, body);
    return card;
  }

  fetch("data/nike_hombre_calzado.csv")
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo CSV.");
      }
      return response.text();
    })
    .then((csv) => {
      const filas = parseCSV(csv);
      if (filas.length < 2) {
        throw new Error("El CSV no tiene datos válidos.");
      }

      const cabeceras = filas[0].map((columna) => columna.trim());
      const productos = filas.slice(1).map((fila) => {
        const producto = {};
        cabeceras.forEach((cabecera, indice) => {
          producto[cabecera] = (fila[indice] || "").trim();
        });
        return producto;
      });

      const registrosValidos = productos.filter(
        (producto) => producto.nombre && producto.url && producto.imagen
      );

      contenedor.innerHTML = "";
      registrosValidos.forEach((producto) => {
        contenedor.appendChild(crearCard(producto));
      });
    })
    .catch((error) => {
      console.error(error);
      contenedor.innerHTML = `
        <div class="alert alert-danger" role="alert">
          No se pudo cargar el catálogo desde CSV. Abre la página desde un servidor local, por ejemplo:
          <code>python -m http.server 8000</code> y luego visita <code>http://localhost:8000</code>.
        </div>
      `;
    });
}