import sharp from "sharp";

const destinoValido = /^(portfolio|combos|hellen|hero)\/[a-z0-9-]+\.jpg$/;

export function caminhoPermitido(destino) {
  return typeof destino === "string" && destinoValido.test(destino);
}

export async function prepararFoto(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 74, mozjpeg: true })
    .toBuffer();
}

export async function enviarParaStorage({ url, chave, caminho, buffer }) {
  const resposta = await fetch(`${url}/storage/v1/object/fotos/${caminho}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      apikey: chave,
      "Content-Type": "image/jpeg",
      "x-upsert": "true",
    },
    body: buffer,
  });
  if (!resposta.ok) {
    throw new Error("não foi possível guardar a foto.");
  }
  return `${url}/storage/v1/object/public/fotos/${caminho}`;
}
