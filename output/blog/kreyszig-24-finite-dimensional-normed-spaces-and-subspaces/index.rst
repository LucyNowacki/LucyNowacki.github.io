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



