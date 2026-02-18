/**
 * Validates a Brazilian CPF (Cadastro de Pessoas Físicas).
 * Checks format (11 digits) and verifier digits.
 */
export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  // Reject known invalid sequences (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validate first verifier digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  // Validate second verifier digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}

/**
 * Validates an email address using a standard regex pattern.
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

/**
 * Returns the last day of the current decade (e.g. 2029-12-31 for 2020s, 2039-12-31 for 2030s).
 * Format: YYYY-MM-DD
 */
export function getEndOfCurrentDecade(): string {
  const year = new Date().getFullYear();
  const decadeEnd = Math.floor(year / 10) * 10 + 9;
  return `${decadeEnd}-12-31`;
}
