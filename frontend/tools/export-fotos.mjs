import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = join(raiz, "..", "fotos-originais");
const destino = join(raiz, "assets", "img");

const trabalhos = [
  ["IMG_0266.JPG.jpeg", "hero/retrato", 1000],
  ["IMG_9330.JPG_(1).jpeg", "hellen/retrato", 1000],
  ["IMG_0266.JPG.jpeg", "combos/combo-1", 1200],
  ["IMG_3725_(1).PNG", "combos/combo-2", 1200],
  ["IMG_3727_(1).PNG", "combos/combo-3", 1200],
  ["IMG_3728.PNG", "combos/combo-4", 1200],
  ["IMG_3740.PNG", "portfolio/gestante-01", 1400],
  ["IMG_0259.JPG.jpeg", "portfolio/gestante-02", 1400],
  ["IMG_3741.PNG", "portfolio/gestante-03", 1400],
  ["IMG_0220.JPG.jpeg", "portfolio/gestante-04", 1400],
  ["IMG_3743.PNG", "portfolio/gestante-05", 1400],
  ["IMG_3745_(1).PNG", "portfolio/gestante-06", 1400],
  ["IMG_3744.PNG", "portfolio/social-01", 1400],
  ["IMG_3742.PNG", "portfolio/social-02", 1400],
  ["IMG_3717.JPG_(1).jpeg", "portfolio/cabelo-01", 1400],
  ["IMG_3719.JPG.jpeg", "portfolio/cabelo-02", 1400],
  ["IMG_3724.PNG", "portfolio/cabelo-03", 1400],
  ["IMG_3718.JPG_(1).jpeg", "portfolio/cabelo-04", 1400],
  ["IMG_3730.PNG", "portfolio/making-01", 1400],
  ["IMG_1416.PNG", "portfolio/making-02", 1400],
  ["IMG_3731.PNG", "portfolio/making-03", 1400],
  ["IMG_3729_(1).PNG", "portfolio/making-04", 1400],
  ["IMG_3726.PNG", "portfolio/artistico-01", 1400],
];

for (const [arquivo, saida, largura] of trabalhos) {
  const base = sharp(join(origem, arquivo)).rotate().resize({ width: largura, withoutEnlargement: true });
  const jpg = join(destino, `${saida}.jpg`);
  const webp = join(destino, `${saida}.webp`);
  await mkdir(dirname(jpg), { recursive: true });
  await base.clone().jpeg({ quality: 74, mozjpeg: true }).toFile(jpg);
  await base.clone().webp({ quality: 74 }).toFile(webp);
  console.log(saida);
}
