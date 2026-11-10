package com.finance.api.store;

public class StoreException extends RuntimeException {

  private final int statusCode;

  public StoreException(String message, int statusCode) {
    super(message);
    this.statusCode = statusCode;
  }

  public int statusCode() {
    return statusCode;
  }
}
