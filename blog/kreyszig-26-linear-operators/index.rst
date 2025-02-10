.. title: Kreyszig 2.6 Linear Operators
.. slug: kreyszig-26-linear-operators
.. date: 2023-11-21 19:22:26 UTC
.. tags: proofs
.. category: 
.. link: 
.. description: 
.. type: text
.. has_math: yes

**Problem 1.** Show that the operators in sections 2.6-2, 2.6-3, and 2.6-4 are linear.

**Solution:**

To show that the operators in sections 2.6-2, 2.6-3, and 2.6-4 are linear, we need to verify that each operator satisfies the two linearity conditions for all vectors :math:`x, y` in the domain and all scalars :math:`a, b` in the field over which the vector space is defined:

1. :math:`T(x + y) = T(x) + T(y)` (additivity)
2. :math:`T(ax) = aT(x)` (homogeneity)

Let's consider each operator in turn:

**2.6-2 Identity Operator** :math:`I_x`:
The identity operator :math:`I_x` on a vector space :math:`X` is defined by :math:`I_x(x) = x` for all :math:`x \in X`.

- For additivity, consider two vectors :math:`x, y \in X`. We need to show that :math:`I_x(x + y) = I_x(x) + I_x(y)`. Indeed, :math:`I_x(x + y) = x + y = I_x(x) + I_x(y)`.
- For homogeneity, consider a scalar :math:`a` and a vector :math:`x \in X`. We need to show that :math:`I_x(ax) = aI_x(x)`. Indeed, :math:`I_x(ax) = ax = aI_x(x)`.

**2.6-3 Zero Operator** :math:`0_x`:
The zero operator :math:`0_x` on a vector space :math:`X` to another vector space :math:`Y` is defined by :math:`0_x(x) = 0` for all :math:`x \in X`, where :math:`0` is the zero vector in :math:`Y`.

- For additivity, consider two vectors :math:`x, y \in X`. We have :math:`0_x(x + y) = 0 = 0 + 0 = 0_x(x) + 0_x(y)`.
- For homogeneity, for any scalar :math:`a` and vector :math:`x in X`, :math:`0_x(ax) = 0 = a \cdot 0 = a0_x(x)`.

**2.6-4 Differentiation Operator** :math:`D`:
Let :math:`X` be the vector space of all polynomials on :math:`[a, b]`. The differentiation operator :math:`D` is defined by :math:`D(T(x)) = T'(x)`, where :math:`T'` denotes differentiation with respect to :math:`x`.

- For additivity, let :math:`x(t)` and :math:`y(t)` be polynomials in :math:`X`. Then :math:`D(x(t) + y(t)) = (x + y)'(t) = x'(t) + y'((t) = D(x(t)) + D(y(t))`.
- For homogeneity, let :math:`a` be a scalar and :math:`x(t)` be a polynomial in :math:`X`. Then :math:`D(a \cdot x(t)) = (a \cdot x)'(t) = a \cdot x'(t) = a \cdot D(x(t))`.

In all cases, the operators satisfy the linearity conditions, hence they are indeed linear operators.


:math:`\blacksquare`

--------------------

**Problem 2.** Show that the operators :math:`T_1, T_2, T_3`, and :math:`T_4` from :math:`\mathbb{R}^2` into :math:`\mathbb{R}^2` defined by

- :math:`T_1(\xi_1, \xi_2) = (\xi_1, 0)`
- :math:`T_2(\xi_1, \xi_2) = (0, \xi_2)`
- :math:`T_3(\xi_1, \xi_2) = (\xi_2, \xi_1)`
- :math:`T_4(\xi_1, \xi_2) = (\gamma\xi_1, \gamma\xi_2)`

respectively, are linear, and interpret these operators geometrically.

**Solution:**
To demonstrate the linearity of operators :math:`T_1, T_2, T_3`, and :math:`T_4`, we must verify that each operator satisfies the following properties for all vectors :math:`\xi, \eta \in \mathbb{R}^2` and all scalars :math:`a \in \mathbb{R}`:

1. Additivity: :math:`T(\xi + \eta) = T(\xi) + T(\eta)`

2. Homogeneity: :math:`T(a\xi) = aT(\xi)`

For :math:`T_1`:

- Additivity: :math:`T_1((\xi_1 + \eta_1, \xi_2 + \eta_2)) = (\xi_1 + \eta_1, 0) = (\xi_1, 0) + (\eta_1, 0) = T_1(\xi_1, \xi_2) + T_1(\eta_1, \eta_2)`

- Homogeneity: :math:`T_1(a(\xi_1, \xi_2)) = (a\xi_1, 0) = a(\xi_1, 0) = aT_1(\xi_1, \xi_2)`

For :math:`T_2`, additivity and homogeneity can be shown similarly, with :math:`T_2` projecting any vector onto the y-axis.

For :math:`T_3`:

- Additivity: :math:`T_3((\xi_1 + \eta_1, \xi_2 + \eta_2)) = (\xi_2 + \eta_2, \xi_1 + \eta_1) = (\xi_2, \xi_1) + (\eta_2, \eta_1) = T_3(\xi_1, \xi_2) + T_3(\eta_1, \eta_2)`

- Homogeneity: :math:`T_3(a(\xi_1, \xi_2)) = (a\xi_2, a\xi_1) = a(\xi_2, \xi_1) = aT_3(\xi_1, \xi_2)`

For :math:`T_4`:

- Additivity: :math:`T_4((\xi_1 + \eta_1, \xi_2 + \eta_2)) = (\gamma(\xi_1 + \eta_1), \gamma(\xi_2 + \eta_2)) = (\gamma\xi_1, \gamma\xi_2) + (\gamma\eta_1, \gamma\eta_2) = T_4(\xi_1, \xi_2) + T_4(\eta_1, \eta_2)`

- Homogeneity: :math:`T_4(a(\xi_1, \xi_2)) = (a\gamma\xi_1, a\gamma\xi_2) = a(\gamma\xi_1, \gamma\xi_2) = aT_4(\xi_1, \xi_2)`

Geometric Interpretation:

- :math:`T_1` and :math:`T_2` are projection operators onto the x-axis and y-axis respectively.

- :math:`T_3` is a reflection operator across the line :math:`\xi_1 = \xi_2`.
  
:math:`\blacksquare`

---------------------

**Problem 3.** What are the domain, range, and null space of :math:`T_1, T_2, T_3` in Problem 2?

**Solution:**

To determine the domain, range, and null space of the linear operators :math:`T_1, T_2,` and :math:`T_3`, we consider their definitions from Problem 2.

For Operator :math:`T_1`: :math:`T_1(\xi_1, \xi_2) = (\xi_1, 0)`

- **Domain**: The domain of :math:`T_1` is the entire :math:`\mathbb{R}^2`.

- **Range**: The range of :math:`T_1` is the x-axis, given by :math:`\{(\xi_1, 0) \mid \xi_1 \in \mathbb{R}\}`.

- **Null Space**: The null space of :math:`T_1` is the set of all vectors that map to the zero vector under :math:`T_1`, which is :math:`\{(0, \xi_2) \mid \xi_2 \in \mathbb{R}\}`.

For Operator :math:`T_2`: :math:`T_2(\xi_1, \xi_2) = (0, \xi_2)`

- **Domain**: The domain of :math:`T_2` is the entire :math:`\mathbb{R}^2`.

- **Range**: The range of :math:`T_2` is the y-axis, described by :math:`\{(0, \xi_2) \mid \xi_2 \in \mathbb{R}\}`.

- **Null Space**: The null space of :math:`T_2` includes all vectors that :math:`T_2` maps to the zero vector, which is :math:`\{(\xi_1, 0) \mid \xi_1 \in \mathbb{R}\}`.

For Operator :math:`T_3`: :math:`T_3(\xi_1, \xi_2) = (\xi_2, \xi_1)`

- **Domain**: The domain of :math:`T_3` is the entire :math:`\mathbb{R}^2`.

- **Range**: The range of :math:`T_3` is also :math:`\mathbb{R}^2` since any vector in :math:`\mathbb{R}^2` can be obtained by applying :math:`T_3` to some vector in :math:`\mathbb{R}^2`.

- **Null Space**: The null space of :math:`T_3` is the set of vectors that are mapped to the zero vector, which is only the zero vector itself :math:`\{(0, 0)\}`.

These operators' geometric interpretations relate to their ranges and null spaces, with :math:`T_1` and :math:`T_2` acting as projection operators onto the x-axis and y-axis, respectively, and :math:`T_3` mapping vectors onto the line :math:`\xi_1 = \xi_2`.

:math:`\blacksquare`

---------------------

**Problem 4.** What is the null space of :math:`T_4` in Problem 2? Of :math:`T_1` and :math:`T_2` in 2.6-7? Of :math:`T` in 2.6-4?

**Solution:**

Given the definitions of the operators :math:`T_4`, :math:`T_1`, and :math:`T_2` from the provided images, we can find their null spaces.

For **Operator** :math:`T_4` from 2.6-4 (Differentiation):

- **Definition**: :math:`T_4` is defined on the vector space :math:`X` of all polynomials on :math:`[a, b]` by :math:`T_4(x(t)) = x'(t)`, where the prime denotes differentiation with respect to :math:`t`.

- **Null Space**: The null space of the differentiation operator consists of all polynomials :math:`x(t)` such that :math:`x'(t) = 0`. Thus, the null space of :math:`T_4` is the set of all constant polynomials on :math:`[a, b]`.

For **Operator** :math:`T_1` from 2.6-7 (Cross product with a fixed vector):

- **Definition**: :math:`T_1` is defined on :math:`\mathbb{R}^3` by :math:`T_1(\vec{x}) = \vec{x} \times \vec{a}`, where :math:`\vec{a}` is a fixed vector in :math:`\mathbb{R}^3`.

- **Null Space**: The null space of :math:`T_1` includes all vectors :math:`\vec{x}` such that :math:`\vec{x} \times \vec{a} = \vec{0}`, which are the scalar multiples of :math:`\vec{a}` including the zero vector.

For **Operator** :math:`T_2` from 2.6-7 (Dot product with a fixed vector):

- **Definition**: :math:`T_2` is defined on :math:`\mathbb{R}^3` by :math:`T_2(\vec{x}) = \vec{x} \cdot \vec{a}`, where :math:`\vec{a} = (a_i)` is a fixed vector in :math:`\mathbb{R}^3`.

- **Null Space**: The null space of :math:`T_2` consists of all vectors :math:`\vec{x}` that are orthogonal to :math:`\vec{a}`, which is the orthogonal complement of the vector :math:`\vec{a}` in :math:`\mathbb{R}^3`.

The null spaces reflect the specific transformations these operators perform on their respective vector spaces.

:math:`\blacksquare`

--------------------

**Problem 7.** Determine if the operators :math:`T_1` and :math:`T_3` from Problem 2 commute.

**Given:**

- :math:`T_1(\xi_1, \xi_2) = (\xi_1, 0)`

- :math:`T_3(\xi_1, \xi_2) = (\xi_2, \xi_1)`

**Solution:**

To check for commutativity, we calculate :math:`(T_1T_3)(\xi_1, \xi_2)` and :math:`(T_3T_1)(\xi_1, \xi_2)`.

**Applying** :math:`T_1` followed by :math:`T_3`:

1. Apply :math:`T_1` to :math:`(\xi_1, \xi_2)`:
    :math:`T_1(\xi_1, \xi_2) = (\xi_1, 0)`

2. Then apply :math:`T_3` to the result:
    :math:`T_3(\xi_1, 0) = (0, \xi_1)`

**Applying** :math:`T_3` followed by :math:`T_1`:

1. Apply :math:`T_3` to :math:`(\xi_1, \xi_2)`:
    :math:`T_3(\xi_1, \xi_2) = (\xi_2, \xi_1)`

2. Then apply :math:`T_1` to the result:
    :math:`T_1(\xi_2, \xi_1) = (\xi_2, 0)`

**Comparing Results:**

- :math:`T_1T_3` yields :math:`(0, \xi_1)`.

- :math:`T_3T_1` yields :math:`(\xi_2, 0)`.

Since :math:`(0, \xi_1) \neq (\xi_2, 0)` for arbitrary :math:`\xi_1, \xi_2`, we conclude that :math:`T_1` and :math:`T_3` do **not** commute.

**Conclusion:**
  The operators :math:`T_1` and :math:`T_3` do not satisfy the commutativity property :math:`T_1T_3 = T_3T_1` for all vectors in :math:`\mathbb{R}^2`. Therefore, they are non-commutative.

:math:`\blacksquare`

--------------------

**Problem 8.** Represent the operators :math:`T_1, T_2, T_3`, and :math:`T_4` from Problem 2 using :math:`2 \times 2` matrices.

**Given Operators:**

- :math:`T_1(\xi_1, \xi_2) = (\xi_1, 0)`

- :math:`T_2(\xi_1, \xi_2) = (0, \xi_2)`

- :math:`T_3(\xi_1, \xi_2) = (\xi_2, \xi_1)`

- :math:`T_4(\xi_1, \xi_2) = (\gamma\xi_1, \gamma\xi_2)`

**Matrix Representations:**

  - **For** :math:`T_1`:

    The matrix representation is:
    :math:`T_1 = \begin{bmatrix} 1 & 0 \\ 0 & 0 \end{bmatrix}`

  - **For** :math:`T_2`:

    The matrix representation is:
    :math:`T_2 = \begin{bmatrix} 0 & 0 \\ 0 & 1 \end{bmatrix}`

  - **For** :math:`T_3`:

    The matrix representation is:
    :math:`T_3 = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}`

  - **For** :math:`T_4`:

    The matrix representation is:
    :math:`T_4 = \begin{bmatrix} \gamma & 0 \\ 0 & \gamma \end{bmatrix}`

**Conclusion:**
  Each operator from Problem 2 can be expressed as a :math:`2 \times 2` matrix. These matrices transform vectors in :math:`\mathbb{R}^2` by linearly scaling and/or permuting their components as specified by the operators.

:math:`\blacksquare`

--------------------

**Problem 9.** Elaborate the condition in 2.6-10(a) regarding the existence of an inverse operator, :math:`T^{-1}`, in the context of the null space of :math:`T`.

**Theorem Interpretation:**
The theorem from section 2.6-10(a) can be restated in the context of the null space of :math:`T` as follows:

- The inverse operator :math:`T^{-1}` from :math:`\mathcal{R}(T)` to :math:`\mathcal{D}(T)` exists if and only if the only solution to :math:`Tx = 0` is the trivial solution :math:`x = 0`. This is equivalent to saying that the null space of :math:`T`, denoted :math:`N(T)` or :math:`\text{ker}(T)`, consists solely of the zero vector.

**Definitions:**

- **Linear Operator**: A mapping :math:`T: \mathcal{D}(T) \rightarrow Y` between vector spaces :math:`X` and :math:`Y`, adhering to additivity (:math:`T(x + z) = T(x) + T(z)`) and homogeneity (:math:`T(\alpha x) = \alpha T(x)`), for all :math:`x, z \in \mathcal{D}(T)` and scalars :math:`\alpha`.

- **Inverse Operator**: :math:`T^{-1}: \mathcal{R}(T) \rightarrow \mathcal{D}(T)` is the reverse mapping such that :math:`T^{-1}(Tx) = x` for all :math:`x \in \mathcal{D}(T)` and :math:`T(T^{-1}y) = y` for all :math:`y \in \mathcal{R}(T)`.

- **Null Space**: Denoted by :math:`N(T)` or :math:`\text{ker}(T)`, it is the set of vectors :math:`x \in \mathcal{D}(T)` where :math:`T(x) = 0`.

**In-Depth Analysis of Theorem 2.6-10(a):**

This theorem posits that :math:`T^{-1}` can only exist if :math:`Tx = 0` strictly leads to :math:`x = 0`. Essentially, :math:`N(T)` must be trivial—comprised solely of the zero vector. If :math:`N(T)` included any non-zero vectors, :math:`T` could not be injective, as it would map distinct vectors to the same point (the zero vector in :math:`Y`), contravening the bijective requirement for an inverse function.

**Formulating the Condition for Inverse Existence:**

The existence condition for :math:`T^{-1}` relative to the null space of :math:`T` is that :math:`N(T) = \{0\}`. This reflects the injectivity of :math:`T`.

**Examples:**

- **For an Injective Operator**: A matrix representation of :math:`T` as :math:`A` with no linearly dependent rows or columns ensures :math:`N(T) = \{0\}`, affirming the existence of :math:`T^{-1}`.

- **For a Non-Injective Operator**: Should :math:`T` be depicted by a matrix :math:`A` containing a zero row, :math:`N(T)` would be non-trivial, housing non-zero vectors, thus negating the presence of :math:`T^{-1}`.

**Conclusion:**
  The theorem outlined in 2.6-10(a) underscores a pivotal tenet in linear algebra: the invertibility of a linear operator is inherently dependent on the exclusivity of the zero vector in its null space. An operator :math:`T` is invertible if and only if :math:`N(T)` is trivial, serving as a vital criterion for :math:`T`'s injectivity.

:math:`\blacksquare`

--------------------

**Problem 10.** Determine the existence of the inverse operator :math:`T^{-1}` for the differentiation operator :math:`T` as defined in section 2.6-4.

**Operator Definition:**
  The operator :math:`T` defined in section 2.6-4 is the differentiation operator acting on the vector space :math:`X` of all polynomials on the interval :math:`[a, b]`. The action of :math:`T` is defined by :math:`T(x(t)) = x'(t)`, where :math:`x'(t)` denotes the derivative of :math:`x(t)` with respect to :math:`t`.

**Inverse Operator Existence Criteria:**
  An operator :math:`T` has an inverse :math:`T^{-1}` if and only if :math:`T` is bijective, which means it is both injective (one-to-one) and surjective (onto).

**Injectivity Analysis:**
  :math:`T` is injective if :math:`T(x) = T(y)` implies :math:`x = y`. For the differentiation operator, if :math:`x'(t) = y'(t)` for two polynomials :math:`x(t)` and :math:`y(t)`, then :math:`x(t)` and :math:`y(t)` differ by at most a constant. Hence, for :math:`T` to be injective, we must restrict our attention to a subspace of :math:`X` where the constant of integration is fixed, for example by setting :math:`x(a) = 0` for all :math:`x \in X`.

**Surjectivity Analysis:**
  :math:`T` is surjective if for every function :math:`y(t)` in the codomain, there exists an :math:`x(t)` in the domain such that :math:`T(x) = y`. The differentiation operator is surjective onto the space of all differentiable functions on :math:`[a, b]` that can be expressed as the derivative of a polynomial, which is again the space of all polynomials on :math:`[a, b]`.

**Existence of** :math:`T^{-1}`:
  For the differentiation operator :math:`T`, an inverse would correspond to the integration operator. However, since integration includes a constant of integration, :math:`T` is not surjective onto :math:`X`, and therefore, its inverse :math:`T^{-1}` does not exist as a map back into :math:`X`.

**Conclusion:**
  The inverse :math:`T^{-1}` of the differentiation operator :math:`T` as defined in 2.6-4 does not exist within the space of all polynomials on :math:`[a, b]` because :math:`T` is not surjective onto :math:`X`. The differentiation operator, without additional constraints, does not have a unique inverse that maps back to the original polynomial space due to the constant of integration involved in the antiderivative.

:math:`\blacksquare`

**Counterexample Illustration:**
  Consider the differentiation operator :math:`T` on the space :math:`X` of polynomials over an interval :math:`[a, b]`. We are given a function :math:`y(t) = e^t` which is not a polynomial. Our goal is to find a polynomial :math:`x(t)` such that :math:`x'(t) = y(t)`.

**Attempt to Find** :math:`x(t)`:
  The inverse operation to differentiation is integration. Thus, we integrate :math:`y(t)` to find :math:`x(t)`:

  .. math::
     x(t) = \int y(t) dt = \int e^t dt = e^t + C

  where :math:`C` represents the constant of integration.

**Analysis:**
  The result of the integration, :math:`x(t) = e^t + C`, is not a polynomial. Hence, it does not reside in the space :math:`X` of polynomials on :math:`[a, b]`. This shows that :math:`y(t)`, a non-polynomial function, does not have an antiderivative that is a polynomial in :math:`X`.

**Conclusion:**
  Since the integration maps :math:`y(t) = e^t` to a function outside the space of polynomials, it demonstrates that the differentiation operator :math:`T` is not surjective over the space :math:`X`. Consequently, :math:`T` does not have an inverse :math:`T^{-1}` that maps back to :math:`X`. The function :math:`y(t) = e^t` serves as a counterexample, indicating that there are functions in the codomain of :math:`T` for which no polynomial in :math:`X` is a pre-image, thereby confirming the non-existence of an inverse operator :math:`T^{-1}` that returns to the original polynomial space :math:`X`.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 11.** Verify the linearity of the operator :math:`T: X \rightarrow X` defined by :math:`T(x) = bx` for a fixed :math:`2 \times 2` complex matrix :math:`b`, and determine the condition for the existence of the inverse operator :math:`T^{-1}`.

**Proof of Linearity:**
To demonstrate that :math:`T` is linear, it must satisfy additivity and homogeneity.

- **Additivity**:

For any :math:`2 \times 2` matrices :math:`x` and :math:`y` in :math:`X`:

.. math::
    T(x + y) = b(x + y) = bx + by = T(x) + T(y)

- **Homogeneity**:

For any complex scalar :math:`\alpha` and matrix :math:`x` in :math:`X`:

.. math::
    T(\alpha x) = b(\alpha x) = \alpha bx = \alpha T(x)

Since :math:`T` satisfies both properties, we conclude that :math:`T` is indeed a linear operator.

**Condition for the Existence of** :math:`T^{-1}`:
The inverse operator :math:`T^{-1}` exists if and only if :math:`T` is bijective, which entails being both injective and surjective.

- **Injectivity**:

:math:`T` is injective if :math:`T(x) = T(y)` implies :math:`x = y`. For :math:`T`, this condition holds if the matrix :math:`b` is invertible, i.e., :math:`\text{det}(b) \neq 0`.

- **Surjectivity**:

:math:`T` is surjective if for every :math:`z` in :math:`X`, there exists an :math:`x` such that :math:`T(x) = z`. This is true if :math:`b` is invertible, allowing us to solve :math:`x = b^{-1}z` for any :math:`z`.

Therefore, the inverse operator :math:`T^{-1}` exists if and only if the matrix :math:`b` is invertible, characterized by a non-zero determinant, :math:`\text{det}(b) \neq 0`.

:math:`\blacksquare`

--------------------

**Problem 12.** Assess the surjectivity of the operator :math:`T: X \rightarrow X`, defined by :math:`T(x) = bx` for a fixed matrix :math:`b` in :math:`X`, where :math:`X` is the vector space of all :math:`2 \times 2` complex matrices, and :math:`bx` denotes the standard product of matrices.

**Surjectivity Definition:**
  An operator :math:`T` is said to be surjective if for every matrix :math:`z` in :math:`X`, there is a matrix :math:`x` in :math:`X` such that :math:`T(x) = z`. Formally, this means that the equation :math:`bx = z` has a solution for every matrix :math:`z` in :math:`X`.

**Condition for Surjectivity:**
  The operator :math:`T` defined by matrix multiplication is surjective if and only if the matrix :math:`b` is invertible. This is equivalent to the requirement that :math:`\text{det}(b) \neq 0`. If :math:`b` is invertible, then for every matrix :math:`z` in :math:`X`, there exists a unique matrix :math:`x = b^{-1}z` that solves the equation :math:`bx = z`, indicating that :math:`T` maps onto the entire space :math:`X`.

**Conclusion:**
  Surjectivity of the operator :math:`T` hinges on the invertibility of the matrix :math:`b`. If :math:`b` is not invertible (i.e., :math:`\text{det}(b) = 0`), not all matrices :math:`z` in :math:`X` will have a pre-image under :math:`T`, and thus :math:`T` will not be surjective. Conversely, if :math:`b` is invertible, :math:`T` is surjective, ensuring that the inverse operator :math:`T^{-1}` exists and operates as :math:`T^{-1}(z) = b^{-1}z` for all :math:`z` in :math:`X`.

:math:`\blacksquare`

--------------------

**Problem 13** Prove that if :math:`\{x_1, \ldots, x_n\}` is a linearly independent set in :math:`\mathcal{D}(T)`, and :math:`T: \mathcal{D}(T) \rightarrow Y` is a linear operator with an inverse, then the set :math:`\{Tx_1, \ldots, Tx_n\}` is also linearly independent.

**Proof:**
  Assume for contradiction that :math:`\{Tx_1, \ldots, Tx_n\}` is not linearly independent. Then there exist scalars :math:`c_1, \ldots, c_n`, not all zero, such that:

  .. math::
     c_1 Tx_1 + \ldots + c_n Tx_n = 0.

  Applying the inverse operator :math:`T^{-1}` to both sides, and using the linearity of :math:`T^{-1}`, we obtain:

  .. math::
     c_1 T^{-1}(Tx_1) + \ldots + c_n T^{-1}(Tx_n) = T^{-1}(0).

  Since :math:`T^{-1}T` is the identity operator on :math:`\mathcal{D}(T)`, we have :math:`T^{-1}(Tx_i) = x_i` for all :math:`i`. Knowing that the identity operator maps :math:`0` to :math:`0`, the equation simplifies to:

  .. math::
     c_1 x_1 + \ldots + c_n x_n = 0.

  This implies that :math:`c_1, \ldots, c_n` must all be zero because :math:`\{x_1, \ldots, x_n\}` is linearly independent, contradicting our assumption.

**Conclusion:**
  Therefore, the set :math:`\{Tx_1, \ldots, Tx_n\}` must be linearly independent, under the condition that :math:`T` is invertible. This holds true due to the fundamental properties of linear transformations and their inverses in vector space theory.

:math:`\blacksquare`

--------------------

**Problem 14.** Prove that for a linear operator :math:`T: X \rightarrow Y` with :math:`\text{dim} X = \text{dim} Y = n`, the range of :math:`T`, :math:`\mathcal{R}(T)`, is equal to :math:`Y` if and only if the inverse operator :math:`T^{-1}` exists.

**Proof:**

**Forward Direction** (:math:`\mathcal{R}(T) = Y` implies :math:`T^{-1}` exists):

If :math:`\mathcal{R}(T) = Y`, then :math:`T` is surjective, meaning for every :math:`y \in Y`, there exists at least one :math:`x \in X` such that :math:`T(x) = y`. Since :math:`\text{dim} X = \text{dim} Y`, :math:`T` is a surjective linear map between two finite-dimensional vector spaces of equal dimension, which implies :math:`T` is also injective. This is a consequence of the Rank-Nullity Theorem, which in this case implies that :math:`\text{nullity}(T) = 0` because :math:`\text{rank}(T) = \text{dim} Y = n` and :math:`\text{rank}(T) + \text{nullity}(T) = \text{dim} X`.

Being both injective and surjective, :math:`T` is bijective, and therefore an inverse :math:`T^{-1}` exists by definition.

**Reverse Direction** (:math:`T^{-1}` exists implies :math:`\mathcal{R}(T) = Y`):

If :math:`T^{-1}` exists, then by definition, :math:`T` is bijective, meaning it is both injective and surjective. The surjectivity of :math:`T` immediately gives us :math:`\mathcal{R}(T) = Y`, because for every :math:`y \in Y`, the existence of :math:`T^{-1}` guarantees an :math:`x \in X` such that :math:`T(x) = y`.

**Conclusion:**

The range of :math:`T`, :math:`\mathcal{R}(T)`, is equal to :math:`Y` if and only if :math:`T` is bijective, and since :math:`T` is linear, this bijectivity is equivalent to the existence of an inverse :math:`T^{-1}`. This holds true for finite-dimensional vector spaces :math:`X` and :math:`Y` of equal dimension :math:`n`.

:math:`\blacksquare`

**Detailed Explanation of the Rank-Nullity Theorem in Context:**
  The Rank-Nullity Theorem is pivotal in understanding the relationship between the dimensions of a linear operator's range, null space, and domain. For a linear operator :math:`T: X \rightarrow Y` with :math:`\text{dim} X = \text{dim} Y = n`, the theorem is expressed as:

.. math::
    \text{rank}(T) + \text{nullity}(T) = \text{dim} X

Here, :math:`\text{rank}(T)` represents the dimension of the range of :math:`T` (:math:`\mathcal{R}(T)`), and :math:`\text{nullity}(T)` signifies the dimension of the null space of :math:`T` (:math:`N(T)`).

**Application to the Given Problem:**

1. **If** :math:`\mathcal{R}(T) = Y`:

- The rank of :math:`T` is the dimension of :math:`Y`, hence :math:`\text{rank}(T) = \text{dim} Y = n`.

- Applying the Rank-Nullity Theorem, and knowing :math:`\text{dim} X = n`, we deduce that :math:`\text{nullity}(T) = 0`, which implies that :math:`T` is injective.

- A linear operator that is injective and surjective is bijective, indicating the existence of an inverse :math:`T^{-1}`.

2. **If** :math:`T^{-1}` Exists:

   - The existence of :math:`T^{-1}` implies :math:`T` is bijective. Consequently, :math:`T` is injective, leading to :math:`\text{nullity}(T) = 0`.

   - Since :math:`T` is also surjective, :math:`\text{rank}(T) = \text{dim} Y = n`.

   - The Rank-Nullity Theorem then confirms that :math:`\text{rank}(T) + \text{nullity}(T) = n`, which equals :math:`\text{dim} X`, thus confirming that :math:`\mathcal{R}(T) = Y`.

**Conclusion:**
  The Rank-Nullity Theorem in this scenario confirms that the linear operator :math:`T` is invertible if and only if it is surjective. When the domain and codomain are finite-dimensional vector spaces of equal dimension, surjectivity implies injectivity, which is integral to establishing the existence of an inverse operator :math:`T^{-1}`.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 15.** We are tasked with proving that the range :math:`\mathcal{R}(T)` of a linear operator :math:`T` defined on the vector space :math:`X` of all real-valued functions with derivatives of all orders is the entirety of :math:`X`. However, we must also demonstrate that the inverse :math:`T^{-1}` does not exist. This is to be contrasted with Problem 14.

**Showing that** :math:`\mathcal{R}(T)` is all of :math:`X`:
  Any function :math:`y(t)` in :math:`X` can be expressed as the derivative of another function in :math:`X`, as the space includes functions with derivatives of all orders. We can take an antiderivative of :math:`y(t)` to find a function :math:`x(t)` in :math:`X` whose derivative is :math:`y(t)`, that is, :math:`x'(t) = y(t)`. Since the space of functions is closed under integration, this antiderivative :math:`x(t)` is also in :math:`X`. This demonstrates that for every :math:`y(t)` in :math:`X`, there exists an :math:`x(t)` in :math:`X` such that :math:`T(x(t)) = y(t)`, confirming that :math:`\mathcal{R}(T)` is all of :math:`X`.

**Showing that** :math:`T^{-1}` does not exist:
  An inverse operator :math:`T^{-1}` would map a function :math:`y(t)` to a function :math:`x(t)` such that :math:`T(x(t)) = y(t)`. However, the process of taking an antiderivative is not unique due to the constant of integration. Hence, :math:`T` is not injective, as multiple functions in :math:`X` can map to the same function under :math:`T`. Since injectivity is a necessary condition for the existence of an inverse, :math:`T^{-1}` does not exist.

**Comparison with Problem 14 and Comments:**
  Problem 14 involves a finite-dimensional vector space, where surjectivity implies invertibility. In contrast, Problem 15 deals with an infinite-dimensional vector space of smooth functions, where surjectivity is not sufficient for invertibility. The non-uniqueness of the antiderivatives prevents :math:`T` from being injective, unlike in finite dimensions, where surjectivity implies injectivity due to the Rank-Nullity Theorem.

**Conclusion:**
  Despite :math:`\mathcal{R}(T)` covering all of :math:`X`, the non-uniqueness of the antiderivative, due to the constant of integration, prevents :math:`T` from being injective, thus precluding the existence of :math:`T^{-1}`. This example underscores a significant distinction between linear operators in finite-dimensional spaces and those in infinite-dimensional spaces.


