/* A teaching route through the catalogue, not a universal ranking of functions. */
(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.GridderFunctionRoadmap = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  // Explicit keys make catalogue additions and omissions visible instead of
  // silently assigning new material to an arbitrary final stage.
  const plan = [
    ['foundations', 'First polynomial shapes', 'Start with constant and linear change, then compare even and odd powers, turning points and inflection. These examples introduce the power rule and basic graph reading.', [
      'constant', 'linear', 'quadratic', 'cube', 'cubic', 'quartic'
    ]],
    ['polynomial-patterns', 'More polynomial shapes', 'Build on the power rule with higher degrees and sums. Compare symmetry, monotonicity, wells and turning points; some coordinates are numerical approximations.', [
      'poly_fifth', 'poly_sixth', 'poly_seventh', 'poly_eighth', 'poly_cubic_rise', 'poly_cubic_turn', 'poly_cubic_asymmetric', 'poly_quartic_bowl', 'poly_double_well', 'poly_asymmetric_valley', 'poly_quartic_tilt', 'poly_fifth_rise', 'poly_fifth_turn', 'poly_flat_s', 'poly_fifth_three_turn', 'poly_quintic_asymmetric', 'poly_sixth_well', 'poly_sixth_shoulder'
    ]],
    ['roots-powers', 'Roots and fractional powers', 'Use familiar powers and inverse branches to study roots and rational powers. Pay attention to domains and to derivatives at endpoints or zero.', [
      'square_root', 'cube_root', 'power_three_halves', 'power_two_thirds'
    ]],
    ['rational', 'Ratios and domains', 'Use polynomial and power rules to investigate reciprocals and rational functions. Check denominator zeros and distinguish a chosen board window from the full domain.', [
      'reciprocal', 'rat_hill', 'rat_saturation', 'rational', 'rat_tilted_hill', 'rat_cubic_ratio', 'rat_hill_squared', 'rat_odd_squared', 'rat_peak_pair', 'rat_quartic_hill', 'rat_quartic_odd', 'rat_quartic_pair', 'rat_mixed_even', 'rat_skew_quartic'
    ]],
    ['trigonometry', 'Waves and inverse branches', 'Study sine and cosine in radians, then frequency changes and tangent. Restrict each trigonometric function to a one-to-one branch before taking its inverse.', [
      'sine', 'cosine', 'wave_sin_2', 'wave_cos_2', 'wave_sin_3', 'wave_cos_3', 'tangent', 'arcsine', 'arccosine', 'arctangent'
    ]],
    ['exponential-log', 'Exponential and logarithm', 'Compare exponential growth with its inverse logarithm, including base changes. Logarithm inputs must be positive.', [
      'exponential', 'exponential_two', 'log', 'log_two'
    ]],
    ['composites', 'Composing functions', 'Combine the polynomial, exponential, logarithmic and trigonometric examples. Identify the inner and outer functions before using the chain rule.', [
      'gaussian', 'exp_parabola', 'exp_negative_quartic', 'exp_cubic', 'exp_quartic', 'exp_cubic_rise', 'exp_cubic_minus_x', 'exp_quartic_bowl', 'exp_well', 'log_composite', 'log_shifted_bowl', 'log_quartic', 'log_sixth', 'log_quartic_bowl', 'log_even_sixth', 'log_double_well', 'log_tilted_quartic', 'log_skew_quartic', 'exp_sine'
    ]],
    ['hyperbolic', 'Hyperbolic functions', 'Use exponential combinations and quotients to understand hyperbolic functions, then compare an inverse with the branch restrictions already encountered.', [
      'sinh', 'cosh', 'tanh', 'hyperbolic_sech', 'hyperbolic_asinh'
    ]],
    ['branches-components', 'Relations and components', 'Return to roots, polynomials and waves to distinguish a chosen semicircle branch or scalar component from the whole relation or vector function.', [
      'circle_upper', 'circle_lower', 'vector_parabola', 'vector_wave'
    ]],
    ['piecewise-corners', 'Piecewise rules and corners', 'Compare formulas on either side of a join. Check the value and one-sided derivatives instead of assuming that a joined graph is smooth.', [
      'piecewise_cubic', 'piecewise_valley', 'study_absolute', 'study_nearest_integer', 'study_triangle_wave'
    ]],
    ['jumps', 'Jumps and steps', 'Use one-sided values and open or filled endpoints to investigate jumps, integer steps and fractional parts. Derivatives are considered only where they exist.', [
      'study_sign', 'study_heaviside', 'study_jump_line', 'study_floor', 'study_ceiling', 'study_fraction'
    ]],
    ['limits-oscillation', 'Holes, poles and oscillation', 'Use limits to compare a removable hole, a pole and a filled sinc function. Then compare continuity and differentiability for two increasingly constrained oscillations; sampled curves omit infinite detail.', [
      'study_removable', 'study_pole', 'study_sinc', 'study_x_sin_inverse', 'study_x2_sin_inverse'
    ]],
    ['dense-sets', 'Dense sets and continuity', 'Use rational and irrational inputs to examine Dirichlet and Thomae. Finite constructed points illustrate examples but cannot depict either dense set in full.', [
      'study_dirichlet', 'study_thomae'
    ]]
  ];

  function build(catalogue, G) {
    if (!catalogue || !catalogue.maths || !catalogue.maths.curves || !Array.isArray(catalogue.families)) {
      throw new TypeError('Roadmap requires catalogue.maths.curves and catalogue.families');
    }
    if (G != null && typeof G.levels !== 'function') throw new TypeError('Roadmap requires G.levels to count levels');
    const curves = catalogue.maths.curves;
    const memberships = Object.create(null);
    const familyIds = new Set();
    for (const family of catalogue.families) {
      if (!family.id || familyIds.has(family.id) || !Array.isArray(family.subfamilies)) throw new Error('Invalid or duplicate family: ' + family.id);
      familyIds.add(family.id);
      const subIds = new Set();
      for (const subfamily of family.subfamilies) {
        if (!subfamily.id || subIds.has(subfamily.id) || !Array.isArray(subfamily.keys)) throw new Error('Invalid or duplicate subfamily: ' + subfamily.id);
        subIds.add(subfamily.id);
        const seenInSubfamily = new Set();
        for (const key of subfamily.keys) {
          if (!Object.prototype.hasOwnProperty.call(curves, key)) throw new Error('Unknown catalogue membership key: ' + key);
          if (seenInSubfamily.has(key)) throw new Error('Duplicate key in subfamily: ' + key);
          seenInSubfamily.add(key);
          const member = memberships[key] || (memberships[key] = { families: [], subfamilies: [] });
          if (!member.families.some(item => item.id === family.id)) member.families.push({ id: family.id, label: family.label });
          member.subfamilies.push({ id: subfamily.id, label: subfamily.label });
        }
      }
    }
    const stages = [], entries = [], keys = [], byKey = Object.create(null), stageIds = new Set();
    for (const [id, title, description, stageKeys] of plan) {
      if (stageIds.has(id)) throw new Error('Duplicate roadmap stage: ' + id);
      stageIds.add(id);
      stages.push({ id, title, description, keys: stageKeys.slice() });
      for (const key of stageKeys) {
        if (Object.prototype.hasOwnProperty.call(byKey, key)) throw new Error('Duplicate roadmap key: ' + key);
        if (!Object.prototype.hasOwnProperty.call(curves, key)) throw new Error('Unknown roadmap key: ' + key);
        if (!memberships[key]) throw new Error('Missing family membership for: ' + key);
        const curve = curves[key], index = entries.length;
        const entry = { key, index, number: index + 1, stageId: id, stageTitle: title, label: curve.label, tex: curve.tex,
          families: memberships[key].families, subfamilies: memberships[key].subfamilies,
          levelCount: G == null ? null : G.levels(catalogue.maths, key).length };
        entries.push(entry); keys.push(key); byKey[key] = entry;
      }
    }
    for (const key of Object.keys(curves)) if (!Object.prototype.hasOwnProperty.call(byKey, key)) throw new Error('Missing roadmap key: ' + key);
    return { version: '1', stages, entries, keys, byKey };
  }
  return { build };
});
