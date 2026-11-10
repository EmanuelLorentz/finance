package com.finance.api.modules.accounts;

import com.finance.api.store.MarkdownStore;
import com.finance.api.store.model.StoredAccount;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

  private final MarkdownStore store;

  public AccountService(MarkdownStore store) {
    this.store = store;
  }

  public List<StoredAccount> list() {
    return store.listAccounts();
  }

  public StoredAccount create(CreateAccountRequest request) {
    return store.createAccount(request.name());
  }

  public void delete(String id) {
    store.deleteAccount(id);
  }
}
