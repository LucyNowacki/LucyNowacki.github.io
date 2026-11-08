// Example selection is explicit in the URL. A normal visit always starts with
// the original certification toy, regardless of previously explored maps.
let catalogue;
export function loadMapToys() {
  return catalogue ||= fetch(new URL('./data/map-toys.json', import.meta.url))
    .then(response => {
      if (!response.ok) throw new Error('Map examples could not be loaded.');
      return response.json();
    }).then(data => {
      if (!Array.isArray(data.maps) || !data.maps.length) throw new Error('The map catalogue is empty.');
      return data;
    });
}

export function defaultToyURL(current = new URL(location.href)) {
  const origin = current.searchParams.get('from') || '';
  const overview = origin === 'overview' || current.pathname.endsWith('/story-4k.html');
  const target = new URL(overview ? './story-4k.html' : './', current);
  if (current.searchParams.has('theme')) target.searchParams.set('theme', current.searchParams.get('theme'));
  if (!overview) {
    if (current.searchParams.get('display') === '4k') target.searchParams.set('display', '4k');
    target.hash = /^step-(0[0-9]|1[0-3])$/.test(origin) ? origin : current.hash || '#step-01';
  }
  return target;
}

export function mapToyURL(id, current = new URL(location.href)) {
  const from = current.pathname.endsWith('/story-4k.html') ? 'overview' :
    current.searchParams.get('from') || current.hash.slice(1) || 'step-01';
  const target = new URL(from === 'overview' ? './story-4k.html' : './index.html', current);
  target.searchParams.set('example', id);
  if (from !== 'overview') target.hash = from === 'step-00' ? 'step-01' : from;
  for (const key of ['theme', 'display']) if (current.searchParams.has(key)) target.searchParams.set(key, current.searchParams.get(key));
  return target;
}

async function mountChooser(host) {
  const label = document.createElement('label'); label.className = 'example-chooser-label';
  const caption = document.createElement('span'); caption.textContent = 'Toy example';
  const select = document.createElement('select'); select.setAttribute('aria-label', 'Toy example');
  select.add(new Option('Current certification toy (default)', 'default'));
  select.disabled = true; label.append(caption, select);
  const status = document.createElement('span'); status.className = 'example-chooser-status';
  status.textContent = 'Loading map choices…'; status.setAttribute('role', 'status');
  host.replaceChildren(label, status);
  try {
    const data = await loadMapToys();
    for (const page of [...new Set(data.maps.map(map => map.appendixPage))]) {
      const group = document.createElement('optgroup'); group.label = `Appendix ${page || 'maps'} · certification toys`;
      for (const map of data.maps.filter(map => map.appendixPage === page)) group.append(new Option(map.label, map.id));
      select.append(group);
    }
    const id = new URL(location.href).searchParams.get('example');
    const isMap = new URL(location.href).searchParams.has('example');
    const selected = isMap && data.maps.some(map => map.id === id);
    if (isMap && !selected) { select.add(new Option('Choose a map…', '')); select.value = ''; }
    else select.value = selected ? id : 'default';
    status.textContent = selected ? 'Map-derived toy · full certification process' : isMap ? 'Select an example' : 'Default · original matrices';
    select.disabled = false;
    select.addEventListener('change', () => {
      if (!select.value) return;
      location.assign((select.value === 'default' ? defaultToyURL() : mapToyURL(select.value)).href);
    });
  } catch {
    status.textContent = 'Map choices unavailable. The default toy remains available.';
    // Allow return from the standalone map page if its data request fails.
    select.disabled = false;
    select.addEventListener('change', () => location.assign(defaultToyURL().href));
    const link = document.createElement('a'); link.href = defaultToyURL(); link.textContent = 'Open default toy'; host.append(link);
  }
}

document.querySelectorAll('[data-example-chooser]').forEach(mountChooser);
