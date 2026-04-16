/**
 * Basic MVP totals for self-employed monthly submissions.
 * Income and expenses are plain objects: { key: number, ... }.
 */

function sumNumericObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return 0;
  }
  return Object.values(obj).reduce((sum, v) => {
    const n = Number(v);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function computeTotals(income, expenses) {
  const incomeTotal = sumNumericObject(income);
  const expensesTotal = sumNumericObject(expenses);
  const profit = incomeTotal - expensesTotal;
  return {
    income: incomeTotal,
    expenses: expensesTotal,
    profit,
  };
}

module.exports = {
  computeTotals,
  sumNumericObject,
};
