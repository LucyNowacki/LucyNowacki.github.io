.. title: Kreyszig-2.2-Normed Space, Banach Space
.. slug: kreyszig-22-normed-space-banach-space
.. date: 2023-11-04 21:45:35 UTC
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text


**Problem 1.** Show that the norm :math:`\|x\|` of x is the distance from x to O.

**Definition:**

A *norm* on a (real or complex) vector space :math:`X` is a
real-valued function on :math:`X` whose value at an :math:`x \in X` is denoted by
:math:`\|x\|` (read "norm of x") and which has the properties

- :math:`\|x\| \geq 0` (Non-negativity)
- :math:`\|x\| = 0 \iff x = 0` (Definiteness)
- :math:`\|a x\| = |a| \|x\|` (Homogeneity)
- :math:`\|x + y\| \leq \|x\| + \|y\|` (Triangle Inequality);

here :math:`x` and :math:`y` are arbitrary vectors in :math:`X` and :math:`a` is any scalar.

**Solution:**

The norm :math:`\|x\|` of a vector :math:`x` in a vector space is a generalization of the notion of "length" of a vector.
It measures the size of vectors and is consistent with our geometric intuition.

In a normed vector space, the distance :math:`d` between two vectors :math:`x` and :math:`y` is defined as:

.. math::
   d(x, y) = \|x - y\|

The distance from any vector :math:`x` to the origin :math:`O` (the zero vector :math:`0`) is then:

.. math::
   d(x, O) = \|x - 0\|

Since subtracting the zero vector does not change the vector :math:`x`, we have:

.. math::
   d(x, O) = \|x\|

Thus, the norm :math:`\|x\|` is the distance from the vector :math:`x` to the origin :math:`O` in the vector space :math:`X`.
This relationship holds in any normed vector space, whether it be a space of real numbers, complex numbers, or more abstract objects.

----------------------------------------------------------------------------------------------------------------------------------------

**Problem 2.** Verify that the usual length of a vector in the plane or in three-dimensional space has the properties (N1) to (N4) of a norm.

**Solution:**


**In the Plane** (:math:`\mathbb{R}^2`)

For a vector :math:`x = (x_1, x_2)` in :math:`\mathbb{R}^2`, the usual length (Euclidean norm) is defined as:

.. math::
   \|x\| = \sqrt{x_1^2 + x_2^2}

**Property (N1): Non-negativity**

.. math::
   \|x\| = \sqrt{x_1^2 + x_2^2} \geq 0

The square of any real number is non-negative, and the square root of a non-negative number is also non-negative.

**Property (N2): Definiteness**

.. math::
   \|x\| = 0 \iff x_1^2 + x_2^2 = 0 \iff x_1 = 0 \text{ and } x_2 = 0 \iff x = (0, 0)

The norm is zero if and only if both components of the vector are zero.

**Property (N3): Homogeneity**

For any scalar :math:`a` and vector :math:`x = (x_1, x_2)`,

.. math::
   \|a \cdot x\| = \| (a x_1, a x_2) \| = \sqrt{(a x_1)^2 + (a x_2)^2} = |a| \cdot \sqrt{x_1^2 + x_2^2} = |a| \cdot \|x\|

The norm of a scaled vector is the absolute value of the scalar times the norm of the vector.

**Property (N4): Triangle Inequality**

For any vectors :math:`x = (x_1, x_2)` and :math:`y = (y_1, y_2)`, let's consider the norm of their sum:

.. math::
   \|x + y\| = \| (x_1 + y_1, x_2 + y_2) \| = \sqrt{(x_1 + y_1)^2 + (x_2 + y_2)^2}

To prove the triangle inequality, we expand the square of the norm of :math:`x + y`:

.. math::
   \|x + y\|^2 = x_1^2 + 2x_1y_1 + y_1^2 + x_2^2 + 2x_2y_2 + y_2^2

We can rewrite this as:

.. math::
   \|x + y\|^2 = \|x\|^2 + 2\langle x, y \rangle + \|y\|^2

By the Cauchy-Schwarz inequality, we know:

.. math::
   |\langle x, y \rangle| \leq \|x\| \cdot \|y\|

So we have:

.. math::
   \|x + y\|^2 \leq \|x\|^2 + 2\|x\| \cdot \|y\| + \|y\|^2 = (\|x\| + \|y\|)^2

Taking the square root of both sides (and remembering that the square root function is increasing), we get:

.. math::
   \|x + y\| \leq \|x\| + \|y\|

This completes the proof of the triangle inequality for vectors in :math:`\mathbb{R}^2`.

**In Three-Dimensional Space (:math:`\mathbb{R}^3`)**

The verification of properties (N1) to (N4) in three-dimensional space follows similarly to that in the plane, with the addition of the third component for each vector. The proof of the triangle inequality in :math:`\mathbb{R}^3` follows the same steps as above.

**Concavity of the Square Root Function**

The function :math:`f(t) = \sqrt{t}` is concave on :math:`[0, \infty)` because its second derivative is negative:

.. math::
   f''(t) = -\frac{1}{4t^{3/2}} < 0 \text{ for all } t > 0

The concavity of the square root function ensures that the function applied to a sum is less than or equal to the sum of the functions applied to each term separately, which is consistent with the triangle inequality as we've just proven.

The above reasoning solidifies that the Euclidean norm satisfies the triangle inequality, completing the verification that it indeed constitutes a norm in both :math:`\mathbb{R}^2` and :math:`\mathbb{R}^3`.


**Detailed Transition**

Consider two vectors :math:`x` and :math:`y` in :math:`\mathbb{R}^n`. The squared norm of their sum is:

.. math::
   \|x + y\|^2 = \langle x + y, x + y \rangle

Expanding the inner product:

.. math::
   \|x + y\|^2 = \langle x, x \rangle + 2\langle x, y \rangle + \langle y, y \rangle

The inner product of a vector with itself is the square of its norm:

.. math::
   \|x + y\|^2 = \|x\|^2 + 2\langle x, y \rangle + \|y\|^2

By the Cauchy-Schwarz inequality:

.. math::
   |\langle x, y \rangle| \leq \|x\| \cdot \|y\|

This implies:

.. math::
   2|\langle x, y \rangle| \leq 2\|x\| \cdot \|y\|

Since the norms are non-negative, and the inner product can be negative, we use the absolute value:

.. math::
   2\langle x, y \rangle \leq 2\|x\| \cdot \|y\|

Substituting back into our expanded norm equation:

.. math::
   \|x + y\|^2 \leq \|x\|^2 + 2\|x\| \cdot \|y\| + \|y\|^2

The right-hand side is the square of :math:`\|x\| + \|y\|`:

.. math::
   \|x + y\|^2 \leq (\|x\| + \|y\|)^2

Taking the square root of both sides, since the square root function is monotonically increasing:

.. math::
   \|x + y\| \leq \|x\| + \|y\|

This is the triangle inequality for norms, demonstrating that the Euclidean norm satisfies property (N4).

-----------------------------------------------------------------------------------------------------------


**Problem 4.** Show that we may replace (N2) by :math:`\|x\| = 0 \iff x = 0` without altering the concept of a norm. Show that non-negativity of a norm also follows from (N3) and (N4).

**Solution:**

**Part 1: Replacing (N2)**

The definiteness condition states that :math:`\|x\| = 0 \iff x = 0`. This condition is crucial because it ensures that the only vector with a norm of zero is the zero vector itself.

**Part 2: Non-negativity from (N3) and (N4)**

**Property (N3)** states that :math:`\|a x\| = |a| \|x\|` for any scalar :math:`a` and any vector :math:`x`. This property is known as absolute homogeneity or scalability.

**Property (N4)** is the triangle inequality, which states that :math:`\|x + y\| \leq \|x\| + \|y\|` for any vectors :math:`x` and :math:`y`.

To show that non-negativity follows from (N3) and (N4), consider the following:

For any vector :math:`x` in the vector space, by property (N3), we have:

.. math::
   \|0 \cdot x\| = |0| \|x\| = 0

Here we used the fact that multiplying any vector by zero yields the zero vector, and the absolute value of zero is zero. This gives us the result that :math:`\|0\| = 0`.

Now, using the triangle inequality (N4), for any vector :math:`x`:

.. math::
   \|x\| = \|x + 0\| \leq \|x\| + \|0\|

Since we've established that :math:`\|0\| = 0`, this simplifies to:

.. math::
   \|x\| \leq \|x\| + 0

Thus, :math:`\|x\| \leq \|x\|`, which is true by the reflexivity of the inequality. This shows that :math:`\|x\|` must be non-negative since it cannot be less than itself.

Together, these parts demonstrate that the property (N2) can be replaced by the definiteness condition without changing the concept of a norm, and that non-negativity can be derived from (N3) and (N4), confirming that these properties are sufficient to define a norm.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


**Problem 5.** Show that the Euclidean norm with components :math:`x_i` replaced by :math:`\xi_i` and scalar :math:`a` replaced by :math:`\alpha` defines a norm on the vector space :math:`\mathbb{R}^n`.

**Solution:**

To demonstrate that the Euclidean norm defines a norm on :math:`\mathbb{R}^n` with the components :math:`x_i` replaced by :math:`\xi_i` and the scalar :math:`a` replaced by :math:`\alpha`, we must verify that it satisfies the following properties:

1. **Non-negativity:** For any vector :math:`x`, since each component :math:`\xi_i` is squared, the sum is non-negative. Therefore, :math:`\|x\| \geq 0`.

2. **Definiteness:** The norm :math:`\|x\|` equals zero if and only if every :math:`\xi_i` is zero, which implies that :math:`x` is the zero vector.

3. **Homogeneity (or scalability):** For any scalar :math:`\alpha` and vector :math:`x`, the norm of the scaled vector is given by:

   .. math::
       \|\alpha x\| = \sqrt{\sum_{i=1}^{n} (\alpha \xi_i)^2} = |\alpha| \sqrt{\sum_{i=1}^{n} \xi_i^2} = |\alpha| \|x\|

4. **Triangle Inequality:** For vectors :math:`x = (\xi_1, \xi_2, \ldots, \xi_n)` and :math:`y = (\eta_1, \eta_2, \ldots, \eta_n)`, we need to show that :math:`\|x + y\| \leq \|x\| + \|y\|`.

   Starting with the left side of the inequality:

   .. math::
       \|x + y\|^2 = \sum_{i=1}^{n} (\xi_i + \eta_i)^2 = \sum_{i=1}^{n} (\xi_i^2 + 2\xi_i\eta_i + \eta_i^2)

   Applying the Cauchy-Schwarz inequality:

   .. math::
       \left| \sum_{i=1}^{n} \xi_i\eta_i \right| \leq \sqrt{\sum_{i=1}^{n} \xi_i^2} \cdot \sqrt{\sum_{i=1}^{n} \eta_i^2}

   We then have:

   .. math::
       2\sum_{i=1}^{n} \xi_i\eta_i \leq 2\sqrt{\sum_{i=1}^{n} \xi_i^2} \cdot \sqrt{\sum_{i=1}^{n} \eta_i^2}

   Substituting this back into the squared norm of :math:`x + y`, we get:

   .. math::
       \|x + y\|^2 \leq \sum_{i=1}^{n} \xi_i^2 + 2\sqrt{\sum_{i=1}^{n} \xi_i^2} \cdot \sqrt{\sum_{i=1}^{n} \eta_i^2} + \sum_{i=1}^{n} \eta_i^2

   Which simplifies to:

   .. math::
       \|x + y\|^2 \leq \left( \sqrt{\sum_{i=1}^{n} \xi_i^2} + \sqrt{\sum_{i=1}^{n} \eta_i^2} \right)^2

   Taking the square root of both sides:

   .. math::
       \|x + y\| \leq \sqrt{\sum_{i=1}^{n} \xi_i^2} + \sqrt{\sum_{i=1}^{n} \eta_i^2}

   Thus, we have proven the triangle inequality:

   .. math::
       \|x + y\| \leq \|x\| + \|y\|

By confirming these properties, we have shown that the Euclidean norm with substitutions :math:`\xi_i` for :math:`x_i` and :math:`\alpha` for :math:`a` indeed defines a norm on the vector space :math:`\mathbb{R}^n`.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 6.** Let :math:`X` be the vector space of all ordered pairs :math:`x = (\xi_1, \xi_2)`, :math:`y = (\eta_1, \eta_2)`, ... of real numbers. We are to show that norms on :math:`X` are defined by:

.. math::
   \|x\|_1 = |\xi_1| + |\xi_2|

.. math::
   \|x\|_2 = (\xi_1^2 + \xi_2^2)^{1/2}

.. math::
   \|x\|_{\infty} = \max\{|\xi_1|, |\xi_2|\}

**Solution:**

1. For the :math:`L^1` norm:

   - Non-negativity: Since absolute values are always non-negative, we have :math:`|\xi_1| + |\xi_2| \geq 0`.
   
   - Definiteness: :math:`\|x\|_1 = 0` if and only if :math:`|\xi_1| = 0` and :math:`|\xi_2| = 0`, which occurs if and only if :math:`\xi_1 = 0` and :math:`\xi_2 = 0`, hence :math:`x = 0`.
   
   - Scalar multiplication: For any scalar :math:`\alpha`, :math:`\|\alpha x\|_1 = |\alpha \xi_1| + |\alpha \xi_2| = |\alpha|(|\xi_1| + |\xi_2|) = |\alpha| \|x\|_1`.
   
   - Triangle inequality: For any vectors :math:`x = (\xi_1, \xi_2)` and :math:`y = (\eta_1, \eta_2)`, :math:`\|x + y\|_1 = |(\xi_1 + \eta_1)| + |(\xi_2 + \eta_2)| \leq (|\xi_1| + |\eta_1|) + (|\xi_2| + |\eta_2|) = \|x\|_1 + \|y\|_1`.

2. For the :math:`L^2` norm:

   - Non-negativity: The sum of squares is non-negative, and so is their square root, hence :math:`\|x\|_2 \geq 0`.
   
   - Definiteness: :math:`\|x\|_2 = 0` if and only if :math:`\xi_1^2 + \xi_2^2 = 0`, which occurs only when :math:`\xi_1 = 0` and :math:`\xi_2 = 0`, thus :math:`x = 0`.
   
   - Scalar multiplication: :math:`\|\alpha x\|_2 = ((\alpha \xi_1)^2 + (\alpha \xi_2)^2)^{1/2} = |\alpha| (\xi_1^2 + \xi_2^2)^{1/2} = |\alpha| \|x\|_2`.
   
   - Triangle inequality: This follows from the Minkowski inequality, which is a general result and holds for the :math:`L^2` norm.

3. For the :math:`L^\infty` norm:

   - Non-negativity: The maximum of absolute values is non-negative, so :math:`\|x\|_{\infty} \geq 0`.
   
   - Definiteness: :math:`\|x\|_{\infty} = 0` if and only if both :math:`|\xi_1| = 0` and :math:`|\xi_2| = 0`, which means :math:`x = 0`.
   
   - Scalar multiplication: For any scalar :math:`\alpha`, :math:`\|\alpha x\|_{\infty} = \max\{|\alpha \xi_1|, |\alpha \xi_2|\} = |\alpha| \max\{|\xi_1|, |\xi_2|\} = |\alpha| \|x\|_{\infty}`.
   
   - Triangle inequality: For any vectors :math:`x` and :math:`y`, :math:`\|x + y\|_{\infty} \leq \|x\|_{\infty} + \|y\|_{\infty}` because the maximum absolute value of the sum of components is less than or equal to the sum of the maximum absolute values.

**Triangle inequality**

For the :math:`L^2` norm, we want to prove the triangle inequality:

.. math::
   \|x + y\|_2 \leq \|x\|_2 + \|y\|_2

where :math:`x = (\xi_1, \xi_2)` and :math:`y = (\eta_1, \eta_2)`. We start by squaring both sides of the inequality:

.. math::
   (\|x + y\|_2)^2 \leq (\|x\|_2 + \|y\|_2)^2

Expanding the left-hand side, we have:

.. math::
   (\xi_1 + \eta_1)^2 + (\xi_2 + \eta_2)^2

And the right-hand side becomes:

.. math::
   (\|x\|_2)^2 + 2\|x\|_2\|y\|_2 + (\|y\|_2)^2

Simplifying the norms, we obtain:

.. math::
   \xi_1^2 + 2\xi_1\eta_1 + \eta_1^2 + \xi_2^2 + 2\xi_2\eta_2 + \eta_2^2 \leq \xi_1^2 + \xi_2^2 + 2\sqrt{(\xi_1^2 + \xi_2^2)(\eta_1^2 + \eta_2^2)} + \eta_1^2 + \eta_2^2

The inequality holds due to the Cauchy-Schwarz inequality, which asserts:

.. math::
   (\sum a_i b_i)^2 \leq (\sum a_i^2)(\sum b_i^2)

In our case, it implies:

.. math::
   (2\xi_1\eta_1 + 2\xi_2\eta_2)^2 \leq (2\sqrt{(\xi_1^2 + \xi_2^2)(\eta_1^2 + \eta_2^2)})^2

Since the inequality holds when squared, it also holds when we take the square root of both sides, which gives us the triangle inequality for the :math:`L^2` norm:

.. math::
   \|x + y\|_2 \leq \|x\|_2 + \|y\|_2

--------------------------------------------

**Problem 7.** Prove that the vector space of all continuous real-valued functions on :math:`[a, b]` forms a normed space :math:`X` with norm defined by

.. math::
   \|x\| = \left( \int_a^b x(t)^2 \, dt \right)^{1/2}

satisfies the properties (N1) to (N4).

**Solution:**

To prove that the given norm satisfies the properties (N1) to (N4), we consider two functions :math:`x(t)` and :math:`y(t)` from the vector space, and a scalar :math:`\alpha`.

(N1) Non-negativity:
Since :math:`x(t)^2 \geq 0` for all :math:`t`, it follows that

.. math::
   \|x\| = \left( \int_a^b x(t)^2 \, dt \right)^{1/2} \geq 0.

(N2) Definiteness:
If :math:`\|x\| = 0`, then

.. math::
   \int_a^b x(t)^2 \, dt = 0.

Since :math:`x(t)^2 \geq 0`, this implies :math:`x(t)^2 = 0` almost everywhere, and hence :math:`x(t) = 0` almost everywhere.

(N3) Scalar multiplication:
We have

.. math::
   \|\alpha x\| = \left( \int_a^b (\alpha x(t))^2 \, dt \right)^{1/2} = |\alpha| \left( \int_a^b x(t)^2 \, dt \right)^{1/2} = |\alpha| \|x\|.

(N4) Triangle inequality:
The proof of the triangle inequality for this norm involves the Cauchy-Schwarz inequality for integrals. We start by expanding the square of the norm of the sum:

.. math::
   \|x + y\|^2 = \int_a^b (x(t) + y(t))^2 \, dt.

Expanding the integrand and applying the Cauchy-Schwarz inequality, we get:

.. math::
   \int_a^b (x(t) + y(t))^2 \, dt = \int_a^b x(t)^2 \, dt + 2\int_a^b x(t)y(t) \, dt + \int_a^b y(t)^2 \, dt \leq \int_a^b x(t)^2 \, dt + 2\left(\int_a^b x(t)^2 \, dt\right)^{1/2} \left(\int_a^b y(t)^2 \, dt\right)^{1/2} + \int_a^b y(t)^2 \, dt.

This implies:

.. math::
   \|x + y\|^2 \leq \left( \left( \int_a^b x(t)^2 \, dt \right)^{1/2} + \left( \int_a^b y(t)^2 \, dt \right)^{1/2} \right)^2.

Taking the square root of both sides, we obtain the triangle inequality:

.. math::
   \|x + y\| \leq \|x\| + \|y\|.

This completes the proof that the vector space of all continuous real-valued functions on :math:`[a, b]` with the given norm is a normed space.

**The more detailes for triangle inequality are:**

.. math::
   \|x+y\|^2 = \int_a^b (x(t) + y(t))^2 \, dt

We expand the integrand:

.. math::
   \int_a^b (x(t) + y(t))^2 \, dt = \int_a^b (x(t)^2 + 2x(t)y(t) + y(t)^2) \, dt

We then split the integral:

.. math::
   \int_a^b (x(t)^2 + 2x(t)y(t) + y(t)^2) \, dt = \int_a^b x(t)^2 \, dt + 2\int_a^b x(t)y(t) \, dt + \int_a^b y(t)^2 \, dt

Using the Cauchy-Schwarz inequality for integrals to handle the cross-term:

.. math::
   \left(\int_a^b x(t)y(t) \, dt\right)^2 \leq \left(\int_a^b x(t)^2 \, dt\right) \left(\int_a^b y(t)^2 \, dt\right)

This implies that:

.. math::
   2\int_a^b x(t)y(t) \, dt \leq 2\left(\int_a^b x(t)^2 \, dt\right)^{1/2} \left(\int_a^b y(t)^2 \, dt\right)^{1/2}

Combine the results to get an upper bound for the integral of the sum:

.. math::
   \|x+y\|^2 \leq \int_a^b x(t)^2 \, dt + 2\left(\int_a^b x(t)^2 \, dt\right)^{1/2} \left(\int_a^b y(t)^2 \, dt\right)^{1/2} + \int_a^b y(t)^2 \, dt

Recognizing that the right-hand side is a perfect square:

.. math::
   \|x+y\|^2 \leq \left( \left( \int_a^b x(t)^2 \, dt \right)^{1/2} + \left( \int_a^b y(t)^2 \, dt \right)^{1/2} \right)^2

Since both sides are positive, we can take the square root:

.. math::
   \|x+y\| \leq \left( \int_a^b x(t)^2 \, dt \right)^{1/2} + \left( \int_a^b y(t)^2 \, dt \right)^{1/2}

Which simplifies to the triangle inequality for the :math:`L^2` norm:

.. math::
   \|x+y\| \leq \|x\| + \|y\|

This completes the proof for the triangle inequality of the :math:`L^2` norm in the vector space of continuous real-valued functions on :math:`[a, b]`.

-------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 8.** There are several norms of practical importance on the vector space ofordered n-tuples of numbers
- :math:`||x||_1 = |ξ_1| + |ξ_2| + \ldots + |ξ_n|`
- :math:`||x||_p = (|ξ_1|^p + |ξ_2|^p + \ldots + |ξ_n|^p)^{1/p}` for :math:`p \geq 1`
- :math:`||x||_\infty = \max\{|ξ_1|, |ξ_2|, \ldots, |ξ_n|\}`

**Solution:**


To verify that each of these functions is a norm, we need to show they satisfy the four properties of norms:

1. Non-negativity: :math:`||x|| \geq 0` for all :math:`x \in X`.
2. Definiteness: :math:`||x|| = 0` if and only if :math:`x` is the zero vector.
3. Homogeneity (or scalability): :math:`||\alpha x|| = |\alpha| ||x||` for any scalar :math:`\alpha` and any :math:`x \in X`.
4. Triangle inequality: :math:`||x + y|| \leq ||x|| + ||y||` for all :math:`x, y \in X`.

For the :math:`p`-norm, the first three properties are straightforward to verify. The triangle inequality for the :math:`p`-norm is established by Minkowski's inequality.

.. math::
   \left(\sum_{i=1}^{n} |ξ_i + η_i|^p\right)^{1/p} \leq \left(\sum_{i=1}^{n} |ξ_i|^p\right)^{1/p} + \left(\sum_{i=1}^{n} |η_i|^p\right)^{1/p}

This is the triangle inequality for the :math:`p`-norms. To prove Minkowski's inequality, we consider:

- For :math:`p=1`, the inequality reduces to the triangle inequality for absolute values, which is trivially true.
- For :math:`p>1`, we use Hölder's inequality, which for :math:`\frac{1}{p} + \frac{1}{q} = 1` (where :math:`p,q>1`), states:

.. math::
   \sum_{i=1}^{n} |ξ_i η_i| \leq \left(\sum_{i=1}^{n} |ξ_i|^p\right)^{1/p} \left(\sum_{i=1}^{n} |η_i|^q\right)^{1/q}

By applying Hölder's inequality, we rewrite the left side of Minkowski's inequality as follows:

.. math::
   \sum_{i=1}^{n} |ξ_i + η_i|^p = \sum_{i=1}^{n} |ξ_i + η_i|^{p-1} |ξ_i + η_i|

We then apply Hölder's inequality with :math:`|ξ_i + η_i|^{p-1}` and :math:`|ξ_i + η_i|` as the sequences, and by doing the same for :math:`|η_i|` instead of :math:`|ξ_i|`, and then summing the inequalities, we obtain:

.. math::
   \left(\sum_{i=1}^{n} |ξ_i + η_i|^p\right) \leq \left(\sum_{i=1}^{n} |ξ_i + η_i|^p\right)^{\frac{p}{p-1}} \left(\left(\sum_{i=1}^{n} |ξ_i|^p\right)^{1/p} + \left(\sum_{i=1}^{n} |η_i|^p\right)^{1/p}\right)

Raising both sides to the :math:`\frac{1}{p}` power completes the proof of Minkowski's inequality and establishes the triangle inequality for the :math:`p`-norm.

By verifying that each function satisfies all four norm properties, we show that :math:`||x||_1`, :math:`||x||_p`, and :math:`||x||_\infty` each define a norm on the vector space XX.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 9.** Verify that the space :math:`C[a, b]` with the norm given by

.. math::
   \|x\| = \max_{t \in [a, b]} |x(t)|

where :math:`[a, b]` is the interval, defines a norm.

**Solution:**

To verify that the given formula defines a norm on the space :math:`C[a, b]`, we need to check that it satisfies the following properties for all functions :math:`x, y \in C[a, b]` and all scalars :math:`\lambda`:

1. Non-negativity: :math:`\|x\| \geq 0`, and :math:`\|x\| = 0` if and only if :math:`x(t) = 0` for all :math:`t \in [a, b]`.
2. Absolute scalability: :math:`\|\lambda x\| = |\lambda| \|x\|`.
3. Triangle inequality: :math:`\|x + y\| \leq \|x\| + \|y\|`.

**Non-negativity**

For any :math:`x \in C[a, b]`, since :math:`x(t)` is a continuous function on a closed interval, it will attain a maximum absolute value which is non-negative. Thus, :math:`\|x\| = \max_{t \in [a, b]} |x(t)| \geq 0`. Also, :math:`\|x\| = 0` if and only if :math:`|x(t)| = 0` for all :math:`t`, which means :math:`x(t) = 0` for all :math:`t \in [a, b]`.

**Absolute scalability**

For any scalar :math:`\lambda` and any :math:`x \in C[a, b]`, we have:

.. math::
   \|\lambda x\| = \max_{t \in [a, b]} |\lambda x(t)| = |\lambda| \max_{t \in [a, b]} |x(t)| = |\lambda| \|x\|

This follows because the absolute value function is homogeneous, meaning :math:`|ab| = |a||b|` for all :math:`a, b`.

**Triangle inequality**

The triangle inequality states that for any :math:`x, y \in C[a, b]`, the norm of their sum is less than or equal to the sum of their norms:

.. math::
   \|x + y\| = \max_{t \in [a, b]} |x(t) + y(t)| \leq \max_{t \in [a, b]} (|x(t)| + |y(t)|) \leq \max_{t \in [a, b]} |x(t)| + \max_{t \in [a, b]} |y(t)| = \|x\| + \|y\|

The inequality :math:`|x(t) + y(t)| \leq |x(t)| + |y(t)|` follows from the triangle inequality for absolute values, and we use the fact that the maximum value of a sum is less than or equal to the sum of the maximum values.

Since the given norm satisfies all three properties, it is indeed a norm on the space :math:`C[a, b]`.

**Clarification of Non-negativity Property:**

For any function :math:`x` in :math:`C[a, b]`, the norm is defined as

.. math::
   \|x\| = \max_{t \in [a, b]} |x(t)|

Since :math:`x(t)` is a continuous function on the closed interval :math:`[a, b]`, it has the following properties:

1. **Boundedness**: A continuous function on a closed interval is bounded. That is, there exists a real number :math:`M` such that :math:`|x(t)| \leq M` for all :math:`t \in [a, b]`.

2. **Attainment of Bounds**: By the extreme value theorem, a continuous function on a closed interval attains its maximum and minimum values at least once within that interval. Therefore, there exists some :math:`t_{\text{max}} \in [a, b]` where :math:`|x(t_{\text{max}})| = \max_{t \in [a, b]} |x(t)|`.

With these properties, the non-negativity of the norm can be discussed in detail:

- **Non-negativity**: The norm :math:`\|x\|` is always non-negative because absolute values are non-negative, and because :math:`x` is continuous, it achieves a maximum absolute value on :math:`[a, b]`. This maximum is the value of the norm and cannot be negative.

- **Zero Norm**: The norm :math:`\|x\|` is zero if and only if the maximum absolute value that :math:`x(t)` achieves over the interval :math:`[a, b]` is zero. If :math:`\|x\| = 0`, then :math:`\max_{t \in [a, b]} |x(t)| = 0`, implying that :math:`|x(t)| = 0` for all :math:`t \in [a, b]`. Since a real number's absolute value is zero if and only if the number itself is zero, it follows that :math:`x(t) = 0` for all :math:`t \in [a, b]`. Conversely, if :math:`x(t) = 0` for all :math:`t \in [a, b]`, then clearly :math:`\|x\| = 0`.

These points confirm the non-negativity of the norm and the condition under which the norm of a function is zero.

**Why a Continuous Function on a Closed Interval is Bounded:**

A continuous function on a closed interval \([a, b]\) is guaranteed to be bounded. This assertion is supported by the Boundedness Theorem, which is a direct consequence of the Extreme Value Theorem. The reasoning is as follows:

- **Closed Interval**: A closed interval :math:`[a, b]` includes its endpoints, making it a compact set in the real numbers. Compactness in real numbers implies that the set is both closed and bounded.

- **Continuity**: A function :math:`f` is continuous on :math:`[a, b]` if, for every point :math:`c` in the interval and every :math:`\epsilon > 0`, there exists a :math:`\delta > 0` such that for all :math:`x` within :math:`\delta` of :math:`c`, the value of :math:`f(x)` is within :math:`\epsilon` of :math:`f(c)`. This means the function does not exhibit jumps, breaks, or infinite behavior within the interval.

- **Extreme Value Theorem**: Due to continuity and the closed nature of the interval, the Extreme Value Theorem ensures that a continuous function on a closed interval will attain both its maximum and minimum values within that interval. This theorem does not hold for open intervals or functions that are not continuous.

**Intuitive Explanation**:

If a continuous function were not bounded on a closed interval, it would suggest that the function could assume arbitrarily large or small values. However, continuity ensures a gradual change without sudden leaps. As the interval is closed, the function cannot 'escape' to infinity at the endpoints, because these points are part of the interval and the function must be defined and finite at them. If the function were unbounded, there would exist points where the function's values would become arbitrarily large, contradicting the very definition of continuity.

Thus, the interplay between the function's continuity (precluding abrupt changes or infinite values) and the interval's closed nature (disallowing endpoints from being unbounded) ensures that the function must be bounded.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem Statement** Show that the closed unit ball :math:`\tilde{B}_1(0)` in a normed space :math:`X` is convex.

**Solution:**
To prove that the closed unit ball :math:`\tilde{B}_1(0)` is convex, we need to demonstrate that for any two points :math:`x, y \in \tilde{B}_1(0)`, the line segment joining them is entirely contained within :math:`\tilde{B}_1(0)`. A line segment in a vector space can be represented as the set of all convex combinations of :math:`x` and :math:`y`, which is given by

.. math::
   z = \alpha x + (1 - \alpha) y

where :math:`0 \leq \alpha \leq 1`. The point :math:`z` is a point on the line segment between :math:`x` and :math:`y`, varying smoothly from one to the other as :math:`\alpha` goes from 0 to 1.

Now, we must show that :math:`z` also belongs to :math:`\tilde{B}_1(0)`, which means that :math:`\|z\| \leq 1`. Given that :math:`x, y \in \tilde{B}_1(0)`, we have :math:`\|x\| \leq 1` and :math:`\|y\| \leq 1`. The norm of :math:`z` is computed as follows:

.. math::
   \|z\| = \|\alpha x + (1 - \alpha) y\| \leq \alpha \|x\| + (1 - \alpha) \|y\|

Here we have used the triangle inequality and the property of absolute scalability of norms. Because :math:`\|x\| \leq 1` and :math:`\|y\| \leq 1`, it follows that:

.. math::
   \alpha \|x\| + (1 - \alpha) \|y\| \leq \alpha \cdot 1 + (1 - \alpha) \cdot 1 = \alpha + 1 - \alpha = 1

Hence, :math:`\|z\| \leq 1`, which implies that :math:`z` is in :math:`\tilde{B}_1(0)`. This confirms that :math:`\tilde{B}_1(0)` is convex, as every point :math:`z` formed as a convex combination of any two points :math:`x` and :math:`y` in :math:`\tilde{B}_1(0)` also lies within :math:`\tilde{B}_1(0)`.

**Explanation:**

The point :math:`z = \alpha x + (1 - \alpha) y` is crucial in the definition of a convex set because it represents any point on the line segment between two points :math:`x` and :math:`y` within a vector space :math:`X`. The scalar :math:`\alpha` ranges from 0 to 1 and determines the position of :math:`z` on the line segment:

- When :math:`\alpha = 0`, the expression becomes :math:`z = 0 \cdot x + (1 - 0) \cdot y = y`, placing :math:`z` at the point :math:`y`.
- When :math:`\alpha = 1`, it simplifies to :math:`z = 1 \cdot x + (1 - 1) \cdot y = x`, positioning :math:`z` at the point :math:`x`.
- For values of :math:`\alpha` between 0 and 1, :math:`z` lies within the line segment connecting :math:`x` and :math:`y`.

A set is convex if, for every pair of points within the set, the entire line segment that connects them also lies within the set. The point :math:`z` symbolizes a general point on the line segment between :math:`x` and :math:`y`. Demonstrating that for all values of :math:`\alpha` in the closed interval [0, 1], :math:`z` remains within the set proves the set's convexity. This is the essence of why the expression :math:`z = \alpha x + (1 - \alpha) y` is used: it is a generic representation of any point on the line segment, and verifying that all such points are contained within the set for all :math:`\alpha` in [0, 1] affirms the convexity of the set.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem Statement 15.** Show that a subset :math:`M` in a normed space :math:`X` is bounded if and only if there is a positive number :math:`c` such that :math:`\|x\| \leq c` for every :math:`x \in M`. The diameter :math:`\delta(A)` of a nonempty set :math:`A` in a metric space :math:`(X, d)` is defined to be :math:`\delta(A) = \sup \{d(x, y) : x, y \in A\}`. A set :math:`A` is said to be bounded if :math:`\delta(A) < \infty`.

**Solution:**

If :math:`M` is bounded, then there exists a :math:`c` such that :math:`\|x\| \leq c` for every :math:`x \in M`:

Step 1: Assume :math:`M` is bounded.
  By definition of boundedness in the context of a normed space, this means that the diameter :math:`\delta(M)`, which is the supremum of the distances between all pairs of points in :math:`M`, is less than infinity. In mathematical terms, :math:`\delta(M) = \sup \{\|x - y\| : x, y \in M\} = b < \infty`.

Step 2: Choose any :math:`x \in M` and also take a fixed element :math:`x_0 \in M`.
  We need a reference point in :math:`M` to compare all other points to. The choice of :math:`x_0` is arbitrary but will be used to help establish a universal bound for the norm of any element in :math:`M`.

Step 3: Define :math:`c = b + \|x_0\|`, which is a positive number.
  Here :math:`b` is the diameter :math:`\delta(M)` we defined earlier, which captures the maximum distance between any two points in :math:`M`. We are defining a new constant :math:`c` that not only accounts for this maximum distance but also adds the norm of our reference point :math:`x_0` to ensure that :math:`c` will be an upper bound for the norm of any point in :math:`M`.

**Step 4:** For any :math:`x \in M`, estimate :math:`\|x\|` using the triangle inequality:
  
  .. math::
     \|x\| = \|x - x_0 + x_0\| \leq \|x - x_0\| + \|x_0\| \leq b + \|x_0\| = c.

  The last step uses the fact that :math:`\delta(M) = b` is the supremum of all such norms :math:`\|x - x_0\|`, and therefore :math:`\|x - x_0\|` cannot exceed :math:`b`.

Step 5: This shows that for every :math:`x \in M`, :math:`\|x\| \leq c`.
  The definition of :math:`c` was constructed to be a bound for the norms of all points in :math:`M` relative to the fixed point :math:`x_0` and the diameter of :math:`M`.

**Conversely** , if there exists a :math:`c` such that :math:`\|x\| \leq c` for every :math:`x \in M`, then :math:`M` is bounded:

Step 1: Assume that for every :math:`x \in M`, :math:`\|x\| \leq c` for some positive number :math:`c`.
  This is the hypothesis that there is a uniform bound on the norms of all elements in the set :math:`M`.

**Step 2:** For any :math:`x, y \in M`, using the triangle inequality we have:
  
  .. math::
     \|x - y\| \leq \|x\| + \|y\|.

  This is the triangle inequality applied to the points :math:`x` and :math:`y` in :math:`M`.

**Step 3:** Since :math:`\|x\| \leq c` and :math:`\|y\| \leq c`, it follows that:
  
  .. math::
     \|x - y\| \leq c + c = 2c.

  This step uses the bound for the norms of :math:`x` and :math:`y` to establish a bound for the distance between them.

**Step 4:** This inequality holds for all :math:`x, y \in M`, so :math:`\delta(M)`, the supremum of all such distances, is at most :math:`2c`.
  Here we use the definition of :math:`\delta(M)` again, which is the supremum of all distances between points in :math:`M`. Since we've shown that every such distance is bounded by :math:`2c`, it follows that :math:`\delta(M) \leq 2c`.

Step 5: Therefore, :math:`\delta(M) \leq 2c < \infty`, which means :math:`M` is bounded.
  Since :math:`2c` is a finite number, the supremum of the set of distances (the diameter) is also finite, confirming that :math:`M` is bounded by definition.

In both directions of the proof, the definition of :math:`\delta(M)` as the supremum of distances :math:`\|x - y\|` for :math:`x, y \in M` is crucial for establishing the boundedness of :math:`M`.



