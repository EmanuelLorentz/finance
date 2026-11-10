package com.finance.api.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.finance.api.config.FinanceProperties;
import com.finance.api.store.model.StoredProject;
import com.finance.api.store.model.StoredTransaction;
import com.finance.api.store.model.StoredUpcomingPayment;
import jakarta.validation.Validation;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class MarkdownCollectionsTest {

  @TempDir Path dataDir;

  private MarkdownCollections collections;

  @BeforeEach
  void setUp() {
    DataDirectory directory = new DataDirectory(new FinanceProperties(null, dataDir.toString()));
    collections =
        new MarkdownCollections(directory, Validation.buildDefaultValidatorFactory().getValidator());
  }

  @Test
  void createsMissingFileWithEmptyList() throws IOException {
    assertThat(collections.read(CollectionDefinition.GOALS)).isEmpty();
    assertThat(Files.readString(dataDir.resolve("goals.md")))
        .isEqualTo("# Goals\n\nGoals financeiros. Edite apenas o bloco YAML.\n\n```yaml\n[]\n```\n");
  }

  @Test
  void rewritesExistingFilesWithTheSameText() throws IOException {
    String projects =
        """
        # Projects

        Projects acompanhados na aplicação. Edite apenas o bloco YAML.

        ```yaml
        - id: project-house
          name: Casa
          description: Reserva da reforma
          budget: 12000
          deadline: 2026-12-31
          impactsBalance: true
          color: "#60a5fa"
          createdAt: 2026-10-13
        ```
        """;
    String transactions =
        """
        # Transactions

        Transactions de income, expense e transfer. Edite apenas o bloco YAML.

        ```yaml
        - id: 6d15fa14-7d6d-4e96-9de4-8bdb10de7e91
          description: "Salário: outubro"
          amount: 8500.5
          type: income
          date: 2026-10-05
          account: Nubank - Emanuel
          categoryId: "123"
        - id: tx-2
          description: Mercado
          amount: 0.1
          type: expense
          date: 2026-10-06
          account: Nubank
          categoryId: cat-food
          projectId: project-house
        ```
        """;
    Files.writeString(dataDir.resolve("projects.md"), projects, StandardCharsets.UTF_8);
    Files.writeString(dataDir.resolve("transactions.md"), transactions, StandardCharsets.UTF_8);

    List<StoredProject> readProjects = collections.read(CollectionDefinition.PROJECTS);
    List<StoredTransaction> readTransactions = collections.read(CollectionDefinition.TRANSACTIONS);
    collections.write(CollectionDefinition.PROJECTS, readProjects);
    collections.write(CollectionDefinition.TRANSACTIONS, readTransactions);

    assertThat(readTransactions.get(0).categoryId()).isEqualTo("123");
    assertThat(Files.readString(dataDir.resolve("projects.md"))).isEqualTo(projects);
    assertThat(Files.readString(dataDir.resolve("transactions.md"))).isEqualTo(transactions);
  }

  @Test
  void readsIsPaidFlag() throws IOException {
    Files.writeString(
        dataDir.resolve("upcoming-payments.md"),
        "```yaml\n- id: p\n  description: Aluguel\n  amount: 2200\n  dueDate: 2026-11-05\n"
            + "  category: Moradia\n  isPaid: false\n```\n");

    List<StoredUpcomingPayment> payments = collections.read(CollectionDefinition.UPCOMING_PAYMENTS);

    assertThat(payments).singleElement().satisfies(payment -> assertThat(payment.isPaid()).isFalse());
  }

  @Test
  void rejectsFileWithoutYamlBlock() throws IOException {
    Files.writeString(dataDir.resolve("categories.md"), "# Categories\n");

    assertThatThrownBy(() -> collections.read(CollectionDefinition.CATEGORIES))
        .isInstanceOf(StoreException.class)
        .hasMessage("O arquivo categories.md não tem um bloco YAML.");
  }

  @Test
  void rejectsInvalidRecords() throws IOException {
    Files.writeString(
        dataDir.resolve("categories.md"), "```yaml\n- id: cat\n  name: \"\"\n  color: \"#fff\"\n```\n");

    assertThatThrownBy(() -> collections.read(CollectionDefinition.CATEGORIES))
        .isInstanceOf(StoreException.class)
        .hasMessage("Dados inválidos em categories.md.");
  }

  @Test
  void rejectsNumbersWhereTextIsExpected() throws IOException {
    Files.writeString(dataDir.resolve("accounts.md"), "```yaml\n- id: 123\n  name: Nubank\n```\n");

    assertThatThrownBy(() -> collections.read(CollectionDefinition.ACCOUNTS))
        .isInstanceOf(StoreException.class)
        .hasMessage("Dados inválidos em accounts.md.");
  }
}
