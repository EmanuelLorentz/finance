package com.finance.api.store.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StoredProject(
    @NotEmpty String id,
    @NotEmpty String name,
    String description,
    @PositiveOrZero Double budget,
    @Pattern(regexp = DateOnly.PATTERN) String deadline,
    @NotNull Boolean impactsBalance,
    @NotEmpty String color,
    @NotNull @Pattern(regexp = DateOnly.PATTERN) String createdAt) {}
