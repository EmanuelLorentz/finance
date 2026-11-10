package com.finance.api.modules.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.finance.api.modules.transactions.TransactionResponse;
import java.util.List;

public record DashboardResponse(
    Summary summary,
    List<BalanceHistoryEntry> balanceHistory,
    List<MonthlyComparison> monthlyComparison,
    List<CategoryExpense> categoryExpenses,
    List<TransactionResponse> recentTransactions,
    List<UpcomingPayment> upcomingPayments,
    List<Goal> goals,
    List<FinancialIndicator> indicators) {

  public record Summary(
      double totalBalance,
      double monthlyIncome,
      double monthlyExpenses,
      double monthlySavings,
      Double balanceChangePercent,
      Double incomeChangePercent,
      Double expenseChangePercent,
      Double savingsRatePercent) {}

  public record BalanceHistoryEntry(String month, double balance) {}

  public record MonthlyComparison(String month, double income, double expense) {}

  public record CategoryExpense(String category, double amount, double percentage, String color) {}

  public record FinancialIndicator(String id, String label, String value, String description, Trend trend) {}

  public record Goal(
      String id, String name, double targetAmount, double currentAmount, String deadline, String category) {}

  public record UpcomingPayment(
      String id,
      String description,
      double amount,
      String dueDate,
      String category,
      @JsonProperty("isPaid") boolean isPaid) {}

  public enum Trend {
    POSITIVE("positive"),
    NEGATIVE("negative"),
    NEUTRAL("neutral");

    private final String value;

    Trend(String value) {
      this.value = value;
    }

    @JsonValue
    public String value() {
      return value;
    }
  }
}
