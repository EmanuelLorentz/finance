package com.finance.api.modules.dashboard;

import com.finance.api.modules.dashboard.DashboardMetrics.MetricTransaction;
import com.finance.api.modules.dashboard.DashboardResponse.BalanceHistoryEntry;
import com.finance.api.modules.dashboard.DashboardResponse.Goal;
import com.finance.api.modules.dashboard.DashboardResponse.MonthlyComparison;
import com.finance.api.modules.dashboard.DashboardResponse.UpcomingPayment;
import com.finance.api.modules.transactions.TransactionPresenter;
import com.finance.api.store.MarkdownStore;
import com.finance.api.store.model.FinanceSnapshot;
import com.finance.api.store.model.StoredCategory;
import com.finance.api.store.model.StoredGoal;
import com.finance.api.store.model.StoredProject;
import com.finance.api.store.model.StoredTransaction;
import com.finance.api.store.model.StoredUpcomingPayment;
import com.finance.api.store.model.TransactionType;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

  private static final int HISTORY_MONTHS = 6;
  private static final int RECENT_TRANSACTIONS = 10;
  private static final String[] MONTH_LABELS = {
    "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"
  };

  private record JoinedTransaction(StoredTransaction transaction, StoredCategory category, StoredProject project) {

    boolean impactsBalance() {
      return project == null || project.impactsBalance();
    }
  }

  private static final class MonthTotals {
    private final String label;
    private double income;
    private double expense;

    private MonthTotals(String label) {
      this.label = label;
    }
  }

  private final MarkdownStore store;

  public DashboardService(MarkdownStore store) {
    this.store = store;
  }

  public DashboardResponse build() {
    FinanceSnapshot snapshot = store.readSnapshot();
    List<JoinedTransaction> transactions = join(snapshot);
    List<JoinedTransaction> balanceTransactions =
        transactions.stream().filter(JoinedTransaction::impactsBalance).toList();

    DashboardMetrics.Result metrics =
        DashboardMetrics.build(
            balanceTransactions.stream()
                .map(
                    joined ->
                        new MetricTransaction(
                            joined.transaction().amount(),
                            joined.transaction().type(),
                            joined.transaction().date(),
                            joined.category().name(),
                            joined.category().color()))
                .toList(),
            store.today());

    Map<String, MonthTotals> months = new LinkedHashMap<>();
    for (int index = balanceTransactions.size() - 1; index >= 0; index -= 1) {
      StoredTransaction transaction = balanceTransactions.get(index).transaction();
      String key = transaction.date().substring(0, 7);
      MonthTotals totals = months.computeIfAbsent(key, ignored -> new MonthTotals(monthLabel(key)));
      if (transaction.type() == TransactionType.INCOME) totals.income += transaction.amount();
      if (transaction.type() == TransactionType.EXPENSE) totals.expense += transaction.amount();
    }

    List<MonthlyComparison> monthlyComparison = new ArrayList<>();
    List<BalanceHistoryEntry> balanceHistory = new ArrayList<>();
    double cumulative = 0;
    for (MonthTotals totals : months.values()) {
      monthlyComparison.add(new MonthlyComparison(totals.label, totals.income, totals.expense));
      cumulative += totals.income - totals.expense;
      balanceHistory.add(new BalanceHistoryEntry(totals.label, cumulative));
    }

    return new DashboardResponse(
        metrics.summary(),
        lastItems(balanceHistory, HISTORY_MONTHS),
        lastItems(monthlyComparison, HISTORY_MONTHS),
        metrics.categoryExpenses(),
        transactions.stream()
            .limit(RECENT_TRANSACTIONS)
            .map(joined -> TransactionPresenter.present(joined.transaction(), joined.category()))
            .toList(),
        snapshot.upcomingPayments().stream()
            .filter(payment -> !payment.isPaid())
            .sorted(Comparator.comparing(StoredUpcomingPayment::dueDate))
            .map(DashboardService::presentUpcomingPayment)
            .toList(),
        snapshot.goals().stream()
            .sorted(Comparator.comparing(StoredGoal::deadline))
            .map(DashboardService::presentGoal)
            .toList(),
        metrics.indicators());
  }

  private static List<JoinedTransaction> join(FinanceSnapshot snapshot) {
    Map<String, StoredProject> projectsById =
        snapshot.projects().stream()
            .collect(Collectors.toMap(StoredProject::id, Function.identity(), (first, second) -> second));

    return snapshot.transactions().stream()
        .map(
            transaction ->
                new JoinedTransaction(
                    transaction,
                    TransactionPresenter.categoryOf(transaction, snapshot.categories()),
                    transaction.projectId() == null ? null : projectsById.get(transaction.projectId())))
        .sorted(
            Comparator.comparing((JoinedTransaction joined) -> joined.transaction().date()).reversed())
        .toList();
  }

  private static String monthLabel(String monthKey) {
    return MONTH_LABELS[Integer.parseInt(monthKey.substring(5, 7)) - 1];
  }

  private static <T> List<T> lastItems(List<T> items, int count) {
    return items.subList(Math.max(0, items.size() - count), items.size());
  }

  private static Goal presentGoal(StoredGoal goal) {
    return new Goal(
        goal.id(), goal.name(), goal.targetAmount(), goal.currentAmount(), goal.deadline(), goal.category());
  }

  private static UpcomingPayment presentUpcomingPayment(StoredUpcomingPayment payment) {
    return new UpcomingPayment(
        payment.id(),
        payment.description(),
        payment.amount(),
        payment.dueDate(),
        payment.category(),
        payment.isPaid());
  }
}
