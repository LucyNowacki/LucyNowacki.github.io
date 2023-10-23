.. title: Kreyszig 1.4, Metric Spaces - Convergence, Cauchy Sequence, Completness
.. slug: kreyszig-14-metric-spaces-convergence-cauchy-sequence-completness
.. date: 2023-10-11 10:46:35 UTC+01:00
.. tags: proofs
.. has_math: yes
.. category: 
.. link: 
.. description: 
.. type: text

**Problem 1. Convergence of Subsequences in a Metric Space**


**Given**: A sequence :math:`(x_n)` in a metric space :math:`X` is convergent and has limit :math:`x`.

**To Prove**: Every subsequence :math:`(x_{n_k})` of :math:`(x_n)` is convergent and has the same limit :math:`x`.

**Proof**:

Let :math:`(x_{n_k})` be an arbitrary subsequence of :math:`(x_n)`.

1. Given that :math:`(x_n)` is convergent with limit :math:`x`:
   This means that for every :math:`\epsilon > 0`, there exists an :math:`N` such that for all :math:`n \geq N`, the distance between :math:`x_n` and :math:`x` is less than :math:`\epsilon`. Mathematically, this is:
   :math:`d(x_n, x) < \epsilon \quad \text{for all} \quad n \geq N`

2. Consider the subsequence :math:`(x_{n_k})`:
   Since :math:`n_k` represents the indices of the subsequence and :math:`n_k` is increasing (because it's a subsequence), for every :math:`k \geq K` (for some :math:`K`), we have :math:`n_k \geq N`.

3. Using the convergence of :math:`(x_n)`:
   For the same :math:`\epsilon > 0` as before, for all :math:`k \geq K`, we have:
   :math:`d(x_{n_k}, x) < \epsilon`
   This is because :math:`n_k \geq N` for all :math:`k \geq K`, and we know from the convergence of :math:`(x_n)` that the distance between any term beyond :math:`N` and the limit :math:`x` is less than :math:`\epsilon`.

4. **Conclusion**:
   The above expression shows that the subsequence :math:`(x_{n_k})` also converges to the same limit :math:`x`.

Hence, every subsequence :math:`(x_{n_k})` of :math:`(x_n)` is convergent and has the same limit :math:`x`.

This completes the proof.

**Crux of the Proof for Convergence of Subsequences**

1. **Definition of Convergence**: 
   A sequence :math:`(x_n)` in a metric space converges to a limit :math:`x` if, for every :math:`\epsilon > 0`, there exists an :math:`N` such that for all :math:`n \geq N`, the distance between :math:`x_n` and :math:`x` is less than :math:`\epsilon`.

2. **Nature of Subsequences**: 
   A subsequence :math:`(x_{n_k})` retains the order of the original sequence :math:`(x_n)`. This means that if :math:`n_k` is the index of a term in the subsequence, then for every :math:`k' > k`, :math:`n_{k'} > n_k`.

Given these two points:

3. If :math:`(x_n)` converges to :math:`x`, then beyond a certain index :math:`N`, all terms of :math:`(x_n)` are close to :math:`x`.
4. Since a subsequence :math:`(x_{n_k})` retains the order of :math:`(x_n)`, beyond some index :math:`K`, all terms of :math:`(x_{n_k})` will also be terms of :math:`(x_n)` that are close to :math:`x`.

Thus, the subsequence :math:`(x_{n_k})` will also be close to :math:`x` beyond this index :math:`K`, meaning it converges to the same limit :math:`x`.

In essence, the convergence of the original sequence ensures that its terms get arbitrarily close to the limit, and the nature of subsequences ensures that their terms, being a subset of the original sequence's terms, will also get arbitrarily close to the same limit.


**A Practical Example**


Consider the sequence :math:`(x_n)` defined by :math:`x_n = \frac{1}{n}` for all natural numbers :math:`n`. This sequence represents the reciprocals of natural numbers and is defined in the metric space of real numbers with the usual metric (absolute value of the difference).

**Observation**:
As :math:`n` grows larger, :math:`x_n` gets closer and closer to 0. Hence, the sequence :math:`(x_n)` converges to 0 in the real numbers.

**Subsequence**:
Let's consider a subsequence :math:`(x_{n_k})` where :math:`n_k = 2^k`. This subsequence consists of the terms of :math:`(x_n)` at the positions which are powers of 2. So, the subsequence is:
:math:`x_{n_1} = \frac{1}{2}`, :math:`x_{n_2} = \frac{1}{4}`, :math:`x_{n_3} = \frac{1}{8}`, and so on.

**Observation for the Subsequence**:
Just like the original sequence, as :math:`k` grows larger, :math:`x_{n_k}` gets closer and closer to 0. Hence, the subsequence :math:`(x_{n_k})` also converges to 0 in the real numbers.

**Conclusion**:
Both the sequence :math:`(x_n)` and its subsequence :math:`(x_{n_k})` converge to the same limit, 0, in the metric space of real numbers. This is consistent with our earlier proof that if a sequence in a metric space converges to a limit, then every subsequence of it also converges to the same limit.

----------------------------------------------------------------------------

**Problem 2. Convergence of Cauchy Sequences with Convergent Subsequences**

**Given**: 
- A sequence :math:`(x_n)` is Cauchy.
- There exists a convergent subsequence :math:`(x_{n_k})` such that :math:`x_{n_k} \rightarrow x`.

**To Prove**: 
- :math:`(x_n)` is convergent and its limit is :math:`x`.

**Proof**:

1. **Cauchy Sequence**: By definition, for every :math:`\epsilon > 0`, there exists an :math:`N_1` such that for all :math:`m, n \geq N_1`, we have 
   :math:`d(x_m, x_n) < \frac{\epsilon}{2}`.

2. **Convergent Subsequence**: Since :math:`(x_{n_k}) \rightarrow x`, for the same :math:`\epsilon > 0`, there exists a :math:`K` such that for all :math:`k \geq K`, we have 
   :math:`d(x_{n_k}, x) < \frac{\epsilon}{2}`.

3. **Combining the Two**: Let's choose :math:`N = \max(N_1, n_K)` where :math:`n_K` is the :math:`K`-th term of the sequence :math:`(n_k)`. Then, for all :math:`n \geq N`, we have
   :math:`d(x_n, x) \leq d(x_n, x_{n_K}) + d(x_{n_K}, x)`
   :math:`< \frac{\epsilon}{2} + \frac{\epsilon}{2} = \epsilon`.

Therefore, :math:`(x_n)` converges to :math:`x`.

If a sequence is "tightening up" (Cauchy) and a part of it (subsequence) is getting close to a specific value (converging to x), then the entire sequence must also be getting close to that value (converging to x).

**Practical Example**:

Consider the sequence :math:`(x_n)` defined as follows:
:math:`x_n = (-1)^n + \frac{1}{n}`.

1. **Cauchy Sequence**: :math:`(x_n)` is not a Cauchy sequence as it oscillates between positive and negative values without settling down as :math:`n` increases.

2. **Convergent Subsequence**: However, we can find a convergent subsequence. Consider :math:`x_{n_k}` where :math:`n_k = 2k`. This subsequence is:
:math:`x_{n_1} = \frac{3}{2}`, :math:`x_{n_2} = \frac{5}{4}`, :math:`x_{n_3} = \frac{7}{6}`, and so on, which converges to 1.

According to the proof, if :math:`(x_n)` was Cauchy, it would converge to the same limit as its subsequence, which is 1. However, since :math:`(x_n)` is not Cauchy, we cannot conclude that :math:`(x_n)` converges to 1, which aligns with our observation of the sequence.

Note: This example demonstrates that the condition of being Cauchy is crucial for the sequence to converge to the same limit as its convergent subsequence.

-----------------------------------------------------------------------------------------------------

**Problem 3. Convergence and Neighborhoods in Metric Spaces**

**Given**:

- A sequence :math:`(x_n)` in a metric space.
- A point :math:`x` in the same metric space.

**To Prove**:
:math:`x_n \rightarrow x` if and only if for every neighborhood :math:`B` of :math:`x`, there exists an integer :math:`n_0` such that :math:`x_n \in B` for all :math:`n > n_0`.

**Proof**:

**(⇒) Forward Direction**:
Assume :math:`x_n \rightarrow x`.

By the definition of convergence, for every :math:`\epsilon > 0`, there exists an :math:`N` such that for all :math:`n \geq N`, the distance between :math:`x_n` and :math:`x` is less than :math:`\epsilon`. This means that :math:`x_n` lies in the :math:`\epsilon`-neighborhood of :math:`x` for all :math:`n \geq N`.

Given any neighborhood :math:`B` of :math:`x`, there exists some :math:`\epsilon > 0` such that the :math:`\epsilon`-neighborhood of :math:`x` is contained in :math:`B`. By the convergence of :math:`x_n`, there exists an :math:`n_0` such that :math:`x_n` lies in this :math:`\epsilon`-neighborhood (and hence in :math:`B`) for all :math:`n > n_0`.

**(⇐) Reverse Direction**:
Assume that for every neighborhood :math:`B` of :math:`x`, there exists an integer :math:`n_0` such that :math:`x_n \in B` for all :math:`n > n_0`.

Given any :math:`\epsilon > 0`, consider the :math:`\epsilon`-neighborhood of :math:`x`. By assumption, there exists an :math:`n_0` such that :math:`x_n` lies in this :math:`\epsilon`-neighborhood for all :math:`n > n_0`. This means that the distance between :math:`x_n` and :math:`x` is less than :math:`\epsilon` for all :math:`n > n_0`.

Therefore, :math:`x_n \rightarrow x`.

**Conclusion**:
The sequence :math:`x_n` converges to :math:`x` if and only if for every neighborhood :math:`B` of :math:`x`, there exists an integer :math:`n_0` such that :math:`x_n \in B` for all :math:`n > n_0`.

This completes the proof.

---------------------------------------------------------------------------------------

**Problem 4. Boundedness of Cauchy Sequences**

**Given**:
- A sequence :math:`(x_n)` is Cauchy.

**To Prove**:
- The sequence :math:`(x_n)` is bounded.

**Proof**:

1. **Definition of Cauchy Sequence**: By definition, a sequence is Cauchy if, for any given :math:`\epsilon > 0` (let's choose :math:`\epsilon = 1` for simplicity), there exists an :math:`N` such that for all :math:`m, n \geq N`, we have 
   :math:`|x_m - x_n| < 1`.

2. **Boundedness of Terms Beyond** :math:`N`: For any :math:`n \geq N`, using the triangle inequality, we get:

   :math:`|x_n| = |x_n - x_N + x_N|`
   :math:`\leq |x_n - x_N| + |x_N|`
   :math:`< 1 + |x_N|`

   Let's denote :math:`M = 1 + |x_N|`.
   So, for all :math:`n \geq N`, :math:`|x_n| < M`.

3. **Boundedness of Terms Before** :math:`N`: For terms :math:`x_1, x_2, ... x_{N-1}`, they are finitely many, so they have a maximum absolute value, say :math:`M'`.

4. **Combining the Two**: The sequence :math:`(x_n)` is bounded by :math:`\max(M, M')` for all :math:`n`.

**Conclusion**:
Every Cauchy sequence is bounded.

This completes the proof.

**Crux of the Proof for Boundedness of Cauchy Sequences**

The core idea behind proving that a Cauchy sequence is bounded revolves around leveraging the defining property of Cauchy sequences: as the sequence progresses, its terms get arbitrarily close to each other.

1. **Cauchy's Property**: 
   A Cauchy sequence ensures that, after a certain point (denoted by :math:`N`), the distance between any two terms is less than any given positive value. For the sake of the proof, we chose this value as :math:`\epsilon = 1`.

2. **Boundedness Beyond a Point** (Using :math:`M`): 
   Given the Cauchy property, we deduced that all terms of the sequence beyond the point :math:`N` are not just close to each other but are also close to a specific term, :math:`x_N`. This means that the sequence's terms, after :math:`N`, are bounded by a value :math:`M`, which is a little more than the absolute value of :math:`x_N`.

3. **Boundedness Before the Point** (Using :math:`M'`): 
   The terms before :math:`N` are finitely many. Any finite set of numbers is always bounded because there will be a maximum and minimum value among them. We denote the maximum absolute value of these terms as :math:`M'`.

4. **Why Two Different** :math:`M` and :math:`M'`?: 
   The reason for using two different bounds, :math:`M` and :math:`M'`, is to separately handle the boundedness of two segments of the sequence:

   - :math:`M` handles the terms after the point :math:`N`, ensuring they don't stray too far from :math:`x_N`.

   - :math:`M'` handles the initial terms, up to :math:`N`, by simply using the maximum absolute value among them.

By combining these two bounds, we ensure that the entire sequence is bounded by the larger of :math:`M` and :math:`M'`.

In essence, the proof uses the "tightening" behavior of Cauchy sequences to ensure that the sequence remains within a certain "boundary" and doesn't diverge to infinity, thus proving it's bounded.

-------------------------------------------------------------------------------------------

**Problem 6. Convergence of Distance Sequence of Cauchy Sequences**

**Given**:
Two sequences :math:`(x_n)` and :math:`(y_n)` in a metric space :math:`(X,d)` are Cauchy.

**To Prove**:
The sequence :math:`(a_n)`, where :math:`a_n = d(x_n, y_n)`, converges.

**Proof**:

1. **Cauchy Property of** :math:`(x_n)` and :math:`(y_n)`: 
   Since both :math:`(x_n)` and :math:`(y_n)` are Cauchy, for any given :math:`\epsilon > 0`, there exist integers :math:`N_1` and :math:`N_2` such that for all :math:`m,n \geq N_1` and :math:`p,q \geq N_2`, we have:

   :math:`d(x_m, x_n) < \frac{\epsilon}{2}`
   :math:`d(y_p, y_q) < \frac{\epsilon}{2}`

2. **Using the Triangle Inequality**: 
   Consider the difference :math:`|a_m - a_n|`, where :math:`a_m = d(x_m, y_m)` and :math:`a_n = d(x_n, y_n)`. Using the triangle inequality, we get:

   :math:`|a_m - a_n| = |d(x_m, y_m) - d(x_n, y_n)|`
   :math:`\leq d(x_m, x_n) + d(y_m, y_n)`

   Now, using the properties of the metric and the Cauchy nature of the sequences, we can further bound this as:

   :math:`\leq d(x_m, x_n) + d(y_m, y_n) < \epsilon`
   for all :math:`m,n` greater than :math:`N = \max(N_1, N_2)`.

3. **Convergence of** :math:`(a_n)`: 
   The above inequality shows that the sequence :math:`(a_n)` is Cauchy. In metric spaces where every Cauchy sequence converges (like in real numbers), :math:`(a_n)` will converge.

**Illustrative Example**:

Consider the metric space :math:`(X,d)` where :math:`X` is the set of real numbers and :math:`d` is the usual metric (absolute difference). Let:

:math:`x_n = \frac{1}{n}`
:math:`y_n = \frac{1}{n+1}`

Both :math:`(x_n)` and :math:`(y_n)` are Cauchy sequences in this metric space. Now, consider:

:math:`a_n = d(x_n, y_n) = \left| \frac{1}{n} - \frac{1}{n+1} \right| = \frac{1}{n(n+1)}`

The sequence :math:`(a_n)` represents the distances between the terms of :math:`(x_n)` and :math:`(y_n)`. As :math:`n` goes to infinity, :math:`a_n` goes to 0, showing that :math:`(a_n)` converges to 0.

This completes the proof and illustrative example.

----------------------------------------------------------

**Problem 8. Equivalence of Cauchy Sequences in Two Metrics**

**Given**: 
Two metrics :math:`d_1` and :math:`d_2` on the same set :math:`X`. There exist positive numbers :math:`a` and :math:`b` such that for all :math:`x, y \in X`:

.. math::
   a d_1(x,y) \leq d_2(x,y) \leq b d_1(x,y)

**To Prove**: 
The Cauchy sequences in :math:`(X,d_1)` and :math:`(X,d_2)` are the same.

**Proof**:

1. **Assume a Cauchy Sequence in :math:`(X,d_1)`**:

   Let :math:`(x_n)` be a Cauchy sequence in :math:`(X,d_1)`.

   This means that for any given :math:`\epsilon > 0`, there exists an integer :math:`N` such that for all :math:`m, n \geq N`:

   .. math::
      d_1(x_m, x_n) < \epsilon

2. **Using the Given Inequality**:
   Using the given inequality, we can deduce:

   .. math::
      d_2(x_m, x_n) \leq b d_1(x_m, x_n) < b\epsilon

   This shows that :math:`(x_n)` is also a Cauchy sequence in :math:`(X,d_2)`.

3. **Conversely, Assume a Cauchy Sequence** in :math:`(X,d_2)`:

   Similarly, if :math:`(x_n)` is a Cauchy sequence in :math:`(X,d_2)`,
   then for any given :math:`\epsilon > 0`, there exists an integer :math:`N` such that for all :math:`m, n \geq N`:

   .. math::
      d_2(x_m, x_n) < \epsilon

   Using the given inequality again, we get:

   .. math::
      d_1(x_m, x_n) \leq \frac{1}{a} d_2(x_m, x_n) < \frac{\epsilon}{a}

   This shows that :math:`(x_n)` is also a Cauchy sequence in :math:`(X,d_1)`.

**Conclusion**: 
The Cauchy sequences in :math:`(X,d_1)` and :math:`(X,d_2)` are the same.

This completes the proof.


**Crux of the Proof for Equivalence of Cauchy Sequences in Two Metrics**

The essence of the proof lies in the given relationship between the two metrics :math:`d_1` and :math:`d_2`. The inequalities provided ensure that the "distance" between any two points in :math:`X` as measured by :math:`d_1` and :math:`d_2` are directly proportional. This proportionality ensures that if the terms of a sequence get arbitrarily close to each other in one metric, they must also get arbitrarily close in the other metric.

**Crux of the Proof**:

1. **Proportional Distances**:
   The given inequalities :math:`a d_1(x,y) \leq d_2(x,y) \leq b d_1(x,y)` ensure that distances in :math:`d_2` are always bounded by proportional distances in :math:`d_1`.

2. **Cauchy** in :math:`d_1` Implies Cauchy in :math:`d_2`:
   If a sequence is Cauchy in :math:`(X, d_1)`, then the terms of the sequence are getting closer in the :math:`d_1` metric. Due to the proportional relationship, they must also be getting closer in the :math:`d_2` metric.

3. **Cauchy** in :math:`d_2` Implies Cauchy in :math:`d_1`:
   Similarly, if a sequence is Cauchy in :math:`(X, d_2)`, the proportional relationship ensures that the sequence is also Cauchy in :math:`(X, d_1)`.

By establishing these two implications, we conclude that the set of Cauchy sequences in both metrics is the same.

-------------------------------------------------------------------------------

**Problem 10. Completeness of Complex Numbers Using Completeness of Real Numbers**


**Given**: 

- The real numbers :math:`\mathbb{R}` are complete, which means every Cauchy sequence of real numbers converges to a limit in :math:`\mathbb{R}`.

**To Prove**: 

- The complex numbers :math:`\mathbb{C}` are complete.

**Proof**:

1. **Representation of Complex Numbers**:
   Every complex number can be represented as:

   .. math::
      z = x + yi

   where :math:`x` and :math:`y` are real numbers and :math:`i` is the imaginary unit.

2. **Assume a Cauchy Sequence** in :math:`\mathbb{C}`:
   Let :math:`(z_n)` be a Cauchy sequence in :math:`\mathbb{C}`. This means that for any given :math:`\epsilon > 0`, there exists an integer :math:`N` such that for all :math:`m, n \geq N`:

   .. math::
      |z_m - z_n| < \epsilon

3. **Real and Imaginary Parts are Cauchy**:
   The sequences of real parts :math:`(x_n)` and imaginary parts :math:`(y_n)` of :math:`(z_n)` are also Cauchy in :math:`\mathbb{R}`. This is because:

   .. math::
      |x_m - x_n| \leq |z_m - z_n|
      |y_m - y_n| \leq |z_m - z_n|

4. **Convergence of Real and Imaginary Parts**:
   Since :math:`\mathbb{R}` is complete, the Cauchy sequences :math:`(x_n)` and :math:`(y_n)` converge to limits in :math:`\mathbb{R}`.

5. **Convergence of the Complex Sequence**:
   The sequence :math:`(z_n)` converges to:

   .. math::
      z = x + yi

   in :math:`\mathbb{C}`.

**Conclusion**: 
Every Cauchy sequence in :math:`\mathbb{C}` converges to a limit in :math:`\mathbb{C}`. Hence, :math:`\mathbb{C}` is complete.

This completes the proof.











