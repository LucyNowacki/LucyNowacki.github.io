import {loadMapToys} from './example-chooser.mjs?v=maps2';

let certificates;
export async function loadMapProtocolContext(id) {
  certificates ||= fetch(new URL('./data/map-certificates.json', import.meta.url)).then(r => {
    if (!r.ok) throw new Error('Map certificates could not be loaded.');
    return r.json();
  });
  const [catalogue, proof] = await Promise.all([loadMapToys(), certificates]);
  const map = catalogue.maps.find(m => m.id === id);
  const certificate = proof.maps.find(m => m.id === id);
  if (!map || !certificate) throw new Error('This map example was not found.');
  if (proof.schemaVersion !== 1 || certificate.numeric.A0.length !== 3 || certificate.numeric.B?.length !== 4) {
    throw new Error('The map certificate has an unsupported format.');
  }
  return {map, certificate, source:proof.source, construction:proof.construction,
    numericalConvention:catalogue.numericalConvention};
}

export function protocolURL(id, step = 1, overview = false, current = new URL(location.href)) {
  const target = new URL(overview ? './story-4k.html' : './index.html', current);
  for (const key of ['theme','display']) if (current.searchParams.has(key)) target.searchParams.set(key,current.searchParams.get(key));
  target.searchParams.set('example', id);
  if (!overview) target.hash = `step-${String(step).padStart(2,'0')}`;
  return target;
}
