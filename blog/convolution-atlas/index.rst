.. title: Convolution Atlas: from discrete sums to Legendre geometry
.. slug: convolution-atlas
.. date: 2026-11-11 12:00:00 UTC
.. tags: Proofs
.. description: An interactive route from flip, slide, multiply and sum to Joukowski geometry, Legendre modes and the real-line sup bound.
.. type: text
.. previewimage: /files/interactive/convolution-preview/poster.png

Convolution becomes easier to follow when each term in the formula has a
visible counterpart. **Convolution Atlas** connects the samples, their
products and the output, then follows coefficient matching into the geometry
of Legendre polynomials.

`Open Convolution Atlas </convolution/index.html>`_

.. TEASER_END

.. raw:: html

   <link rel="stylesheet" href="/files/interactive/convolution-preview/preview.css">
   <figure class="convolution-preview" data-convolution-preview>
     <video muted loop playsinline preload="metadata" width="960" height="540" poster="/files/interactive/convolution-preview/poster.png" aria-label="Finite convolution: the reversed kernel slides across an input, products form and add to the selected output.">
       <source src="/files/interactive/convolution-preview/preview.webm" type="video/webm">
       <source src="/files/interactive/convolution-preview/preview.mp4" type="video/mp4">
     </video>
     <img class="convolution-preview-poster" src="/files/interactive/convolution-preview/poster.png" width="960" height="540" alt="Cyan input, blue reversed kernel, green products and a purple convolution output.">
     <button type="button" hidden data-convolution-toggle aria-label="Pause convolution animation" aria-pressed="true">Pause</button>
   </figure>
   <script type="module" src="/files/interactive/convolution-preview/preview.js"></script>

Start with a finite sum
=======================

In the `discrete convolution lesson </convolution/index.html>`_, choose an
example or edit the samples. Flip and slide the kernel, inspect a product,
then watch the products add to one output value. The formula and plot colours
match, so a selected term can be followed across the views.

The three views show the complete sequences, the flip–slide–sum construction,
and the addition of shifted kernels. This lesson uses finite point samples,
with zero values away from their sample positions.

From coefficient matching to geometry
======================================

The `Joukowski–Legendre lesson </convolution/joukowski/index.html>`_ follows a
different use of convolution: multiplying two generating series and collecting
terms of the same degree. A lattice shows which pairs contribute, while the
complex-plane diagrams show the corresponding Laurent powers.

Move the angle and radius to connect the circle, its Joukowski image and the
Legendre mode. The degree selected in the generating series and the Fourier
frequency of a Laurent term remain distinct throughout the explanation.

Why the real-line bound is one
==============================

In `real-line stability </convolution/joukowski/real-line/index.html>`_, the
circle has radius one. A point and its reciprocal are complex conjugates;
their midpoint is the real input. Linked diagrams then show the Legendre value
as a weighted mean of unit phases. Positive weights summing to one keep that
mean inside the unit disk, and the endpoint normalization attains one.

The lesson includes the angular integral estimate used later in the thesis.
The displayed argument supplies the bound; the moving diagrams and numerical
readouts help explain it.

Choose your starting point
==========================

* `Flip, slide, multiply, sum </convolution/index.html>`_
* `Joukowski–Legendre Laurent expansion </convolution/joukowski/index.html>`_
* `Real-line stability of Legendre modes </convolution/joukowski/real-line/index.html>`_

The atlas is growing one lesson at a time. These three linked lessons are
available now, with mathematical notation rendered through MathJax.
