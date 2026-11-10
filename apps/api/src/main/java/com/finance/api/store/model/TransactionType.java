package com.finance.api.store.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TransactionType {
  INCOME("income"),
  EXPENSE("expense"),
  TRANSFER("transfer");

  private final String value;

  TransactionType(String value) {
    this.value = value;
  }

  @JsonValue
  public String value() {
    return value;
  }
}
