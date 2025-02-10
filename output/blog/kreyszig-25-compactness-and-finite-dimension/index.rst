.. title: Kreyszig 2.5 Compactness and Finite Dimension
.. slug: kreyszig-25-compactness-and-finite-dimension
.. date: 2023-11-17 20:30:40 UTC
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text

**Problem 1.** Show that :math:`\mathbb{R}^n` and :math:`\mathbb{C}^n` are not compact.

Solution

To show that :math:`\mathbb{R}^n` and :math:`\mathbb{C}^n` are not compact, we can utilize the Heine-Borel theorem, which characterizes compact subsets of :math:`\mathbb{R}^n`. The theorem states that a subset of :math:`\mathbb{R}^n` is compact if and only if it is closed and bounded.

**For** :math:`\mathbb{R}^n`:

1. **Closedness**: By definition, :math:`\mathbb{R}^n` is closed because it contains all its limit points; every convergent sequence in :math:`\mathbb{R}^n` has a limit that is also in :math:`\mathbb{R}^n`.

2. **Boundedness**: However, :math:`\mathbb{R}^n` is not bounded. To see this, consider the sequence :math:`\{(x_k)\}_{k=1}^{\infty}` where :math:`x_k = (k, 0, 0, \ldots, 0)` in :math:`\mathbb{R}^n`. This sequence has no upper bound within :math:`\mathbb{R}^n` because for any given :math:`M \in \mathbb{R}`, there exists an :math:`N` such that for all :math:`n > N`, :math:`x_n > M`.

Thus, since :math:`\mathbb{R}^n` is not bounded, it cannot be compact according to the Heine-Borel theorem.

**For** :math:`\mathbb{C}^n`:

1. **Closedness**: :math:`\mathbb{C}^n` is also closed because it includes all its limit points; it is the entire space of :math:`n`-tuples of complex numbers.

2. **Boundedness**: We can show that :math:`\mathbb{C}^n` is not bounded in a similar manner to :math:`\mathbb{R}^n`. Consider the sequence of complex numbers :math:`\{(z_k)\}_{k=1}^{\infty}` where :math:`z_k = (k, 0, \ldots, 0)` in :math:`\mathbb{C}^n`, where :math:`k` represents the complex number :math:`k + 0i`. This sequence, too, has no bound within :math:`\mathbb{C}^n` for the same reasons as in :math:`\mathbb{R}^n`.

Thus, :math:`\mathbb{C}^n` is not bounded and, hence, not compact.

Note that :math:`\mathbb{C}^n` is isomorphic to :math:`\mathbb{R}^{2n}` since each complex number corresponds to a pair of real numbers (the real and imaginary parts). Therefore, the non-compactness of :math:`\mathbb{C}^n` follows from the non-compactness of :math:`\mathbb{R}^{2n}`.

In conclusion, neither :math:`\mathbb{R}^n` nor :math:`\mathbb{C}^n` is compact because, although both are closed, neither is bounded.

 :math:`\blacksquare`

The detailed explanation of why the sequence :math:`\{(x_k)\}_{k=1}^{\infty}` with :math:`x_k = (k, 0, 0, \ldots, 0)` in :math:`\mathbb{R}^n` has no upper bound is as follows:

For any chosen real number :math:`M`, no matter how large, there exists a natural number :math:`N` such that for all :math:`k > N`, the value of :math:`k` is greater than :math:`M`. This means that the first component of the vector :math:`x_k` is greater than :math:`M`. The formal expression of this statement is:

.. math::
   \forall M \in \mathbb{R}, \exists N \in \mathbb{N} : \forall k > N, x_k > M

This expression states that for any real number :math:`M` one might consider as a potential upper bound, there exists a point in the sequence, beyond the :math:`N` th term, where the elements of the sequence exceed :math:`M`. Thus, for any :math:`M` in :math:`\mathbb{R}`, we can find elements in the sequence :math:`\{(x_k)\}` that are larger than :math:`M`, demonstrating that the sequence does not have an upper bound in :math:`\mathbb{R}^n`.

The absence of an upper bound implies that the sequence is unbounded. According to the Heine-Borel theorem, a necessary condition for a subset of :math:`\mathbb{R}^n` to be compact is that it must be bounded. Since the sequence :math:`\{(x_k)\}` is unbounded in :math:`\mathbb{R}^n`, it follows that :math:`\mathbb{R}^n` itself is not compact as it fails to satisfy the boundedness condition required by the theorem.

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 2.** Show that a discrete metric space :math:`X` consisting of infinitely many points is not compact.

**Solution**

To prove that an infinite discrete metric space :math:`X` is not compact, we use the definition of compactness in metric spaces. A metric space is compact if every open cover has a finite subcover.

In a discrete metric space, the metric is defined such that :math:`d(x, x) = 0` for all :math:`x \in X`, and :math:`d(x, y) = 1` for all :math:`x \neq y`. This implies that each point in :math:`X` is isolated from every other point. We can then consider an open cover of :math:`X` consisting of the open balls :math:`\{B(x, \frac{1}{2})\}` for each :math:`x \in X`. Each of these balls is indeed an open set because it contains no points other than its center.

Since :math:`X` contains infinitely many points, the collection :math:`\{B(x, \frac{1}{2})\}` is an infinite cover for :math:`X`. If :math:`X` were compact, there would exist a finite subcover that still covers :math:`X`. However, this is not possible because each open ball in our cover contains exactly one point of :math:`X` and no two balls contain the same point. Thus, no finite collection of these balls can cover the entirety of :math:`X`.

Consequently, there is no finite subcover possible for the cover :math:`\{B(x, \frac{1}{2})\}`, which means that the discrete metric space :math:`X` cannot be compact.

 :math:`\blacksquare`

---------------------

**Problem 3.** Give examples of compact and noncompact curves in the plane :math:`\mathbb{R}^2`.

**Solution**

**Compact Curves:**

1. **Unit Circle**: The set of all points :math:`(x, y)` such that :math:`x^2 + y^2 = 1`. This curve is closed and bounded.

2. **Square**: The boundary defined by the set of all points :math:`(x, y)` with vertices at :math:`(\pm1, \pm1)`. It is a closed and bounded shape.

3. **Triangle**: The boundary formed by connecting points :math:`(0, 0)`, :math:`(1, 0)`, and :math:`(0, 1)`. Each edge is a closed line segment, making the whole triangle compact.

4. **Closed Disk**: The set of all points :math:`(x, y)` satisfying :math:`x^2 + y^2 \leq r^2` for a fixed :math:`r`. This includes all points within and on the boundary, constituting a closed and bounded set.

**Noncompact Curves:**

1. **Ray**: The set of points :math:`(x, y)` forming a ray extending from the origin indefinitely, like :math:`\{(t, t) | t \geq 0\}`. This curve is unbounded.

2. **Hyperbola**: The set of points :math:`(x, y)` satisfying :math:`xy = 1`. This curve extends to infinity in all directions.

3. **Infinite Line**: A line like :math:`y = x` that extends without bound in both directions.

4. **Logarithmic Spiral**: Defined by the polar equation :math:`r = e^{\theta}`, this curve winds away from the origin infinitely.

These examples illustrate the distinction in :math:`\mathbb{R}^2` between compact sets, which are both closed and bounded, and noncompact sets, which are not closed, not bounded, or both.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 4.** Show that for an infinite subset :math:`M` in the space :math:`s` to be compact, it is necessary that there are numbers :math:`\gamma_1, \gamma_2, \ldots` such that for all :math:`x = (\xi_k(x)) \in M` we have :math:`|\xi_k(x)| \leq \gamma_k`. (It can be shown that the condition is also sufficient for the compactness of :math:`M`.)

**Solution**

To show the necessity of the condition for compactness in the space :math:`s`, as defined in the problem statement, we need to demonstrate that for any sequence in a compact subset :math:`M` of :math:`s`, the elements of the sequence must be uniformly bounded by some sequence :math:`\{\gamma_k\}`.

Consider the space :math:`s` as defined in the second image, where the metric :math:`d` is given by:

.. math::
   d(x, y) = \sum_{j=1}^{\infty} \frac{1}{2^j} \frac{| \xi_j - \eta_j |}{1 + | \xi_j - \eta_j |}

with :math:`x = (\xi_k)` and :math:`y = (\eta_k)` being elements of :math:`s`.

The metric :math:`d` is designed such that the "distance" it measures is the sum of a series of terms, each of which is a fraction of the absolute difference between the components of two elements :math:`x` and :math:`y`, scaled by :math:`1/2^j`. This series converges because each term is less than or equal to :math:`1/2^j`, and :math:`\sum 1/2^j` is a convergent geometric series.

Now let's consider the subset :math:`M \subset s`. If :math:`M` is compact, then from the definition of compactness in metric spaces, every sequence in :math:`M` has a convergent subsequence. For a sequence :math:`\{x^{(n)}\}` with :math:`x^{(n)} = (\xi_k^{(n)})` in :math:`M`, its convergence in :math:`s` means that for every :math:`\epsilon > 0`, there exists an :math:`N` such that for all :math:`m, n > N`, :math:`d(x^{(m)}, x^{(n)}) < \epsilon`.

For compactness, we require that this sequence has a convergent subsequence in :math:`s`. Due to the definition of the metric, this means that for each :math:`j`, the sequence :math:`\{\xi_j^{(n)}\}` must be Cauchy, and hence bounded. Therefore, there must exist a bound :math:`\gamma_j` for each :math:`j` such that :math:`|\xi_j^{(n)}| \leq \gamma_j` for all :math:`n`.

To see why the sequence :math:`\{\xi_j^{(n)}\}` must be bounded, suppose it were not. If for some :math:`j`, :math:`\{\xi_j^{(n)}\}` were unbounded, then we could choose :math:`\epsilon` small enough (specifically :math:`\epsilon < 1/2^j`) and a subsequence :math:`\{x^{(n_k)}\}` such that :math:`|\xi_j^{(n_k)} - \xi_j^{(n_{k+1})}| > 1` for all :math:`k`, which would imply :math:`d(x^{(n_k)}, x^{(n_{k+1})})` would not converge to 0, contradicting the compactness of :math:`M`.

Therefore, for :math:`M` to be compact, it is necessary that there exist numbers :math:`\gamma_1, \gamma_2, \ldots` such that for all :math:`x = (\xi_k(x)) \in M` we have :math:`|\xi_k(x)| \leq \gamma_k`. This condition is known to be sufficient as well for the compactness of :math:`M` in the space :math:`s`, as a uniformly bounded and equicontinuous sequence in :math:`s` will have a convergent subsequence by the Arzelà-Ascoli theorem.

 :math:`\blacksquare`

---------------------

**Problem 5.** A metric space :math:`X` is said to be locally compact if every point of :math:`X` has a compact neighborhood. Show that :math:`\mathbb{R}` and :math:`\mathbb{C}`, and more generally, :math:`\mathbb{R}^n` and :math:`\mathbb{C}^n` are locally compact.

Solution

To prove that :math:`\mathbb{R}`, :math:`\mathbb{C}`, and by extension :math:`\mathbb{R}^n` and :math:`\mathbb{C}^n`, are locally compact, we utilize the following concepts:

1. A space is **locally compact** if each point has a **compact neighborhood**.
2. A set is **compact** if every open cover has a finite subcover, which, in a metric space, translates to the set being closed and bounded, as per the **Heine-Borel theorem**.
3. A **neighborhood** of a point includes an open set containing that point.

**Detailed Proofs of Local Compactness**

**Detailed Proof for** :math:`\mathbb{R}`:

For any point :math:`x \in \mathbb{R}`, we can identify a neighborhood around :math:`x`, such as the open interval :math:`(x - \epsilon, x + \epsilon)` for some :math:`\epsilon > 0`. The closure of this interval is the closed interval :math:`[x - \epsilon, x + \epsilon]`, which encompasses its limit points and is delimited by the points :math:`x - \epsilon` and :math:`x + \epsilon`. By the Heine-Borel theorem, as :math:`[x - \epsilon, x + \epsilon]` is both closed and bounded within :math:`\mathbb{R}`, it is compact. Therefore, every point :math:`x` possesses a compact neighborhood in :math:`\mathbb{R}`, affirming its local compactness.

**Detailed Proof for** :math:`\mathbb{C}`:

Upon recognizing :math:`\mathbb{C}` as topologically equivalent to :math:`\mathbb{R}^2`, for any :math:`z \in \mathbb{C}`, we consider the open disk centered at :math:`z`, denoted :math:`D(z, \epsilon)` for some :math:`\epsilon > 0`. This disk serves as a neighborhood of :math:`z`. The closure of :math:`D(z, \epsilon)`, which consists of all points inside and on the boundary of the disk, constitutes a closed set. It is also bounded by the circumference of the disk. Thus, by the Heine-Borel theorem, the closure of :math:`D(z, \epsilon)` is compact in :math:`\mathbb{C}`, corroborating its local compactness.

**Detailed Proof for** :math:`\mathbb{R}^n`:

For an arbitrary point :math:`x \in \mathbb{R}^n`, we select the open ball :math:`B(x, \epsilon)` centered at :math:`x` with a radius :math:`\epsilon > 0`. The closure of this ball, :math:`\overline{B(x, \epsilon)}`, which includes all points within and on the periphery of the sphere, is closed. Moreover, it is bounded as all points lie within a maximum distance :math:`\epsilon` from :math:`x`. Consequently, :math:`\overline{B(x, \epsilon)}` is compact as per the Heine-Borel theorem, demonstrating that :math:`\mathbb{R}^n` is locally compact since :math:`x` has a compact neighborhood.

**Detailed Proof for** :math:`\mathbb{C}^n`:

Given that :math:`\mathbb{C}^n` aligns with :math:`\mathbb{R}^{2n}` topologically, each complex coordinate having a real and imaginary part, for any point :math:`z \in \mathbb{C}^n`, an open ball in :math:`\mathbb{R}^{2n}` can be centered at the point corresponding to :math:`z` with a radius :math:`\epsilon > 0`. The closure of this ball is also a closed and bounded set in :math:`\mathbb{R}^{2n}`, and hence compact. This provides every point in :math:`\mathbb{C}^n` with a compact neighborhood, certifying local compactness.

Each proof underlines the principle that local compactness is evidenced by the ability to encase any point within a closed and bounded (thus compact) subset, meeting the local compactness criterion.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 6.** Show that a compact metric space :math:`X` is locally compact.

**Proof**

Let :math:`X` be a compact metric space. We aim to prove that for every point :math:`x` in :math:`X`, there exists a compact neighborhood around :math:`x`. In metric spaces, we have the luxury of using open balls as basic neighborhoods. For an arbitrary :math:`x \in X` and for any positive real number :math:`\epsilon`, the open ball :math:`B(x, \epsilon)` is an open set containing :math:`x`.

Due to the compactness of :math:`X`, any open cover has a finite subcover. Consider the collection of open balls :math:`\{B(x, \frac{1}{n})\}_{n \in \mathbb{N}}`, which is indeed an open cover of :math:`X`. By the compactness of :math:`X`, there exists a finite subcover of this collection, implying the existence of some :math:`N \in \mathbb{N}` such that :math:`B(x, \frac{1}{N})` is contained within an open set that is part of the finite subcover of :math:`X`.

The closure of :math:`B(x, \frac{1}{N})`, denoted by :math:`\overline{B(x, \frac{1}{N})}`, is a closed subset of the compact space :math:`X`. By the properties of compact spaces, closed subsets of compact spaces are also compact. Thus, :math:`\overline{B(x, \frac{1}{N})}` is compact and contains the open ball :math:`B(x, \frac{1}{N})`, which is a neighborhood of :math:`x`. This establishes that :math:`x` has a compact neighborhood.

Since the choice of :math:`x` in :math:`X` was arbitrary, and we have demonstrated that each point has a compact neighborhood, it follows that the metric space :math:`X` is locally compact.

This detailed proof leverages the Heine-Borel theorem and the properties of open and closed sets in metric spaces to demonstrate the local compactness of a compact metric space.

 :math:`\blacksquare`

---------------------

**Problem 7.** If :math:`\dim Y < \infty` in Riesz's lemma 2.5-4, show that one can even choose :math:`\theta = 1`.

**Proof Using Riesz's Lemma**

Let us consider Riesz's lemma in the context where :math:`Y` is a finite-dimensional subspace of :math:`Z`, a subspace of a normed space :math:`X`. Riesz's lemma asserts that given a closed subspace :math:`Y` which is a proper subset of :math:`Z`, for every real number :math:`\theta` in the interval (0,1), there exists a :math:`z \in Z` such that :math:`\|z\| = 1` and :math:`\|z - y\| \geq \theta` for all :math:`y \in Y`.

Suppose :math:`v \in Z \setminus Y` and denote the distance from :math:`v` to :math:`Y` by :math:`a`, where :math:`a = \inf\{\|v - y\| : y \in Y\}`. Since :math:`Y` is closed and finite-dimensional, it is also a known fact that closed balls in :math:`Y` are compact. Thus, the infimum :math:`a` is actually achieved by some :math:`y_0 \in Y`. We have :math:`\|v - y_0\| = a` and :math:`a > 0` because :math:`v` is not in :math:`Y`.

We proceed to define :math:`z` as the normalization of :math:`v - y_0`, so :math:`z = c(v - y_0)` where :math:`c = \frac{1}{\|v - y_0\|} = \frac{1}{a}`. This normalization ensures that :math:`\|z\| = 1`.

For any :math:`y \in Y`, we can express :math:`y` as :math:`y_1 = y_0 + c^{-1}y`, with :math:`y_1` also in :math:`Y` due to the vector space properties of :math:`Y`. The norm :math:`\|z - y\|` is then :math:`\|c(v - y_0) - y\| = c\|v - y_1\|`. Given that :math:`v` is closest to :math:`y_0` by the very definition of :math:`a`, it follows that :math:`c\|v - y_1\| \geq c\|v - y_0\| = c \cdot a = 1`. Consequently, :math:`\|z - y\| \geq 1` for all :math:`y \in Y`.

Since the choice of :math:`y` was arbitrary, this implies that :math:`\|z - y\| \geq \theta` for any :math:`\theta \leq 1`. Thus, when :math:`Y` is finite-dimensional, it is permissible to select :math:`\theta = 1` in Riesz's lemma. The lemma is thereby applicable for :math:`\theta = 1`, which is due to the structure of the normed space and the finite-dimensionality of :math:`Y`, guaranteeing the existence of such a :math:`z` with the specified characteristics.

 :math:`\blacksquare`

**A little different approach**

To show that :math:`\theta=1` can be chosen in Riesz's lemma under the condition that the dimension of :math:`Y` is finite, we will analyze the proof of Riesz's lemma and demonstrate that if :math:`Y` has a finite dimension, then the distance from any :math:`v \in Z \setminus Y` to :math:`Y` can be made equal to 1, which implies that :math:`\theta` can be taken as 1.

Riesz's Lemma states that for any two subspaces :math:`Y` and :math:`Z` of a normed space :math:`X`, with :math:`Y` being closed and a proper subset of :math:`Z`, for every :math:`\theta` in the interval (0,1), there exists a :math:`z \in Z` such that :math:`\|z\| = 1` and :math:`\|z - y\| \geq \theta` for all :math:`y \in Y`.

**Proof Using Riesz's Lemma**

Suppose :math:`Y` is a finite-dimensional subspace of :math:`Z`. By the properties of finite-dimensional normed spaces, we know that closed balls in :math:`Y` are compact. Let :math:`v \in Z \setminus Y` and denote its distance from :math:`Y` by :math:`a`, that is, :math:`a = \inf\{\|v - y\| : y \in Y\}`. Since :math:`Y` is closed and :math:`v` is not in :math:`Y`, it follows that :math:`a > 0`.

In the finite-dimensional subspace :math:`Y`, due to compactness, the infimum :math:`a` is actually attained for some :math:`y_0 \in Y`. That is, there exists a :math:`y_0 \in Y` such that :math:`\|v - y_0\| = a`. Now, define :math:`z` as a scaled vector of :math:`v - y_0`, specifically :math:`z = c(v - y_0)`, where :math:`c = \frac{1}{\|v - y_0\|} = \frac{1}{a}`. This scaling ensures that :math:`\|z\| = 1`.

Now, consider any :math:`y \in Y`. We examine the distance from :math:`z` to :math:`y`. Note that any :math:`y` can be written as :math:`y_1 = y_0 + c^{-1}y`, where :math:`y_1 \in Y` due to :math:`Y` being a vector space and thus closed under addition and scalar multiplication. We calculate:

.. math::
   \|z - y\| = \|c(v - y_0) - y\| = c\|v - y_0 - c^{-1}y\| = c\|v - y_1\|.

Because :math:`v` is closer to :math:`y_0` than any other point in :math:`Y` by the definition of :math:`y_0`, it follows that :math:`c\|v - y_1\| \geq c\|v - y_0\| = c \cdot a = 1`. Therefore, for all :math:`y \in Y`, :math:`\|z - y\| \geq 1`, which by the choice of our :math:`z` implies :math:`\|z - y\| \geq \theta` for any :math:`\theta \leq 1`. Hence, in the case where :math:`Y` has finite dimension, we can choose :math:`\theta = 1` in Riesz's lemma.

This shows that the lemma is not only true for any :math:`\theta` in the open interval (0,1) but can be strengthened to include :math:`\theta = 1` when the subspace :math:`Y` is of finite dimension. The lemma holds trivially for :math:`\theta = 1` because the normed space structure and finite dimensionality ensure the existence of such :math:`z` with the required properties.

 :math:`\blacksquare`

---------------------

**Problem 8.** In Problem 7, Section 2.4, show directly (without using 2.4-5) that there is an :math:`a > 0` such that :math:`a\|x\|_2 \leq \|x\|`. (Use 2.5-7.)

Show directly that there is a constant :math:`a > 0` such that :math:`a\|x\|_2 \leq \|x\|` for a normed finite-dimensional vector space :math:`X` without using the theorem on equivalent norms.

**Proof**

Let :math:`X` be a finite-dimensional vector space equipped with two norms :math:`\|\cdot\|` and :math:`\|\cdot\|_2`, where :math:`\|\cdot\|_2` is the standard Euclidean norm. Consider the unit sphere :math:`S` in :math:`X` with respect to :math:`\|\cdot\|_2`, that is, :math:`S = \{x \in X : \|x\|_2 = 1\}`.

Since :math:`X` is finite-dimensional, :math:`S` is compact with respect to :math:`\|\cdot\|_2`. Now, define a mapping :math:`T: S \to \mathbb{R}` by :math:`T(x) = \|x\|` for all :math:`x \in S`. This mapping is continuous because the norms are continuous functions, and by the Corollary 2.5-7, since :math:`S` is compact, :math:`T` attains its maximum and minimum values on :math:`S`.

Let :math:`m = \min \{T(x) : x \in S\}`. Since all norms on a finite-dimensional space are positive definite, we have :math:`m > 0` because if :math:`m = 0`, there would exist an :math:`x \in S` such that :math:`\|x\| = 0`, which implies :math:`x = 0`, contradicting the fact that :math:`x` is on the unit sphere :math:`S`.

Now, for any :math:`x \in X` with :math:`x \neq 0`, we can write :math:`x` as :math:`x = \|x\|_2 \cdot \left(\frac{x}{\|x\|_2}\right)`. Notice that :math:`\frac{x}{\|x\|_2} \in S`, hence :math:`\left\|\frac{x}{\|x\|_2}\right\| \geq m`. Multiplying both sides by :math:`\|x\|_2`, we get :math:`\|x\| = \|x\|_2 \cdot \left\|\frac{x}{\|x\|_2}\right\| \geq m \|x\|_2`.

Set :math:`a = m`, which is the positive minimum value of :math:`T` on the compact set :math:`S`. We have established that :math:`a\|x\|_2 \leq \|x\|` for all :math:`x \in X`, where :math:`a > 0`.

This completes the proof, establishing the existence of a positive constant :math:`a` that provides a lower bound for the ratio of the norms :math:`\|\cdot\|` and :math:`\|\cdot\|_2` on a finite-dimensional vector space :math:`X`.

 :math:`\blacksquare`

---------------------

**Problem.9** If :math:`X` is a compact metric space and :math:`M \subseteq X` is closed, show that :math:`M` is compact.

**Proof**

Consider :math:`X`, a metric space endowed with a metric :math:`d`, and let :math:`M \subseteq X` be a closed subset. Our objective is to substantiate the compactness of :math:`M` predicated on the compactness of the ambient space :math:`X`.

Compactness in a metric space is defined such that a subset :math:`M` of :math:`X` is compact if every open cover of :math:`M` admits a finite subcover. Let us take an arbitrary open cover :math:`\mathcal{O}` of :math:`M`, constituted by a family of open sets in :math:`X` such that every point in :math:`M` resides within some member of :math:`\mathcal{O}`.

Given the closure of :math:`M` in :math:`X`, its complement :math:`X \setminus M` is open in :math:`X`. Enhance the open cover :math:`\mathcal{O}` of :math:`M` by annexing the open set :math:`X \setminus M`, thereby generating a new open cover :math:`\mathcal{O}'` that extends over the entirety of :math:`X`, for it encompasses every point in :math:`X`.

The compact nature of :math:`X` necessitates that the open cover :math:`\mathcal{O}'` of :math:`X` must possess a finite subcover, designated as :math:`\mathcal{O}''`. This finite subcover aptly covers all points in :math:`X`, and by extension, all points in :math:`M`.

From the finite subcover :math:`\mathcal{O}''`, excise the set :math:`X \setminus M` should it be included. The residual compendium of sets within :math:`\mathcal{O}''` thus forms a finite subcollection originating from the initial cover :math:`\mathcal{O}`, which adequately covers :math:`M`. Consequently, :math:`M` is furnished with a finite subcover from its open cover :math:`\mathcal{O}`.

Ergo, :math:`M` aligns with the compactness criterion. We have thus rigorously delineated, utilizing the axioms of metric topology alongside the attributes of closed sets nestled within compact spaces, that a closed subset :math:`M` of a compact metric space :math:`X` is necessarily compact.

This consummates the proof, and we have methodically demonstrated, consistent with the tenets of metric space theory and the inherent properties of closed subsets within compact spaces, that a closed subset :math:`M` of a compact metric space :math:`X` must itself exhibit compactness.

 :math:`\blacksquare`
