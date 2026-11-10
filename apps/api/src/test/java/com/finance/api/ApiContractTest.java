package com.finance.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class ApiContractTest {

  private static final Path DATA_DIR = createDataDir();

  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;

  @TestConfiguration
  static class FixedClock {
    @Bean
    @Primary
    Clock fixedClock() {
      return Clock.fixed(Instant.parse("2026-11-04T15:00:00Z"), ZoneId.of("America/Sao_Paulo"));
    }
  }

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry registry) {
    registry.add("finance.data-dir", DATA_DIR::toString);
    registry.add("finance.web-origin", () -> "http://localhost:5173");
  }

  private static Path createDataDir() {
    try {
      return Files.createTempDirectory("finance-api-test");
    } catch (IOException error) {
      throw new UncheckedIOException(error);
    }
  }

  @BeforeEach
  void clearData() throws IOException {
    try (Stream<Path> files = Files.list(DATA_DIR)) {
      for (Path file : files.toList()) Files.delete(file);
    }
  }

  @Test
  void health() throws Exception {
    mvc.perform(get("/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ok"));
  }

  @Test
  void emptyDashboardKeepsNullPercentages() throws Exception {
    mvc.perform(get("/dashboard"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.summary.totalBalance").value(0))
        .andExpect(jsonPath("$.summary", hasKey("balanceChangePercent")))
        .andExpect(jsonPath("$.summary.balanceChangePercent").value(nullValue()))
        .andExpect(jsonPath("$.balanceHistory", hasSize(0)))
        .andExpect(jsonPath("$.indicators", hasSize(0)));

    assertFileExists("transactions.md");
    assertFileExists("upcoming-payments.md");
  }

  @Test
  void categoriesAreCreatedSortedAndProtected() throws Exception {
    postJson("/categories", "{\"name\":\"  Mercado \",\"color\":\"#f87171\"}")
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Mercado"));
    postJson("/categories", "{\"name\":\"Alimentação\",\"color\":\"#4ade80\"}").andExpect(status().isCreated());
    postJson("/categories", "{\"name\":\"Mercado\",\"color\":\"#000\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Já existe uma Category com esse nome."));

    mvc.perform(get("/categories"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[*].name", contains("Alimentação", "Mercado")));

    mvc.perform(delete("/categories/missing"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Category not found"));
  }

  @Test
  void transactionLifecycle() throws Exception {
    postJson("/categories", "{\"name\":\"Salário\",\"color\":\"#4ade80\"}").andExpect(status().isCreated());
    String accountId = id(postJson("/accounts", "{\"name\":\"Nubank\"}").andExpect(status().isCreated()));

    String body =
        "{\"description\":\"Salário\",\"amount\":8500.5,\"type\":\"income\",\"category\":\"Salário\","
            + "\"date\":\"2026-11-02\",\"account\":\"Nubank\",\"extra\":true}";
    String transactionId =
        id(
            postJson("/transactions", body)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("Salário"))
                .andExpect(jsonPath("$.amount").value(8500.5))
                .andExpect(jsonPath("$", not(hasKey("projectId")))));

    mvc.perform(get("/transactions")).andExpect(jsonPath("$", hasSize(1)));

    String categoryId =
        json.readTree(mvc.perform(get("/categories")).andReturn().getResponse().getContentAsString())
            .get(0)
            .get("id")
            .asText();
    mvc.perform(delete("/categories/" + categoryId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Essa Category está em uma Transaction e não pode ser excluída."));
    mvc.perform(delete("/accounts/" + accountId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Essa conta está em uma Transaction e não pode ser excluída."));

    mvc.perform(get("/dashboard"))
        .andExpect(jsonPath("$.summary.monthlyIncome").value(8500.5))
        .andExpect(jsonPath("$.monthlyComparison[0].month").value("nov"))
        .andExpect(jsonPath("$.recentTransactions", hasSize(1)));

    mvc.perform(delete("/transactions/" + transactionId)).andExpect(status().isNoContent());
    mvc.perform(delete("/transactions/" + transactionId))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Transaction not found"));

    String stored = Files.readString(DATA_DIR.resolve("transactions.md"), StandardCharsets.UTF_8);
    assertThat(stored).contains("```yaml\n[]\n```");
  }

  @Test
  void transactionRequiresRegisteredCategoryAndAccount() throws Exception {
    String body =
        "{\"description\":\"Mercado\",\"amount\":10,\"type\":\"expense\",\"category\":\"Nada\","
            + "\"date\":\"2026-11-02\",\"account\":\"Nubank\"}";
    postJson("/transactions", body)
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Selecione uma Category cadastrada."));

    postJson("/transactions", body.replace("\"amount\":10", "\"amount\":10,\"projectId\":\"x\""))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Project not found"));
  }

  @Test
  void invalidPayloadsAnswerBadRequestWithMessage() throws Exception {
    postJson(
            "/transactions",
            "{\"description\":\"X\",\"amount\":-1,\"type\":\"expense\",\"category\":\"A\","
                + "\"date\":\"2026-11-02\",\"account\":\"B\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("O valor não pode ser negativo."));
    postJson(
            "/transactions",
            "{\"description\":\"X\",\"amount\":\"10\",\"type\":\"expense\",\"category\":\"A\","
                + "\"date\":\"2026-11-02\",\"account\":\"B\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Valor inválido no campo amount."));
    postJson(
            "/transactions",
            "{\"description\":\"X\",\"amount\":1,\"type\":\"other\",\"category\":\"A\","
                + "\"date\":\"02/11/2026\",\"account\":\"B\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Valor inválido no campo type."));
    postJson("/accounts", "{\"name\":\"   \"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Informe o nome da conta."));
    postJson("/projects", "not json").andExpect(status().isBadRequest());
  }

  @Test
  void projects() throws Exception {
    String projectId =
        id(
            postJson("/projects", "{\"name\":\"Casa\",\"impactsBalance\":false,\"color\":\"#60a5fa\",\"budget\":12000}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdAt").value("2026-11-04"))
                .andExpect(jsonPath("$.budget").value(12000))
                .andExpect(jsonPath("$", not(hasKey("description"))))
                .andExpect(jsonPath("$", not(hasKey("deadline")))));

    mvc.perform(get("/projects")).andExpect(jsonPath("$", hasSize(1)));
    mvc.perform(get("/projects/" + projectId)).andExpect(jsonPath("$.name").value("Casa"));
    mvc.perform(get("/projects/" + projectId + "/transactions")).andExpect(jsonPath("$", hasSize(0)));
    mvc.perform(get("/projects/missing"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Project not found"));
    mvc.perform(get("/projects/missing/transactions")).andExpect(status().isNotFound());

    String stored = Files.readString(DATA_DIR.resolve("projects.md"), StandardCharsets.UTF_8);
    assertThat(stored)
        .contains("  budget: 12000\n  impactsBalance: false\n  color: \"#60a5fa\"\n  createdAt: 2026-11-04\n");
  }

  @Test
  void upcomingPaymentsKeepIsPaidKey() throws Exception {
    Files.writeString(
        DATA_DIR.resolve("upcoming-payments.md"),
        "```yaml\n- id: p1\n  description: Aluguel\n  amount: 2200\n  dueDate: 2026-11-05\n"
            + "  category: Moradia\n  isPaid: false\n- id: p2\n  description: Pago\n  amount: 1\n"
            + "  dueDate: 2026-11-01\n  category: Moradia\n  isPaid: true\n```\n");

    mvc.perform(get("/dashboard"))
        .andExpect(jsonPath("$.upcomingPayments", hasSize(1)))
        .andExpect(jsonPath("$.upcomingPayments[0].isPaid").value(false));
  }

  @Test
  void unknownRoutesAnswerNotFound() throws Exception {
    mvc.perform(get("/nothing"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Route GET:/nothing not found"));
    mvc.perform(delete("/projects/abc")).andExpect(status().isNotFound());
  }

  @Test
  void corsAllowsWebOrigin() throws Exception {
    mvc.perform(
            options("/transactions")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "DELETE"))
        .andExpect(status().isOk())
        .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
  }

  private ResultActions postJson(String path, String body) throws Exception {
    return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(body));
  }

  private String id(ResultActions result) throws Exception {
    JsonNode node = json.readTree(result.andReturn().getResponse().getContentAsString());
    return node.get("id").asText();
  }

  private static void assertFileExists(String name) {
    assertThat(DATA_DIR.resolve(name)).exists();
  }
}
