var db = firebase.database();
var fecha = "20/10/2024"

document.getElementById('repartidorForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    
    const numeroRuta = document.getElementById('numeroRuta').value;
    const telefono = document.getElementById('telefono').value;
    console.log(telefono)
    const nuevoRepartidorRef = db.ref('repartidores').push();
    nuevoRepartidorRef.set({
        nombre: nombre,
        numero_ruta: numeroRuta,
        telefono: telefono
    });

    document.getElementById('repartidorForm').reset();
    mostrarRepartidores();
});

function pdfcall(){
    let table = document.getElementById("resultadosRango")
    console.log(table.childElementCount)
    var doc = new jsPDF();
    console.log(datos)
    var nombre = document.getElementById("filtrarRepartidorRango").textContent
    var fechaIni = document.getElementById("fechaInicio").value
    var fechaFin = document.getElementById("fechaFin").value
    console.log(nombre)
    doc.setFontSize(10);
    doc.text(10,10,"Resumen de " + nombre)
    doc.text(10,20,"Fecha de " + fechaIni + " a " + fechaFin)
    doc.setFontSize(15);
    doc.text(30,45,"Fecha")
    doc.text(100,45,"paquetes")
    doc.setFontSize(10);
    doc.line(10, 47, 190, 47);
    let medida = 55
    datos.forEach(dia =>{
        doc.text(30,medida, dia.fecha)
        doc.text(110,medida, dia.paquetes.toString())
        console.log(dia.paquetes)
        //doc.text(30,medida, dia.paquetes)
        medida += 5

    })
    
    doc.save("Resumen");
}

function mostrarRepartidores() {
    const repartidoresList = document.getElementById('repartidoresList');
    repartidoresList.innerHTML = ''; // Limpiar el contenido previo

    db.ref('repartidores').on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const repartidor = childSnapshot.val();

            // Crear elementos de la tarjeta Bootstrap
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card border-info mb-3';
            cardDiv.style.maxWidth = '20rem';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const nombre = document.createElement('h4');
            nombre.className = 'card-title';
            nombre.textContent = repartidor.nombre;

            const numeroRuta = document.createElement('h4');
            numeroRuta.className = 'card-title';
            numeroRuta.textContent = repartidor.numero_ruta;

            const telefono = document.createElement('h4');
            telefono.className = 'card-title';
            telefono.textContent = repartidor.telefono;

            // Botón para eliminar repartidor
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-primary';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.onclick = function() {
                db.ref('repartidores/' + childSnapshot.key).remove();
                mostrarRepartidores(); // Actualizar la lista después de eliminar
            };

            // Agregar elementos al cuerpo de la tarjeta
            cardBody.appendChild(nombre);
            cardBody.appendChild(numeroRuta);
            cardBody.appendChild(telefono);
            cardBody.appendChild(deleteBtn);

            // Agregar el cuerpo de la tarjeta al contenedor principal de la tarjeta
            cardDiv.appendChild(cardBody);

            // Agregar la tarjeta completa al contenedor de repartidores
            repartidoresList.appendChild(cardDiv);
        });
    });
}


mostrarRepartidores();


// Poblar el select con los repartidores
function poblarSelects() {
    const repartidorSelect = document.getElementById('repartidorSelect');
    
    repartidorSelect.innerHTML = '';
   

    db.ref('repartidores').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const repartidor = childSnapshot.val();
            const option = document.createElement('option');
            option.value = childSnapshot.key;
            option.textContent = repartidor.nombre;
            repartidorSelect.appendChild(option);
            
        });
    });
}

// Registrar seguimiento
document.getElementById('seguimientoForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const repartidorId = document.getElementById('repartidorSelect').value;
    const fecha = document.getElementById('fecha').value;
    const paquetes = parseInt(document.getElementById('paquetes').value, 10);

    db.ref('seguimiento/' + repartidorId + '/' + fecha).set({
        paquetes: paquetes
    });

    document.getElementById('paquetes').value = "";
    alert("Datos registrados");
});

// Filtrar por repartidor y fecha


poblarSelects();

let datos = []
class dia{

    constructor(fecha,paquetes){
        this.fecha = fecha
        this.paquetes = paquetes
    }
}


document.getElementById('rangoFechaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const repartidorId = document.getElementById('filtrarRepartidorRango').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    const resultadosRango = document.getElementById('resultadosRango');
    resultadosRango.innerHTML = '';

    if (new Date(fechaInicio) > new Date(fechaFin)) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
    }

    const ref = db.ref('seguimiento/' + repartidorId);

    ref.once('value', function(snapshot) {
        let totalPaquetes = 0;
        let cantidadValores = snapshot.numChildren();
        

        // Crear la tabla
        const table = document.createElement('table');
        table.id = "dias-trabajados"
        table.className = 'table table-striped';
        
        // Crear el encabezado de la tabla
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Fecha</th>
                <th>Paquetes</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        snapshot.forEach(function(childSnapshot) {
            const fecha = childSnapshot.key;
            const data = childSnapshot.val();

            if (fecha >= fechaInicio && fecha <= fechaFin) {
                totalPaquetes += data.paquetes;

                datos.push(new dia(fecha,data.paquetes))
                // Crear una fila para cada fecha y número de paquetes
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${fecha}</td>
                    <td>${data.paquetes}</td>
                `;
                tbody.appendChild(tr);
            }
        });
        console.log(datos)
        // Añadir el cuerpo de la tabla
        table.appendChild(tbody);

        // Añadir la tabla al contenedor de resultados
        resultadosRango.appendChild(table);

        // Mostrar el total de paquetes
        const totalP = document.createElement('p');
        totalP.textContent = `Total de paquetes repartidos: ${totalPaquetes}`;
        const totalD = document.createElement('p')
        totalD.textContent = `Total de dias trabajados: ${cantidadValores}`
        resultadosRango.appendChild(totalD);
        resultadosRango.appendChild(totalP);
    });
});


// Reutilizar la función para poblar los selects de repartidores
function poblarSelectRango() {
    const filtrarRepartidorRango = document.getElementById('filtrarRepartidorRango');
    filtrarRepartidorRango.innerHTML = '';

    db.ref('repartidores').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            const repartidor = childSnapshot.val();
            const option = document.createElement('option');
            option.value = childSnapshot.key;
            option.textContent = repartidor.nombre;
            filtrarRepartidorRango.appendChild(option);
        });
    });
}

// Llamada inicial para poblar el select al cargar la página
poblarSelectRango();

