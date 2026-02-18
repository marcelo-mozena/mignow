/**
 * Parse a JSON file into an array of records.
 */
export async function parseJsonFile(file: File): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  // Single object → wrap in array
  if (typeof parsed === 'object' && parsed !== null) {
    return [parsed];
  }

  throw new Error('Formato JSON inválido. Esperado um array ou objeto.');
}

/**
 * Detect the CSV separator by checking the first (header) line.
 * Supports `;` and `,`. Falls back to `,`.
 */
function detectSeparator(headerLine: string): string {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

/**
 * Try to convert DD/MM/YY or DD/MM/YYYY to YYYY-MM-DD.
 * Returns the original string if it doesn't match.
 */
function normalizeDateValue(val: string): string {
  // DD/MM/YY or DD/MM/YYYY
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return val;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  let year = match[3];
  if (year.length === 2) {
    const num = parseInt(year, 10);
    year = (num >= 0 && num <= 49 ? 2000 + num : 1900 + num).toString();
  }
  return `${year}-${month}-${day}`;
}

/**
 * Parse a CSV file into an array of records.
 * Auto-detects separator (`,` or `;`).
 * Uses the first line as headers.
 */
export async function parseCsvFile(
  file: File,
  separator?: string
): Promise<Record<string, unknown>[]> {
  const text = await file.text();
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV deve conter ao menos uma linha de cabeçalho e uma de dados.');
  }

  const sep = separator ?? detectSeparator(lines[0]);
  const headers = lines[0].split(sep).map(h => h.trim());
  const records: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(sep).map(v => v.trim());
    const record: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      const val = values[idx] ?? '';
      const lower = val.toLowerCase();
      // Boolean
      if (lower === 'true' || lower === 'false') {
        record[header] = lower === 'true';
      }
      // Date DD/MM/YY or DD/MM/YYYY
      else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(val)) {
        record[header] = normalizeDateValue(val);
      }
      // Keep as string — avoids data loss for CPF, phone, codes with leading zeros
      else {
        record[header] = val;
      }
    });
    records.push(record);
  }

  return records;
}

/**
 * Parse a file based on its extension.
 */
export async function parseFile(file: File): Promise<Record<string, unknown>[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'json':
      return parseJsonFile(file);
    case 'csv':
      return parseCsvFile(file);
    default:
      throw new Error(`Formato de arquivo não suportado: .${ext}. Use .json ou .csv`);
  }
}
