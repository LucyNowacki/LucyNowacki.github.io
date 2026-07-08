.. title: Kreyszig 1.1, Metric Spaces
.. slug: kreyszig-11-metric-spaces
.. date: 2023-10-05 15:16:43 UTC+01:00
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text


The Real Line as a Metric Space
===============================

**Problem 1. Show that the real line is a metric space.**

To demonstrate that the real line is a metric space, we must define a distance function (or metric) on the real line and confirm that it adheres to the properties of a metric.

Let's represent the real line as :math:`\mathbb{R}` and consider two points :math:`x, y \in \mathbb{R}`.

**Definition of the Metric (Distance Function):**

Define the distance between :math:`x` and :math:`y` as:
:math:`d(x, y) = |x - y|`
where :math:`| \cdot |` symbolizes the absolute value.

We now need to confirm that :math:`d` adheres to the three properties of a metric:

1. **Non-negativity:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) \geq 0` and :math:`d(x, y) = 0` if and only if :math:`x = y`.

   *Proof:* 
   :math:`d(x, y) = |x - y| \geq 0` because the absolute value is always non-negative.
   :math:`d(x, y) = 0` if and only if :math:`x - y = 0` or :math:`x = y`.

2. **Symmetry:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) = d(y, x)`.

   *Proof:* 
   :math:`d(x, y) = |x - y| = |- (y - x)| = |y - x| = d(y, x)`.

3. **Triangle Inequality:** For all :math:`x, y, z \in \mathbb{R}`, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

   *Proof:* 
   Using the properties of absolute values, we have:
   :math:`|x - z| = |(x - y) + (y - z)| \leq |x - y| + |y - z|`.
   Thus, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

Given that the distance function :math:`d` adheres to all three properties of a metric on :math:`\mathbb{R}`, we can deduce that the real line :math:`\mathbb{R}` is a metric space with metric :math:`d`.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 2. Does** :math:`d(x,y) = (x-y)^2` **define a metric on the set of all real numbers?**

To determine if :math:`d(x,y) = (x-y)^2` defines a metric on the set of all real numbers, we need to check if it satisfies the three properties of a metric:

1. **Non-negativity:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) \geq 0` and :math:`d(x, y) = 0` if and only if :math:`x = y`.

   *Proof:* 
   :math:`d(x, y) = (x-y)^2` is always non-negative since the square of any real number is non-negative.
   :math:`d(x, y) = 0` if and only if :math:`(x-y)^2 = 0`, which implies :math:`x-y = 0` or :math:`x = y`.

2. **Symmetry:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) = d(y, x)`.

   *Proof:* 
   :math:`d(x, y) = (x-y)^2` and :math:`d(y, x) = (y-x)^2`. Since :math:`(x-y)^2 = (y-x)^2`, we have :math:`d(x, y) = d(y, x)`.

3. **Triangle Inequality:** For all :math:`x, y, z \in \mathbb{R}`, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

   *Proof:* 
   We need to check if :math:`(x-z)^2 \leq (x-y)^2 + (y-z)^2` for all :math:`x, y, z \in \mathbb{R}`.
   This inequality does not hold in general. For a counterexample, consider :math:`x = 0`, :math:`y = 1`, and :math:`z = 2`. We have:
   :math:`(x-z)^2 = 4`
   :math:`(x-y)^2 + (y-z)^2 = 1 + 1 = 2`
   Clearly, 4 is not less than or equal to 2, so the triangle inequality is not satisfied.

Given that the triangle inequality is not satisfied for the function :math:`d(x,y) = (x-y)^2`, we can conclude that it does not define a metric on the set of all real numbers.

--------------------------------------------------------------------------------------------------------------------------

**Problem 3. Show that** :math:`d(x,y)=\sqrt(|x-y|)` **defines a metric on the set of all real numbers.**

Define the distance between :math:`x` and :math:`y` as:
:math:`d(x, y) = \sqrt{|x - y|}`
where :math:`| \cdot |` symbolizes the absolute value.

We now need to confirm that :math:`d` adheres to the three properties of a metric:

1. **Non-negativity:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) \geq 0` and :math:`d(x, y) = 0` if and only if :math:`x = y`.

   *Proof:* 
   :math:`d(x, y) = \sqrt{|x - y|}` is always non-negative since the square root of any non-negative number is non-negative.
   :math:`d(x, y) = 0` if and only if :math:`\sqrt{|x-y|} = 0`, which implies :math:`|x-y| = 0` or :math:`x = y`.

2. **Symmetry:** For all :math:`x, y \in \mathbb{R}`, :math:`d(x, y) = d(y, x)`.

   *Proof:* 
   :math:`d(x, y) = \sqrt{|x - y|}` and :math:`d(y, x) = \sqrt{|y - x|}`. Since :math:`|x-y| = |y-x|`, we have :math:`d(x, y) = d(y, x)`.

3. **Triangle Inequality:** For all :math:`x, y, z \in \mathbb{R}`, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

   *Proof:* 
   We need to check if :math:`\sqrt{|x-z|} \leq \sqrt{|x-y|} + \sqrt{|y-z|}` for all :math:`x, y, z \in \mathbb{R}`.
   Squaring both sides, this is equivalent to checking if :math:`|x-z| \leq |x-y| + 2\sqrt{|x-y|}\sqrt{|y-z|} + |y-z|`.
   Using the triangle inequality for absolute values, we have:
   :math:`|x-z| \leq |x-y| + |y-z|`.
   Since :math:`2\sqrt{|x-y|}\sqrt{|y-z|}` is always non-negative, the inequality :math:`|x-z| \leq |x-y| + 2\sqrt{|x-y|}\sqrt{|y-z|} + |y-z|` is satisfied.

Given that the distance function :math:`d` adheres to all three properties of a metric on :math:`\mathbb{R}`, we can deduce that the real line :math:`\mathbb{R}` is a metric space with metric :math:`d`.

----------------------------------------------------------------------------------------------------------

**Problem 4. Find all metrics on set X consisting of two points. Consiting of one point.**

Consider a set :math:`X` with two distinct points, :math:`a` and :math:`b`.

For :math:`d: X \times X \rightarrow \mathbb{R}` to be a metric, it must satisfy the following properties:

1. :math:`d(x, y) \geq 0` (non-negativity)
2. :math:`d(x, y) = 0` if and only if :math:`x = y` (identity of indiscernibles)
3. :math:`d(x, y) = d(y, x)` (symmetry)
4. :math:`d(x, z) \leq d(x, y) + d(y, z)` (triangle inequality)

Given that :math:`X` has only two points, the possible distances are:

1. :math:`d(a, a) = 0`
2. :math:`d(b, b) = 0`
3. :math:`d(a, b)` which must be positive.
4. :math:`d(b, a) = d(a, b)`

Thus, for any positive real number :math:`r`, defining :math:`d(a, b) = r` and :math:`d(b, a) = r` gives a metric on :math:`X`. There are infinitely many such metrics, one for each positive real number :math:`r`.

Now, for a set :math:`X` with a single point, :math:`a`, the only possible distance is:

1. :math:`d(a, a) = 0`

Given that this satisfies all the properties of a metric, there is only one metric on :math:`X` when :math:`X` consists of a single point.

----------------------------------------------------------------------------------------------------------------------------

**Problem 5. Let d be a metric on X. Determine all constants k such that (i) k*d, (ii) d+k is  metric on X.**

Given a metric :math:`d` on :math:`X`, let's determine the constants :math:`k` for which:

(i) :math:`k \cdot d` is a metric on :math:`X`
(ii) :math:`d + k` is a metric on :math:`X`

For (i) :math:`k \cdot d` to be a metric:

1. :math:`k \cdot d(x, y) \geq 0` for all :math:`x, y \in X`. This implies :math:`k \geq 0`.
2. :math:`k \cdot d(x, y) = 0` if and only if :math:`x = y`. This property is satisfied for all values of :math:`k`.
3. Symmetry is automatically satisfied.
4. The triangle inequality is satisfied for all :math:`k`.

Thus, for (i), :math:`k` can be any non-negative real number.

For (ii) :math:`d + k` to be a metric:

1. :math:`d(x, y) + k \geq 0` for all :math:`x, y \in X`. This implies :math:`k > 0`.
2. :math:`d(x, y) + k = 0` is never true since :math:`k > 0`.
3. Symmetry is automatically satisfied.
4. The triangle inequality is satisfied for all :math:`k`.

Thus, for (ii), :math:`k` must be strictly positive.

---------------------------------------------------------------------------------------------------------------------

**Problem 6. We have a sequence space** :math:`l^{\infty}` **, where every element of X is a complex sequence, i.e.,** :math:`x=(\xi_1, \xi_2, ...)` **, and the metric is defined as** :math:`d(x,y)=sup_{j \in \mathbb{N}} |\xi_j - \eta_j|` **. Show that a such defined d(x,y) is really metric.**

Consider the sequence space :math:`l^{\infty}` where each element of :math:`X` is a complex sequence, i.e., :math:`x = (\xi_1, \xi_2, \ldots)`. The metric is defined as :math:`d(x,y) = \sup_{j \in \mathbb{N}} |\xi_j - \eta_j|`.

To show that :math:`d` is a metric, we need to verify the following properties:

1. **Non-negativity:**
   - :math:`d(x, y) \geq 0` for all :math:`x, y \in X` and :math:`d(x, y) = 0` if and only if :math:`x = y`.

   - Proof: The absolute value is always non-negative, and if :math:`d(x, y) = 0`, then :math:`\xi_j = \eta_j` for all :math:`j`. Conversely, if :math:`x = y`, then :math:`d(x, y) = 0`.

2. **Symmetry:**
   - :math:`d(x, y) = d(y, x)` for all :math:`x, y \in X`.

   - Proof: :math:`d(x, y) = \sup_{j \in \mathbb{N}} |\xi_j - \eta_j| = d(y, x)`.

3. **Triangle Inequality:**
   - For all :math:`x, y, z \in X`, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

   - Proof: Using the triangle inequality for absolute values, we have :math:`|\xi_j - \zeta_j| \leq |\xi_j - \eta_j| + |\eta_j - \zeta_j|`. Taking the supremum over all :math:`j` gives the desired result.

Given that the distance function :math:`d` satisfies all the properties of a metric, we conclude that it is indeed a metric on :math:`l^{\infty}`.

--------------------------------------------------------------------------------------------------------------------------------

**Problem 7. Determine the Induced Metric on** :math:`A`


Consider the space :math:`l^{\infty}`, which consists of all bounded sequences. If :math:`A` is a subspace of :math:`l^{\infty}` consisting of all sequences of zeros and ones, then the metric of :math:`l^{\infty}` induces a metric on :math:`A`.

For :math:`d: A \times A \rightarrow \mathbb{R}` to be a metric, it must satisfy the following properties:

1. :math:`d(x, y) \geq 0` (non-negativity)
2. :math:`d(x, y) = 0` if and only if :math:`x = y` (identity of indiscernibles)
3. :math:`d(x, y) = d(y, x)` (symmetry)
4. :math:`d(x, z) \leq d(x, y) + d(y, z)` (triangle inequality)

**Definition of the Induced Metric:**

For any two sequences :math:`x, y` in :math:`A`, the distance between them in the induced metric is given by:
:math:`d(x,y) = \sup_{j \in \mathbb{N}} |x_j - y_j|`

However, since each :math:`x_j` and :math:`y_j` can only be 0 or 1 in :math:`A`:

1. **Non-negativity:** The absolute difference :math:`|x_j - y_j|` can only be 0 (if :math:`x_j = y_j`) or 1 (if :math:`x_j \neq y_j`). Therefore, the supremum will be 0 if the sequences are the same and 1 if they are different at any position.

   *Proof:* 
   The absolute difference between any two terms of sequences in :math:`A` is either 0 or 1. The supremum of a set of non-negative numbers that includes 0 and does not exceed 1 is 1.

2. **Symmetry:** For all sequences :math:`x, y` in :math:`A`, :math:`d(x, y) = d(y, x)`.

   *Proof:* 
   The order of the terms in the absolute difference does not affect its value, so :math:`|x_j - y_j| = |y_j - x_j|`.

3. **Triangle Inequality:** This needs to be verified for the induced metric on :math:`A`. Given the nature of sequences in :math:`A`, the triangle inequality holds.

   *Proof:* 
   For any three sequences :math:`x, y, z` in :math:`A`, the triangle inequality can be verified by considering the individual terms of the sequences and noting that the sum of the absolute differences for any term does not exceed 1.

**In other words, the induced metric on** :math:`A` **is:**
:math:`d(x,y) = \begin{cases} 
0 & \text{if } x=y \\
1 & \text{if } x \neq y 
\end{cases}`

This is known as the discrete metric. Every pair of distinct sequences in :math:`A` is at a distance of 1 from each other, while the distance between a sequence and itself is 0.

Given the properties and proofs outlined above, the induced metric on :math:`A` is indeed a metric.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 8. Show that** :math:`\tilde{d}` **defines a metric on the function space** :math:`C[a,b]`

Consider the function space :math:`C[a,b]`, which consists of all real-valued continuous functions defined on the closed interval :math:`[a,b]`. Let :math:`X` be the set of all such functions, denoted by :math:`x, y, \dots`, where each function is a mapping from the independent variable :math:`t` to the real numbers.

For :math:`\tilde{d}: X \times X \rightarrow \mathbb{R}` to be a metric, it must satisfy the following properties:

1. :math:`\tilde{d}(x, y) \geq 0` (non-negativity)
2. :math:`\tilde{d}(x, y) = 0` if and only if :math:`x = y` (identity of indiscernibles)
3. :math:`\tilde{d}(x, y) = \tilde{d}(y, x)` (symmetry)
4. :math:`\tilde{d}(x, z) \leq \tilde{d}(x, y) + \tilde{d}(y, z)` (triangle inequality)

**Definition of the Metric** :math:`\tilde{d}`:

For any two functions :math:`x, y` in :math:`X`, the distance between them in the metric :math:`\tilde{d}` is given by:
:math:`\tilde{d}(x,y) = \int_{a}^{b} |x(t) - y(t)| dt`

**Verification of Metric Properties:**

1. **Non-negativity:** The absolute value ensures that the integrand is non-negative. Therefore, the integral of a non-negative function is also non-negative.

   *Proof:* 
   :math:`\tilde{d}(x,y) = \int_{a}^{b} |x(t) - y(t)| dt \geq 0`

2. **Identity of indiscernibles:** If :math:`x = y`, then for all :math:`t \in [a,b]`, :math:`x(t) = y(t)`, and thus :math:`|x(t) - y(t)| = 0`. The integral of zero is zero.

   *Proof:* 
   If :math:`x = y`, then :math:`\tilde{d}(x,y) = \int_{a}^{b} 0 dt = 0`

3. **Symmetry:** The absolute value function is symmetric, so swapping :math:`x` and :math:`y` does not change the value of the integrand.

   *Proof:* 
   :math:`\tilde{d}(x,y) = \int_{a}^{b} |x(t) - y(t)| dt = \int_{a}^{b} |y(t) - x(t)| dt = \tilde{d}(y,x)`

4. **Triangle Inequality:** Using the properties of integrals and absolute values, we can show that the triangle inequality holds.

   *Proof:* 
   For any function :math:`z` in :math:`X`, we have:
   :math:`|x(t) - z(t)| \leq |x(t) - y(t)| + |y(t) - z(t)|`

   Integrating both sides over :math:`[a,b]`, we get:
   :math:`\int_{a}^{b} |x(t) - z(t)| dt \leq \int_{a}^{b} |x(t) - y(t)| dt + \int_{a}^{b} |y(t) - z(t)| dt`

   Thus, :math:`\tilde{d}(x,z) \leq \tilde{d}(x,y) + \tilde{d}(y,z)`

Given the properties and proofs outlined above, the function :math:`\tilde{d}` does indeed define a metric on the function space :math:`C[a,b]`.

----------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 10. Hamming Distance. Let X be a set of all ordered triples of zeros and ones. Show that X consists of 8 elements and a metric d on X is defined by d(x,y)=number of places where x and y have a different entries.**

Definition of Ordered Triples:

An ordered triple refers to a set of three elements arranged in a specific order. The order of elements in the triple is significant, meaning that the triple (0,1,0) is different from the triple (1,0,0). 

Elements of Set X:

Given that each element of the ordered triple can be either a 0 or a 1, we can list all possible ordered triples in set :math:`X` as follows:

1. (0,0,0)
2. (0,0,1)
3. (0,1,0)
4. (0,1,1)
5. (1,0,0)
6. (1,0,1)
7. (1,1,0)
8. (1,1,1)

Thus, set :math:`X` consists of 8 distinct ordered triples.

Definition of the Metric d on X:

For any two ordered triples :math:`x` and :math:`y` in :math:`X`, the metric :math:`d(x,y)` is defined as the number of positions at which the entries of :math:`x` and :math:`y` differ.

**Example:**

Let's consider two ordered triples:
:math:`x = (0,1,0)`
:math:`y = (1,1,1)`

Comparing the entries of :math:`x` and :math:`y` position by position:

- At the first position: :math:`x` has 0 and :math:`y` has 1. They are different.
- At the second position: Both :math:`x` and :math:`y` have 1. They are the same.
- At the third position: :math:`x` has 0 and :math:`y` has 1. They are different.

So, there are 2 positions at which :math:`x` and :math:`y` have different entries. Therefore, :math:`d(x,y) = 2`.

In essence, the metric :math:`d(x,y)` for the set :math:`X` counts the number of "mismatches" between the entries of two ordered triples. The more mismatches there are, the "farther apart" the two ordered triples are considered to be in terms of the metric.

This format should be suitable for Nikola reStructuredText (rst) rendering.

Properties of the Metric d:


To show that :math:`d` is a metric, we need to verify the following properties:

1. **Non-negativity:** For all :math:`x, y \in X`, :math:`d(x, y) \geq 0`.

   *Proof:* 
   The number of differing positions between two ordered triples is always non-negative.

2. **Identity of Indiscernibles:** For all :math:`x, y \in X`, :math:`d(x, y) = 0` if and only if :math:`x = y`.

   *Proof:* 
   If :math:`d(x, y) = 0`, it means there are no differing positions between :math:`x` and :math:`y`, implying :math:`x = y`.

3. **Symmetry:** For all :math:`x, y \in X`, :math:`d(x, y) = d(y, x)`.

   *Proof:* 
   The number of differing positions between :math:`x` and :math:`y` is the same as the number of differing positions between :math:`y` and :math:`x`.

4. **Triangle Inequality:** For all :math:`x, y, z \in X`, :math:`d(x, z) \leq d(x, y) + d(y, z)`.

   *Proof:* 
   Let's consider three ordered triples :math:`x, y,` and :math:`z` from set :math:`X`. For each position in the ordered triples:

   - If :math:`x` and :math:`z` have the same entry, then the contribution to :math:`d(x, z)` is 0 for that position.
   
   - If :math:`x` and :math:`z` have different entries, then either :math:`x` and :math:`y` have different entries, or :math:`y` and :math:`z` have different entries, or both. This means that the sum of the contributions to :math:`d(x, y)` and :math:`d(y, z)` for that position is at least 1.
   
   Summing over all positions, we get:
   :math:`d(x, z) \leq d(x, y) + d(y, z)`

   Thus, the triangle inequality is satisfied for the Hamming distance on set :math:`X`.


Given that the metric :math:`d` satisfies all the properties of a metric on :math:`X`, we can conclude that :math:`d` defines a metric on the set :math:`X` of all ordered triples of zeros and ones.

--------------------------------------------------------------------------------------------------------------

**Problem 11. Prove**

.. math::
   d(x_1, x_{k+1}) \leq (d(x_1,x_2) + d(x_2,x_3) + \ldots + d(x_{k-1}, x_k)) + d(x_k, x_{k+1})


Given a metric space with metric :math:`d`, we want to prove that for any sequence of points :math:`x_1, x_2, \ldots, x_n` in the space:

.. math::
   d(x_1, x_n) \leq d(x_1,x_2) + d(x_2,x_3) + \ldots + d(x_{n-1}, x_n)

To prove this, we'll use induction on :math:`n`.

**Base Case**  :math:`n=2` For :math:`n = 2` , the statement is trivially true as:

.. math::
   d(x_1, x_2) \leq d(x_1, x_2)

**Inductive Step**
Assuming our inductive hypothesis, we have:

.. math::
   d(x_1, x_k) \leq d(x_1,x_2) + d(x_2,x_3) + \ldots + d(x_{k-1}, x_k)

Now, consider the distance between :math:`x_1` and :math:`x_{k+1}`. Using the triangle inequality, we can say:

.. math::
   d(x_1, x_{k+1}) \leq d(x_1, x_k) + d(x_k, x_{k+1})

Here's the breakdown:

- :math:`d(x_1, x_{k+1})` is the total distance from :math:`x_1` to :math:`x_{k+1}`.
  
- :math:`d(x_1, x_k)` represents the distance from :math:`x_1` to :math:`x_k`.

- :math:`d(x_k, x_{k+1})` is the distance between the points :math:`x_k` and :math:`x_{k+1}`.

The triangle inequality tells us that the direct path from :math:`x_1` to :math:`x_{k+1}` is shorter than or equal to the sum of the path from :math:`x_1` to :math:`x_k` and then from :math:`x_k` to :math:`x_{k+1}`.

Now, using our inductive assumption, we can replace :math:`d(x_1, x_k)` with the sum of distances between consecutive points up to :math:`x_k`:

.. math::
   d(x_1, x_{k+1}) \leq (d(x_1,x_2) + d(x_2,x_3) + \ldots + d(x_{k-1}, x_k)) + d(x_k, x_{k+1})

This equation essentially states that the direct distance from :math:`x_1` to :math:`x_{k+1}` is less than or equal to the sum of distances when traveling through all intermediate points up to :math:`x_{k+1}`.

Thus, our inductive step is complete, and the statement holds for :math:`n = k+1`.



By the principle of mathematical induction, the statement is true for all positive integers :math:`n`.

**Conclusion**

The given inequality is a direct consequence of the triangle inequality, and it holds for any sequence of points in a metric space.

**Problem 12.**

Given the inequality:

.. math::
   d(x_1, x_{k+1}) \leq (d(x_1,x_2) + d(x_2,x_3) + \ldots + d(x_{k-1}, x_k)) + d(x_k, x_{k+1})

We aim to prove:

.. math::
   |d(x,y) - d(z,w)| \leq d(x,z) + d(y,w)

**Proof**

Using the triangle inequality, we have:

.. math::
   d(x,y) \leq d(x,z) + d(z,y)

Similarly:

.. math::
   d(z,w) \leq d(z,y) + d(y,w)

From the first inequality, expressing d(z,y) :

.. math::
   d(z,y) \geq d(x,y) - d(x,z)

Substituting into the second inequality:

.. math::
   d(z,w) \leq d(x,y) - d(x,z) + d(y,w)

Rearranging, we get:

.. math::
   d(x,y) - d(z,w) \leq d(x,z) + d(y,w)

Similarly, by interchanging  x and  z and y  and  w , we derive:

.. math::
   d(z,w) - d(x,y) \leq d(x,z) + d(y,w)

Combining the two results:

.. math::
   |d(x,y) - d(z,w)| \leq d(x,z) + d(y,w)


In conclusion, the direct path (straight line) between any two points is always shorter than or equal to the sum of the paths that go through an intermediate point.

This completes the proof.

-----------------------------------------------------------------------------------------------------------------

**Problem 13. Using triangle inequality show** :math:`|d(x,z)-d(y,z)|\leq d(x,y)`

1. **Using the Triangle Inequality:**
   
   We know from the triangle inequality that:
   :math:`d(x,z) \leq d(x,y) + d(y,z)`
   (1)

   Similarly, we have:
   :math:`d(y,z) \leq d(y,x) + d(x,z)`
   (2)

2. **Rearranging (1):**

   From (1), we can rearrange to get:
   :math:`d(x,z) - d(y,z) \leq d(x,y)`
   (3)

3. **Rearranging (2):**

   From (2), we can rearrange to get:
   :math:`d(y,z) - d(x,z) \leq d(x,y)`
   (4)

4. **Combining (3) and (4):**

   From (3) and (4), we can conclude that:
   :math:`-d(x,y) \leq d(x,z) - d(y,z) \leq d(x,y)`

   This is the definition of the absolute value inequality. Thus, we can rewrite it as:
   :math:`|d(x,z) - d(y,z)| \leq d(x,y)`

And that completes the proof.

------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 16.**

We aim to prove the following inequality using the triangle inequality:

.. math::
   d(x,y) \leq d(z,x) + d(z,y)

**Proof**


Using the triangle inequality for any three points x ,  y , and  z  in a metric space, we have:

.. math::
   d(x,y) \leq d(x,z) + d(z,y)

This states that the distance between x and  y is always less than or equal to the sum of the distances from  x to z and from z to y .

Thus, the desired inequality is proven:

.. math::
   d(x,y) \leq d(z,x) + d(z,y)

**A bit detailed look**

The triangle inequality states that for any three points in a metric space, the direct distance between two of them is always less than or equal to the sum of their distances to the third point. 

Given three points x ,  y, and z:

- The direct distance between x and y is denoted as:

  .. math::
     d(x,y)

- The sum of their distances to z is:

  .. math::
     d(x,z) + d(z,y)

Using the triangle inequality, we can conclude:

.. math::
   d(x,y) \leq d(x,z) + d(z,y)


This completes the proof.

-------------------------------------------------------------------------------------------------

**Problem 14. Show that (M3) and (M4) can be derived from (M2) and (M4).**

**Proof:**

1. **Deriving (M3) from (M2) and (M4):**

Given (M2): :math:`d(x,y) = 0` if and only if :math:`x = y`

Given (M4): :math:`d(x,y) \leq d(x,z) + d(z,y)`

To prove (M3): :math:`d(x,y) = d(y,x)`

Consider any two points :math:`x` and :math:`y`. 

Using (M4) with :math:`z = x`, we get:
:math:`d(x,y) \leq d(x,x) + d(x,y)`

But from (M2), :math:`d(x,x) = 0`. So, 
:math:`d(x,y) \leq d(x,y)`

Similarly, using (M4) with :math:`z = y`, we get:
:math:`d(y,x) \leq d(y,y) + d(y,x)`

Again, from (M2), :math:`d(y,y) = 0`. So, 
:math:`d(y,x) \leq d(y,x)`

Combining the two inequalities, we get:
:math:`d(x,y) = d(y,x)`

This proves (M3).

2. **Deriving (M4) from (M2) and (M4):**

This is trivial since (M4) is already given.

Thus, we have shown that (M3) can be derived from (M2) and (M4).

-------------------------------------------------------------------------------------------------------

**Problem 15. Show that non-negativity of a metric follows from (M2) to (M4).**

**Proof:**

Given the axioms:

(M2): :math:`d(x,y) = 0` if and only if :math:`x = y`

(M3): :math:`d(x,y) = d(y,x)`

(M4): :math:`d(x,y) \leq d(x,z) + d(z,y)`

We aim to prove non-negativity, i.e., :math:`d(x,y) \geq 0` for all :math:`x, y`.

Consider any two points :math:`x` and :math:`y`.

Using (M4) with :math:`z = x`, we get:
:math:`d(x,y) \leq d(x,x) + d(x,y)`

From (M2), we know that :math:`d(x,x) = 0`. Substituting this in, we get:
:math:`d(x,y) \leq d(x,y)`

Now, using (M3), we have:
:math:`d(y,x) = d(x,y)`

Using (M4) with :math:`z = y`, we get:
:math:`d(y,x) \leq d(y,y) + d(y,x)`

Again, from (M2), :math:`d(y,y) = 0`. Substituting this in, we get:
:math:`d(y,x) \leq d(y,x)`

Combining the two inequalities, we get:
:math:`0 \leq d(x,y)`

This proves the non-negativity of the metric :math:`d`.

Thus, non-negativity of a metric follows from (M2) to (M4).


