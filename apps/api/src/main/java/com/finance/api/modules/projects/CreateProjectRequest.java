package com.finance.api.modules.projects;

import com.finance.api.store.model.DateOnly;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateProjectRequest(
    @NotEmpty(message = "Informe o nome do Project.") String name,
    String description,
    @PositiveOrZero(message = "O Budget não pode ser negativo.") Double budget,
    @Pattern(regexp = "(" + DateOnly.PATTERN + ")?", message = "O prazo deve estar no formato AAAA-MM-DD.")
        String deadline,
    @NotNull(message = "Informe se o Project impacta o Balance.") Boolean impactsBalance,
    @NotEmpty(message = "Selecione uma cor.") String color) {}
