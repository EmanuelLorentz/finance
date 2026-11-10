package com.finance.api.store.model;

import java.util.List;

public record FinanceSnapshot(
    List<StoredCategory> categories,
    List<StoredProject> projects,
    List<StoredTransaction> transactions,
    List<StoredGoal> goals,
    List<StoredUpcomingPayment> upcomingPayments) {}
