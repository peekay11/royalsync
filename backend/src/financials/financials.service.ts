export class FinancialSummaryService {
  normalizeToMonthly(amount: number, frequency: string): number {
    switch (frequency.toUpperCase()) {
      case 'ANNUALLY': return amount / 12;
      case 'WEEKLY': return amount * 4.33;
      case 'BIWEEKLY': return amount * 2.16;
      case 'MONTHLY': default: return amount;
    }
  }

  calculateSummary(assets: any[], liabilities: any[], incomes: any[], expenses: any[]) {
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
    const netWorth = totalAssets - totalLiabilities;

    const monthlyIncome = incomes.reduce((sum, i) => sum + this.normalizeToMonthly(i.amount, i.frequency), 0);
    const monthlyExpenses = expenses.reduce((sum, e) => sum + this.normalizeToMonthly(e.amount, e.frequency), 0);
    const monthlySurplus = monthlyIncome - monthlyExpenses;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      assets,
      liabilities,
      incomes,
      expenses
    };
  }
}
