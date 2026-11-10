package com.finance.api.store.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record StoredUpcomingPayment(
    @NotEmpty String id,
    @NotEmpty String description,
    @NotNull @PositiveOrZero Double amount,
    @NotNull @Pattern(regexp = DateOnly.PATTERN) String dueDate,
    @NotEmpty String category,
    @JsonProperty("isPaid") @NotNull Boolean isPaid) {}
