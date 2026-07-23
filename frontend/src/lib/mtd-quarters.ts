/** Pure UK MTD tax-year quarter helpers — safe for client and server. */

export type MtdQuarter = {
  label: string;
  from: Date;
  to: Date;
  deadline: Date;
};

/** UK tax year quarters for MTD (6 Apr start). Deadline = period end + 1 month + 7 days. */
export function getUkTaxYearQuarters(reference = new Date()): MtdQuarter[] {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const day = reference.getDate();
  const taxYearStartYear = month > 3 || (month === 3 && day >= 6) ? year : year - 1;

  const mk = (fromY: number, fromM: number, fromD: number, toY: number, toM: number, toD: number, label: string) => {
    const from = new Date(fromY, fromM, fromD);
    const to = new Date(toY, toM, toD);
    const deadline = new Date(toY, toM, toD);
    deadline.setMonth(deadline.getMonth() + 1);
    deadline.setDate(deadline.getDate() + 7);
    return { label, from, to, deadline };
  };

  return [
    mk(taxYearStartYear, 3, 6, taxYearStartYear, 6, 5, "Apr–Jul"),
    mk(taxYearStartYear, 6, 6, taxYearStartYear, 9, 5, "Jul–Oct"),
    mk(taxYearStartYear, 9, 6, taxYearStartYear + 1, 0, 5, "Oct–Jan"),
    mk(taxYearStartYear + 1, 0, 6, taxYearStartYear + 1, 3, 5, "Jan–Apr"),
  ];
}

export function getCurrentQuarter(reference = new Date()): MtdQuarter {
  const quarters = getUkTaxYearQuarters(reference);
  const now = reference.getTime();
  for (const q of quarters) {
    if (now >= q.from.getTime() && now <= q.to.getTime() + 86_400_000) {
      return q;
    }
  }
  return quarters[quarters.length - 1];
}
