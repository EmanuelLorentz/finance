package com.finance.api.modules.transactions;

import com.finance.api.store.MarkdownStore;
import com.finance.api.store.model.FinanceSnapshot;
import com.finance.api.store.model.StoredTransaction;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TransactionService {

  private final MarkdownStore store;

  public TransactionService(MarkdownStore store) {
    this.store = store;
  }

  public List<TransactionResponse> list() {
    FinanceSnapshot snapshot = store.readSnapshot();
    return snapshot.transactions().stream()
        .sorted(Comparator.comparing(StoredTransaction::date).reversed())
        .map(transaction -> TransactionPresenter.present(transaction, snapshot.categories()))
        .toList();
  }

  public TransactionResponse create(CreateTransactionRequest request) {
    StoredTransaction transaction =
        store.createTransaction(
            request.description(),
            request.amount(),
            request.type(),
            request.date(),
            request.account(),
            request.category(),
            request.projectId());
    return TransactionPresenter.present(transaction, store.listCategories());
  }

  public void delete(String id) {
    store.deleteTransaction(id);
  }
}
