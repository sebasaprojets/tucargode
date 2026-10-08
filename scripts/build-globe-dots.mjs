/**
 * Genera los puntos de tierra del globo del hero (se ejecuta una sola vez):
 *   node scripts/build-globe-dots.mjs
 * Fuente: Natural Earth vía world-atlas (countries-50m). Muestreo uniforme
 * en la esfera (espiral de Fibonacci). Salida compacta: [lon*10, lat*10, flag]
 * con flag 1 = Alemania, 2 = Venezuela, 0 = resto.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);
const countries = feature(topo, topo.objects.countries).features;
const de = countries.find((c) => c.id === '276');
const ve = countries.find((c) => c.id === '862');

const N = 26000;
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // sin Antártida: limpia el polo sur
  const p = [lon, lat];
  if (!geoContains(land, p)) continue;
  const flag = geoContains(de, p) ? 1 : geoContains(ve, p) ? 2 : 0;
  out.push(Math.round(lon * 10), Math.round(lat * 10), flag);
}
const file = new URL('../src/components/Globe/landDots.json', import.meta.url);
writeFileSync(file, JSON.stringify(out));
const count = out.length / 3;
const flags = [0, 0, 0];
for (let i = 2; i < out.length; i += 3) flags[out[i]]++;
console.log(`dots: ${count}  DE: ${flags[1]}  VE: ${flags[2]}  bytes: ${JSON.stringify(out).length}`);
