.. title: Kreyszig 2.4 Finite Dimensional Normed Spaces and Subspaces
.. slug: kreyszig-24-finite-dimensional-normed-spaces-and-subspaces
.. date: 2023-11-15 19:46:21 UTC
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text

**Problem 1.** Give examples of subspaces of :math:`\ell^\infty` and :math:`\ell^2` which are not closed.

**Solution:**

In topology and functional analysis, a subspace of a topological space is considered **closed** if it contains all its limit points. For a subspace to be not closed, there must exist sequences (or nets) within the subspace that converge to a point outside the subspace.

For :math:`\ell^\infty` (Bounded Sequences):

**Example of a Non-Closed Subspace**:

- Consider the subspace of :math:`\ell^\infty` consisting of sequences that converge to 0.
- **Example Sequence**: Define :math:`x_n = (0, 0, \ldots, 0, \frac{1}{n}, 0, \ldots)`, where each :math:`x_n` has :math:`\frac{1}{n}` at the :math:`n`-th position and 0 everywhere else.
- **Proof of Non-Closure**: 
  - As :math:`n` increases, each :math:`x_n` converges to the zero sequence (all terms are zero), which is in the subspace.
  - The term-wise limit of :math:`(x_n)` as :math:`n \to \infty` is the harmonic sequence :math:`y = (1, \frac{1}{2}, \frac{1}{3}, \ldots)`.
  - Although each :math:`x_n` converges to 0, the limit sequence :math:`y` does not converge to 0.
  - Since :math:`y` is not in the subspace (it doesn't converge to 0) but is a limit of sequences in the subspace, this demonstrates that the subspace is not closed.

For :math:`\ell^2` (Square-Summable Sequences):

**Example of a Non-Closed Subspace**:

- Consider the subspace of :math:`\ell^2` consisting of sequences that converge to 0.
- **Example Sequence**: Let :math:`x_n = (1, \frac{1}{2}, \ldots, \frac{1}{n}, 0, 0, \ldots)`, where the first :math:`n` terms are the first :math:`n` terms of the harmonic sequence, and the rest are 0.
- **Proof of Non-Closure**: 
  - Each :math:`x_n` is square-summable and converges to 0, making them elements of the subspace.
  - The term-wise limit of :math:`(x_n)` as :math:`n \to \infty` is :math:`y = (1, \frac{1}{2}, \frac{1}{3}, \ldots)`.
  - While each :math:`x_n` is square-summable, the limit sequence :math:`y` is not square-summable. The sum of the squares of the terms of :math:`y`, :math:`\sum \frac{1}{n^2}`, diverges.
  - Since :math:`y` is not in :math:`\ell^2` (not square-summable) but is the limit of sequences in the subspace, this demonstrates that the subspace is not closed.

These examples illustrate that not all subspaces in :math:`\ell^\infty` and :math:`\ell^2` are closed. A subspace is not closed if it does not contain the limits of all convergent sequences within it. In :math:`\ell^\infty`, the subspace of sequences converging to 0 fails to include the harmonic sequence, which is a limit point. Similarly, in :math:`\ell^2`, the subspace of sequences converging to 0 does not include the harmonic sequence, which is not square-summable. This absence of limit points in the respective subspaces proves they are not closed.


These examples illustrate the principle of closed subspaces and demonstrate how sequences within these subspaces and their corresponding limit points can indicate whether a subspace is closed.

**Problem:**

Consider the space :math:`\ell^\infty` which consists of all bounded sequences of real numbers, and the space :math:`\ell^2` which consists of all square-summable sequences. We are tasked with demonstrating that certain subspaces of these spaces are not closed.

**Solution:**

The distinction between the sequences :math:`\left( \frac{1}{n} \right)` and :math:`\left( \frac{1}{n^2} \right)` in the context of closed subspaces is significant.

The sequence :math:`\left( \frac{1}{n} \right)` has terms that approach 0 as :math:`n` grows, but it does not actually converge to 0. The terms get infinitesimally small but never reach a limit as a sequence. This sequence does not meet the criterion for sequences in a subspace :math:`S \subset \ell^\infty` that we consider, which is the set of all sequences that converge to 0.

On the other hand, the sequence :math:`\left( \frac{1}{n^2} \right)` does converge to 0. For every :math:`\epsilon > 0`, there is an :math:`N` such that for all :math:`n > N`, :math:`\left| \frac{1}{n^2} \right| < \epsilon`. This means the sequence :math:`\left( \frac{1}{n^2} \right)` meets the criterion for inclusion in :math:`S`.

When we consider the limit of a sequence of sequences from :math:`S`, if the limit sequence is not in :math:`S`, it shows that :math:`S` is not closed. For the sequence :math:`\left( \frac{1}{n} \right)`, we can demonstrate this by considering a sequence of sequences :math:`(x_n)` where each :math:`x_n` consists of the first :math:`n` terms of :math:`\left( \frac{1}{n} \right)` followed by zeros. The term-wise limit of this sequence of sequences as :math:`n` approaches infinity is the sequence :math:`\left( \frac{1}{n} \right)`, which is bounded and therefore an element of :math:`\ell^\infty` but not in :math:`S` since it does not converge to 0, hence showing that :math:`S` is not closed in :math:`\ell^\infty`.

In contrast, any sequence of sequences from :math:`S` where each sequence converges to 0 will have a limit that also converges to 0. This is due to the more rapid convergence of the terms :math:`\left( \frac{1}{n^2} \right)` compared to :math:`\left( \frac{1}{n} \right)`. Thus, the sequence :math:`\left( \frac{1}{n^2} \right)` is not suitable for constructing a counterexample of a non-closed subspace in :math:`\ell^\infty`, because its limit behavior is consistent with sequences in :math:`S`.

**Proofs of convergence**

.. math::
    \varepsilon \text{-Proof that } \frac{1}{n} \text{ Does Not Converge to 0:}

Suppose for contradiction that :math:`\frac{1}{n}` converges to 0. Then, for any :math:`\varepsilon > 0`, there should exist an :math:`N \in \mathbb{N}` such that for all :math:`n > N`, :math:`\left| \frac{1}{n} - 0 \right| < \varepsilon`.

Let's choose :math:`\varepsilon = \frac{1}{2}`. According to our assumption, there should exist an :math:`N` such that for all :math:`n > N`, :math:`\left| \frac{1}{n} \right| < \frac{1}{2}`.

However, no matter how large :math:`N` is chosen, there will always be an :math:`n = N + 1` such that :math:`\frac{1}{n} = \frac{1}{N + 1}`, which is not less than :math:`\frac{1}{2}` for sufficiently large :math:`N`. This contradicts the assumption that :math:`\frac{1}{n}` converges to 0.

.. math::
    \varepsilon \text{-Proof that } \frac{1}{n^2} \text{ Converges to 0:}

To prove that :math:`\frac{1}{n^2}` converges to 0, we must show that for any :math:`\varepsilon > 0`, there exists an :math:`N \in \mathbb{N}` such that for all :math:`n > N`, :math:`\left| \frac{1}{n^2} - 0 \right| < \varepsilon`.

Let :math:`\varepsilon > 0` be given. We want to find an :math:`N` such that if :math:`n > N`, then :math:`\frac{1}{n^2} < \varepsilon`.

Since :math:`\frac{1}{n^2}` is decreasing as :math:`n` increases, we can solve the inequality :math:`\frac{1}{n^2} < \varepsilon` for :math:`n`. We get :math:`n^2 > \frac{1}{\varepsilon}`, and thus :math:`n > \sqrt{\frac{1}{\varepsilon}}`.

Therefore, if we choose :math:`N` to be any integer greater than :math:`\sqrt{\frac{1}{\varepsilon}}`, then for all :math:`n > N`, :math:`\left| \frac{1}{n^2} \right| < \varepsilon`. This proves that :math:`\frac{1}{n^2}` converges to 0.


**Problem Statement:**

Discuss examples and counterexamples for non-closed and closed subspaces in the spaces :math:`\ell^\infty` and :math:`\ell^2`.

**Solution:**

**Example for** :math:`\ell^\infty` (Non-closed Subspace):

- **Subspace Definition**: Consider the subspace :math:`S \subset \ell^\infty` consisting of sequences that converge to 0.
- **Example Sequence**: :math:`x_n = (0, 0, \ldots, 0, \underbrace{\frac{1}{n}}_{n\text{-th position}}, 0, 0, \ldots)`. As :math:`n \to \infty`, each :math:`x_n` converges to the zero sequence, which is in :math:`S`.
- **Limit Sequence**: The term-wise limit of :math:`(x_n)` as :math:`n \to \infty` is :math:`y = (1, \frac{1}{2}, \frac{1}{3}, \ldots)`, the harmonic sequence.
- **Proof**: Since :math:`y` does not converge to 0, :math:`y \notin S`. But :math:`y` is the limit of sequences in :math:`S`. Therefore, :math:`S` does not contain all its limit points, showing it is not closed.

**Counterexample for** :math:`\ell^\infty` (Closed Subspace):

- **Subspace Definition**: Consider the subspace :math:`T \subset \ell^\infty` consisting of all sequences that are eventually constant (i.e., from some point onward, all terms are the same).
- **Example Sequence**: :math:`x_n = (a, a, \ldots, a, \underbrace{b}_{n\text{-th position}}, b, b, \ldots)`, where :math:`a, b` are constants.
- **Limit Sequence**: The limit of :math:`(x_n)` as :math:`n \to \infty` is a constant sequence :math:`(a, a, a, \ldots)`.
- **Proof**: Since the limit sequence is constant, it is in :math:`T`. Thus, :math:`T` contains all its limit points and is closed.

**Example for** :math:`\ell^2` (Non-closed Subspace):

- **Subspace Definition**: Consider the subspace :math:`U \subset \ell^2` consisting of sequences converging to 0.
- **Example Sequence**: :math:`x_n = (1, \frac{1}{2}, \ldots, \frac{1}{n}, 0, 0, \ldots)`. Each :math:`x_n` is in :math:`U` since it converges to 0 and is square-summable.
- **Limit Sequence**: The term-wise limit of :math:`(x_n)` as :math:`n \to \infty` is the sequence :math:`y = (1, \frac{1}{2}, \frac{1}{3}, \ldots)`, which is not square-summable.
- **Proof**: The sequence :math:`y` is the harmonic sequence, which is not in :math:`U` as it is not square-summable. However, it is the limit of sequences in :math:`U`. Hence, :math:`U` does not contain all its limit points, showing it is not closed.

**Counterexample for** :math:`\ell^2` (Closed Subspace):

- **Subspace Definition**: Consider the subspace :math:`V \subset \ell^2` consisting of all sequences that are eventually zero.
- **Example Sequence**: :math:`x_n = (a_1, a_2, \ldots, a_k, 0, 0, \ldots)` with only a finite number of non-zero terms.
- **Limit Sequence**: Any sequence of sequences in :math:`V` will have a limit sequence that is also eventually zero.
- **Proof**: Since the limit sequence will be eventually zero, it is in :math:`V`. Thus, :math:`V` contains all its limit points and is closed.

**The essence of the original problem is to understand and provide examples of non-closed subspaces within the mathematical spaces** :math:`\ell^\infty` and :math:`\ell^2`.

- **In the Context of** :math:`\ell^\infty`:
  This space consists of all bounded sequences of real numbers. The goal was to identify a subspace of :math:`\ell^\infty` that is not closed. A subspace is closed if it contains all its limit points, meaning every sequence within the subspace that converges has its limit also within the subspace. A non-closed subspace would be one where you can find a sequence (or sequences) within the subspace that converges to a limit not included in the subspace.

- **In the Context of** :math:`\ell^2`:
  This space is made up of all square-summable sequences of real numbers. Similar to :math:`\ell^\infty`, the task was to find a subspace of :math:`\ell^2` that does not contain all its limit points, thus making it a non-closed subspace.

In both cases, the challenge lies in identifying specific sequences and showing through examples (and counterexamples) how their behavior within these spaces illustrates the concept of closed versus non-closed subspaces. This understanding is fundamental in functional analysis and topology, as it provides insight into the behavior of sequences in different mathematical spaces and the properties of these spaces.

Applying the concepts of closed and non-closed subspaces to real-life scenarios can help in understanding these abstract mathematical ideas in a more tangible way. Let's use some analogies:

**Closed Subspaces - A "Complete" Library**

- **Analogy**: Think of a closed subspace as a library that contains every possible book (limit points) on a specific topic. For instance, a library dedicated to "World History" contains every book ever written on the subject, including those that are the culmination of earlier works (analogous to limit points of sequences).
- **Real-Life Example**: When a researcher looks for information on a particular historical event, they will find all relevant books in this library, including those that have evolved from earlier research. The library is "closed" in the sense that it leaves no gaps in this field of knowledge.

**Non-Closed Subspaces - An Incomplete Music Playlist**

- **Analogy**: A non-closed subspace is like a music playlist meant to include every song from a specific genre but misses some key tracks. Imagine a playlist intended to contain every jazz song ever composed, but it lacks some essential pieces that are considered evolutions or variations of earlier jazz songs.
- **Real-Life Example**: A jazz enthusiast looking for a comprehensive collection of jazz music in this playlist will find it lacking. Some songs that should be there, being logical continuations or variations of existing songs (like limits of sequences), are missing. This playlist is "non-closed" as it doesn't encapsulate the complete range of jazz music.

**For** :math:`\ell^\infty` - Temperature Readings

- **Analogy**: Consider a weather monitoring system that tracks temperature but is set to record only up to a certain threshold. This system is analogous to a non-closed subspace in :math:`\ell^\infty` if it fails to record extreme temperature spikes that surpass its set limit, even though such spikes are the logical continuations (limits) of the recorded data.
- **Real-Life Example**: A meteorological station records temperatures but stops logging data beyond a certain point. During an unusual thermal event, where temperatures exceed this threshold, the system fails to record these critical data points, thus not "closing" the full spectrum of temperature variations.

**For** :math:`\ell^2` - Ecological Studies

- **Analogy**: Imagine an ecological study tracking the population of a specific species over time. If the study is discontinued prematurely, it's like a non-closed subspace in :math:`\ell^2`, failing to include the "limit" of the population trend.
- **Real-Life Example**: Biologists observe a species' population but stop their study after a certain period. The final phase of the study, which could have shown a critical trend (like a limit of a sequence), is missing. This incomplete study doesn't encapsulate the full picture of the population dynamics.

These analogies help to illustrate the concepts of closed and non-closed subspaces in a more concrete and relatable manner.

---------------------------------------------------------------------------------------------------------------------------

**Problem 2.** Determine the largest possible value of :math:`c` in the inequality

.. math::
   \|\alpha_1 x_1 + \ldots + \alpha_n x_n\| \geq c(|\alpha_1| + \ldots + |\alpha_n|)

from Lemma 2.4-1, for the cases where the space :math:`X` is :math:`\mathbb{R}^2` with vectors :math:`x_1 = (1,0), x_2 = (0,1)` and when :math:`X` is :math:`\mathbb{R}^3` with vectors :math:`x_1 = (1,0,0), x_2 = (0,1,0), x_3 = (0,0,1)`.

**Solution:**

To determine the largest possible value of :math:`c` in :math:`\mathbb{R}^2` and :math:`\mathbb{R}^3`, we utilize the lemma on linear combinations which asserts that for any set of linearly independent vectors in a normed space :math:`X`, there exists a :math:`c > 0` such that for any choice of scalars :math:`\alpha_1, \ldots, \alpha_n`, the inequality

.. math::
    \|\alpha_1 x_1 + \ldots + \alpha_n x_n\| \geq c(|\alpha_1| + \ldots + |\alpha_n|)

holds true.

**For** :math:`\mathbb{R}^2`:

Given vectors :math:`x_1 = (1,0)` and :math:`x_2 = (0,1)`, we seek the largest :math:`c` such that for any scalars :math:`\alpha_1` and :math:`\alpha_2`:

.. math::
    \|(1,0)\alpha_1 + (0,1)\alpha_2\| \geq c(|\alpha_1| + |\alpha_2|)

The left-hand side simplifies to :math:`\|(\alpha_1, \alpha_2)\|`, which is the Euclidean norm in :math:`\mathbb{R}^2` and is equal to :math:`\sqrt{\alpha_1^2 + \alpha_2^2}`. The inequality thus becomes:

.. math::
    \sqrt{\alpha_1^2 + \alpha_2^2} \geq c(|\alpha_1| + |\alpha_2|)

To find the largest :math:`c`, we need to maximize the quotient:

.. math::
    \frac{\sqrt{\alpha_1^2 + \alpha_2^2}}{|\alpha_1| + |\alpha_2|}

which reaches its maximum when :math:`\alpha_1 = \alpha_2`, yielding :math:`c = \frac{1}{\sqrt{2}}`.

**For** :math:`\mathbb{R}^3`:

Given vectors :math:`x_1 = (1,0,0)`, :math:`x_2 = (0,1,0)`, and :math:`x_3 = (0,0,1)`, we aim to find the largest :math:`c` such that for any scalars :math:`\alpha_1, \alpha_2, \alpha_3`:

.. math::
    \|(1,0,0)\alpha_1 + (0,1,0)\alpha_2 + (0,0,1)\alpha_3\| \geq c(|\alpha_1| + |\alpha_2| + |\alpha_3|)

The left-hand side simplifies to :math:`\|(\alpha_1, \alpha_2, \alpha_3)\|`, which is :math:`\sqrt{\alpha_1^2 + \alpha_2^2 + \alpha_3^2}`. The inequality becomes:

.. math::
    \sqrt{\alpha_1^2 + \alpha_2^2 + \alpha_3^2} \geq c(|\alpha_1| + |\alpha_2| + |\alpha_3|)

Similarly, to maximize the quotient:

.. math::
    \frac{\sqrt{\alpha_1^2 + \alpha_2^2 + \alpha_3^2}}{|\alpha_1| + |\alpha_2| + |\alpha_3|}

the maximum is achieved when :math:`\alpha_1 = \alpha_2 = \alpha_3`, resulting in :math:`c = \frac{1}{\sqrt{3}}`.

Hence, in :math:`\mathbb{R}^2`, the largest possible :math:`c` is :math:`\frac{1}{\sqrt{2}}`, and in :math:`\mathbb{R}^3`, the largest possible :math:`c` is :math:`\frac{1}{\sqrt{3}}`.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 3.** Show that in Definition 2.4-4 the axioms of an equivalence relation hold. The definition states that a norm :math:`\|\cdot\|` on a vector space :math:`X` is said to be equivalent to a norm :math:`\|\cdot\|_0` on :math:`X` if there are positive numbers :math:`a` and :math:`b` such that for all :math:`x \in X` we have :math:`a\|x\|_0 \leq \|x\| \leq b\|x\|_0`.

**Solution:**

To show that the definition of equivalent norms satisfies the axioms of an equivalence relation, we must verify reflexivity, symmetry, and transitivity.

**Reflexivity**:

For reflexivity, we consider any norm :math:`\|\cdot\|` on a vector space :math:`X`. A norm is reflexive if it is equivalent to itself. Given the definition of equivalent norms, for all :math:`x \in X`, the condition

.. math::
    a\|x\|_0 \leq \|x\| \leq b\|x\|_0

must hold for some positive constants :math:`a` and :math:`b`. When :math:`\|\cdot\|_0` is the same as :math:`\|\cdot\|`, we can choose :math:`a = b = 1`, thus for all :math:`x \in X`, we have

.. math::
    \|x\| \leq \|x\| \leq \|x\|,

which is trivially true, thus establishing reflexivity.

**Symmetry**:

For symmetry, assume that :math:`\|\cdot\|` is equivalent to :math:`\|\cdot\|_0`. This implies the existence of positive constants :math:`a` and :math:`b` such that

.. math::
    a\|x\|_0 \leq \|x\| \leq b\|x\|_0, \quad \forall x \in X.

To demonstrate symmetry, we must show that :math:`\|\cdot\|_0` is also equivalent to :math:`\|\cdot\|`. From the given inequality, we can derive that

.. math::
    \frac{1}{b}\|x\| \leq \|x\|_0 \leq \frac{1}{a}\|x\|,

establishing symmetry by showing that the constants :math:`1/b` and :math:`1/a` serve to demonstrate the equivalence in the reverse order.

**Transitivity**:

For transitivity, assume :math:`\|\cdot\|` is equivalent to :math:`\|\cdot\|_0` and :math:`\|\cdot\|_0` is equivalent to :math:`\|\cdot\|_1` with respective positive constants :math:`a, b` for the first pair and :math:`c, d` for the second pair, satisfying

.. math::
    a\|x\|_0 \leq \|x\| \leq b\|x\|_0

and

.. math::
    c\|x\|_1 \leq \|x\|_0 \leq d\|x\|_1,

for all :math:`x \in X`. To establish transitivity, we demonstrate that :math:`\|\cdot\|` is equivalent to :math:`\|\cdot\|_1`. By combining the inequalities and recognizing that multiplication of inequalities is valid, we obtain

.. math::
    ac\|x\|_1 \leq \|x\| \leq bd\|x\|_1,

confirming that :math:`\|\cdot\|` is equivalent to :math:`\|\cdot\|_1` and thus showing transitivity.

These demonstrations confirm that the axioms of an equivalence relation are satisfied by the definition of equivalent norms.

----------------------------------------------------------------------------------------------------------------------------

**Problem 4** Show that equivalent norms on a vector space :math:`X` induce the same topology for :math:`X`.

**Solution:**

Suppose :math:`\|\cdot\|` and :math:`\|\cdot\|_0` are equivalent norms on a vector space :math:`X`. By definition, there exists positive constants :math:`a, b > 0` such that for all :math:`x \in X`, the following inequalities hold:

.. math::
    a\|x\|_0 \leq \|x\| \leq b\|x\|_0.

We aim to show that the identity map :math:`I: (X, \|\cdot\|) \rightarrow (X, \|\cdot\|_0)` induces the same topology, which requires proving that :math:`I` is continuous. To this end, consider a point :math:`x_0 \in X` and an arbitrary :math:`\epsilon > 0`. We choose :math:`\delta = \frac{\epsilon}{a}` and for all :math:`x` satisfying :math:`\|x - x_0\| < \delta`, we have:

.. math::
    \|x - x_0\|_0 \leq \frac{1}{a}\|x - x_0\| < \frac{a\delta}{a} = \epsilon.

This inequality shows that every ball in :math:`(X, \|\cdot\|_0)` centered at :math:`x_0` with radius :math:`\epsilon` contains the image under :math:`I` of a ball in :math:`(X, \|\cdot\|)` centered at the same point with radius :math:`\delta`. Hence, :math:`I` is continuous.

Similarly, to prove that the inverse identity map :math:`\bar{I}: (X, \|\cdot\|_0) \rightarrow (X, \|\cdot\|)` is continuous, we take a point :math:`x_0 \in X` and an arbitrary :math:`\epsilon > 0`. Setting :math:`\delta = \frac{\epsilon}{b}` ensures that for all :math:`x` satisfying :math:`\|x - x_0\|_0 < \delta`, the following holds:

.. math::
    \|x - x_0\| \leq b\|x - x_0\|_0 < b\delta = \epsilon.

Thus, every ball in :math:`(X, \|\cdot\|)` centered at :math:`x_0` with radius :math:`\epsilon` contains the image under :math:`\bar{I}` of a ball in :math:`(X, \|\cdot\|_0)` centered at the same point with radius :math:`\delta`, confirming the continuity of the inverse map.

Having established the continuity of both :math:`I` and :math:`\bar{I}`, we conclude that they are homeomorphisms, showing that the topologies induced by :math:`\|\cdot\|` and :math:`\|\cdot\|_0` are indeed the same.

**Remark**:

The converse is also true, that is, if two norms :math:`\|\cdot\|` and :math:`\|\cdot\|_0` on :math:`X` induce the same topology, they are equivalent norms on :math:`X`.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 5.** If :math:`\|\cdot\|` and :math:`\|\cdot\|_0` are equivalent norms on :math:`X`, show that the Cauchy sequences in :math:`(X, \|\cdot\|)` and :math:`(X, \|\cdot\|_0)` are the same.

**Solution:**

To prove this, we use the definition of equivalent norms that provides constants :math:`a, b > 0` such that for all :math:`x \in X`:

.. math::
    a\|x\|_0 \leq \|x\| \leq b\|x\|_0.

A sequence :math:`(x_n)` in :math:`X` is Cauchy with respect to a norm if for every :math:`\epsilon > 0`, there exists an :math:`N \in \mathbb{N}` such that for all :math:`m, n > N`, it holds that :math:`\|x_m - x_n\| < \epsilon`.

**Cauchy in** :math:`(X, \|\cdot\|)` implies Cauchy in :math:`(X, \|\cdot\|_0)`:

Assume :math:`(x_n)` is Cauchy in :math:`(X, \|\cdot\|)`. For every :math:`\epsilon > 0`, choose :math:`\delta = a\epsilon`. There exists :math:`N` such that for all :math:`m, n > N`, we have:

.. math::
    \|x_m - x_n\| < \delta.

Applying the inequality given by the equivalence of norms, we obtain:

.. math::
    \|x_m - x_n\|_0 \leq \frac{1}{a}\|x_m - x_n\| < \frac{\delta}{a} = \epsilon.

Hence, :math:`(x_n)` is also Cauchy in :math:`(X, \|\cdot\|_0)`.

**Cauchy in** :math:`(X, \|\cdot\|_0)` implies Cauchy in :math:`(X, \|\cdot\|)`:

Conversely, if :math:`(x_n)` is Cauchy in :math:`(X, \|\cdot\|_0)`, for every :math:`\epsilon > 0`, choose :math:`\delta = \frac{\epsilon}{b}`. There exists :math:`N` such that for all :math:`m, n > N`, it holds that:

.. math::
    \|x_m - x_n\|_0 < \delta.

From the equivalent norm inequality, we get:

.. math::
    \|x_m - x_n\| \leq b\|x_m - x_n\|_0 < b\delta = \epsilon.

Therefore, :math:`(x_n)` is a Cauchy sequence in :math:`(X, \|\cdot\|)` as well.

Since we have shown that Cauchy sequences in one normed space are Cauchy in the other and vice versa, we conclude that the Cauchy sequences in both :math:`(X, \|\cdot\|)` and :math:`(X, \|\cdot\|_0)` are the same. This conclusion follows from the ability to find a :math:`\delta` for every :math:`\epsilon` (and vice versa) satisfying the conditions for a Cauchy sequence in both normed spaces.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 6.** Theorem 2.4-5 implies that :math:`\|\cdot\|_2` and :math:`\|\cdot\|_\infty` in Problem 8, Section 2.2, are equivalent. Give a direct proof of this fact.

Solution:

By Theorem 2.4-5, on a finite-dimensional vector space :math:`X`, any norm :math:`\|\cdot\|` is equivalent to any other norm :math:`\|\cdot\|_0`. To prove the equivalence of the :math:`\ell_2` and :math:`\ell_\infty` norms, we need to establish two inequalities that hold for all vectors in :math:`\mathbb{R}^n`.

To provide a direct proof that the :math:`\ell_2` norm (Euclidean norm) and the :math:`\ell_\infty` norm (maximum norm) are equivalent on a finite-dimensional vector space :math:`X`, we will leverage the theorem from the second image which states that on a finite-dimensional vector space, any norm is equivalent to any other norm.

The :math:`\ell_2` norm of a vector :math:`x \in \mathbb{R}^n` is defined as:

.. math::
    \|x\|_2 = \sqrt{x_1^2 + x_2^2 + \ldots + x_n^2},

and the :math:`\ell_\infty` norm is defined as:

.. math::
    \|x\|_\infty = \max_{1 \leq i \leq n} |x_i|.

**Proof**:

*Showing :math:`\|x\|_2 \leq c \|x\|_\infty` for some :math:`c > 0`*:

By definition, for any :math:`x \in \mathbb{R}^n`, each component :math:`x_i` satisfies :math:`|x_i| \leq \|x\|_\infty`. Thus,

.. math::
    \|x\|_2^2 = x_1^2 + x_2^2 + \ldots + x_n^2 \leq n\|x\|_\infty^2,

since there are :math:`n` terms and each :math:`x_i^2 \leq \|x\|_\infty^2`. Taking square roots, we have:

.. math::
    \|x\|_2 \leq \sqrt{n}\|x\|_\infty.

Hence, we can choose :math:`c = \sqrt{n}`, showing the first inequality.

*Showing :math:`\|x\|_\infty \leq d \|x\|_2` for some :math:`d > 0`*:

Consider the vector :math:`x \in \mathbb{R}^n` with the largest component in absolute value being :math:`\|x\|_\infty`. Then, by the definition of the Euclidean norm:

.. math::
    \|x\|_\infty^2 \leq x_1^2 + x_2^2 + \ldots + x_n^2 = \|x\|_2^2.

Since the square root is a monotonic function, taking square roots gives:

.. math::
    \|x\|_\infty \leq \|x\|_2.

Here, we can choose :math:`d = 1`, showing the second inequality.

Since we have established both inequalities :math:`\|x\|_2 \leq \sqrt{n}\|x\|_\infty` and :math:`\|x\|_\infty \leq \|x\|_2`, by the definition of equivalent norms, the :math:`\ell_2` and :math:`\ell_\infty` norms are equivalent on :math:`\mathbb{R}^n`.

This direct proof aligns with the statement of the theorem that in a finite-dimensional vector space, all norms are equivalent.

**Theorem 2.4-5 (Equivalent norms):**

On a finite-dimensional vector space :math:`X`, any norm :math:`\|\cdot\|` is equivalent to any other norm :math:`\|\cdot\|_0`. This theorem is fundamental in the study of finite-dimensional vector spaces because it ensures that all norms define the same topology and consequently, the same notions of convergence, continuity, and compactness.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 7.** Let :math:`\|\cdot\|_2` be as in Prob. 8, Sec. 2.2, and let :math:`\|\cdot\|` be any norm on that vector space, call it :math:`X`. Show directly (without using 2.4-5) that there is a :math:`b > 0` such that :math:`\|x\| \leq b \|x\|_2` for all :math:`x`.

**Solution:**

We are given that :math:`\|\cdot\|_2` is the Euclidean norm defined on :math:`\mathbb{R}^n`. For any vector :math:`x` in :math:`\mathbb{R}^n`, the :math:`\ell_2` norm is calculated as:

.. math::
    \|x\|_2 = \sqrt{x_1^2 + x_2^2 + \ldots + x_n^2}.

Let :math:`\{e_1, e_2, \ldots, e_n\}` be the standard basis for :math:`\mathbb{R}^n`. The norm :math:`\|\cdot\|` being a norm on :math:`X` implies that it satisfies the property of absolute scalability, which states that for any scalar :math:`\alpha` and any vector :math:`x` in :math:`X`, the following holds:

.. math::
    \|\alpha x\| = |\alpha| \|x\|.

For any vector :math:`x = (x_1, x_2, \ldots, x_n)` in :math:`X`, we express :math:`x` as a linear combination of the standard basis vectors:

.. math::
    x = x_1 e_1 + x_2 e_2 + \ldots + x_n e_n.

Applying the properties of a norm, specifically the triangle inequality and absolute scalability, we have:

.. math::
    \|x\| = \|x_1 e_1 + x_2 e_2 + \ldots + x_n e_n\| \leq |x_1| \|e_1\| + |x_2| \|e_2\| + \ldots + |x_n| \|e_n\|.

Define :math:`b_i = \|e_i\|` for each :math:`i`. Set :math:`b = \max\{b_1, b_2, \ldots, b_n\}`, which allows us to rewrite the inequality as:

.. math::
    \|x\| \leq b (|x_1| + |x_2| + \ldots + |x_n|).

Using the Cauchy-Schwarz inequality, we observe that the sum of the absolute values of the components of :math:`x` is less than or equal to the square root of the sum of the squares of these components. This gives us:

.. math::
    |x_1| + |x_2| + \ldots + |x_n| \leq \sqrt{n(x_1^2 + x_2^2 + \ldots + x_n^2)} = \sqrt{n}\|x\|_2.

Combining the two inequalities, we obtain:

.. math::
    \|x\| \leq b\sqrt{n}\|x\|_2.

Thus, we have established that there exists a constant :math:`b' = b\sqrt{n}` which satisfies the condition :math:`\|x\| \leq b' \|x\|_2` for all :math:`x \in X`. The constant :math:`b'` depends on the norm :math:`\|\cdot\|` and the dimension of the space :math:`X`, which concludes the direct proof.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Problem 8.** Show that the norms :math:`\|\cdot\|_1` and :math:`\|\cdot\|_2` in Prob. 8, Sec. 2.2, satisfy

.. math::
    \frac{1}{\sqrt{n}} \|x\|_1 \leq \|x\|_2 \leq \|x\|_1.

Solution:

To establish this relationship between the :math:`\ell_1` and :math:`\ell_2` norms, we will utilize the definitions and properties of each norm. For a vector :math:`x \in \mathbb{R}^n`, the norms are defined by:

.. math::
    \|x\|_1 = |x_1| + |x_2| + \ldots + |x_n|,

and

.. math::
    \|x\|_2 = \sqrt{x_1^2 + x_2^2 + \ldots + x_n^2}.

**Proof**:

*The inequality* :math:`\|x\|_2 \leq \|x\|_1`:

The square root of a sum of squares is always less than or equal to the sum of the absolute values, hence we have:

.. math::
    \|x\|_2 = \sqrt{x_1^2 + x_2^2 + \ldots + x_n^2} \leq |x_1| + |x_2| + \ldots + |x_n| = \|x\|_1.

This follows since for all :math:`i`, :math:`\sqrt{x_i^2} = |x_i|`.

*The inequality* :math:`\frac{1}{\sqrt{n}} \|x\|_1 \leq \|x\|_2`:

By employing the Cauchy-Schwarz inequality, which asserts that for any sequences :math:`a_i` and :math:`b_i`:

.. math::
    \left(\sum_{i=1}^n a_i b_i\right)^2 \leq \left(\sum_{i=1}^n a_i^2\right)\left(\sum_{i=1}^n b_i^2\right).

Letting :math:`a_i = 1` and :math:`b_i = |x_i|`, it yields:

.. math::
    \left(\sum_{i=1}^n |x_i|\right)^2 \leq n \left(\sum_{i=1}^n |x_i|^2\right),

which simplifies to:

.. math::
    \|x\|_1^2 \leq n \|x\|_2^2.

Taking square roots on both sides, we get:

.. math::
    \|x\|_1 \leq \sqrt{n} \|x\|_2,

and rearranging gives us:

.. math::
    \frac{1}{\sqrt{n}} \|x\|_1 \leq \|x\|_2.

By combining the established inequalities, we have proven the required relationship:

.. math::
    \frac{1}{\sqrt{n}} \|x\|_1 \leq \|x\|_2 \leq \|x\|_1.

This completes the direct proof of the norm inequalities as presented in the problem statement.

-----------------------------------------------------------------------------------------------

**Problem 9.** If two norms :math:`\|\cdot\|` and :math:`\|\cdot\|_0` on a vector space :math:`X` are equivalent, show that (i) :math:`\|x_n - x\| \rightarrow 0` implies (ii) :math:`\|x_n - x\|_0 \rightarrow 0` (and vice versa, of course).

**Solution:**

By the definition of equivalent norms, there exist positive constants :math:`c, C` such that for all :math:`x \in X`, we have:

.. math::
    c\|x\|_0 \leq \|x\| \leq C\|x\|_0.

**Proof**:

(i) Assume :math:`\|x_n - x\| \rightarrow 0`, meaning that for every :math:`\epsilon > 0`, there exists an :math:`N` such that for all :math:`n > N`, :math:`\|x_n - x\| < \epsilon`. Utilizing the lower bound of the equivalent norms, we have:

.. math::
    \|x_n - x\|_0 \leq \frac{1}{c}\|x_n - x\|.

Since :math:`\|x_n - x\| < \epsilon`, it follows that:

.. math::
    \|x_n - x\|_0 < \frac{\epsilon}{c}.

Therefore, :math:`\|x_n - x\|_0 \rightarrow 0` as :math:`n \rightarrow \infty`.

(ii) Conversely, assume :math:`\|x_n - x\|_0 \rightarrow 0`. For every :math:`\epsilon' > 0`, there exists an :math:`N'` such that for all :math:`n > N'`, :math:`\|x_n - x\|_0 < \epsilon'`. Applying the upper bound of the equivalent norms, we obtain:

.. math::
    \|x_n - x\| \leq C\|x_n - x\|_0.

By setting :math:`\epsilon' = \frac{\epsilon}{C}`, we find:

.. math::
    \|x_n - x\| < C \frac{\epsilon}{C} = \epsilon,

which indicates that :math:`\|x_n - x\| \rightarrow 0` as :math:`n \rightarrow \infty`.

Hence, we have shown that convergence in one norm implies convergence in the other, validating that (i) :math:`\|x_n - x\| \rightarrow 0` if and only if (ii) :math:`\|x_n - x\|_0 \rightarrow 0`, under the assumption that the norms :math:`\|\cdot\|` and :math:`\|\cdot\|_0` are equivalent.







