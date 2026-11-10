package com.finance.api.store;

import com.finance.api.store.model.StoredAccount;
import com.finance.api.store.model.StoredCategory;
import com.finance.api.store.model.StoredGoal;
import com.finance.api.store.model.StoredProject;
import com.finance.api.store.model.StoredTransaction;
import com.finance.api.store.model.StoredUpcomingPayment;

public record CollectionDefinition<T>(String fileName, String title, String description, Class<T> type) {

  public static final CollectionDefinition<StoredCategory> CATEGORIES =
      new CollectionDefinition<>(
          "categories.md",
          "Categories",
          "Classificações usadas nas transactions. Edite apenas o bloco YAML.",
          StoredCategory.class);

  public static final CollectionDefinition<StoredAccount> ACCOUNTS =
      new CollectionDefinition<>(
          "accounts.md",
          "Accounts",
          "Contas usadas nas transactions. Edite apenas o bloco YAML.",
          StoredAccount.class);

  public static final CollectionDefinition<StoredProject> PROJECTS =
      new CollectionDefinition<>(
          "projects.md",
          "Projects",
          "Projects acompanhados na aplicação. Edite apenas o bloco YAML.",
          StoredProject.class);

  public static final CollectionDefinition<StoredTransaction> TRANSACTIONS =
      new CollectionDefinition<>(
          "transactions.md",
          "Transactions",
          "Transactions de income, expense e transfer. Edite apenas o bloco YAML.",
          StoredTransaction.class);

  public static final CollectionDefinition<StoredGoal> GOALS =
      new CollectionDefinition<>(
          "goals.md", "Goals", "Goals financeiros. Edite apenas o bloco YAML.", StoredGoal.class);

  public static final CollectionDefinition<StoredUpcomingPayment> UPCOMING_PAYMENTS =
      new CollectionDefinition<>(
          "upcoming-payments.md",
          "Upcoming Payments",
          "Pagamentos previstos. Edite apenas o bloco YAML.",
          StoredUpcomingPayment.class);
}
