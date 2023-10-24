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

---------------------------------------------------------------------------------------------------------------------------------------

**Problem 9 Statement**

On a fixed interval :math:`[a, b] \subset \mathbb{R}`, consider the set :math:`X` consisting of all polynomials with real coefficients and of degree not exceeding a given :math:`n`, and the polynomial :math:`x = 0` (for which a degree is not defined in a usual discussion of degree). Show that :math:`X` with usual addition and usual multiplication by real numbers is a real vector space of dimension :math:`n+1`.

**/ Solution**

**Vector Space Axioms Verification**:

1. **Closure under Addition**: 
   For any two polynomials :math:`p(t), q(t) \in X`, their sum :math:`p(t) + q(t)` is also a polynomial with real coefficients, and its degree is not exceeding :math:`n`. Therefore, :math:`p(t) + q(t) \in X`.

2. **Closure under Scalar Multiplication**: 
   For any polynomial :math:`p(t) \in X` and any real number :math:`c`, the product :math:`c \cdot p(t)` is also a polynomial with real coefficients, and its degree is not exceeding :math:`n`. Therefore, :math:`c \cdot p(t) \in X`.

3. **Associativity of Addition**: 
   For any :math:`p(t), q(t), r(t) \in X`, :math:`(p(t) + q(t)) + r(t) = p(t) + (q(t) + r(t))`.

4. **Commutativity of Addition**: 
   For any :math:`p(t), q(t) \in X`, :math:`p(t) + q(t) = q(t) + p(t)`.

5. **Identity Element of Addition**: 
   The zero polynomial :math:`0` acts as the additive identity in :math:`X`, since for any :math:`p(t) \in X`, :math:`p(t) + 0 = p(t)`.

6. **Inverse Elements of Addition**: 
   For every :math:`p(t) \in X`, its additive inverse is :math:`-p(t)`, which is also in :math:`X`. Thus, :math:`p(t) + (-p(t)) = 0`.

7. **Compatibility of Scalar Multiplication with Field Multiplication**: 
   For any real numbers :math:`a, b` and any :math:`p(t) \in X`, :math:`a \cdot (b \cdot p(t)) = (a \cdot b) \cdot p(t)`.

8. **Identity Element of Scalar Multiplication**: 
   For any :math:`p(t) \in X`, :math:`1 \cdot p(t) = p(t)`, where 1 is the multiplicative identity in :math:`\mathbb{R}`.

9. **Distributivity of Scalar Multiplication with respect to Vector Addition**: 
   For any real number :math:`a` and any :math:`p(t), q(t) \in X`, :math:`a \cdot (p(t) + q(t)) = a \cdot p(t) + a \cdot q(t)`.

10. **Distributivity of Scalar Multiplication with respect to Scalar Addition**: 
    For any real numbers :math:`a, b` and any :math:`p(t) \in X`, :math:`(a + b) \cdot p(t) = a \cdot p(t) + b \cdot p(t)`.

**Basis and Dimension**:

A basis for :math:`X` can be the set of monomials :math:`\{e_0, e_1, \ldots, e_n\}`, where :math:`e_j(t) = t^j` for :math:`t \in [a, b]` and :math:`0 \leq j \leq n`. This set is linearly independent and spans :math:`X`, as any polynomial of degree not exceeding :math:`n` can be written as a linear combination of these monomials.

The dimension of :math:`X` is the number of vectors in its basis, which is :math:`n+1`.

**Conclusion**:

:math:`X` is a real vector space of dimension :math:`n+1` on the interval :math:`[a, b]`, with a basis :math:`\{e_0, e_1, \ldots, e_n\}`.


**Problem 9 (Real Polynomial Example) Statement**

On a fixed interval :math:`[a, b] \subset \mathbb{R}`, consider two specific real polynomials :math:`p(t) = 2t^2 + 3t + 1` and :math:`q(t) = t^2 - 2t + 4`. Show that the set :math:`X` of all real polynomials of degree not exceeding a given :math:`n` with the usual addition and scalar multiplication is a real vector space.

**Solution**

**Vector Space Axioms Verification**:

1. **Closure under Addition**: 

   .. math::
      p(t) + q(t) = (2t^2 + 3t + 1) + (t^2 - 2t + 4) = 3t^2 + t + 5

   The result is a polynomial of degree 2, which is not exceeding :math:`n` if :math:`n \geq 2`.

2. **Closure under Scalar Multiplication**: 
   Let's take a real number :math:`c = 3`.

   .. math::
      c \cdot p(t) = 3 \cdot (2t^2 + 3t + 1) = 6t^2 + 9t + 3

   The result is a polynomial of degree 2, which is not exceeding :math:`n` if :math:`n \geq 2`.

3. **Associativity of Addition**: 
   Let's take another polynomial :math:`r(t) = 4t - 1`.

   .. math::
      (p(t) + q(t)) + r(t) = (3t^2 + t + 5) + (4t - 1) = 3t^2 + 5t + 4
      p(t) + (q(t) + r(t)) = (2t^2 + 3t + 1) + (5t^2 - 2t + 3) = 3t^2 + 5t + 4

   Both results are equal.

4. **Commutativity of Addition**: 

   .. math::
      p(t) + q(t) = 3t^2 + t + 5
      q(t) + p(t) = 3t^2 + t + 5

   Both results are equal.

5. **Identity Element of Addition**: 
   The zero polynomial is :math:`0`.

   .. math::
      p(t) + 0 = 2t^2 + 3t + 1
      0 + p(t) = 2t^2 + 3t + 1

   Both results are equal to :math:`p(t)`.

6. **Inverse Elements of Addition**: 
   The additive inverse of :math:`p(t)` is :math:`-p(t) = -2t^2 - 3t - 1`.

   .. math::
      p(t) + (-p(t)) = 2t^2 + 3t + 1 + (-2t^2 - 3t - 1) = 0

7. **Compatibility of Scalar Multiplication with Field Multiplication**: 
   For real numbers :math:`a = 2` and :math:`b = 3`,

   .. math::
      a \cdot (b \cdot p(t)) = 2 \cdot (3 \cdot (2t^2 + 3t + 1)) = 12t^2 + 18t + 6
      (a \cdot b) \cdot p(t) = (2 \cdot 3) \cdot (2t^2 + 3t + 1) = 12t^2 + 18t + 6

   Both results are equal.

8. **Identity Element of Scalar Multiplication**: 

   .. math::
      1 \cdot p(t) = 1 \cdot (2t^2 + 3t + 1) = 2t^2 + 3t + 1

   The result is equal to :math:`p(t)`.

9. **Distributivity of Scalar Multiplication with respect to Vector Addition**: 
   For any real number :math:`a`,

   .. math::
      a \cdot (p(t) + q(t)) = 3 \cdot (3t^2 + t + 5) = 9t^2 + 3t + 15
      a \cdot p(t) + a \cdot q(t) = 3 \cdot (2t^2 + 3t + 1) + 3 \cdot (t^2 - 2t + 4) = 9t^2 + 3t + 15

   Both results are equal.

10. **Distributivity of Scalar Multiplication with respect to Scalar Addition**: 
    For any real numbers :math:`a, b`,

    .. math::
      (a + b) \cdot p(t) = (3 + 2) \cdot (2t^2 + 3t + 1) = 10t^2 + 15t + 5
      a \cdot p(t) + b \cdot p(t) = 3 \cdot (2t^2 + 3t + 1) + 2 \cdot (2t^2 + 3t + 1) = 10t^2 + 15t + 5

    Both results are equal.

**Basis and Dimension**:

A basis for :math:`X` can be the set of monomials :math:`\{1, t, t^2, \ldots, t^n\}`. In our specific example, a basis for polynomials of degree not exceeding 2 is :math:`\{1, t, t^2\}`.

The dimension of :math:`X` is the number of vectors in its basis, which is :math:`n+1`. In our specific example, the dimension is 3.

**Conclusion**:

The set :math:`X` of all real polynomials of degree not exceeding :math:`n` on the interval :math:`[a, b]` is a real vector space of dimension :math:`n+1`, with the usual addition and scalar multiplication.

**Problem Statement**

Show that we can obtain a complex metric space :math:`\tilde{X}` in a similar fashion if we let the coefficients be complex. Also, determine if :math:`X` is a subspace of :math:`\tilde{X}`.

**Solution**

**Part 1:** Constructing :math:`\tilde{X}`

1. **Set Definition**: 
   Let :math:`\tilde{X}` be the set of all polynomials with complex coefficients of degree not exceeding :math:`n`, along with the zero polynomial. A general element of :math:`\tilde{X}` can be represented as:

   .. math::
      p(t) = c_0 + c_1t + c_2t^2 + \ldots + c_nt^n

   where :math:`c_0, c_1, \ldots, c_n` are complex numbers.

2. **Vector Space Operations**: 

   - **Addition**: For any two polynomials :math:`p(t), q(t) \in \tilde{X}`, their sum :math:`p(t) + q(t)` is also a polynomial in :math:`\tilde{X}` with complex coefficients.

   - **Scalar Multiplication**: For any complex number :math:`\alpha` and any polynomial :math:`p(t) \in \tilde{X}`, the product :math:`\alpha p(t)` is also a polynomial in :math:`\tilde{X}`.

3. **Verification of Vector Space Axioms**: 
   Similar to the real case, one can verify that :math:`\tilde{X}` satisfies all the vector space axioms under these operations.

**Part 2:** Is :math:`X` a Subspace of :math:`\tilde{X}`?

1. **Subspace Criteria**: 
   A subset :math:`Y` of a vector space :math:`Z` is a subspace of :math:`Z` if:

   - The zero vector of :math:`Z` is in :math:`Y`.

   - For every :math:`u, v \in Y`, the sum :math:`u + v` is in :math:`Y`.

   - For every :math:`u \in Y` and scalar :math:`c`, the product :math:`cu` is in :math:`Y`.

2. **Application to** :math:`X` and :math:`\tilde{X}`:

   - The zero polynomial is in both :math:`X` and :math:`\tilde{X}`.

   - The sum of any two polynomials in :math:`X` (with real coefficients) is a polynomial with real coefficients, which is in :math:`X`.

   - The product of any polynomial in :math:`X` by any real number is a polynomial with real coefficients, which is in :math:`X`.

3. **Failure under Complex Scalar Multiplication**: 

   However, if we consider scalar multiplication by complex numbers (as is allowed in :math:`\tilde{X}`), :math:`X` is not closed under this operation. For example, if :math:`p(t) \in X` and :math:`i` is the imaginary unit, :math:`i \cdot p(t)` will be a polynomial with complex coefficients, which is not in :math:`X` but is in :math:`\tilde{X}`.

4. **Conclusion**: 
   While :math:`X` satisfies the criteria for being a subspace under real scalar multiplication, it does not satisfy the criteria under complex scalar multiplication. Therefore, :math:`X` is not a subspace of :math:`\tilde{X}` when :math:`\tilde{X}` is considered as a complex vector space.

----------------------------------------------------------------------------------------------------------------------------------------

**Problem 10.**

If :math:`Y` and :math:`Z` are subspaces of a vector space :math:`X`, show that :math:`Y \cap Z` is a subspace of :math:`X`, but :math:`Y \cup Z` need not be one. Provide three examples to illustrate the concepts.

**Solution**

**Part 1:** :math:`Y \cap Z` is a Subspace

To show that :math:`Y \cap Z` is a subspace of :math:`X`, we need to verify the subspace criteria:

1. **Non-emptiness**: Since :math:`Y` and :math:`Z` are subspaces, they both contain the zero vector. Therefore, :math:`Y \cap Z` is non-empty as it at least contains the zero vector.

2. **Closed under addition**: Let :math:`u` and :math:`v` be any vectors in :math:`Y \cap Z`. Since :math:`u` and :math:`v` are in both :math:`Y` and :math:`Z`, and since :math:`Y` and :math:`Z` are subspaces (and thus closed under addition), :math:`u + v` must be in both :math:`Y` and :math:`Z`. Therefore, :math:`u + v` is in :math:`Y \cap Z`.

3. **Closed under scalar multiplication**: Let :math:`u` be any vector in :math:`Y \cap Z` and let :math:`c` be any scalar. Since :math:`u` is in both :math:`Y` and :math:`Z`, and since :math:`Y` and :math:`Z` are subspaces (and thus closed under scalar multiplication), :math:`c \cdot u` must be in both :math:`Y` and :math:`Z`. Therefore, :math:`c \cdot u` is in :math:`Y \cap Z`.

**Part 2:** :math:`Y \cup Z` Need Not Be a Subspace

To show that :math:`Y \cup Z` need not be a subspace, consider the following examples:

1. **Example 1**: Let :math:`X = \mathbb{R}^2`, :math:`Y = \{(x, 0) \mid x \in \mathbb{R}\}` (the x-axis), and :math:`Z = \{(0, y) \mid y \in \mathbb{R}\}` (the y-axis). :math:`Y` and :math:`Z` are both subspaces of :math:`X`, but :math:`Y \cup Z` is not because it is not closed under addition. For example, :math:`(1, 0) \in Y` and :math:`(0, 1) \in Z`, but :math:`(1, 0) + (0, 1) = (1, 1) \notin Y \cup Z`.

2. **Example 2**: Let :math:`X = \mathbb{R}^3`, :math:`Y = \{(x, 0, 0) \mid x \in \mathbb{R}\}`, and :math:`Z = \{(0, y, 0) \mid y \in \mathbb{R}\}`. :math:`Y` and :math:`Z` are both subspaces of :math:`X`, but :math:`Y \cup Z` is not a subspace because it is not closed under scalar multiplication. For example, :math:`(1, 0, 0) \in Y`, but :math:`2 \cdot (1, 0, 0) = (2, 0, 0) \notin Y \cup Z`.

3. **Example 3**: Let :math:`X = \mathbb{R}`, :math:`Y = \{2\}`, and :math:`Z = \{3\}`. :math:`Y` and :math:`Z` are both subspaces of :math:`X`, but :math:`Y \cup Z = \{2, 3\}` is not a subspace because it is not closed under addition or scalar multiplication.

**Conclusion**

While the intersection of two subspaces is always a subspace, the union of two subspaces is generally not a subspace unless one of the subspaces is contained within the other. The provided examples illustrate scenarios where the union of two subspaces fails to satisfy the subspace criteria.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Problem 11 Statement

If :math:`M \neq \emptyset` is any subset of a vector space :math:`X`, show that :math:`\text{span}(M)` is a subspace of :math:`X`.

Solution
---------

To prove that :math:`\text{span}(M)` is a subspace of :math:`X`, we need to verify the following properties:

1. **Non-emptiness**: 
   Since :math:`M \neq \emptyset`, there is at least one vector in :math:`M`. The zero vector of :math:`X` can be represented as a linear combination of vectors in :math:`M` with all coefficients being zero. Hence, the zero vector is in :math:`\text{span}(M)`, ensuring that :math:`\text{span}(M)` is non-empty.

   .. math::
      \text{Let } \mathbf{v} \in M, \text{ then } 0 \cdot \mathbf{v} = \mathbf{0} \in \text{span}(M)

2. **Closure under Addition**: 
   Let :math:`\mathbf{u}` and :math:`\mathbf{v}` be any two vectors in :math:`\text{span}(M)`. This means that :math:`\mathbf{u}` and :math:`\mathbf{v}` can be expressed as linear combinations of vectors from :math:`M`. The sum :math:`\mathbf{u} + \mathbf{v}` is also a linear combination of vectors from :math:`M` and is therefore in :math:`\text{span}(M)`.

   .. math::
      \text{Let } \mathbf{u} = \sum_{i=1}^{n} a_i \mathbf{m}_i \text{ and } \mathbf{v} = \sum_{i=1}^{n} b_i \mathbf{m}_i, \text{ where } \mathbf{m}_i \in M
      \text{Then, } \mathbf{u} + \mathbf{v} = \sum_{i=1}^{n} (a_i + b_i) \mathbf{m}_i \in \text{span}(M)

3. **Closure under Scalar Multiplication**: 
   Let :math:`\mathbf{u}` be a vector in :math:`\text{span}(M)` and :math:`c` be any scalar. The product :math:`c\mathbf{u}` is also a linear combination of vectors from :math:`M` and is therefore in :math:`\text{span}(M)`.

   .. math::
      \text{Let } \mathbf{u} = \sum_{i=1}^{n} a_i \mathbf{m}_i, \text{ where } \mathbf{m}_i \in M
      \text{Then, } c\mathbf{u} = c\sum_{i=1}^{n} a_i \mathbf{m}_i = \sum_{i=1}^{n} (ca_i) \mathbf{m}_i \in \text{span}(M)

By verifying these properties, we have shown that :math:`\text{span}(M)` is a subspace of :math:`X`.

------------------------------------------------------------------------------------------------------------------------------------

**Problem 12. Two-rowed squred matrices and thier space**

  To show that the set of all real :math:`2 \times 2` matrices forms a vector space :math:`X`, we need to verify that the set satisfies the eight vector space axioms under matrix addition and scalar multiplication.

  Let's denote the set of all real :math:`2 \times 2` matrices as :math:`X`, and let :math:`A`, :math:`B`, and :math:`C` be arbitrary matrices in :math:`X`, and let :math:`k` and :math:`l` be arbitrary real numbers. The matrices can be represented as follows:

  .. math::
    A = \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix}, \quad B = \begin{bmatrix} b_{11} & b_{12} \\ b_{21} & b_{22} \end{bmatrix}, \quad C = \begin{bmatrix} c_{11} & c_{12} \\ c_{21} & c_{22} \end{bmatrix}

  Now, let's verify the vector space axioms:

  1. **Closure under Addition**: For any :math:`A, B \in X`, :math:`A + B` is also in :math:`X`.

     .. math::
       A + B = \begin{bmatrix} a_{11} + b_{11} & a_{12} + b_{12} \\ a_{21} + b_{21} & a_{22} + b_{22} \end{bmatrix}

     Since the sum of real numbers is a real number, each element of :math:`A + B` is real, and :math:`A + B \in X`.

  2. **Associativity of Addition**: For any :math:`A, B, C \in X`, :math:`(A + B) + C = A + (B + C)`.

     .. math::
       (A + B) + C = \begin{bmatrix} a_{11} + b_{11} + c_{11} & a_{12} + b_{12} + c_{12} \\ a_{21} + b_{21} + c_{21} & a_{22} + b_{22} + c_{22} \end{bmatrix}
       A + (B + C) = \begin{bmatrix} a_{11} + (b_{11} + c_{11}) & a_{12} + (b_{12} + c_{12}) \\ a_{21} + (b_{21} + c_{21}) & a_{22} + (b_{22} + c_{22}) \end{bmatrix}

     By the associativity of real number addition, these two results are equal.

  3. **Commutativity of Addition**: For any :math:`A, B \in X`, :math:`A + B = B + A`.

     .. math::
       A + B = \begin{bmatrix} a_{11} + b_{11} & a_{12} + b_{12} \\ a_{21} + b_{21} & a_{22} + b_{22} \end{bmatrix}
       B + A = \begin{bmatrix} b_{11} + a_{11} & b_{12} + a_{12} \\ b_{21} + a_{21} & b_{22} + a_{22} \end{bmatrix}

     By the commutativity of real number addition, these two results are equal.

  4. **Existence of Additive Identity**: There exists a matrix :math:`O \in X` such that for any :math:`A \in X`, :math:`A + O = A`.

     .. math::
       O = \begin{bmatrix} 0 & 0 \\ 0 & 0 \end{bmatrix}
       A + O = \begin{bmatrix} a_{11} + 0 & a_{12} + 0 \\ a_{21} + 0 & a_{22} + 0 \end{bmatrix} = A

  5. **Existence of Additive Inverse**: For any :math:`A \in X`, there exists a matrix :math:`-A \in X` such that :math:`A + (-A) = O`.
  
     .. math::
       -A = \begin{bmatrix} -a_{11} & -a_{12} \\ -a_{21} & -a_{22} \end{bmatrix}
       A + (-A) = \begin{bmatrix} a_{11} + (-a_{11}) & a_{12} + (-a_{12}) \\ a_{21} + (-a_{21}) & a_{22} + (-a_{22}) \end{bmatrix} = O

  6. **Closure under Scalar Multiplication**: For any :math:`A \in X` and any real number :math:`k`, :math:`kA` is also in :math:`X`.

     .. math::
       kA = k \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} = \begin{bmatrix} ka_{11} & ka_{12} \\ ka_{21} & ka_{22} \end{bmatrix}

     Since the product of a real number and a real number is a real number, each element of :math:`kA` is real, and :math:`kA \in X`.

  7. **Associativity of Scalar Multiplication**: For any :math:`A \in X` and any real numbers :math:`k` and :math:`l`, :math:`k(lA) = (kl)A`.

     .. math::
       k(lA) = k \left( l \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} \right) = k \begin{bmatrix} la_{11} & la_{12} \\ la_{21} & la_{22} \end{bmatrix} = \begin{bmatrix} kla_{11} & kla_{12} \\ kla_{21} & kla_{22} \end{bmatrix}
       (kl)A = (kl) \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} = \begin{bmatrix} kla_{11} & kla_{12} \\ kla_{21} & kla_{22} \end{bmatrix}

     These two results are equal.

  8. **Distributivity of Scalar Multiplication with respect to Scalar Addition**: For any :math:`A \in X` and any real numbers :math:`k` and :math:`l`, :math:`(k + l)A = kA + lA`.

     .. math::
       (k + l)A = (k + l) \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} = \begin{bmatrix} (k + l)a_{11} & (k + l)a_{12} \\ (k + l)a_{21} & (k + l)a_{22} \end{bmatrix}
       kA + lA = k \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} + l \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} = \begin{bmatrix} ka_{11} + la_{11} & ka_{12} + la_{12} \\ ka_{21} + la_{21} & ka_{22} + la_{22} \end{bmatrix}

     By the distributivity of real number multiplication over addition, these two results are equal.

  9. **Distributivity of Scalar Multiplication with respect to Vector Addition**: For any :math:`A, B \in X` and any real number :math:`k`, :math:`k(A + B) = kA + kB`.

     .. math::
       k(A + B) = k \left( \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} + \begin{bmatrix} b_{11} & b_{12} \\ b_{21} & b_{22} \end{bmatrix} \right) = k \begin{bmatrix} a_{11} + b_{11} & a_{12} + b_{12} \\ a_{21} + b_{21} & a_{22} + b_{22} \end{bmatrix} = \begin{bmatrix} k(a_{11} + b_{11}) & k(a_{12} + b_{12}) \\ k(a_{21} + b_{21}) & k(a_{22} + b_{22}) \end{bmatrix}
       kA + kB = k \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{bmatrix} + k \begin{bmatrix} b_{11} & b_{12} \\ b_{21} & b_{22} \end{bmatrix} = \begin{bmatrix} ka_{11} & ka_{12} \\ ka_{21} & ka_{22} \end{bmatrix} + \begin{bmatrix} kb_{11} & kb_{12} \\ kb_{21} & kb_{22} \end{bmatrix} = \begin{bmatrix} ka_{11} + kb_{11} & ka_{12} + kb_{12} \\ ka_{21} + kb_{21} & ka_{22} + kb_{22} \end{bmatrix}

     By the distributivity of real number multiplication over addition, these two results are equal.

  Since all eight vector space axioms are satisfied, the set of all real :math:`2 \times 2` matrices forms a vector space :math:`X`.

**Zero vector**

.. math::
  \text{The zero vector in } X \text{ is the } 2 \times 2 \text{ zero matrix } \begin{pmatrix} 0 & 0 \\ 0 & 0 \end{pmatrix}.

**Determine dim X**

.. math::
  \text{To determine the dimension of the vector space } X \text{ of all real } 2 \times 2 \text{ matrices, we need to find a basis for } X \text{ and then count the number of vectors in that basis.}

  \text{A } 2 \times 2 \text{ matrix can be represented as:}
  \begin{bmatrix}
  a & b \\
  c & d
  \end{bmatrix}

  \text{where } a, b, c, \text{ and } d \text{ are real numbers.}

  \text{A basis for this vector space is a set of linearly independent matrices that span the entire space. For the space of all } 2 \times 2 \text{ matrices, a common basis is:}
  \left\{ \begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 1 \\ 0 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 0 \\ 1 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix} \right\}

  \text{These matrices are linearly independent and any } 2 \times 2 \text{ matrix can be expressed as a linear combination of these four matrices. Therefore, they form a basis for } X.

  \text{The dimension of } X, \text{ denoted as } \dim(X), \text{ is the number of vectors in a basis for } X. \text{ Since we have found a basis for } X \text{ that contains four matrices, we can conclude that:}
  \dim(X) = 4

**Find a basis for X**

To find a basis for the vector space :math:`X` of all real :math:`2 \times 2` matrices, we need to identify a set of linearly independent matrices that span the entire space.

A :math:`2 \times 2` matrix can be represented as:

.. math::
   \begin{bmatrix}
   a & b \\
   c & d
   \end{bmatrix}

where :math:`a, b, c,` and :math:`d` are real numbers.

A common basis for this vector space is the set of matrices:

1. :math:`\begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}`
2. :math:`\begin{bmatrix} 0 & 1 \\ 0 & 0 \end{bmatrix}`
3. :math:`\begin{bmatrix} 0 & 0 \\ 1 & 0 \end{bmatrix}`
4. :math:`\begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix}`

These matrices are linearly independent because no matrix can be written as a linear combination of the others. Additionally, any :math:`2 \times 2` matrix can be expressed as a linear combination of these four matrices. For example, for any real numbers :math:`a, b, c,` and :math:`d`:

.. math::
   \begin{bmatrix}
   a & b \\
   c & d
   \end{bmatrix}
   = a \begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}
   + b \begin{bmatrix} 0 & 1 \\ 0 & 0 \end{bmatrix}
   + c \begin{bmatrix} 0 & 0 \\ 1 & 0 \end{bmatrix}
   + d \begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix}

Therefore, the set :math:`\left\{ \begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 1 \\ 0 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 0 \\ 1 & 0 \end{bmatrix}, \begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix} \right\}` forms a basis for :math:`X`.

**Examples of subspaces of X**

1. **The Zero Subspace**: 
   The set containing only the zero matrix is a subspace of :math:`X`. 

   .. math::
      \left\{ \begin{bmatrix} 0 & 0 \\ 0 & 0 \end{bmatrix} \right\}

   This subspace satisfies all the required properties of a vector space.

2. **The Subspace of Diagonal Matrices**: 
   The set of all :math:`2 \times 2` diagonal matrices is a subspace of :math:`X`. 

   .. math::
      \left\{ \begin{bmatrix} a & 0 \\ 0 & b \end{bmatrix} \mid a, b \in \mathbb{R} \right\}

   This set is closed under addition and scalar multiplication, and it contains the zero vector.

3. **The Subspace of Upper Triangular Matrices**: 
   The set of all :math:`2 \times 2` upper triangular matrices is a subspace of :math:`X`. 

   .. math::
      \left\{ \begin{bmatrix} a & b \\ 0 & c \end{bmatrix} \mid a, b, c \in \mathbb{R} \right\}

   This set is also closed under addition and scalar multiplication, and it includes the zero vector.

**Do the symmetric matrices x in X form a subspace?**

Yes, the set of symmetric matrices in :math:`X` forms a subspace. A symmetric matrix is defined as a square matrix that is equal to its transpose. For a :math:`2 \times 2` matrix :math:`A`, this means that:

.. math::
   A = \begin{bmatrix} a & b \\ c & d \end{bmatrix}

is symmetric if :math:`b = c`. So a symmetric matrix in :math:`X` has the form:

.. math::
   \begin{bmatrix} a & b \\ b & d \end{bmatrix}

Now, let's check the three main properties to confirm that this set is indeed a subspace:

1. **Closed under addition**: If you take two symmetric matrices :math:`A` and :math:`B` in :math:`X`, their sum :math:`A + B` will also be a symmetric matrix in :math:`X`.

2. **Closed under scalar multiplication**: If you take any scalar :math:`k` and a symmetric matrix :math:`A` in :math:`X`, the product :math:`kA` will also be a symmetric matrix in :math:`X`.

3. **Contains the zero vector**: The zero matrix is a symmetric matrix, and it is in :math:`X`.

Since these three properties are satisfied, the set of symmetric matrices in :math:`X` forms a subspace of :math:`X`.

**Do the singular matrices x in X form a subspace?**

To determine if the set of singular matrices in :math:`X` (the space of all :math:`2 \times 2` real matrices) forms a subspace, we need to check the three main properties of a subspace:

1. **Closed under addition**: If :math:`A` and :math:`B` are singular matrices in :math:`X`, then :math:`A + B` should also be a singular matrix in :math:`X`.
2. **Closed under scalar multiplication**: If :math:`A` is a singular matrix in :math:`X` and :math:`c` is any scalar, then :math:`cA` should also be a singular matrix in :math:`X`.
3. **Contains the zero vector**: The set should contain the zero matrix, which is a singular matrix.

However, the set of singular matrices does not satisfy these properties. Here’s why:

1. **Closed under addition**: This property is not always satisfied. For example, consider the singular matrices:

   .. math::
      A = \begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}, \quad B = \begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix}

   Their sum is:

   .. math::
      A + B = \begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}

   The matrix :math:`A + B` is the identity matrix, which is not singular. So, the set of singular matrices is not closed under addition.

2. **Closed under scalar multiplication**: This property is satisfied because multiplying a singular matrix by any scalar will result in another singular matrix or the zero matrix.

3. **Contains the zero vector**: The set of singular matrices does contain the zero matrix.

Since the set of singular matrices in :math:`X` is not closed under addition, it does not form a subspace of :math:`X`.



