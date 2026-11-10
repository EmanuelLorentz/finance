package com.finance.api.store.model;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record StoredGoal(
    @NotEmpty String id,
    @NotEmpty String name,
    @NotNull @PositiveOrZero Double targetAmount,
    @NotNull @PositiveOrZero Double currentAmount,
    @NotNull @Pattern(regexp = DateOnly.PATTERN) String deadline,
    @NotEmpty String category) {}
