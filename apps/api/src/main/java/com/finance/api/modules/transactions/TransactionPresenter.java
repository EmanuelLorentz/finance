package com.finance.api.modules.transactions;

import com.finance.api.store.model.StoredCategory;
import com.finance.api.store.model.StoredTransaction;
import java.util.List;

public final class TransactionPresenter {

  private static final StoredCategory FALLBACK_CATEGORY = new StoredCategory("", "Outros", "#6b7280");

  private TransactionPresenter() {}

  public static StoredCategory categoryOf(StoredTransaction transaction, List<StoredCategory> categories) {
    return categories.stream()
        .filter(category -> category.id().equals(transaction.categoryId()))
        .findFirst()
        .orElse(FALLBACK_CATEGORY);
  }

  public static TransactionResponse present(StoredTransaction transaction, List<StoredCategory> categories) {
    return present(transaction, categoryOf(transaction, categories));
  }

  public static TransactionResponse present(StoredTransaction transaction, StoredCategory category) {
    return new TransactionResponse(
        transaction.id(),
        transaction.description(),
        transaction.amount(),
        transaction.type(),
        category.name(),
        transaction.date(),
        transaction.account(),
        transaction.projectId());
  }
}
