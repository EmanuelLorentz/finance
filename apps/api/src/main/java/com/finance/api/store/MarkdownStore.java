package com.finance.api.store;

import static com.finance.api.store.CollectionDefinition.ACCOUNTS;
import static com.finance.api.store.CollectionDefinition.CATEGORIES;
import static com.finance.api.store.CollectionDefinition.GOALS;
import static com.finance.api.store.CollectionDefinition.PROJECTS;
import static com.finance.api.store.CollectionDefinition.TRANSACTIONS;
import static com.finance.api.store.CollectionDefinition.UPCOMING_PAYMENTS;

import com.finance.api.store.model.FinanceSnapshot;
import com.finance.api.store.model.StoredAccount;
import com.finance.api.store.model.StoredCategory;
import com.finance.api.store.model.StoredProject;
import com.finance.api.store.model.StoredTransaction;
import com.finance.api.store.model.TransactionType;
import java.text.Collator;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Every operation runs under one lock so a request never sees a half-written collection. */
@Component
public class MarkdownStore {

  private final MarkdownCollections collections;
  private final Clock clock;
  private final Collator collator = Collator.getInstance(Locale.forLanguageTag("pt-BR"));
  private final ReentrantLock lock = new ReentrantLock();

  public MarkdownStore(MarkdownCollections collections, Clock clock) {
    this.collections = collections;
    this.clock = clock;
  }

  public FinanceSnapshot readSnapshot() {
    return locked(
        () ->
            new FinanceSnapshot(
                collections.read(CATEGORIES),
                collections.read(PROJECTS),
                collections.read(TRANSACTIONS),
                collections.read(GOALS),
                collections.read(UPCOMING_PAYMENTS)));
  }

  public List<StoredProject> listProjects() {
    return locked(
        () -> {
          List<StoredProject> projects = collections.read(PROJECTS);
          projects.sort(Comparator.comparing(StoredProject::createdAt));
          return projects;
        });
  }

  public Optional<StoredProject> getProject(String id) {
    return locked(
        () -> collections.read(PROJECTS).stream().filter(project -> project.id().equals(id)).findFirst());
  }

  public StoredProject createProject(
      String name,
      String description,
      Double budget,
      String deadline,
      boolean impactsBalance,
      String color) {
    return locked(
        () -> {
          List<StoredProject> projects = collections.read(PROJECTS);
          StoredProject project =
              new StoredProject(
                  newId(),
                  name,
                  isNullOrEmpty(description) ? null : description,
                  budget,
                  isNullOrEmpty(deadline) ? null : deadline,
                  impactsBalance,
                  color,
                  today());
          projects.add(project);
          collections.write(PROJECTS, projects);
          return project;
        });
  }

  public List<StoredTransaction> listTransactions(String projectId) {
    return locked(
        () -> {
          List<StoredTransaction> transactions = collections.read(TRANSACTIONS);
          return transactions.stream()
              .filter(transaction -> projectId == null || projectId.equals(transaction.projectId()))
              .sorted(Comparator.comparing(StoredTransaction::date).reversed())
              .collect(Collectors.toCollection(ArrayList::new));
        });
  }

  public List<StoredCategory> listCategories() {
    return locked(
        () -> {
          List<StoredCategory> categories = collections.read(CATEGORIES);
          categories.sort(byName(StoredCategory::name));
          return categories;
        });
  }

  public StoredCategory createCategory(String rawName, String color) {
    return locked(
        () -> {
          List<StoredCategory> categories = collections.read(CATEGORIES);
          String name = rawName.trim();

          if (categories.stream().anyMatch(category -> category.name().equals(name))) {
            throw new StoreException("Já existe uma Category com esse nome.", 400);
          }

          StoredCategory category = new StoredCategory(newId(), name, color);
          categories.add(category);
          collections.write(CATEGORIES, categories);
          return category;
        });
  }

  public void deleteCategory(String id) {
    locked(
        () -> {
          List<StoredCategory> categories = collections.read(CATEGORIES);
          List<StoredTransaction> transactions = collections.read(TRANSACTIONS);

          if (categories.stream().noneMatch(category -> category.id().equals(id))) {
            throw new StoreException("Category not found", 404);
          }
          if (transactions.stream().anyMatch(transaction -> transaction.categoryId().equals(id))) {
            throw new StoreException("Essa Category está em uma Transaction e não pode ser excluída.", 400);
          }

          categories.removeIf(category -> category.id().equals(id));
          collections.write(CATEGORIES, categories);
          return null;
        });
  }

  public List<StoredAccount> listAccounts() {
    return locked(
        () -> {
          List<StoredAccount> accounts =
              syncAccounts(collections.read(ACCOUNTS), collections.read(TRANSACTIONS));
          accounts.sort(byName(StoredAccount::name));
          return accounts;
        });
  }

  public StoredAccount createAccount(String rawName) {
    return locked(
        () -> {
          List<StoredAccount> accounts =
              syncAccounts(collections.read(ACCOUNTS), collections.read(TRANSACTIONS));
          String name = rawName.trim();

          if (accounts.stream().anyMatch(account -> account.name().equals(name))) {
            throw new StoreException("Já existe uma conta com esse nome.", 400);
          }

          StoredAccount account = new StoredAccount(newId(), name);
          accounts.add(account);
          collections.write(ACCOUNTS, accounts);
          return account;
        });
  }

  public void deleteAccount(String id) {
    locked(
        () -> {
          List<StoredTransaction> transactions = collections.read(TRANSACTIONS);
          List<StoredAccount> accounts = syncAccounts(collections.read(ACCOUNTS), transactions);
          StoredAccount account =
              accounts.stream()
                  .filter(item -> item.id().equals(id))
                  .findFirst()
                  .orElseThrow(() -> new StoreException("Account not found", 404));

          if (transactions.stream().anyMatch(transaction -> transaction.account().equals(account.name()))) {
            throw new StoreException("Essa conta está em uma Transaction e não pode ser excluída.", 400);
          }

          accounts.removeIf(item -> item.id().equals(id));
          collections.write(ACCOUNTS, accounts);
          return null;
        });
  }

  public StoredTransaction createTransaction(
      String description,
      double amount,
      TransactionType type,
      String date,
      String accountName,
      String categoryName,
      String rawProjectId) {
    return locked(
        () -> {
          String projectId = isNullOrEmpty(rawProjectId) ? null : rawProjectId;
          List<StoredCategory> categories = collections.read(CATEGORIES);
          List<StoredProject> projects = collections.read(PROJECTS);
          List<StoredTransaction> transactions = collections.read(TRANSACTIONS);
          List<StoredAccount> accounts = syncAccounts(collections.read(ACCOUNTS), transactions);

          if (projectId != null && projects.stream().noneMatch(project -> project.id().equals(projectId))) {
            throw new StoreException("Project not found", 400);
          }

          StoredCategory category =
              categories.stream()
                  .filter(item -> item.name().equals(categoryName))
                  .findFirst()
                  .orElseThrow(() -> new StoreException("Selecione uma Category cadastrada.", 400));

          if (accounts.stream().noneMatch(account -> account.name().equals(accountName))) {
            throw new StoreException("Selecione uma conta cadastrada.", 400);
          }

          StoredTransaction transaction =
              new StoredTransaction(
                  newId(), description, amount, type, date, accountName, category.id(), projectId);
          transactions.add(transaction);
          collections.write(TRANSACTIONS, transactions);
          return transaction;
        });
  }

  public void deleteTransaction(String id) {
    locked(
        () -> {
          List<StoredTransaction> transactions = collections.read(TRANSACTIONS);
          if (!transactions.removeIf(transaction -> transaction.id().equals(id))) {
            throw new StoreException("Transaction not found", 404);
          }
          collections.write(TRANSACTIONS, transactions);
          return null;
        });
  }

  public String today() {
    return LocalDate.now(clock).toString();
  }

  private List<StoredAccount> syncAccounts(
      List<StoredAccount> accounts, List<StoredTransaction> transactions) {
    Set<String> known = accounts.stream().map(StoredAccount::name).collect(Collectors.toSet());
    Set<String> missing = new LinkedHashSet<>();
    for (StoredTransaction transaction : transactions) {
      String name = transaction.account();
      if (!name.isEmpty() && !known.contains(name)) missing.add(name);
    }

    if (missing.isEmpty()) return accounts;

    List<StoredAccount> next = new ArrayList<>(accounts);
    missing.forEach(name -> next.add(new StoredAccount(newId(), name)));
    collections.write(ACCOUNTS, next);
    return next;
  }

  private <T> Comparator<T> byName(Function<T, String> name) {
    return (left, right) -> collator.compare(name.apply(left), name.apply(right));
  }

  private static String newId() {
    return UUID.randomUUID().toString();
  }

  private static boolean isNullOrEmpty(String value) {
    return value == null || value.isEmpty();
  }

  private <T> T locked(Supplier<T> task) {
    lock.lock();
    try {
      return task.get();
    } finally {
      lock.unlock();
    }
  }
}
