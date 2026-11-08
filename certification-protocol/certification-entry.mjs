// Keep the original mathematical model isolated. Only an explicit example URL
// loads the generalized map certification route.
if (new URL(location.href).searchParams.has('example')) {
  document.documentElement.classList.add('map-loading');
  await import('./map-protocol-app.mjs?v=maps2');
} else if (document.querySelector('#story-4k-root')) {
  await import('./story-4k.mjs?v=responsive1');
} else {
  await import('./app.mjs?v=midpoint1');
}
