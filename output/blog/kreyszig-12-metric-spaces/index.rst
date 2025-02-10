.. title: Kreyszig 1.2, Metric Spaces
.. slug: kreyszig-12-metric-spaces
.. date: 2023-10-07 00:03:11 UTC+01:00
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text

**Problem 1. Show that in the metric** :math:`d(x,y) = \sum_{j=1}^{\infty} \frac{1}{2^j} \frac{|x_j - y_j|}{1 + |x_j - y_j|}` **we can obtain another metric by replacing** :math:`\frac{1}{2^j}` **by** :math:`\mu_j > 0` **such that** :math:`\sum \mu_j` **converges.**

**Proof:**

Given the metric:
:math:`d(x,y) = \sum_{j=1}^{\infty} \frac{1}{2^j} \frac{|x_j - y_j|}{1 + |x_j - y_j|}`

We want to replace :math:`\frac{1}{2^j}` with :math:`\mu_j > 0` such that :math:`\sum \mu_j` converges. Let's denote the new metric as :math:`d'(x,y)`.

:math:`d'(x,y) = \sum_{j=1}^{\infty} \mu_j \frac{|x_j - y_j|}{1 + |x_j - y_j|}`

To show that :math:`d'` is a metric, it must satisfy the metric axioms:

1. **Non-negativity:** :math:`d'(x,y) \geq 0` for all :math:`x, y` and :math:`d'(x,y) = 0` if and only if :math:`x = y`.

   *Proof:* 
   Each term in the series is non-negative due to the absolute value and the fact that :math:`\mu_j > 0`. The sum is zero if and only if each term is zero, which implies :math:`x_j = y_j` for all :math:`j`, or :math:`x = y`.

2. **Symmetry:** :math:`d'(x,y) = d'(y,x)` for all :math:`x, y`.

   *Proof:* 
   This is evident from the absolute value in the definition of the metric.

3. **Triangle Inequality:** :math:`d'(x,z) \leq d'(x,y) + d'(y,z)` for all :math:`x, y, z`.

   *Proof:* 
   For each term in the series, the triangle inequality for the absolute value gives:
   :math:`\frac{|x_j - z_j|}{1 + |x_j - z_j|} \leq \frac{|x_j - y_j| + |y_j - z_j|}{1 + |x_j - y_j| + |y_j - z_j|}`
   Multiplying both sides by :math:`\mu_j` and summing over all :math:`j` gives the desired result.

Given that the series :math:`\sum \mu_j` converges, the series defining :math:`d'` will also converge for any :math:`x` and :math:`y` (by the comparison test, since each term of the metric series is bounded by :math:`\mu_j`).

Thus, :math:`d'` defined with :math:`\mu_j` is a valid metric on the space as long as :math:`\sum \mu_j` converges.

--------------------------------------------------------------------------------------------

**Problem 2: Show that the geometric mean of two positive numbers does not exceed the arithmetic mean using the given inequality.**

**Given:**

:math:`\alpha \beta \leq \int_0^{\alpha} t^{p-1} dt + \int_0^{\beta} u^{q-1} du = \frac{\alpha^p}{p} + \frac{\beta^q}{q}`

where :math:`\alpha` and :math:`\beta` are positive numbers, and :math:`p` and :math:`q` are conjugate exponents such that :math:`\frac{1}{p} + \frac{1}{q} = 1`.

**Proof:**

To show that the geometric mean of two positive numbers does not exceed the arithmetic mean, consider two positive numbers :math:`a` and :math:`b`. The geometric mean is :math:`\sqrt{ab}` and the arithmetic mean is :math:`\frac{a+b}{2}`.

Let's set :math:`\alpha = a` and :math:`\beta = b`, and choose :math:`p = 2` and :math:`q = 2` (since they are conjugate exponents).

Using the given inequality:
:math:`ab \leq \frac{a^2}{2} + \frac{b^2}{2}`

Rearranging:
:math:`2ab \leq a^2 + b^2`

Taking the square root of both sides:
:math:`\sqrt{2ab} \leq \sqrt{a^2 + b^2}`

Dividing both sides by 2:
:math:`\sqrt{ab} \leq \frac{a+b}{2}`

This shows that the geometric mean of :math:`a` and :math:`b` is less than or equal to their arithmetic mean.

Thus, the geometric mean of two positive numbers does not exceed the arithmetic mean.

---------------------------------------------------------------------------------------------------------------------

**Problem 3: Show that the Cauchy-Schwarz inequality implies the given inequality for sequences.**

**Given:**

:math:`\left| \sum_{j=1}^{\infty} \xi_j \eta_j \right| \leq \sqrt{ \sum_{k=1}^{\infty} |\xi_k|^2 } \sqrt{ \sum_{m=1}^{\infty} |\eta_m|^2 }`

**To Prove:**

:math:`(\left| \xi_1 \right| + \dots + \left| \xi_n \right|)^2 \leq n (\left| \xi_1 \right|^2 + \dots + \left| \xi_n \right|^2)`

**Proof:**

Let's consider two sequences:

1. :math:`a_j = |\xi_j|` for :math:`j = 1, 2, ..., n`
2. :math:`b_j = 1` for all :math:`j`

Using the Cauchy-Schwarz inequality, we have:

:math:`\left( \sum_{j=1}^{n} a_j b_j \right)^2 \leq \left( \sum_{j=1}^{n} a_j^2 \right) \left( \sum_{j=1}^{n} b_j^2 \right)`

Substituting in our choices for :math:`a_j` and :math:`b_j`, we get:

:math:`\left( \sum_{j=1}^{n} |\xi_j| \right)^2 \leq \left( \sum_{j=1}^{n} |\xi_j|^2 \right) \left( \sum_{j=1}^{n} 1^2 \right)`

Since :math:`\sum_{j=1}^{n} 1^2 = n`, our inequality becomes:

:math:`\left( \sum_{j=1}^{n} |\xi_j| \right)^2 \leq n \left( \sum_{j=1}^{n} |\xi_j|^2 \right)`

This completes the proof.

-----------------------------------------------------------------------------------------------------------

**Problem 4: Find a sequence that converges to 0 but is not in any :math:`l^p` space, where :math:`1 \leq p < +\infty`.**

**Given:**

Consider the sequence :math:`(x_n)` defined as:

.. math::

   x_n = 
   \begin{cases} 
   \frac{1}{k} & \text{if } n = 2^k \text{ for some } k \in \mathbb{N} \\
   0 & \text{otherwise}
   \end{cases}

This means that the sequence :math:`(x_n)` will have the values:

.. math::
   
   x_1 = 0, x_2 = 1, x_3 = 0, x_4 = \frac{1}{2}, x_5 = x_6 = x_7 = 0, x_8 = \frac{1}{3}, \dots 


**Proof:**

1. **Convergence to 0:**
Clearly, :math:`(x_n)` converges to 0 as :math:`n` approaches infinity because the sequence is 0 at all but countably many points, and where it is not 0, it is a sequence of numbers :math:`\frac{1}{k}` which tends to 0 as :math:`k` increases.

2. **Not in any** :math:`l^p` **space:**
To see why :math:`(x_n)` is not in any :math:`l^p` space, consider the :math:`p`-norm of :math:`(x_n)`:

.. math::

   ||x_n||_p = \left( \sum_{n=1}^{\infty} |x_n|^p \right)^{\frac{1}{p}}

For :math:`n = 2^k`, :math:`x_n = \frac{1}{k}`. So, the :math:`p`-norm becomes:

.. math::

   ||x_n||_p = \left( \sum_{k=1}^{\infty} \left( \frac{1}{k} \right)^p \right)^{\frac{1}{p}}

Given that the series :math:`\sum_{k=1}^{\infty} \left( \frac{1}{k} \right)^p` is divergent for :math:`p \leq 1`, it implies that the sequence :math:`(x_n)` is not in any :math:`l^p` space for :math:`p \leq 1`.

--------------------------------------------------------------------------------

**Problem 5: Find a sequence** :math:`x` **which is in** :math:`l^p` **for some** :math:`p > 1` **but** :math:`x` **is not in** :math:`l^1` **.**

**Solution:**

Consider the sequence :math:`x_n` defined by:

.. math::

   x_n = \frac{1}{n^{\alpha}}

where :math:`0 < \alpha < 1`.

**1.** :math:`x` is in :math:`l^p` for :math:`p > 1`:

For the sequence to be in :math:`l^p`, the series :math:`\sum_{n=1}^{\infty} |x_n|^p` must converge. In this case:

.. math::

   \sum_{n=1}^{\infty} \left( \frac{1}{n^{\alpha}} \right)^p = \sum_{n=1}^{\infty} \frac{1}{n^{p\alpha}}

Given that :math:`p > 1` and :math:`0 < \alpha < 1`, the exponent :math:`p\alpha` will be strictly between 1 and :math:`p`. Since the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^s}` converges for :math:`s > 1`, our series will converge for any :math:`p > 1`.

**Proof: Convergence of the series** :math:`\sum_{n=1}^{\infty} \frac{1}{n^s}` **for** :math:`s > 1`

**Integral Test:**

To determine the convergence of the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^s}`, we can compare it to the improper integral:

.. math::

   \int_{1}^{\infty} \frac{1}{x^s} \, dx

1. **Evaluate the integral:**

.. math::

   \int_{1}^{\infty} \frac{1}{x^s} \, dx = \lim_{{b \to \infty}} \int_{1}^{b} x^{-s} \, dx

Using the power rule for integration:

.. math::

   \lim_{{b \to \infty}} \left[ \frac{x^{-s+1}}{-s+1} \right]_1^b = \lim_{{b \to \infty}} \left[ \frac{1}{(1-s)b^{s-1}} - \frac{1}{1-s} \right]

For :math:`s > 1`, the term :math:`\frac{1}{(1-s)b^{s-1}}` approaches 0 as :math:`b` approaches infinity. Thus, the integral converges to:

.. math::

   \frac{1}{s-1}

2. **Comparison with the series:**

Since the improper integral converges, the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^s}` also converges by the integral test.

In conclusion, the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^s}` converges for all :math:`s > 1`.


**2.** :math:`x` is not in :math:`l^1`:

For the sequence to be in :math:`l^1`, the series :math:`\sum_{n=1}^{\infty} |x_n|` must converge. In this case:

.. math::

   \sum_{n=1}^{\infty} \frac{1}{n^{\alpha}}

Given that :math:`0 < \alpha < 1`, this is a p-series with :math:`p = \alpha`, and it is known that such a series diverges when :math:`p \leq 1`. Thus, the sequence :math:`x_n` is not in :math:`l^1`.

**Proof: Divergence of the series** :math:`\sum_{n=1}^{\infty} \frac{1}{n^p}` **for** :math:`p \leq 1`

**Integral Test:**

To determine the convergence of the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^p}`, we can compare it to the improper integral:

.. math::

   \int_{1}^{\infty} \frac{1}{x^p} \, dx

1. **Evaluate the integral:**

.. math::

   \int_{1}^{\infty} \frac{1}{x^p} \, dx = \lim_{{b \to \infty}} \int_{1}^{b} x^{-p} \, dx

Using the power rule for integration:

.. math::

   \lim_{{b \to \infty}} \left[ \frac{x^{-p+1}}{-p+1} \right]_1^b = \lim_{{b \to \infty}} \left[ \frac{1}{(1-p)b^{p-1}} - \frac{1}{1-p} \right]

For :math:`p \leq 1`, the term :math:`\frac{1}{(1-p)b^{p-1}}` does not approach 0 as :math:`b` approaches infinity. Instead, it either remains constant (for \(p = 1\)) or grows without bound (for \(p < 1\)). Thus, the integral diverges.

2. **Comparison with the series:**

Since the improper integral diverges, the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^p}` also diverges by the integral test.

In conclusion, the series :math:`\sum_{n=1}^{\infty} \frac{1}{n^p}` diverges for all :math:`p \leq 1`.


Therefore, the sequence :math:`x_n = \frac{1}{n^{\alpha}}` where :math:`0 < \alpha < 1` is in :math:`l^p` for any :math:`p > 1` but is not in :math:`l^1`.

--------------------------------------------------------------------------------------------------

**Problem 6:** 
Show that if :math:`A \subset B` in a metric space :math:`(X,d)`, then :math:`\delta(A) \leq \delta(B)`.

**Given:**
The diameter :math:`\delta(A)` of a nonempty set :math:`A` in a metric space :math:`(X,d)` is defined as:

.. math::
   \delta(A) = \sup_{x, y \in A} d(x, y)

A set :math:`A` is said to be bounded if :math:`\delta(A) < \infty`.

**Intuition:**
Consider two nested sets :math:`A` and :math:`B` in a metric space. The inner set represents :math:`A` and the outer set represents :math:`B`. 

.. image:: https://www.wolframcloud.com/obj/8284851e-93d0-4a74-90e1-459e0333670c

The maximum distance between any two points in :math:`A` will always be less than or equal to the maximum distance between any two points in :math:`B`. This is because every point in :math:`A` is also in :math:`B`, and the supremum of distances in :math:`B` must account for all distances in :math:`A` as well as additional distances between points exclusive to :math:`B` or between points in :math:`A` and points exclusive to :math:`B`.

**Proof:**
1. Let's consider any two points :math:`x, y` in :math:`A`. Since :math:`A \subset B`, both :math:`x` and :math:`y` are also in :math:`B`. Therefore, the distance :math:`d(x, y)` is also a distance between two points in :math:`B`.
2. Given the definition of :math:`\delta` as the supremum of distances between any two points in a set, the maximum distance between any two points in :math:`A` will always be less than or equal to the maximum distance between any two points in :math:`B`. This is because the set of all distances in :math:`A` is a subset of the set of all distances in :math:`B`.
3. Therefore, :math:`\delta(A) \leq \delta(B)`.

--------------------------------------------------------------------------------------------------------------

**Problem 7:** 
Given the definition of the diameter :math:`\delta(A)` of a nonempty set :math:`A` in a metric space :math:`(X,d)`, show that:

.. math::
   \delta(A) = \sup_{x, y \in A} d(x, y)

Show that :math:`\delta(A) = 0` if and only if :math:`A` consists of a single point.

**Proof:**

**(=>) Direction:**
Assume :math:`\delta(A) = 0`. This means that the supremum of the distances between all pairs of points in :math:`A` is 0. For any two distinct points :math:`x` and :math:`y` in :math:`A`, the distance :math:`d(x, y)` must be 0. However, in a metric space, the distance between two distinct points is always greater than 0. Therefore, the only way for the supremum of the distances to be 0 is if there are no pairs of distinct points in :math:`A`. This implies that :math:`A` consists of a single point.

**(<=) Direction:**
Assume :math:`A` consists of a single point, say :math:`a`. Then, for any :math:`x, y \in A`, :math:`x = y = a`. The distance :math:`d(x, y) = d(a, a) = 0`. Since this is the only possible distance between points in :math:`A`, the supremum of these distances is also 0. Therefore, :math:`\delta(A) = 0`.

Combining both directions, we conclude that :math:`\delta(A) = 0` if and only if :math:`A` consists of a single point.

---------------------------------------------------------------------------------------------------------------

**Problem 8:** 
Given two nonempty subsets :math:`A` and :math:`B` of a metric space :math:`(X,d)`, the distance :math:`D(A,B)` between :math:`A` and :math:`B` is defined as:

.. math::
   D(A,B) = \inf_{a \in A, b \in B} d(a, b)

Show that :math:`D` does not define a metric on the power set of :math:`X`.

**Proof:**
To show that :math:`D` does not define a metric on the power set of :math:`X`, we need to show that at least one of the metric properties is violated by :math:`D`. The metric properties are:

1. **Non-negativity:** For all sets :math:`A, B` in the power set of :math:`X`, :math:`D(A,B) \geq 0`.
2. **Identity of indiscernibles:** :math:`D(A,B) = 0` if and only if :math:`A = B`.
3. **Symmetry:** For all sets :math:`A, B` in the power set of :math:`X`, :math:`D(A,B) = D(B,A)`.
4. **Triangle inequality:** For all sets :math:`A, B, C` in the power set of :math:`X`, :math:`D(A,C) \leq D(A,B) + D(B,C)`.

We will focus on the second property, the identity of indiscernibles.

Consider two distinct sets :math:`A` and :math:`B` such that :math:`A` is a subset of :math:`B` and :math:`B` contains one additional point :math:`b` not in :math:`A`. Now, for any point :math:`a` in :math:`A`, the distance :math:`d(a, b)` is some positive value. However, since :math:`A` is a subset of :math:`B`, the distance between any point in :math:`A` and itself in :math:`B` is 0. This means that the infimum of the distances between points in :math:`A` and :math:`B` is 0, even though :math:`A` and :math:`B` are distinct sets. This violates the identity of indiscernibles property, as :math:`D(A,B) = 0` even when :math:`A \neq B`.

Therefore, :math:`D` does not define a metric on the power set of :math:`X`.



**Problem 8:** 
Given two nonempty subsets :math:`A` and :math:`B` of a metric space :math:`(X,d)`, the distance :math:`D(A,B)` between :math:`A` and :math:`B` is defined as:

.. math::
   D(A,B) = \inf_{a \in A, b \in B} d(a, b)

Show that :math:`D` does not define a metric on the power set of :math:`X`.

**Visualization:**

.. image:: https://www.wolframcloud.com/obj/b078151a-22ad-4290-b859-657a3777ff26

In the above visualization:

- The inner circle represents the set :math:`A`.
- The outer circle represents the set :math:`B`.
- The point labeled "a" is a point in :math:`A`.
- The point labeled "b" is a point in :math:`B` but not in :math:`A`.

**Proof with Visualization:**

Consider two distinct sets :math:`A` and :math:`B` in a metric space such that :math:`A` is a proper subset of :math:`B`. As visualized, :math:`A` is represented by the inner circle, and :math:`B` is represented by the outer circle. The point :math:`a` is in both :math:`A` and :math:`B`, while the point :math:`b` is only in :math:`B`.

Now, the distance :math:`d(a, b)` between any point :math:`a` in :math:`A` and the point :math:`b` in :math:`B` is some positive value. However, since :math:`A` is a subset of :math:`B`, the distance between any point in :math:`A` and itself in :math:`B` is 0. This means that the infimum of the distances between points in :math:`A` and :math:`B` is 0, even though :math:`A` and :math:`B` are distinct sets. This violates the identity of indiscernibles property, as :math:`D(A,B) = 0` even when :math:`A \neq B`.

Therefore, :math:`D` does not define a metric on the power set of :math:`X`.

------------------------------------------------------------------------------------------------------

**Problem 9:** 
Given the definition of the distance :math:`D(A,B)` between two nonempty subsets :math:`A` and :math:`B` of a metric space :math:`(X,d)`, show that:

.. math::
   D(A,B) = \inf_{a \in A, b \in B} d(a, b)

Show that if :math:`A \cap B \neq \emptyset`, then :math:`D(A,B) = 0`. What about the converse?

**Proof with Visualization:**

.. image:: https://www.wolframcloud.com/obj/15f2f93c-50a2-4687-b6cb-0b8b26a2a6f2

In the above visualization:

- The circle on the left represents the set :math:`A`.
- The circle on the right represents the set :math:`B`.
- The point labeled "x" is a point that belongs to both :math:`A` and :math:`B`, i.e., :math:`x \in A \cap B`.

1. **If** :math:`A \cap B \neq \emptyset` **then** :math:`D(A,B) = 0` **:**
   
   If :math:`A \cap B \neq \emptyset`, then there exists at least one point :math:`x` such that :math:`x \in A` and :math:`x \in B`. For this point, :math:`d(x, x) = 0`. Since :math:`D(A,B)` is the infimum of the distances between all pairs of points where one is from :math:`A` and the other is from :math:`B`, and since 0 is a possible distance (because of the point :math:`x`), the infimum is 0. Therefore, :math:`D(A,B) = 0`.

2. **Converse: If** :math:`D(A,B) = 0` **, then** :math:`A \cap B \neq \emptyset` **:**

   This statement is true. If :math:`D(A,B) = 0`, it means that the infimum of the distances between all pairs of points where one is from :math:`A` and the other is from :math:`B` is 0. This implies that there exists a pair of points :math:`a \in A` and :math:`b \in B` such that :math:`d(a, b) = 0`. In a metric space, the distance between two points is 0 if and only if the two points are the same. Therefore, :math:`a = b`, which means there exists a point that belongs to both :math:`A` and :math:`B`, i.e., :math:`A \cap B \neq \emptyset`.

----------------------------------------------------------------------------------------------------------------

**Problem 10:** 
Given the definition of the distance :math:`D(x,B)` from a point :math:`x` to a non-empty subset :math:`B` of a metric space :math:`(X,d)`, show that:

.. math::
   D(x,B) = \inf_{b \in B} d(x, b)

Show that for any :math:`x, y \in X`:

.. math::
   |D(x,B) - D(y,B)| \leq d(x,y)

**Proof:**

For any :math:`b \in B`:

1. :math:`d(x, b) \leq d(x, y) + d(y, b)` (by the triangle inequality)

Rearranging, we get:

2. :math:`d(x, b) - d(y, b) \leq d(x, y)`

Now, taking the infimum over all :math:`b \in B` on both sides:

3. :math:`D(x,B) - D(y,B) \leq d(x,y)`

Similarly, by interchanging :math:`x` and :math:`y`:

4. :math:`d(y, b) \leq d(y, x) + d(x, b)` (by the triangle inequality)

Rearranging, we get:

5. :math:`d(y, b) - d(x, b) \leq d(y, x)`

Taking the infimum over all :math:`b \in B` on both sides:

6. :math:`D(y,B) - D(x,B) \leq d(y,x)`

From (3) and (6), we get:

.. math::
   |D(x,B) - D(y,B)| \leq d(x,y)

**Visualization Explanation:**

.. image:: https://www.wolframcloud.com/obj/2f65e7f6-4afe-448d-93ed-5cf2d939da51

In the above visualization:

- The circle represents the set :math:`B`.
- The points labeled "x" and "y" are two arbitrary points in :math:`X`.
- The point labeled "b" is an arbitrary point in :math:`B`.
- The solid line between "x" and "y" represents the distance :math:`d(x,y)`.
- The dashed lines from "x" and "y" to "b" represent the distances :math:`d(x,b)` and :math:`d(y,b)` respectively.

From the triangle inequality, the direct distance between "x" and "y" (i.e., :math:`d(x,y)`) is always less than or equal to the sum of their distances to any point "b" in :math:`B`. This is visually evident as the direct path (solid line) between "x" and "y" is shorter than the path that goes through "b" (dashed lines).

This visualization supports the proof that for any two points :math:`x` and :math:`y` in :math:`X`, the difference in their distances to set :math:`B` is bounded by their direct distance, i.e., :math:`|D(x,B) - D(y,B)| \leq d(x,y)`.

----------------------------------------------------------------------------------------------------------------

**Problem 12:** 

Given the definition of a bounded set from Problem 6, where the diameter :math:`\delta(A)` of a nonempty set :math:`A` in a metric space :math:`(X, d)` is defined by:

.. math::
   \delta(A) = \sup_{x,y \in A} d(x, y)

A set is said to be bounded if :math:`\delta(A) < \infty`. 

Show that the union of two bounded sets :math:`A` and :math:`B` in a metric space is a bounded set.

.. image:: https://www.wolframcloud.com/obj/55851edd-7940-4ce1-b5b4-c96a59787567
   :alt: Visualization of the union of two bounded sets

**Proof:**

Let's assume that both :math:`A` and :math:`B` are bounded sets. This means:

.. math::
   \delta(A) = \sup_{x,y \in A} d(x, y) < \infty
   \delta(B) = \sup_{x,y \in B} d(x, y) < \infty

Now, consider any two points :math:`p` and :math:`q` in :math:`A \cup B`. There are three possible scenarios:

1. Both :math:`p` and :math:`q` are in :math:`A`.
2. Both :math:`p` and :math:`q` are in :math:`B`.
3. :math:`p` is in :math:`A` and :math:`q` is in :math:`B` or vice versa.

For the first scenario, :math:`d(p, q) \leq \delta(A)` since :math:`A` is bounded.

For the second scenario, :math:`d(p, q) \leq \delta(B)` since :math:`B` is bounded.

For the third scenario, let's use the triangle inequality:

.. math::
   d(p, q) \leq d(p, r) + d(r, q)

Where :math:`r` is any point in :math:`A` (or :math:`B`). Since both :math:`A` and :math:`B` are bounded, we can say:

.. math::
   d(p, q) \leq \delta(A) + \delta(B)

Combining all three scenarios, the supremum of the distances between any two points in :math:`A \cup B` is:

.. math::
   \delta(A \cup B) \leq \max(\delta(A), \delta(B), \delta(A) + \delta(B))

Since both :math:`\delta(A)` and :math:`\delta(B)` are finite, their sum is also finite. Thus, :math:`\delta(A \cup B) < \infty`, which means :math:`A \cup B` is bounded.

This completes the proof.

-------------------------------------------------------------------------------------------

**Problem 11:** 

Given a metric space :math:`(X,d)`, another metric on :math:`X` is defined by:

.. math::
   \tilde{d}(x,y) = \frac{d(x,y)}{1+d(x,y)}

Show that :math:`\tilde{d}` is a metric and that :math:`X` is bounded in this metric.

**Proof:**

**Part 1: Show that \(\tilde{d}(x,y)\) is a metric:**

1. **Non-negativity:** For any :math:`x, y \in X`,

   .. math::
      \tilde{d}(x,y) = \frac{d(x,y)}{1+d(x,y)} \geq 0

   since :math:`d(x,y) \geq 0` by the definition of a metric.

2. **Identity of indiscernibles:** For any :math:`x \in X`,

   .. math::
      \tilde{d}(x,x) = \frac{d(x,x)}{1+d(x,x)} = 0

   since :math:`d(x,x) = 0`.

3. **Symmetry:** For any :math:`x, y \in X`,

   .. math::
      \tilde{d}(x,y) = \frac{d(x,y)}{1+d(x,y)} = \frac{d(y,x)}{1+d(y,x)} = \tilde{d}(y,x)

   because :math:`d(x,y) = d(y,x)`.

4. **Triangle Inequality:** For any :math:`x, y, z \in X`,

   .. math::
      \tilde{d}(x,z) + \tilde{d}(z,y) = \frac{d(x,z)}{1+d(x,z)} + \frac{d(z,y)}{1+d(z,y)}

   Using the properties of fractions and the triangle inequality for :math:`d`, we can show that:

   .. math::
      \tilde{d}(x,z) + \tilde{d}(z,y) \geq \tilde{d}(x,y)

**Part 2: Show that \(X\) is bounded in the metric \(\tilde{d}(x,y)\):**

Given the nature of the fraction, as :math:`d(x,y)` increases, the value of :math:`\tilde{d}(x,y)` also increases, but at a diminishing rate due to the increasing denominator. As :math:`d(x,y)` approaches infinity, :math:`\tilde{d}(x,y)` approaches but never exceeds 1. This means that for all pairs :math:`x, y \in X`, the value of :math:`\tilde{d}(x,y)` is always between 0 and 1, inclusive. Therefore, the supremum of :math:`\tilde{d}(x,y)` over all :math:`x, y \in X` is 1, which means that :math:`X` is bounded in the metric :math:`\tilde{d}(x,y)` with diameter at most 1.

**Explanation for the supremum statement:**

The function :math:`\tilde{d}(x,y) = \frac{d(x,y)}{1+d(x,y)}` is a fraction where the numerator is the original distance between :math:`x` and :math:`y`, and the denominator is 1 plus that distance. The smallest value of :math:`d(x,y)` is 0 (when :math:`x=y`), and in this case, :math:`\tilde{d}(x,y) = 0`. As :math:`d(x,y)` increases, the value of :math:`\tilde{d}(x,y)` also increases, but at a diminishing rate due to the increasing denominator. As :math:`d(x,y)` approaches infinity, :math:`\tilde{d}(x,y)` approaches but never exceeds 1. This means that the largest possible value of :math:`\tilde{d}(x,y)` over all :math:`x, y \in X` is 1.

This completes the proof.


Let's delve deeper into the statement "the supremum of :math:`\tilde{d}(x,y)` over all :math:`x,y \in X` is at most 1."

**Explanation:**

The function :math:`\tilde{d}(x,y) = \frac{d(x,y)}{1+d(x,y)}` is a fraction where the numerator is the original distance between :math:`x` and :math:`y`, and the denominator is 1 plus that distance.

- The smallest value of :math:`d(x,y)` is 0 (when :math:`x=y`), and in this case, :math:`\tilde{d}(x,y) = 0`.

- As :math:`d(x,y)` increases, the value of :math:`\tilde{d}(x,y)` also increases. However, because of the denominator :math:`1+d(x,y)`, the rate of increase of :math:`\tilde{d}(x,y)` is slower than the rate of increase of :math:`d(x,y)`.

- As :math:`d(x,y)` approaches infinity, the fraction :math:`\frac{d(x,y)}{1+d(x,y)}` approaches 1. This means that no matter how large :math:`d(x,y)` becomes, :math:`\tilde{d}(x,y)` will never exceed 1.

Thus, the largest possible value of :math:`\tilde{d}(x,y)` over all :math:`x,y \in X` is 1, making the supremum of :math:`\tilde{d}(x,y)` equal to 1.

