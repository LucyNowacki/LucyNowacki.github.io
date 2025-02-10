.. title: Proof for Arithmetic Series
.. slug: proof-for-arithmetic-series
.. date: 2022-05-24 14:52:36 UTC+01:00
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text


It is a simple proof for Arithmetic Progression, and one should memorise it. 

Terms: :math:`a, a+d, a+d,..., a+(n-2)d, a+(n-1)d`

Now set up two opposite direction sums

Sum1: :math:`S_n=(a)+(a+d)+(a+2d)+...+(a+(n-2)d)+(a+(n-1)d)`

Sum2: :math:`S_n=(a+(n-1)d)+(a+(n-2)d)+...+(a+2d)+(a+d)+(a)`

Sum1 + Sum2 results in

:math:`2S_n=(2a+(n-1)d)+(2a+(n-1)d)+(2a+(n-1)d)+\newline\,\,\,\,\,\,\,\,\,\,\,\,\,\,\,\,\,...+(2a+(n-1)d)+(2a+(n-1)d)`

:math:`\therefore`

:math:`2S_n=n[2a+(n-1)d]`

:math:`S_n=\frac{n}{2}\left( 2a+(n-1)d\right) =\frac{n}{2}\left( a+\color{red} a+(n-1)d\right)`

Where the red term is the last term, therefore we have

:math:`S_n=\frac{n}{2}\left( a+\color{red}last\,term\right)\,\,\,\,\,\,\,\square`


.. math::

   \int \frac{dx}{1+ax}=\frac{1}{a}\ln(1+ax)+C


