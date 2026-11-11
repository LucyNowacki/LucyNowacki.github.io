/* Scoped preview player. Each figure owns its playback and manual preference. */
(() => {
  'use strict';
  function initialise() {
    document.querySelectorAll('[data-convolution-preview]').forEach(figure => {
      if (figure.dataset.convolutionInitialised) return;
      const video = figure.querySelector('video');
      const toggle = figure.querySelector('[data-convolution-toggle]');
      if (!video || !toggle) return;
      figure.dataset.convolutionInitialised = 'true';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      let visible = false;
      let preference = null; // null: automatic; true: explicitly playing; false: paused.
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.autoplay = false;
      video.pause();
      toggle.hidden = false;

      function update() {
        const playing = !video.paused && !video.ended;
        toggle.textContent = playing ? 'Pause' : 'Play';
        toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} convolution animation`);
        toggle.setAttribute('aria-pressed', String(playing));
      }
      function shouldPlay() {
        return visible && !document.hidden && preference !== false &&
          (preference === true || !reduced.matches);
      }
      function playback() {
        if (shouldPlay()) {
          const request = video.play();
          if (request) request.then(() => {
            // A pending play can settle after an offscreen/pause event.
            if (!shouldPlay()) video.pause();
            update();
          }).catch(update);
        } else {
          video.pause();
          update();
        }
      }
      toggle.addEventListener('click', event => {
        event.preventDefault();
        preference = video.paused;
        playback();
      });
      const reveal = () => {
        if (video.readyState >= 2 && figure.dataset.convolutionStarted === 'true') {
          figure.dataset.convolutionReady = 'true';
        }
      };
      video.addEventListener('play', () => {
        figure.dataset.convolutionStarted = 'true';
        reveal();
        update();
      });
      video.addEventListener('pause', update);
      video.addEventListener('loadeddata', reveal);
      video.addEventListener('error', () => {
        delete figure.dataset.convolutionReady;
        toggle.hidden = true;
      });
      document.addEventListener('visibilitychange', playback);
      const motionChanged = () => {
        if (reduced.matches && preference === true) preference = null;
        playback();
      };
      if (reduced.addEventListener) reduced.addEventListener('change', motionChanged);
      else reduced.addListener(motionChanged);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .1);
          playback();
        }, { threshold: [0, .1] }).observe(figure);
      } else {
        const checkVisibility = () => {
          const bounds = figure.getBoundingClientRect();
          visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
          playback();
        };
        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
        checkVisibility();
      }
      update();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, { once: true });
  else initialise();
})();
