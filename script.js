const contenedor = document.getElementById("productos");

fetch("data/productos.csv")
  .then(response => response.text())
  .then(csv => {

    const filas = csv.split("\n");

    for(let i = 1; i < filas.length; i++) {

      const columnas = filas[i].split(",");

      if(columnas.length < 5) continue;

      const producto = {
        categoria: columnas[0],
        imagen: columnas[1],
        nombre: columnas[2],
        precio: columnas[3],
        url: columnas[4]
      };

      contenedor.innerHTML += `
        <div class="card">
          ${producto.imagen}
          
          <div class="card-body">
            <small>${producto.categoria}</small>
            <h3>${producto.nombre}</h3>
            
            <p class="precio">${producto.precio}</p>
            
            ${producto.url}
              Ver producto
            </a>
          </div>
        </div>
      `;
    }
  });