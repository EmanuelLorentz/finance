package com.finance.api.modules.transactions;

import com.finance.api.store.model.DateOnly;
import com.finance.api.store.model.TransactionType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateTransactionRequest(
    @NotEmpty(message = "Informe a descrição.") String description,
    @NotNull(message = "Informe o valor.") @PositiveOrZero(message = "O valor não pode ser negativo.")
        Double amount,
    @NotNull(message = "Informe o tipo da Transaction.") TransactionType type,
    @NotNull(message = "Selecione uma Category cadastrada.") String category,
    @NotNull(message = "Informe a data.")
        @Pattern(regexp = DateOnly.PATTERN, message = "A data deve estar no formato AAAA-MM-DD.")
        String date,
    @NotNull(message = "Selecione uma conta cadastrada.") String account,
    String projectId) {}
