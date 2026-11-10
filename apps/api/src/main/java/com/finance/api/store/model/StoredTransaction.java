package com.finance.api.store.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StoredTransaction(
    @NotEmpty String id,
    @NotEmpty String description,
    @NotNull @PositiveOrZero Double amount,
    @NotNull TransactionType type,
    @NotNull @Pattern(regexp = DateOnly.PATTERN) String date,
    @NotEmpty String account,
    @NotEmpty String categoryId,
    @Size(min = 1) String projectId) {}
