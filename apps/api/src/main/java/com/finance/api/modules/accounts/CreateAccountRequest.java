package com.finance.api.modules.accounts;

import jakarta.validation.constraints.NotBlank;

public record CreateAccountRequest(@NotBlank(message = "Informe o nome da conta.") String name) {}
