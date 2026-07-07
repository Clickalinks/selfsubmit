/** UK tax year label e.g. 2026-27 for a reference date. */
export function currentUkTaxYearLabel(reference = new Date()): string {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth() + 1;
  const day = reference.getUTCDate();
  const afterApril5 = month > 4 || (month === 4 && day > 5);
  const startYear = afterApril5 ? year : year - 1;
  const endYearShort = String(startYear + 1).slice(-2);
  return `${startYear}-${endYearShort}`;
}

export function taxYearStartIso(taxYear: string): string {
  const [startYear] = taxYear.split("-");
  return `${startYear}-04-06`;
}

export function taxYearEndIso(taxYear: string): string {
  const [startYear] = taxYear.split("-");
  const y = Number(startYear);
  return `${y + 1}-04-05`;
}
