import { chromium } from "playwright";
import {
  writeContentIntoJson,
  readContentFromJson,
  esMismaSemana,
  wait,
} from "../utils/main.mjs";

let browser = null;
let context = null;
let page = null;

const carrefourMainCategoriesJsonPath = "./data/carrefour/categories.json";
const carrefourProductsJsonPath = "./data/carrefour/products.json";

const initBrowser = async () => {
  browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
    ],
  });

  context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    extraHTTPHeaders: {
      "Accept-Language": "es-ES,es;q=0.9",
    },
  });

  page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", {
      get: () => ["es-ES", "es"],
    });
  });
};

const getSubcategories = async (mainCategory) => {
  await initBrowser();

  await page.goto(mainCategory.href, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
    referer: "https://www.carrefour.es/supermercado",
  });

  // Ahora navegamos por las categorías de nivel 2 para agrupar los productos de manera más concreta
  await page.waitForSelector(".nav-second-level-categories", {
    timeout: 20000,
  });
  let subcategories = await page.$$eval(
    ".nav-second-level-categories .nav-second-level-categories__slide",
    (elements) =>
      elements.map((el) => {
        const id = el.querySelector("a")?.id?.trim();
        const title = el
          .querySelector(".nav-second-level-categories__text")
          ?.innerText?.trim();
        const href = el.querySelector("a")?.href?.trim();

        return {
          id,
          title,
          href,
        };
      }),
  );

  await browser.close();

  // Aplicamos un filtro porque no nos interesan las ofertas tampoco, al menos de momento
  return subcategories.filter(
    (category) => !category.title.toLowerCase().includes("oferta"),
  );
};

const syncMainCategoriesCarrefour = async () => {
  // Si estamos en la misma semana, no hacemos scraping de los datos
  const mainCategoriesFromFile = await readContentFromJson(
    carrefourMainCategoriesJsonPath,
  );
  if (
    mainCategoriesFromFile &&
    esMismaSemana(mainCategoriesFromFile.last_update, new Date())
  ) {
    return;
  }

  console.log(
    `El contenido de ${carrefourMainCategoriesJsonPath} está desactualizado. Actualizando...`,
  );

  // Comenzamos scraping para obtener las categorías principales
  await initBrowser();

  await page.goto("https://www.carrefour.es/supermercado", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForSelector(".nav-first-level-categories", { timeout: 20000 });

  const mainCategories = await page.$$eval(
    ".nav-first-level-categories .nav-first-level-categories__slide",
    (elements) =>
      elements.map((el) => {
        const id = el.querySelector("a")?.id?.trim();
        const title = el
          .querySelector(".nav-first-level-categories__text")
          ?.innerText?.trim();
        const href = el.querySelector("a")?.href?.trim();

        return {
          id,
          title,
          href,
        };
      }),
  );

  // Aplicamos un filtro porque solo nos interesan las categorías acabadas en /c que es donde hay productos.
  // Las que no nos interesan son Mis productos y Ofertas (tienen una estructura diferente al resto de categorías).
  const mainCategoriesFiltered = mainCategories.filter(
    (category) =>
      category.id !== "catmasterlist" &&
      category.id !== "cat20968591" &&
      category.href !== "",
  );

  await browser.close();

  // Obtenemos las subcategorías para cada categoría principal
  for (const mainCategory of mainCategoriesFiltered) {
    mainCategory.subcategories = await getSubcategories(mainCategory);
  }

  await writeContentIntoJson(
    carrefourMainCategoriesJsonPath,
    mainCategoriesFiltered,
  );
};

const blockedSubCategories = [
  "cerveza",
  "vinos",
  "energéticas",
  "alcoholes",
  "cava y champagne",
  "licores y cremas",
  "sidra",
];

const syncProductsCarrefour = async () => {
  const mainCategories = await readContentFromJson(
    carrefourMainCategoriesJsonPath,
  );
  mainCategories.data.is_completed = false;

  while (!mainCategories.data.is_completed) {
    try {
      for (const mainCategory of mainCategories.data) {
        for (const subcategory of mainCategory.subcategories) {
          if (
            !blockedSubCategories.includes(subcategory.title.toLowerCase()) &&
            (!subcategory.last_update ||
              !esMismaSemana(subcategory.last_update, new Date()))
          ) {
            console.log(
              `Obteniendo productos de la categoría ${subcategory.title}`,
            );
            let products = [];
            let hasNextPage = true;
            let currentOffset = 0;
            let offsetPerPage = 24;
            while (hasNextPage) {
              console.log(`Página ${currentOffset / offsetPerPage + 1}`);

              await initBrowser();

              await page.goto(
                `${subcategory.href}${currentOffset === 0 ? "" : `?offset=${currentOffset}`}`,
                {
                  waitUntil: "domcontentloaded",
                  timeout: 60000,
                  referer: "https://www.carrefour.es/supermercado",
                },
              );

              await page.waitForSelector(".product-card-list__item", {
                timeout: 20000,
              });

              // Scroll
              // for (let i = 0; i < 5; i++) {
              //     await page.mouse.wheel(0, 800);
              //     await page.waitForTimeout(800);
              //     await page.mouse.wheel(0, -200);
              //     await page.waitForTimeout(400);
              //     await page.mouse.wheel(0, 200);
              //     console.log(`Scroll ${i + 1}/5`);
              // }

              for (let i = 0; i < 3; i++) {
                await page.mouse.wheel(0, 1500);
                await page.waitForTimeout(1000);
              }

              const pageProducts = await page.$$eval(
                ".product-card-list__item",
                (elements) => {
                  return elements
                    .map((el) => {
                      const image = el
                        .querySelector(".product-card__image")
                        ?.src?.trim();
                      const title = el
                        .querySelector(".product-card__title-link")
                        ?.innerText?.trim();
                      const href = el
                        .querySelector(".product-card__title-link")
                        ?.href?.trim();

                      const standardPrice = parseFloat(
                        el
                          .querySelector(".product-card__price")
                          ?.innerText?.trim()
                          .replace(",", ".")
                          .replace("€", ""),
                      );
                      const strikethroughPrice = parseFloat(
                        el
                          .querySelector(".product-card__price--strikethrough")
                          ?.innerText?.trim()
                          .replace(",", ".")
                          .replace("€", ""),
                      );
                      const currentPrice = parseFloat(
                        el
                          .querySelector(".product-card__price--current")
                          ?.innerText?.trim()
                          .replace(",", ".")
                          .replace("€", ""),
                      );

                      const promotionTitle = el
                        .querySelector(".badge__name")
                        ?.innerText?.trim();

                      if (
                        !image &&
                        !title &&
                        !standardPrice &&
                        !strikethroughPrice &&
                        !promotionTitle
                      )
                        return;

                      return {
                        image,
                        title,
                        href,
                        price: standardPrice || strikethroughPrice,
                        currentPrice,
                        promotionTitle,
                      };
                    })
                    .filter((p) => p !== null);
                },
              );

              products.push(...pageProducts);

              // Buscamos si existe botón de siguiente página
              const nextButton = await page.$(".pagination__next");
              if (nextButton) {
                const nextButtonIsDisabled = await nextButton.evaluate((el) =>
                  el.classList.contains("pagination__next--disabled"),
                );
                if (!nextButtonIsDisabled) {
                  currentOffset += offsetPerPage;
                  await page.waitForTimeout(2000 + Math.random() * 2000);
                } else {
                  hasNextPage = false;
                }
              } else {
                hasNextPage = false;
              }

              await browser.close();
            }

            console.log(`Se han encontrado ${products.length} productos`);

            subcategory.last_update = new Date();
            subcategory.products = products.filter((p) => p !== null);

            await writeContentIntoJson(
              carrefourProductsJsonPath,
              mainCategories.data,
            );
            await writeContentIntoJson(
              carrefourMainCategoriesJsonPath,
              mainCategories.data,
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (browser) await browser.close();

      wait(2);
    }
  }

  mainCategories.data.is_completed = true;
  await writeContentIntoJson(carrefourProductsJsonPath, mainCategories.data);
};

export const syncCarrefour = async () => {
  // Por alguna razón que desconozco, si se accede a la ruta para obtener las categorías principales
  // y de ahí se navega una a una a las rutas de cada categoría con la misma instancia del navegador
  // Carrefour me bloquea. Es por esto que iniciamos una instancia nueva para cada acceso.

  await syncMainCategoriesCarrefour();
  await syncProductsCarrefour();
};
