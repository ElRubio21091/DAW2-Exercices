import { DniDuplicadoError, SocioNoEncontradoError } from "./errores.js";
import { precioEntrada, ejecutarConRetardo, maximo, getObjectByValue, getObjectsByValue, getObjectsByPattern, getObjectsInRange, mostrarTabla, } from "./utils.js";
import { Gimnasio, Entrenador } from "./gimnasio.js";
import { palabrasAleatorias, mostrarConSeparador, quitarRepetidas, quitarRepetidasOrdenado, buscarPalabra, medir, } from "./palabras.js";
function obtener(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`No existe el elemento #${id}`);
    return el;
}
const salida = obtener("salida");
function escribir(texto) {
    const p = document.createElement("p");
    p.textContent = texto;
    salida.appendChild(p);
}
function ejercicio1() {
    escribir(`1a) 10, 20, 5, true -> ${precioEntrada(10, 20, 5, true)}`);
    escribir(`1a) 10, 20, 5, false -> ${precioEntrada(10, 20, 5, false)}`);
    escribir(`1a) dato inválido -> ${precioEntrada(10, NaN, 5, true)}`);
    ejecutarConRetardo(() => escribir("1b) Mensaje tras 2 segundos"), 2);
    escribir(`1c) máximo(3, 9, 4) -> ${maximo(3, 9, 4)}`);
    escribir(`1c) máximo() -> ${maximo()}`);
}
const videojuegos = [
    { codigo: "V1", titulo: "Zelda", precio: 59.99, plataforma: "Switch", pegi: 12 },
    { codigo: "V2", titulo: "FIFA", precio: 69.9, plataforma: "PS5", pegi: 3, descuento: 20 },
    { codigo: "V3", titulo: "Minecraft", precio: 26.95, plataforma: "PC", pegi: 7 },
    { codigo: "V4", titulo: "Mario Kart", precio: 49.99, plataforma: "Switch", pegi: 3 },
    { codigo: "V5", titulo: "Indie Puzzle", precio: 9.5, plataforma: "PC" },
    { codigo: "V6", titulo: "Spider-Man", precio: 54.9, plataforma: "PS5", pegi: 16 },
];
function ejercicio2() {
    mostrarTabla(videojuegos, obtener("tabla"));
    escribir(`2c) por código V3 -> ${getObjectByValue(videojuegos, "codigo", "V3")?.titulo}`);
    escribir(`2c) plataforma Switch -> ${getObjectsByValue(videojuegos, "plataforma", "Switch").map(v => v.titulo).join(", ")}`);
    escribir(`2c) patrón "M*" -> ${getObjectsByPattern(videojuegos, "titulo", "M*").map(v => v.titulo).join(", ")}`);
    escribir(`2c) patrón "FIF?" -> ${getObjectsByPattern(videojuegos, "titulo", "FIF?").map(v => v.titulo).join(", ")}`);
    escribir(`2c) precio entre 20 y 55 -> ${getObjectsInRange(videojuegos, "precio", 20, 55).map(v => v.titulo).join(", ")}`);
}
function ejercicio3() {
    const lista = obtener("lista");
    const input = obtener("nombre");
    const favoritos = new Set();
    const pintar = () => {
        lista.value = [...favoritos].join("\n");
    };
    const buscar = (nombre) => [...favoritos].find(f => f.toLowerCase() === nombre.toLowerCase());
    obtener("btnAgregar").addEventListener("click", () => {
        const nombre = input.value.trim();
        if (nombre === "" || buscar(nombre) !== undefined)
            return;
        favoritos.add(nombre);
        input.value = "";
        pintar();
    });
    obtener("btnBorrar").addEventListener("click", () => {
        const existente = buscar(input.value.trim());
        if (existente === undefined)
            return;
        favoritos.delete(existente);
        input.value = "";
        pintar();
    });
}
function ejercicio4() {
    const gym = new Gimnasio("FitZone");
    new Gimnasio("FitZone Norte");
    const pruebas = [
        ["Añadir socio 1", () => gym.agregarSocio({ dni: "111A", nombre: "Ana", tarjeta: "T-01" })],
        ["Añadir socio 2", () => gym.agregarSocio({ dni: "222B", nombre: "Luis", email: "luis@mail.com", tarjeta: "T-02" })],
        ["Añadir socio 3", () => gym.agregarSocio({ dni: "333C", nombre: "Marta", tarjeta: "T-03" })],
        ["Mostrar 111A", () => escribir(gym.mostrarSocio("111A"))],
        ["Modificar 111A", () => gym.modificarSocio("111A", { nombre: "Ana María", email: "ana@mail.com" })],
        ["Mostrar 111A tras modificar", () => escribir(gym.mostrarSocio("111A"))],
        ["Añadir DNI repetido", () => gym.agregarSocio({ dni: "111A", nombre: "Otra", tarjeta: "T-99" })],
        ["Obtener socio inexistente", () => gym.obtenerSocio("999Z")],
        ["Borrar socio inexistente", () => gym.borrarSocio("999Z")],
        ["Borrar 333C", () => gym.borrarSocio("333C")],
    ];
    try {
        for (const [descripcion, accion] of pruebas) {
            try {
                accion();
                escribir(`✔ ${descripcion}`);
            }
            catch (e) {
                if (e instanceof DniDuplicadoError) {
                    escribir(`✘ ${descripcion} -> [DNI duplicado] ${e.message}`);
                }
                else if (e instanceof SocioNoEncontradoError) {
                    escribir(`✘ ${descripcion} -> [No encontrado] ${e.message}`);
                }
                else if (e instanceof Error) {
                    escribir(`✘ ${descripcion} -> [Error desconocido] ${e.message}`);
                }
                else {
                    throw e;
                }
            }
        }
        gym.apuntarClase("111A", "Yoga");
        gym.apuntarClase("111A", "Spinning");
        gym.apuntarClase("222B", "Yoga");
        gym.apuntarClase("222B", "Spinning");
        gym.apuntarClase("222B", "Boxeo");
        escribir(`Recomendaciones para 111A: ${[...gym.recomendarClases("111A")].join(", ")}`);
        escribir(gym.resumen());
        escribir(`Total de gimnasios: ${Gimnasio.totalGimnasios}`);
        escribir(new Entrenador("Pau", "CrossFit").describir());
    }
    finally {
        escribir("Prueba finalizada");
    }
}
function ejercicio5() {
    const diez = palabrasAleatorias(10);
    const pre = document.createElement("pre");
    pre.textContent = mostrarConSeparador(diez);
    salida.appendChild(pre);
    const base = palabrasAleatorias(1000);
    const copiaB = [...base];
    const tB = medir(() => quitarRepetidas(copiaB));
    escribir(`5b) sin ordenar: quedan ${copiaB.length} palabras, ${tB.toFixed(2)} ms`);
    let unicas = [];
    const tC = medir(() => { unicas = quitarRepetidasOrdenado(base); });
    escribir(`5c) ordenado: quedan ${unicas.length} palabras, ${tC.toFixed(2)} ms`);
    const buscadas = palabrasAleatorias(1000);
    let encontradas = 0;
    const tD = medir(() => {
        for (const p of buscadas) {
            if (buscarPalabra(base, p) !== undefined)
                encontradas++;
        }
    });
    escribir(`5d) encontradas ${encontradas} de ${buscadas.length}, ${tD.toFixed(2)} ms`);
}
ejercicio1();
ejercicio2();
ejercicio3();
ejercicio4();
ejercicio5();
//# sourceMappingURL=main.js.map