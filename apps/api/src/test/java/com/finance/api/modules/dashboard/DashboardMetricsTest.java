package com.finance.api.modules.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.finance.api.modules.dashboard.DashboardMetrics.MetricTransaction;
import com.finance.api.modules.dashboard.DashboardResponse.FinancialIndicator;
import com.finance.api.modules.dashboard.DashboardResponse.Trend;
import com.finance.api.store.model.TransactionType;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class DashboardMetricsTest {

  @ParameterizedTest
  @CsvSource({
    "12.5, '12,5'",
    "0.05, '0,1'",
    "1.005, '1,0'",
    "2.25, '2,3'",
    "-2.25, '-2,3'",
    "-0.04, '-0,0'",
    "0, '0,0'",
    "100, '100,0'",
  })
  void formatsLikeJavaScriptToFixed(double value, String expected) {
    assertThat(DashboardMetrics.formatDecimal(value)).isEqualTo(expected);
  }

  @Test
  void clampsComparableDayToShorterMonth() {
    assertThat(DashboardMetrics.previousComparableDate("2026-03-31")).isEqualTo("2026-02-28");
    assertThat(DashboardMetrics.previousComparableDate("2026-01-15")).isEqualTo("2025-12-15");
  }

  @Test
  void percentChangeTreatsMissingAndZeroBaselines() {
    assertThat(DashboardMetrics.percentChange(10, null)).isNull();
    assertThat(DashboardMetrics.percentChange(0, 0.0)).isEqualTo(0.0);
    assertThat(DashboardMetrics.percentChange(10, 0.0)).isNull();
    assertThat(DashboardMetrics.percentChange(150, 100.0)).isEqualTo(50.0);
    assertThat(DashboardMetrics.percentChange(-50, -100.0)).isEqualTo(50.0);
  }

  @Test
  void emptyHistoryHasNoComparisons() {
    DashboardMetrics.Result result = DashboardMetrics.build(List.of(), "2026-11-04");

    assertThat(result.summary().totalBalance()).isZero();
    assertThat(result.summary().balanceChangePercent()).isNull();
    assertThat(result.summary().incomeChangePercent()).isNull();
    assertThat(result.summary().savingsRatePercent()).isNull();
    assertThat(result.categoryExpenses()).isEmpty();
    assertThat(result.indicators()).isEmpty();
  }

  @Test
  void buildsSummaryAndIndicators() {
    List<MetricTransaction> transactions =
        List.of(
            new MetricTransaction(10000, TransactionType.INCOME, "2026-11-02", "Salário", "#4ade80"),
            new MetricTransaction(1500, TransactionType.EXPENSE, "2026-11-03", "Mercado", "#f87171"),
            new MetricTransaction(500, TransactionType.EXPENSE, "2026-11-03", "Casa", "#f87171"),
            new MetricTransaction(300, TransactionType.TRANSFER, "2026-11-03", "Casa", "#f87171"),
            new MetricTransaction(8000, TransactionType.INCOME, "2026-10-02", "Salário", "#4ade80"),
            new MetricTransaction(2000, TransactionType.EXPENSE, "2026-10-03", "Mercado", "#f87171"),
            new MetricTransaction(999, TransactionType.EXPENSE, "2026-10-20", "Mercado", "#f87171"));

    DashboardMetrics.Result result = DashboardMetrics.build(transactions, "2026-11-04");

    assertThat(result.summary().monthlyIncome()).isEqualTo(10000);
    assertThat(result.summary().monthlyExpenses()).isEqualTo(2000);
    assertThat(result.summary().monthlySavings()).isEqualTo(8000);
    assertThat(result.summary().totalBalance()).isEqualTo(13001);
    assertThat(result.summary().incomeChangePercent()).isEqualTo(25.0);
    assertThat(result.summary().expenseChangePercent()).isEqualTo(0.0);
    assertThat(result.summary().savingsRatePercent()).isEqualTo(80.0);
    assertThat(result.categoryExpenses())
        .extracting(DashboardResponse.CategoryExpense::category)
        .containsExactly("Mercado", "Casa");

    assertThat(result.indicators())
        .extracting(FinancialIndicator::id, FinancialIndicator::value, FinancialIndicator::trend)
        .containsExactly(
            tuple("savings-rate", "80,0%", Trend.POSITIVE),
            tuple("income-commitment", "20,0%", Trend.NEUTRAL),
            tuple("emergency-coverage", "4,3 meses", Trend.POSITIVE),
            tuple("top-category", "75,0%", Trend.NEUTRAL));
  }
}
