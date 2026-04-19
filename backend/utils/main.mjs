import fs from 'fs/promises';

function esMismoDia(fecha1, fecha2) {
    if (!fecha1 || !fecha2) return false;
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
// cron.schedule('0 3 * * 1', () => {
//     getMercadonaProducts();
// });

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")                      // separa tildes
        .replace(/[\u0300-\u036f]/g, "")       // elimina tildes
        .replace(/s$/, "");                    // singular (básico)
}

function buscarEnCatalogo(ingrediente, catalogo) {
    const termino = normalizar(ingrediente);

    return catalogo
        .flatMap(categoria =>
            categoria.productos.map(p => ({
                ...p,
                categoria: categoria.title,
                parent: categoria.parent
            }))
        )
        .filter(producto => {
            const nombre = normalizar(producto.nombre);
            const categoria = normalizar(producto.categoria);
            const parent = normalizar(producto.parent ?? "");

            return nombre.includes(termino)
                || categoria.includes(termino)
                || parent.includes(termino);
        })
        .sort((a, b) => a.precio - b.precio);
}

export const esMismaSemana = (fecha1, fecha2) => {
    if (!fecha1 || !fecha2) return false;

    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);

    // Función para obtener el número de semana del año (ISO 8601)
    const getWeekNumber = (d) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    return d1.getFullYear() === d2.getFullYear() && getWeekNumber(d1) === getWeekNumber(d2);
};

export const wait = (min) => new Promise(resolve => setTimeout(resolve, min * 60000));

export const writeContentIntoJson = async (path, data) => {
    try {
        const jsonContent = JSON.stringify({
            last_update: new Date(),
            data
        }, null, 4);

        await fs.writeFile(path, jsonContent, 'utf8');

        console.log(`Contenido guardado en ${path} con éxito`);
    } catch (e) {
        console.log(`Error al guardar en ${path}: ${e.message}`);
    }
}

export const readContentFromJson = async (path) => {
    try {
        const fileContent = await fs.readFile(path, 'utf8');
        const json = JSON.parse(fileContent);

        console.log(`Contenido cargado desde ${path} con éxito`);

        return json;
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.error(`No se ha encontrado ${path}`);
        } else {
            console.error(`Error al cargar el contenido desde ${path}: ${e.message}`);
        }
        return null;
    }
}