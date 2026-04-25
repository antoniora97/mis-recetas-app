import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import pkg from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
const { PrismaClient } = pkg;
import cors from "cors";

import { getMercadonaProducts } from "./data-scraping/mercadona-scraping.mjs";
import { syncCarrefour } from "./data-scraping/carrefour-scraping.mjs";
import { readContentFromJson } from "./utils/main.mjs";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const app = express();
const upload = multer();
app.use(cors());

const PORT = 3000;

cloudinary.config({
  cloud_name: "dcus93oaf",
  api_key: "547133458172637",
  api_secret: "ZE4OyQQosq2L6llZBcdxj2ulvJA",
});

let MERCADONA_PRODUCTS_CATALOG = {};

// Endpoint manual por si quieres forzar la actualización sin esperar al lunes
// app.get('/admin/force-update', async (req, res) => {
//     getMercadonaProducts();
//     res.send("Actualización forzada iniciada en segundo plano.");
// });

// app.get('/api/buscar/:ingrediente', (req, res) => {
//     const busqueda = req.params.ingrediente.trim().toLowerCase();

//     // Función para quitar tildes (vital para "macarrón")
//     const normalizar = (str) =>
//         str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//     const terminoLimpiado = normalizar(busqueda);

//     // 1. Aplanamos el catálogo
//     const todosLosProductos = MERCADONA_PRODUCTS_CATALOG.flatMap(categoria =>
//         categoria.data.map(p => ({
//             ...p,
//             nombreNorm: normalizar(p.nombre),
//             categoriaNorm: normalizar(categoria.title)
//         }))
//     );

//     // 2. FILTRO DE PRECISIÓN (Sin librerías raras)
//     const resultados = todosLosProductos.filter(p => {
//         // ¿El nombre o la categoría contienen la palabra exacta que has escrito?
//         return p.nombreNorm.includes(terminoLimpiado) ||
//             p.categoriaNorm.includes(terminoLimpiado);
//     });

//     // 3. ORDENACIÓN (Relevancia real)
//     const resultadosFinales = resultados.sort((a, b) => {
//         // Si el nombre EMPIEZA por lo que buscas, va arriba del todo
//         const aEmpieza = a.nombreNorm.startsWith(terminoLimpiado) ? 0 : 1;
//         const bEmpieza = b.nombreNorm.startsWith(terminoLimpiado) ? 0 : 1;

//         if (aEmpieza !== bEmpieza) return aEmpieza - bEmpieza;

//         // Si no, ordenamos por precio
//         return parseFloat(a.precio) - parseFloat(b.precio);
//     });

//     res.json({
//         busqueda: busqueda,
//         total: resultadosFinales.length,
//         productos: resultadosFinales
//     });
// });

const scrapers = {
  mercadona: getMercadonaProducts,
  carrefour: syncCarrefour,
};

// app.post('api/sync/:supermarketName', (req, res) => {
//     const { supermarketName } = req.params.toLowerCase().trim();
//     const runScraper = scrapers[supermarketName];

//     if (!runScraper) {
//         return res.status(404).json({ error: 'Supermercado no soportado' });
//     }

//     try {
//         // Opción A: Ejecución en segundo plano (Recomendado para scraping largo)
//         // Respondemos 202 (Accepted) para no dejar al frontend colgado
//         res.status(202).json({
//             message: `Sincronización iniciada para ${supermarketName}`,
//             statusUrl: `/api/sync/${supermarketName}/status`
//         });

//         // Ejecutamos el scraper sin 'await' para que el hilo siga libre
//         runScraper().catch(err => console.error(`Fallo en ${supermarketName}:`, err));

//     } catch (error) {
//         res.status(500).json({ error: 'Error al iniciar la sincronización' });
//     }
// })

app.get("/api/products/:supermarketName", async (req, res) => {
  console.log(`Petición recibida para: ${req.params.supermarketName}`); // Log de control

  try {
    const { supermarketName } = req.params;
    const filePath = `./data/${supermarketName}/products.json`;

    console.log(`Intentando leer: ${filePath}`);

    const jsonContent = await readContentFromJson(filePath);

    // Si llegamos aquí, el archivo se leyó bien
    res.json({
      last_update: jsonContent?.last_update || null,
      data: jsonContent?.data || [],
    });
  } catch (error) {
    console.error("❌ ERROR DETECTADO:", error.message);

    // Enviamos una respuesta de error para que el cliente NO se quede colgado
    res.status(500).json({
      error: "No se pudo leer el archivo",
      message: error.message,
      path: error.path,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  const fechaHoy = new Date();

  // syncCarrefour();

  // const exitoAlCargar = cargarDesdeDisco();

  // Obtenemos los productos en nuestro código postal
  // const mercadonaProductsCatalog = await getMercadonaProducts('11408');
  // const carrefourProductsCatalog = await getCarrefourProducts('11408');

  // console.log("MERCADONA");
  // console.log(mercadonaProductsCatalog);
  // console.log("CARREFOUR");
  // console.log(carrefourProductsCatalog);

  //PRODUCTS_IN_MEMORY_ARR = productsCatalog;
  //ULTIMA_ACTUALIZACION = new Date();

  //guardarEnDisco(productsCatalog);

  // const necesitaActualizar =
  //     !exitoAlCargar
  //     ||
  //     MERCADONA_PRODUCTS_CATALOG.length === 0
  //     ||
  //     !esMismoDia(ULTIMA_ACTUALIZACION, fechaHoy);

  // if (necesitaActualizar) {
  //     if (!esMismoDia(ULTIMA_ACTUALIZACION, fechaHoy) && exitoAlCargar) {
  //         console.log("📅 Los datos guardados no son de hoy. Actualizando...");
  //     } else {
  //         console.log("🔍 No hay datos previos. Iniciando scrap inicial...");
  //     }
  //     getMercadonaProducts();
  // } else {
  //     console.log("✅ Los datos están actualizados (corresponden a esta semana). No se requiere scrap.");
  // }
});

app.post("/recipes", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      instructions,
      ingredients,
      difficulty,
      categories,
    } = req.body;

    let imageUrl = ""; // Valor por defecto

    // 1. Solo intentamos subir si el usuario envió un archivo
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "mis_recetas" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const cloudRes = await uploadToCloudinary();
      imageUrl = cloudRes.secure_url;
    }

    // 2. Guardar en Prisma (imageUrl será el link de Cloudinary o un string vacío)
    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        cookingTime,
        image: imageUrl,
        difficulty,
        categories: categories ? JSON.parse(categories) : [],
        instructions: JSON.parse(instructions),
        ingredients: {
          create: JSON.parse(ingredients),
        },
      },
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar" });
  }
});
