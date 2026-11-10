package com.finance.api.store.model;

import jakarta.validation.constraints.NotEmpty;

public record StoredAccount(@NotEmpty String id, @NotEmpty String name) {}
