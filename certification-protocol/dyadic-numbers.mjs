/* Exact binary64 decoding. BigInt rational arithmetic, independent of display
   rounding. IEEE 754 fields are read in an explicit big-endian byte order. */
const TWO52 = 1n << 52n;
const MASK64 = (1n << 64n) - 1n;
export function numberToBits(value) {
  const buffer = new ArrayBuffer(8), view = new DataView(buffer);
  view.setFloat64(0, value, false);
  return view.getBigUint64(0, false).toString(2).padStart(64, '0');
}
export function bitsToNumber(bits) {
  if (!/^[01]{64}$/.test(bits)) throw new RangeError('Use exactly 64 binary digits.');
  const buffer = new ArrayBuffer(8), view = new DataView(buffer);
  view.setBigUint64(0, BigInt('0b' + bits), false);
  return view.getFloat64(0, false);
}
export function reduceRational(numerator, denominator = 1n) {
  if (denominator === 0n) throw new RangeError('Zero denominator.');
  if (denominator < 0n) { numerator = -numerator; denominator = -denominator; }
  let a = numerator < 0n ? -numerator : numerator, b = denominator;
  while (b) [a, b] = [b, a % b];
  return { numerator: numerator / a, denominator: denominator / a };
}
export function rationalText({ numerator, denominator }) {
  return denominator === 1n ? numerator.toString() : `${numerator}/${denominator}`;
}
export function parseDecimal(text) {
  const match = /^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(text.trim());
  if (!match) throw new RangeError('Enter a decimal number, for example 0.625 or 1e-8.');
  const fraction = match[3] ?? match[4] ?? '', integer = match[2] ?? '0';
  const exponent = Number(match[5] ?? 0) - fraction.length;
  // Keep exploratory exact arithmetic bounded without truncating silently.
  if (Math.abs(exponent) > 2000 || integer.length + fraction.length > 2000) throw new RangeError('Use at most 2000 decimal places or a decimal exponent between −2000 and 2000.');
  const n = BigInt(integer + fraction) * (match[1] === '-' ? -1n : 1n);
  return exponent >= 0 ? reduceRational(n * 10n ** BigInt(exponent)) : reduceRational(n, 10n ** BigInt(-exponent));
}
export function subtractRationals(a, b) {
  return reduceRational(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator);
}
export function exactDecimal({ numerator, denominator }) {
  let d = denominator, twos = 0, fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos++; }
  while (d % 5n === 0n) { d /= 5n; fives++; }
  if (d !== 1n) return null;
  const places = Math.max(twos, fives);
  const negative = numerator < 0n;
  const scaled = (negative ? -numerator : numerator) * 2n ** BigInt(places - twos) * 5n ** BigInt(places - fives);
  const digits = scaled.toString().padStart(places + 1, '0');
  const result = places ? `${digits.slice(0, -places)}.${digits.slice(-places)}`.replace(/0+$/, '').replace(/\.$/, '') : digits;
  return (negative ? '-' : '') + result;
}
export function decodeBinary64(bits) {
  const value = bitsToNumber(bits), sign = Number(bits[0]);
  const exponentBits = bits.slice(1, 12), fractionBits = bits.slice(12);
  const exponentField = parseInt(exponentBits, 2), fractionInteger = BigInt('0b' + fractionBits);
  const base = { bits, value, sign, exponentBits, fractionBits, exponentField, fractionInteger,
    hex: BigInt('0b' + bits).toString(16).padStart(16, '0') };
  if (exponentField === 2047) return { ...base, classification: fractionInteger ? 'NaN' : 'infinity', rational: null };
  if (exponentField === 0 && fractionInteger === 0n) return { ...base, classification: 'zero', rational: { numerator: 0n, denominator: 1n }, power: -1074, significand: 0n, denominatorPower: 0 };
  const normal = exponentField !== 0;
  const significand = (normal ? TWO52 : 0n) + fractionInteger;
  const power = normal ? exponentField - 1023 - 52 : -1074;
  const signed = sign ? -significand : significand;
  const rational = power >= 0 ? reduceRational(signed << BigInt(power)) : reduceRational(signed, 1n << BigInt(-power));
  return { ...base, classification: normal ? 'normal' : 'subnormal', power, significand, rational,
    denominatorPower: rational.denominator.toString(2).length - 1 };
}
export function changeBit(bits, index) {
  if (!Number.isInteger(index) || index < 0 || index > 63) throw new RangeError('Bit index must be between 0 and 63.');
  bitsToNumber(bits);
  return (BigInt('0b' + bits) ^ (1n << BigInt(63 - index)) & MASK64).toString(2).padStart(64, '0');
}
export function decimalEncoding(text) {
  const intended = parseDecimal(text), bits = numberToBits(Number(text)), decoded = decodeBinary64(bits);
  return { intended, bits, decoded, error: decoded.rational ? subtractRationals(decoded.rational, intended) : null };
}
