// Compatibility for previews shared before the full protocol was added.
import {mapToyURL} from './example-chooser.mjs?v=maps2';
const selected=new URL(location.href).searchParams.get('example');
if(selected) location.replace(mapToyURL(selected).href);
else document.querySelector('#map-toys-root').textContent='Choose a map above to follow its full certification process.';
