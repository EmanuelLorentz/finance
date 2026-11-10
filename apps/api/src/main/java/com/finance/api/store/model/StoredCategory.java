package com.finance.api.store.model;

import jakarta.validation.constraints.NotEmpty;

public record StoredCategory(@NotEmpty String id, @NotEmpty String name, @NotEmpty String color) {}
