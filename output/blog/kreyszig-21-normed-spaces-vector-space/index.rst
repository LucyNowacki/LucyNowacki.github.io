.. title: Kreyszig 2.1, Normed Spaces - Vector Space
.. slug: kreyszig-21-normed-spaces-vector-space
.. date: 2023-10-11 15:24:36 UTC+01:00
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text


**Problem 1. Show that the set of real numbers, with the usual addition and multiplication, constitutes a one-dimensional real vector space, and the set of all complex numbers constitutes a one-dimensional complex vector space.**

**Proof for Real Numbers as a One-Dimensional Real Vector Space**

1. **Additive Identity**: There exists a number :math:`0` such that for every real number :math:`x`, :math:`x + 0 = x`.
   
   **Example**:
   
   .. math::
      5 + 0 = 5

2. **Additive Inverse**: For every real number :math:`x`, there exists a number :math:`-x` such that :math:`x + (-x) = 0`.
   
   **Example**:
   
   .. math::
      5 + (-5) = 0

3. **Closure under Addition**: For every pair of real numbers :math:`x` and :math:`y`, their sum :math:`x + y` is also a real number.
   
   **Example**:
   
   .. math::
      5 + 3 = 8

4. **Closure under Scalar Multiplication**: For every real number :math:`x` and every scalar :math:`a`, the product :math:`ax` is also a real number.
   
   **Example**:
   
   .. math::
      3 \times 5 = 15

5. **Distributivity of Scalar Multiplication with respect to Vector Addition**: For every real number :math:`x` and :math:`y` and every scalar :math:`a`, :math:`a(x + y) = ax + ay`.
   
   **Example**:
   
   .. math::
      3(5 + 2) = 3 \times 5 + 3 \times 2

6. **Distributivity of Scalar Multiplication with respect to Scalar Addition**: For every real number :math:`x` and scalars :math:`a` and :math:`b`, :math:`(a + b)x = ax + bx`.
   
   **Example**:
   
   .. math::
      (3 + 2) \times 5 = 3 \times 5 + 2 \times 5

7. **Associativity of Scalar Multiplication**: For every real number :math:`x` and scalars :math:`a` and :math:`b`, :math:`a(bx) = (ab)x`.
   
   **Example**:
   
   .. math::
      3(2 \times 5) = (3 \times 2) \times 5

8. **Multiplicative Identity of Scalar Multiplication**: There exists a scalar :math:`1` such that for every real number :math:`x`, :math:`1 \times x = x`.
   
   **Example**:
   
   .. math::
      1 \times 5 = 5

 :math:`\blacksquare`

**Proof for Complex Numbers as a One-Dimensional Complex Vector Space**


1. **Additive Identity**: There exists a complex number :math:`0` such that for every complex number :math:`z`, :math:`z + 0 = z`.
   
   **Example**:
   
   .. math::
      (3 + 2i) + 0 = 3 + 2i

2. **Additive Inverse**: For every complex number :math:`z`, there exists a complex number :math:`-z` such that :math:`z + (-z) = 0`.
   
   **Example**:
   
   .. math::
      (3 + 2i) + (-3 - 2i) = 0

3. **Closure under Addition**: For every pair of complex numbers :math:`z_1` and :math:`z_2`, their sum :math:`z_1 + z_2` is also a complex number.
   
   **Example**:
   
   .. math::
      (3 + 2i) + (1 + 4i) = 4 + 6i

4. **Closure under Scalar Multiplication**: For every complex number :math:`z` and every scalar :math:`c` in the complex numbers, the product :math:`cz` is also a complex number.
   
   **Example**:
   
   .. math::
      (2 + i) \times (3 + 2i) = 6 + 7i

5. **Distributivity of Scalar Multiplication with respect to Vector Addition**: For every complex number :math:`z_1` and :math:`z_2` and every scalar :math:`c` in the complex numbers, :math:`c(z_1 + z_2) = cz_1 + cz_2`.
   
   **Example**:
   
   .. math::
      (2 + i)((3 + 2i) + (1 + 4i)) = (2 + i)(3 + 2i) + (2 + i)(1 + 4i)

6. **Distributivity of Scalar Multiplication with respect to Scalar Addition**: For every complex number :math:`z` and scalars :math:`c_1` and :math:`c_2` in the complex numbers, :math:`(c_1 + c_2)z = c_1z + c_2z`.
   
   **Example**:
   
   .. math::
      (2 + i + 1)(3 + 2i) = (2 + i)(3 + 2i) + 3 + 2i

7. **Associativity of Scalar Multiplication**: For every complex number :math:`z` and scalars :math:`c_1` and :math:`c_2` in the complex numbers, :math:`c_1(c_2z) = (c_1c_2)z`.
   
   **Example**:
   
   .. math::
      (2 + i)(i(3 + 2i)) = (2 + i \times i)(3 + 2i)

8. **Multiplicative Identity of Scalar Multiplication**: There exists a scalar :math:`1` in the complex numbers such that for every complex number :math:`z`, :math:`1 \times z = z`.
   
   **Example**:
   
   .. math::
      1 \times (3 + 2i) = 3 + 2i

 :math:`\blacksquare`

-------------------------------------------------------------------------------------

**Problem 2. Proof for Properties of the Zero Vector**

Given that :math:`\theta` is the zero vector in a vector space.

1. **Proof** for :math:`0 \cdot \mathbf{x} = \theta`:

   Using the distributive property of scalar multiplication over vector addition, we have:

   .. math::
      0 \cdot \mathbf{x} = (0 + 0) \cdot \mathbf{x} = 0 \cdot \mathbf{x} + 0 \cdot \mathbf{x}

   Subtracting :math:`0 \cdot \mathbf{x}` from both sides:

   .. math::
      0 \cdot \mathbf{x} - 0 \cdot \mathbf{x} = \theta

   Thus, :math:`0 \cdot \mathbf{x} = \theta`.

      :math:`\blacksquare`

2. **Proof** for :math:`\alpha \cdot \theta = \theta`:

   For any scalar :math:`\alpha`:

   .. math::
      \alpha \cdot \theta = \alpha \cdot (0 \cdot \mathbf{x}) = (\alpha \cdot 0) \cdot \mathbf{x} = 0 \cdot \mathbf{x} = \theta

   Therefore, :math:`\alpha \cdot \theta = \theta`.

     :math:`\blacksquare`

**Proof for the Property** :math:`(-1) \cdot \mathbf{x} = -\mathbf{x}`

Given a vector :math:`\cdot` in a vector space.

To prove: :math:`(-1) \cdot \mathbf{x} = -\mathbf{x}`

**Proof**:

Using the distributive property of scalar multiplication over scalar addition, we have:

.. math::
   \mathbf{x} + (-1) \cdot \mathbf{x} = (1 + (-1)) \cdot \mathbf{x} = 0 \cdot \mathbf{x}

From a previous proof, we know that:

.. math::
   0 \cdot \mathbf{x} = \theta

Where :math:`\theta` is the zero vector.

Therefore:

.. math::
   \mathbf{x} + (-1) \cdot \mathbf{x} = \theta

This implies that :math:`(-1) \cdot \mathbf{x}` is the additive inverse of :math:`\mathbf{x}`, which is denoted as :math:`-\mathbf{x}`.

Hence, :math:`(-1) \cdot \mathbf{x} = -\mathbf{x}`.

     :math:`\blacksquare`

------------------------------------------------------------------------------------------------------------------

**Problem 3. Span of the Set M** in :math:`\mathbb{R}^3`

The span of a set of vectors is the set of all linear combinations of those vectors. In other words, it's the set of all vectors that can be obtained by taking weighted sums of the vectors in the set.

Given the set :math:`M = \{ (1,1,1), (0,0,2) \}` in :math:`\mathbb{R}^3`, any vector in the span of :math:`M` can be written as:

.. math::
   \alpha (1,1,1) + \beta (0,0,2) = (\alpha, \alpha, \alpha + 2\beta)

From the above expression, we can see that:

1. The first and second components of any vector in the span are always equal.
2. The third component can be any real number since :math:`\alpha` and :math:`\beta` can be any real numbers.

Thus, the span of :math:`M` in :math:`\mathbb{R}^3` is the set of all vectors of the form :math:`(a, a, b)` where :math:`a` and :math:`b` are real numbers. This is a plane in :math:`\mathbb{R}^3` that passes through the origin and is defined by the equation :math:`x = y`.

Visualization

.. image:: https://www6b3.wolframalpha.com/Calculate/MSP/MSP534170df867fd63c0f0000027ch9e42i92b0004?MSPStoreType=image/png&s=20
   :alt: 3D Visualization of the plane x=y
   :align: center

This plane passes through the origin and spans infinitely in all directions within the plane. The vectors :math:`(1,1,1)` and :math:`(0,0,2)` from the set :math:`M` lie on this plane, and their linear combinations fill out the entire plane.

     :math:`\blacksquare`

-----------------------------------------------------------------------------

**Problem 4. Determination of Subspaces in** :math:`\mathbb{R}^3`

To determine whether a subset of :math:`\mathbb{R}^3` constitutes a subspace, it must satisfy the following three properties:

1. The zero vector of :math:`\mathbb{R}^3` is in the subset.
2. The subset is closed under vector addition.
3. The subset is closed under scalar multiplication.

Given the subsets:

(a) All :math:`x` with :math:`\xi_1 = \xi_2`, and :math:`\xi_2 = 0`

**Evaluation**:

This means :math:`x` is of the form :math:`(0, 0, \xi_3)`. 

1. The zero vector :math:`(0, 0, 0)` is in this subset.
2. Sum of any two vectors in this subset will also be in this subset.
3. Scalar multiplication of any vector in this subset will also be in this subset.

Thus, (a) is a subspace of :math:`\mathbb{R}^3`.

(b) All :math:`x` with :math:`\xi_1 = \xi_2 + 1`

**Evaluation**:

1. This subset doesn't contain the zero vector.
2. It's not closed under scalar multiplication since multiplying by a negative scalar will result in a vector outside this subset.

Thus, (b) is not a subspace of :math:`\mathbb{R}^3`.

(c) All :math:`x` with positive :math:`\xi_1, \xi_2, \xi_3`

**Evaluation**:

1. This subset doesn't contain the zero vector.
2. It's not closed under scalar multiplication since multiplying by a negative scalar will result in a vector outside this subset.

Thus, (c) is not a subspace of :math:`\mathbb{R}^3`.

(d) All :math:`x` with :math:`\xi_1 - \xi_2 + \xi_3 = \text{const}`

**Evaluation**:

If the constant is zero, then this subset could be a subspace. But if the constant is any other value, then the subset won't contain the zero vector, so it won't be a subspace.

**Conclusion**:

- (a) is a subspace of :math:`\mathbb{R}^3`.
- (b) is not a subspace of :math:`\mathbb{R}^3`.
- (c) is not a subspace of :math:`\mathbb{R}^3`.
- (d) could be a subspace if the constant is zero; otherwise, it's not.

:math:`\blacksquare`

--------------------------------------------------------------------------------------------

**Problem 5.** The space :math:`C[a,b]` consists of all continuous functions defined on the closed interval :math:`[a, b]`. That is, :math:`C[a,b]` is the set of functions :math:`f: [a, b] \to \mathbb{R}` such that :math:`f` is continuous on :math:`[a, b]`.

**Proof of Linear Independence**

To show that the set :math:`\{ x_1, ..., x_n \}`, where :math:`x_j(x) = t^j` for :math:`j = 1, ..., n`, is linearly independent in :math:`C[a,b]`, we need to show that the only scalars :math:`c_1, ..., c_n` that satisfy the equation

.. math::
   c_1 x_1(t) + c_2 x_2(t) + ... + c_n x_n(t) = 0

for all :math:`t` in :math:`[a, b]` are :math:`c_1 = c_2 = ... = c_n = 0`.

Given the functions :math:`x_j(t) = t^j`, the above equation becomes:

.. math::
   c_1 t + c_2 t^2 + ... + c_n t^n = 0

This is a polynomial of degree :math:`n`. If this polynomial is identically zero on the interval :math:`[a, b]`, then all its coefficients must be zero. This is because a non-zero polynomial of degree :math:`n` can have at most :math:`n` roots, but if the polynomial is zero for all :math:`t` in a continuous interval, it must be the zero polynomial.

Therefore, :math:`c_1 = c_2 = ... = c_n = 0`, which proves that the set :math:`\{ x_1, ..., x_n \}` is linearly independent in :math:`C[a,b]`.


     :math:`\blacksquare`

**Clarification on Polynomials and Their Roots**

A polynomial of degree :math:`n` is an expression of the form:

.. math::
   p(t) = c_0 + c_1 t + c_2 t^2 + \dots + c_n t^n

where :math:`c_0, c_1, \dots, c_n` are coefficients and :math:`n` is a non-negative integer.

The Fundamental Theorem of Algebra states that a non-zero polynomial of degree :math:`n` has exactly :math:`n` roots, counting multiplicities. This means that the polynomial can be zero at most :math:`n` times.

However, if we have a polynomial that is zero for every value of :math:`t` in a continuous interval (like :math:`[a, b]`), then it's not just zero at isolated points—it's zero everywhere in that interval. This behavior is inconsistent with a polynomial that has non-zero coefficients because such a polynomial would not be zero at more than :math:`n` points.

Therefore, the only way a polynomial can be zero for all :math:`t` in a continuous interval is if it's the zero polynomial, which means all its coefficients :math:`c_0, c_1, \dots, c_n` are zero.

In simpler terms: If you have a polynomial that's zero everywhere in an interval, then it's actually the zero polynomial, and all its coefficients are zero.

**The crux of the proof is:**

If a polynomial is zero for every value of t within a continuous interval (like [a,b]), then it cannot merely be the result of the polynomial having roots within that interval. Instead, the polynomial must be the zero polynomial, meaning all its coefficients are zero.

In essence, a non-zero polynomial can only be zero at a finite number of points determined by its degree. If it's zero everywhere in a continuous interval, it contradicts this property, so it must be the zero polynomial.

--------------------------------------------------------------------------------------

**Problem 6.** Show that in an :math:`n`-dimensional vector space :math:`X`, the representation of any vector :math:`x` as a linear combination of a given basis vectors :math:`e_1, \dots, e_n` is unique.

**Proof**:

Assume, for the sake of contradiction, that there are two different representations of the vector :math:`x` in terms of the basis vectors.

Let these representations be:

.. math::

   x = a_1 e_1 + a_2 e_2 + \dots + a_n e_n

   x = b_1 e_1 + b_2 e_2 + \dots + b_n e_n

where :math:`a_i` and :math:`b_i` are scalars, and at least one :math:`a_i` is not equal to :math:`b_i`.

Subtracting the second equation from the first, we get:

.. math::

   0 = (a_1 - b_1) e_1 + (a_2 - b_2) e_2 + \dots + (a_n - b_n) e_n

Now, since :math:`\{ e_1, e_2, \dots, e_n \}` is a basis for :math:`X`, these vectors are linearly independent. This means that the only way the above equation can hold is if each coefficient :math:`(a_i - b_i)` is zero.

Thus, :math:`a_i - b_i = 0` for all :math:`i`, which implies :math:`a_i = b_i` for all :math:`i`.

This contradicts our assumption that the two representations were different. Therefore, our original assumption was false, and the representation of any vector :math:`x` as a linear combination of the basis vectors is unique.

     :math:`\blacksquare`

**Truth Table for the Proof's Logic**

.. image:: https://www.wolframcloud.com/obj/845f9add-0989-4031-9cc4-aaec65b61ba3

The logical structure of the proof can be summarized as:

1. **Assumption**: There are two different representations of :math:`x`.
2. **Implication**: Subtracting the two representations results in a non-zero polynomial.
3. **Contradiction**: A non-zero polynomial cannot be zero everywhere in a continuous interval.
4. **Conclusion**: The assumption is false; the representation is unique.

.. note:: 
   This truth table is a simplification and doesn't capture the full depth of the proof. The proof's logic is more nuanced than what can be represented in a binary truth table.

--------------------------------------------------------------------------------------------

**Problem 7:** Basis and Dimension of Complex Vector Space :math:`X`

**Problem Statement**:

Let :math:`\{e_1,...,e_n\}` be a basis for a complex vector space :math:`X`. Find the basis for :math:`X` regarded as a real vector space. What is the dimension of :math:`X` in either case?

**Solution**:

1. **Basis for :math:`X` as a Complex Vector Space**:

Given that :math:`\{e_1, \dots, e_n\}` is a basis for the complex vector space :math:`X`, any vector :math:`v` in :math:`X` can be expressed as:

.. math::
   v = a_1 e_1 + a_2 e_2 + \dots + a_n e_n

where :math:`a_i` are complex numbers.

2. **Basis for :math:`X` as a Real Vector Space**:

When we regard :math:`X` as a real vector space, the basis for :math:`X` is:

.. math::
   \{e_1, i e_1, e_2, i e_2, \dots, e_n, i e_n\}

3. **Dimension of :math:`X` in Either Case**:

- As a complex vector space, the dimension of :math:`X` is :math:`n`.
  
- As a real vector space, the dimension of :math:`X` is :math:`2n`.

:math:`\blacksquare`

------------------------------------------------------------------------------------------------

**Problem 8.** If :math:`M` is a linearly dependent set in a complex vector space :math:`X`, is :math:`M` linearly dependent in :math:`X`, regarded as a real vector space?

**Solution**

If :math:`M` is linearly dependent in a complex vector space :math:`X`, then there exist complex scalars, not all zero, such that:

.. math::

   c_1 v_1 + c_2 v_2 + \dots + c_n v_n = 0

where :math:`v_1, v_2, \dots, v_n` are vectors in :math:`M` and at least one of the :math:`c_i` is non-zero.

Now, when we regard :math:`X` as a real vector space, each complex scalar :math:`c_i` can be expressed as:

.. math::

   c_i = a_i + b_i i

where :math:`a_i` and :math:`b_i` are real numbers.

Substituting this into our linear combination, we get:

.. math::

   (a_1 + b_1 i) v_1 + (a_2 + b_2 i) v_2 + \dots + (a_n + b_n i) v_n = 0

This can be rearranged as:

.. math::

   a_1 v_1 + a_2 v_2 + \dots + a_n v_n + i(b_1 v_1 + b_2 v_2 + \dots + b_n v_n) = 0

For the above equation to hold true, both the real part and the imaginary part of the equation must be zero:

.. math::

   a_1 v_1 + a_2 v_2 + \dots + a_n v_n = 0
   b_1 v_1 + b_2 v_2 + \dots + b_n v_n = 0

Given that at least one of the :math:`c_i` is non-zero, it implies that at least one of the :math:`a_i` or :math:`b_i` is non-zero. Therefore, the set :math:`M` is also linearly dependent when :math:`X` is regarded as a real vector space.

**Conclusion**

Yes, if :math:`M` is linearly dependent in a complex vector space :math:`X`, then :math:`M` is also linearly dependent in :math:`X` when regarded as a real vector space.

:math:`\blacksquare`