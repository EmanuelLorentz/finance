package com.finance.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "finance")
public record FinanceProperties(String webOrigin, String dataDir) {

  private static final String DEFAULT_WEB_ORIGIN = "http://localhost:5173";

  public FinanceProperties {
    webOrigin = unquote(webOrigin);
    if (webOrigin == null) webOrigin = DEFAULT_WEB_ORIGIN;
    dataDir = unquote(dataDir);
  }

  // .env files written for the Node API quote their values; the properties loader keeps the quotes.
  private static String unquote(String value) {
    if (value == null) return null;
    String trimmed = value.trim();
    if (trimmed.length() >= 2) {
      char first = trimmed.charAt(0);
      char last = trimmed.charAt(trimmed.length() - 1);
      if ((first == '"' || first == '\'') && first == last) {
        trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
      }
    }
    return trimmed.isEmpty() ? null : trimmed;
  }
}
