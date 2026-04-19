import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, "cache_mercadona.json");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

// Función que obtiene los productos de mercadona de un código postal, por defecto 11408
export const getMercadonaProducts = async (zipCode = "11408") => {
  try {
    console.log(
      `[${new Date().toLocaleString()}] Iniciando actualización semanal...`,
    );

    // Petición a la API de Mercadona para obtener todas las categorías (se almacenan en data.results)
    const mercadonaCategories = (
      await axios.get("https://tienda.mercadona.es/api/categories/", {
        headers: HEADERS,
      })
    ).data.results;

    // Las categorías en Mercadona se establecen de la siguiente manera:
    // - Categoría 1 (por ejemplo, Aceite, especias y salsas con id 12)
    // - Categoría 2 (por ejemplo, Aceite, vinagre y sal con 112)
    // - Categoría 3 (por ejemplo, Aceite de oliva con id 420)
    // Por tanto, nos quedamos con las categorías 2 (como categoría padre) y 3,
    // para agrupar los productos más específicamente
    let productsCatalog = [];
    for (let category1 of mercadonaCategories) {
      for (let category2 of category1.categories) {
        try {
          // La manera de obtener los productos es pidiendo por categoría 2
          const category2Response = (
            await axios.get(
              `https://tienda.mercadona.es/api/categories/${category2.id}/`,
              {
                headers: {
                  ...HEADERS,
                  Cookie: `customer_postal_code=${zipCode};`,
                },
              },
            )
          ).data;

          // Agrupamos los productos por categoría padre (la 2) e hija (la 3)
          // de forma que exista una relación entre los productos de la categoría 3
          // Ejemplo: las categorías Aceite de oliva y Vinagre y otros aderezos
          // se agrupan con la categoría Aceite, vinagre y sal
          let category2Entry = {
            id: category2.id,
            name: category2.name,
            categories: [
              category2Response.categories.map((category3) => ({
                id: category3.id,
                name: category3.name,
                products: category3.products.map((product) => ({
                  id: product.id,
                  name: product.display_name,
                  unitPrice: parseFloat(product.price_instructions.unit_price),
                  image: product.thumbnail,
                })),
              })),
            ],
          };

          // La añadimos al catálogo en forma de array
          productsCatalog.push(category2Entry);

          // Pausa de medio segundo entre categorías para no petar la API
          await wait(500);
        } catch (e) {
          console.error(`Error en subcategoría ${category2.id}`);
        }
      }
    }

    console.log("¡Catálogo actualizado con éxito!");

    return productsCatalog;
  } catch (error) {
    console.error("Error crítico en la actualización:", error.message);
  }
};
