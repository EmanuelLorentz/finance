package com.finance.api.modules.dashboard;

import com.finance.api.modules.dashboard.DashboardResponse.CategoryExpense;
import com.finance.api.modules.dashboard.DashboardResponse.FinancialIndicator;
import com.finance.api.modules.dashboard.DashboardResponse.Summary;
import com.finance.api.modules.dashboard.DashboardResponse.Trend;
import com.finance.api.store.model.TransactionType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Pure calculations for the dashboard. Dates are compared as ISO strings (AAAA-MM-DD). */
final class DashboardMetrics {

  record MetricTransaction(
      double amount, TransactionType type, String date, String categoryName, String categoryColor) {}

  record Result(Summary summary, List<CategoryExpense> categoryExpenses, List<FinancialIndicator> indicators) {}

  private record Period(String start, String end) {}

  private static final double SAVINGS_RATE_REFERENCE = 20;
  private static final double EMERGENCY_MONTHS_REFERENCE = 3;
  private static final int CLOSED_MONTHS_IN_AVERAGE = 3;

  private DashboardMetrics() {}

  static String previousComparableDate(String today) {
    LocalDate date = LocalDate.parse(today);
    YearMonth previous = YearMonth.from(date).minusMonths(1);
    int comparableDay = Math.min(date.getDayOfMonth(), previous.lengthOfMonth());
    return previous.atDay(comparableDay).toString();
  }

  private static Period currentPeriod(String today) {
    return new Period(today.substring(0, 7) + "-01", today);
  }

  private static Period previousPeriod(String today) {
    String end = previousComparableDate(today);
    return new Period(end.substring(0, 7) + "-01", end);
  }

  private static String historyStart(List<MetricTransaction> transactions) {
    String earliest = null;
    for (MetricTransaction transaction : transactions) {
      if (earliest == null || transaction.date().compareTo(earliest) < 0) earliest = transaction.date();
    }
    return earliest;
  }

  private static boolean outside(MetricTransaction transaction, Period period) {
    return transaction.date().compareTo(period.start()) < 0 || transaction.date().compareTo(period.end()) > 0;
  }

  private static double sumByType(List<MetricTransaction> transactions, TransactionType type, Period period) {
    double sum = 0;
    for (MetricTransaction transaction : transactions) {
      if (transaction.type() != type || outside(transaction, period)) continue;
      sum += transaction.amount();
    }
    return sum;
  }

  private static Double observedSum(
      List<MetricTransaction> transactions, TransactionType type, Period period, String firstDate) {
    if (firstDate == null || firstDate.compareTo(period.end()) > 0) return null;
    return sumByType(transactions, type, period);
  }

  private static Double balanceAsOf(List<MetricTransaction> transactions, String asOf, String firstDate) {
    if (firstDate == null || firstDate.compareTo(asOf) > 0) return null;

    double sum = 0;
    for (MetricTransaction transaction : transactions) {
      if (transaction.date().compareTo(asOf) > 0) continue;
      if (transaction.type() == TransactionType.INCOME) sum += transaction.amount();
      if (transaction.type() == TransactionType.EXPENSE) sum -= transaction.amount();
    }
    return sum;
  }

  // Null means the previous period was not observed. Zero is a real baseline:
  // 0 against 0 is 0%, and a different current value has no finite percentage.
  static Double percentChange(double current, Double previous) {
    if (previous == null) return null;
    if (previous == 0) return current == 0 ? 0.0 : null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  private static Double ratioPercent(double part, double whole) {
    if (whole == 0) return null;
    return (part / whole) * 100;
  }

  // Must round like JavaScript's toFixed(1): exact binary value, ties away from zero.
  static String formatDecimal(double value) {
    String formatted = new BigDecimal(value).setScale(1, RoundingMode.HALF_UP).toPlainString();
    if (value < 0 && !formatted.startsWith("-")) formatted = "-" + formatted;
    return formatted.replace('.', ',');
  }

  private static List<String> closedMonthKeys(String today, String firstDate) {
    String firstKey = firstDate.substring(0, 7);
    List<String> keys = new ArrayList<>();
    YearMonth cursor = YearMonth.parse(today.substring(0, 7)).minusMonths(1);

    while (keys.size() < CLOSED_MONTHS_IN_AVERAGE && cursor.toString().compareTo(firstKey) >= 0) {
      keys.add(cursor.toString());
      cursor = cursor.minusMonths(1);
    }
    return keys;
  }

  private static double expenseInMonth(List<MetricTransaction> transactions, String key) {
    return sumByType(transactions, TransactionType.EXPENSE, new Period(key + "-01", key + "-31"));
  }

  private static Double averageClosedExpenses(
      List<MetricTransaction> transactions, String today, String firstDate) {
    if (firstDate == null) return null;
    List<String> months = closedMonthKeys(today, firstDate);
    if (months.isEmpty()) return null;
    double total = 0;
    for (String key : months) total += expenseInMonth(transactions, key);
    return total / months.size();
  }

  private static List<CategoryExpense> categoryExpenses(List<MetricTransaction> transactions, Period period) {
    Map<String, double[]> amounts = new LinkedHashMap<>();
    Map<String, String> colors = new LinkedHashMap<>();

    for (MetricTransaction transaction : transactions) {
      if (transaction.type() != TransactionType.EXPENSE || outside(transaction, period)) continue;
      amounts.computeIfAbsent(transaction.categoryName(), name -> new double[1])[0] += transaction.amount();
      colors.put(transaction.categoryName(), transaction.categoryColor());
    }

    double total = 0;
    for (double[] amount : amounts.values()) total += amount[0];
    if (total == 0) return List.of();

    List<CategoryExpense> result = new ArrayList<>();
    for (Map.Entry<String, double[]> entry : amounts.entrySet()) {
      double amount = entry.getValue()[0];
      result.add(new CategoryExpense(entry.getKey(), amount, (amount / total) * 100, colors.get(entry.getKey())));
    }
    result.sort(Comparator.comparingDouble(CategoryExpense::amount).reversed());
    return result;
  }

  private static List<FinancialIndicator> buildIndicators(
      Double savingsRate,
      double income,
      double expenses,
      double balance,
      Double averageExpenses,
      List<CategoryExpense> categories) {
    List<FinancialIndicator> indicators = new ArrayList<>();

    if (savingsRate != null) {
      Trend trend =
          savingsRate >= SAVINGS_RATE_REFERENCE
              ? Trend.POSITIVE
              : savingsRate < 0 ? Trend.NEGATIVE : Trend.NEUTRAL;
      indicators.add(
          new FinancialIndicator(
              "savings-rate",
              "Taxa de Poupança",
              formatDecimal(savingsRate) + "%",
              "das entradas do mês que sobraram",
              trend));
    }

    Double commitment = ratioPercent(expenses, income);
    if (commitment != null) {
      indicators.add(
          new FinancialIndicator(
              "income-commitment",
              "Comprometimento da renda",
              formatDecimal(commitment) + "%",
              "das entradas usadas em saídas",
              commitment > 100 ? Trend.NEGATIVE : Trend.NEUTRAL));
    }

    if (averageExpenses != null && averageExpenses != 0) {
      double coverage = balance / averageExpenses;
      Trend trend =
          coverage >= EMERGENCY_MONTHS_REFERENCE
              ? Trend.POSITIVE
              : coverage < 0 ? Trend.NEGATIVE : Trend.NEUTRAL;
      indicators.add(
          new FinancialIndicator(
              "emergency-coverage",
              "Cobertura de Emergência",
              formatDecimal(coverage) + " meses",
              "com a média das saídas dos meses fechados",
              trend));
    }

    if (!categories.isEmpty()) {
      CategoryExpense topCategory = categories.get(0);
      indicators.add(
          new FinancialIndicator(
              "top-category",
              "Maior Category do mês",
              formatDecimal(topCategory.percentage()) + "%",
              topCategory.category(),
              Trend.NEUTRAL));
    }

    return indicators;
  }

  static Result build(List<MetricTransaction> transactions, String today) {
    String firstDate = historyStart(transactions);
    Period current = currentPeriod(today);
    Period previous = previousPeriod(today);
    double monthlyIncome = sumByType(transactions, TransactionType.INCOME, current);
    double monthlyExpenses = sumByType(transactions, TransactionType.EXPENSE, current);
    double monthlySavings = monthlyIncome - monthlyExpenses;
    Double balance = balanceAsOf(transactions, today, firstDate);
    double totalBalance = balance == null ? 0 : balance;
    Double previousBalance = balanceAsOf(transactions, previous.end(), firstDate);
    List<CategoryExpense> categories = categoryExpenses(transactions, current);
    Double savingsRatePercent = ratioPercent(monthlySavings, monthlyIncome);

    Summary summary =
        new Summary(
            totalBalance,
            monthlyIncome,
            monthlyExpenses,
            monthlySavings,
            percentChange(totalBalance, previousBalance),
            percentChange(
                monthlyIncome, observedSum(transactions, TransactionType.INCOME, previous, firstDate)),
            percentChange(
                monthlyExpenses, observedSum(transactions, TransactionType.EXPENSE, previous, firstDate)),
            savingsRatePercent);

    return new Result(
        summary,
        categories,
        buildIndicators(
            savingsRatePercent,
            monthlyIncome,
            monthlyExpenses,
            totalBalance,
            averageClosedExpenses(transactions, today, firstDate),
            categories));
  }
}
