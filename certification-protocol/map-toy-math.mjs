/** Floating-point singular values, ascending, of z I - A for a real matrix.
 * Jacobi diagonalization uses the realification of its Hermitian Gram matrix.
 * Each squared singular value occurs twice. This is a display diagnostic,
 * not an interval enclosure or a validated lower singular-value bound.
 */
export function mapToySingularValues(A, z) {
  const n = A.length, [x, y] = z;
  if (!n || A.some(row => row.length !== n || row.some(v => !Number.isFinite(v))) || !z.every(Number.isFinite)) return [];
  const scale = Math.max(Math.abs(x), Math.abs(y), ...A.flat().map(Math.abs));
  if (scale === 0) return Array(n).fill(0);
  const B = A.map((row, i) => row.map((v, j) => ((i === j ? x : 0) - v) / scale));
  const imaginary = y / scale;
  const H = Array.from({length: 2 * n}, () => Array(2 * n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const re = B.reduce((sum, row) => sum + row[i] * row[j], 0) + (i === j ? imaginary * imaginary : 0);
    const im = imaginary * (A[i][j] - A[j][i]) / scale;
    H[i][j] = H[i + n][j + n] = re;
    H[i][j + n] = -im; H[i + n][j] = im;
  }
  for (let iteration = 0; iteration < 100 * n * n; iteration++) {
    let p = 0, q = 1, largest = 0;
    for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) {
      if (Math.abs(H[i][j]) > largest) { largest = Math.abs(H[i][j]); p = i; q = j; }
    }
    if (largest <= 2e-15 * Math.max(1, ...H.map((row, i) => Math.abs(row[i])))) break;
    const delta = (H[q][q] - H[p][p]) / (2 * H[p][q]);
    const t = (delta >= 0 ? 1 : -1) / (Math.abs(delta) + Math.hypot(1, delta));
    const c = 1 / Math.hypot(1, t), s = t * c, off = H[p][q];
    H[p][p] -= t * off; H[q][q] += t * off; H[p][q] = H[q][p] = 0;
    for (let k = 0; k < H.length; k++) if (k !== p && k !== q) {
      const kp = H[k][p], kq = H[k][q];
      H[k][p] = H[p][k] = c * kp - s * kq;
      H[k][q] = H[q][k] = s * kp + c * kq;
    }
  }
  const squares = H.map((row, i) => row[i]).sort((a, b) => a - b);
  return Array.from({length: n}, (_, i) => scale * Math.sqrt(Math.max(0, (squares[2 * i] + squares[2 * i + 1]) / 2)));
}
