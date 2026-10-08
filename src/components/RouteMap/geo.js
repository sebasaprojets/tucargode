/**
 * Contornos continentales muy simplificados (lon, lat) para un mapa de puntos
 * estilizado. No pretende precisión cartográfica.
 */
export const BOUNDS = { lonMin: -95, lonMax: 25, latMin: -12, latMax: 62 };
export const SCALE = 10;
export const WIDTH = (BOUNDS.lonMax - BOUNDS.lonMin) * SCALE;
export const HEIGHT = (BOUNDS.latMax - BOUNDS.latMin) * SCALE;

export const project = ([lon, lat]) => [(lon - BOUNDS.lonMin) * SCALE, (BOUNDS.latMax - lat) * SCALE];

const LAND = [
  // Norteamérica / Centroamérica
  [[-95,62],[-80,62],[-78,58],[-70,60],[-64,60],[-61,56],[-56,52],[-53,47],[-60,46],[-65,44],[-70,42],[-74,40.5],[-76,35],[-81,31],[-80,25.5],[-82,27],[-84,30],[-89,30],[-95,29],[-97,26],[-97,22],[-95,19],[-91,18.5],[-90,21],[-87,21],[-88,16],[-84,15],[-83,11],[-80,9],[-77,8],[-77.5,7],[-80,7.5],[-83,8.5],[-86,12],[-92,14.5],[-95,16]],
  // Groenlandia (extremo sur)
  [[-52,62],[-41,62],[-43,59.8],[-48,60.8]],
  // Cuba
  [[-85,22],[-82,23.2],[-77,22],[-74,20],[-77.5,19.8],[-80,21.5]],
  // La Española
  [[-74.5,19.8],[-70,20],[-68.3,18.5],[-71.5,17.6],[-74.5,18.3]],
  // Sudamérica (norte)
  [[-77.5,7],[-77,8.5],[-75,11],[-72,12.4],[-70,12],[-68,10.6],[-64,10.6],[-62,10.7],[-60.5,8.5],[-58,7],[-55,6],[-52,5],[-50,1.5],[-48,-1],[-44,-2.5],[-40,-3],[-35,-5.5],[-35,-12],[-80,-12],[-81,-5],[-80,-2],[-79,1],[-78,2.5],[-77.5,4]],
  // África
  [[-17,21],[-16,24],[-13,27.5],[-9.5,30],[-9,33],[-6,35.8],[-2,35.2],[3,36.8],[10,37.2],[11,33.5],[19,30.5],[25,31.5],[25,-12],[13,-12],[13,-5],[9,-1],[9.5,4],[6,4.3],[2,6.2],[-4,5],[-7.5,4.4],[-12,7],[-15,11],[-17,14.5]],
  // Europa continental
  [[-9.5,37],[-9.3,43],[-8,43.7],[-1.8,43.4],[-1.2,46],[-4.6,48],[-1.5,48.7],[1.5,50.2],[3,51.2],[4.5,52.5],[5.5,53.4],[8.5,53.6],[9,54.8],[8.2,55.5],[8.3,57],[10.5,57.7],[10.5,56.2],[12.5,56],[12,54.5],[14,54],[18,54.8],[21,54.5],[25,55],[25,36],[22,36.5],[21,38.5],[19.5,40],[19.5,42],[16,43.5],[13.5,45.5],[12.3,44.5],[14,42],[16,40],[16,38],[15.6,38.2],[15.3,40],[12,41.8],[10.5,43],[8.5,44.3],[6.5,43.1],[3.2,43.2],[3,41.8],[0.5,40.5],[-0.5,38.5],[-2,36.7],[-5.5,36],[-7,37]],
  // Escandinavia
  [[5,58],[5,62],[25,62],[25,60],[21.5,60.5],[19,59.5],[18,59],[16.5,56.5],[14.3,55.5],[12.8,55.5],[11.8,58],[10.7,59.5],[8,58]],
  // Gran Bretaña
  [[-5.7,50],[1.5,51.2],[1.7,52.7],[0,53.5],[-1.5,55],[-2,56],[-1.8,57.6],[-3.5,58.6],[-5,58.6],[-6.2,56.5],[-4.8,55],[-3,54.3],[-3,53.4],[-4.6,53.3],[-4.2,52.2],[-5.2,51.7],[-3.5,51.4]],
  // Irlanda
  [[-10,51.5],[-6,52.2],[-6,54],[-7.5,55.3],[-10,54.2]],
];

function inside([x, y], poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Rectángulos envolventes: cada punto solo se prueba contra los polígonos cercanos
const BOXES = LAND.map((poly) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { poly, minX, minY, maxX, maxY };
});

let cache = null;

/** Genera (una sola vez) un único `d` de path con todos los puntos de tierra. */
export function buildDotsPath(step = 1.25) {
  if (cache) return cache;
  let d = '';
  for (let lat = BOUNDS.latMax - step / 2; lat > BOUNDS.latMin; lat -= step) {
    for (let lon = BOUNDS.lonMin + step / 2; lon < BOUNDS.lonMax; lon += step) {
      if (
        BOXES.some(
          (b) => lon >= b.minX && lon <= b.maxX && lat >= b.minY && lat <= b.maxY && inside([lon, lat], b.poly),
        )
      ) {
        const [x, y] = project([lon, lat]);
        d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      }
    }
  }
  cache = d;
  return d;
}
