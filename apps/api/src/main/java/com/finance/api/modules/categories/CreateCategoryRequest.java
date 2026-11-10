package com.finance.api.modules.categories;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record CreateCategoryRequest(
    @NotBlank(message = "Informe o nome da Category.") String name,
    @NotEmpty(message = "Selecione uma cor.") String color) {}
