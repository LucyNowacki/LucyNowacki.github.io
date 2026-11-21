(() => {
  const video = document.getElementById('film');
  const cover = document.getElementById('film-cover');
  const toggle = document.getElementById('film-toggle');
  const status = document.getElementById('film-status');
  cover.hidden = false;
  toggle.hidden = false;

  // The loopback preview serves whole files without Range support. Load just
  // one rendition before playback so seeking works there. Hosted and file
  // pages use the standard source list and native streaming.
  async function preparePreview() {
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname)) return;
    const source = [...video.querySelectorAll('source')].find(s => video.canPlayType(s.type));
    if (!source) return;
    video.controls = false;
    try {
      const response = await fetch(source.src);
      if (response.ok) video.src = URL.createObjectURL(await response.blob());
    } catch {
      // The native source list can still try the alternate format.
    } finally {
      video.controls = true;
    }
  }
  let preparing = true;
  const ready = preparePreview().finally(() => { preparing = false; });
  let pending = false;

  function refresh() {
    toggle.textContent = video.ended ? 'Replay film' : video.paused ? 'Play film' : 'Pause film';
    cover.hidden = !video.paused || video.currentTime > 0;
  }

  async function play() {
    if (pending) return;
    pending = true;
    status.textContent = '';
    try {
      if (preparing) await ready;
      if (video.ended) video.currentTime = 0;
      await video.play();
    } catch (error) {
      if (error.name !== 'AbortError') {
        status.textContent = 'Playback could not start. Try Play film again or download the MP4.';
      }
    } finally {
      pending = false;
      refresh();
    }
  }
  cover.addEventListener('click', play);
  toggle.addEventListener('click', () => video.paused ? play() : video.pause());
  video.addEventListener('playing', () => { status.textContent = ''; refresh(); });
  video.addEventListener('pause', refresh);
  video.addEventListener('ended', refresh);
  video.addEventListener('error', () => {
    status.textContent = 'This browser could not play the film. Download the MP4 to watch it.';
  });

  const explorer = document.getElementById('entry-to-arrow');
  let metadataReady, seekTicket = 0;
  function followTimestamp() {
    const match = /^#t=([0-9]+(?:[.][0-9]+)?)$/.exec(location.hash);
    if (match) seekTo(Number(match[1]), false);
  }
  document.querySelector('.film-script')?.addEventListener('click', event => {
    const jump = event.target.closest('a.film-time');
    if (!jump || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (location.hash === jump.hash) followTimestamp();
    video.scrollIntoView({ block: 'center' });
  });
  window.addEventListener('hashchange', followTimestamp);
  followTimestamp();
  if (!explorer) return;
  const passage = document.getElementById('watch-correspondence');
  const start = Number(explorer.dataset.start), end = Number(explorer.dataset.end);
  const cues = JSON.parse(explorer.dataset.cues);
  const example = { n: 3, r: 1.5, t: .36 };
  let typesetting = Promise.resolve();
  const map = window.createLaurentCorrespondence(explorer, {
    M: window.JoukowskiMath,
    typeset(nodes) {
      typesetting = typesetting.then(async () => {
        if (!window.MathJax?.startup?.promise) return;
        await MathJax.startup.promise;
        await MathJax.typesetPromise(nodes);
      }).catch(() => {});
    },
    onSelect(j) {
      map.render({ ...example, j });
      // When paused, show the completed highlight. During playback start
      // at the spoken coordinates so the viewer hears the whole sentence.
      seekTo(video.paused ? cues[j + 2] - .44 : cues[j + 1] + .01, false);
    },
  });
  explorer.querySelector('.lc-tip-view').id = 'infinite-arrows';
  explorer.hidden = false;
  passage.hidden = false;
  const zoomLink = document.createElement('a');
  zoomLink.href = '#infinite-arrows';
  zoomLink.textContent = 'Explore the 40-arrow zoom';
  passage.after(zoomLink);
  zoomLink.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    video.pause();
    if (location.hash !== zoomLink.hash) history.pushState(null, '', zoomLink.hash);
    map.showInfinite();
  });
  const guidance = document.createElement('p');
  guidance.className = 'lc-note lc-film-guidance';
  guidance.textContent = 'The film uses ρ = 1.5 and θ = 0.36 radians. Select an entry during playback to hear its sentence, or pause to inspect its completed arrow.';
  explorer.querySelector('.lc-intro').after(guidance);
  map.render({ ...example, j: null });

  function syncSelection() {
    const t = video.currentTime;
    if (t < start || t >= end) return;
    const i = cues.filter(cue => cue <= t).length - 1;
    map.render({ ...example, j: i >= 1 && i <= 4 ? i - 1 : null, total: i === 5 });
  }
  async function seekTo(time, withSound) {
    const ticket = ++seekTicket;
    if (withSound) play();
    try {
      await ready;
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        if (!metadataReady) {
          metadataReady = new Promise((resolve, reject) => {
            video.addEventListener('loadedmetadata', resolve, { once: true });
            video.addEventListener('error', reject, { once: true });
            video.preload = 'auto';
            if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
          });
        }
        await metadataReady;
      }
      if (ticket !== seekTicket) return;
      video.currentTime = Math.min(time, video.duration);
      refresh();
      if (explorer) syncSelection();
    } catch {
      status.textContent = 'This passage could not load. Open the downloaded MP4 to watch it.';
    }
  }
  video.addEventListener('timeupdate', syncSelection);
  video.addEventListener('seeked', () => { syncSelection(); refresh(); });
  passage.addEventListener('click', () => seekTo(start + .04, true));
  function followLink() {
    if (location.hash === '#forty-arrow-film' && explorer.dataset.infiniteStart !== undefined) seekTo(Number(explorer.dataset.infiniteStart) + .04, false);
    if (location.hash === '#four-arrows') seekTo(start + .45, false);
    if (location.hash === '#infinite-arrows') { video.pause(); map.showInfinite(); }
    if (location.hash === '#entry-to-arrow') explorer.scrollIntoView();
  }
  const cutaway = explorer.dataset.infiniteStart;
  if (cutaway !== undefined) {
    const watchZoom = document.createElement('button');
    watchZoom.type = 'button';
    watchZoom.textContent = 'Watch the 40-arrow animation';
    watchZoom.addEventListener('click', () => {
      video.scrollIntoView({block: 'center'});
      seekTo(Number(cutaway) + .02, true);
    });
    explorer.querySelector('.lc-view-tabs').after(watchZoom);
    watchZoom.className = 'lc-film-zoom';
  }
  window.addEventListener('hashchange', followLink);
  followLink();
})();
