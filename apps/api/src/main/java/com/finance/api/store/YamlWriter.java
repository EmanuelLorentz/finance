package com.finance.api.store;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Writes flat records as a YAML 1.2 block sequence. The text must stay identical to the existing
 * files in data/: plain scalars whenever YAML 1.2 allows them, integers without decimals and no
 * document marker.
 */
final class YamlWriter {

  private static final Pattern CORE_SCHEMA_NON_STRING =
      Pattern.compile(
          "~|null|Null|NULL|true|True|TRUE|false|False|FALSE"
              + "|[-+]?(\\.[0-9]+|[0-9]+(\\.[0-9]*)?)([eE][-+]?[0-9]+)?"
              + "|0o[0-7]+|0x[0-9a-fA-F]+"
              + "|[-+]?\\.(inf|Inf|INF)|\\.(nan|NaN|NAN)");

  private static final String INDICATORS = "?:,[]{}#&*!|>'\"%@`";

  private YamlWriter() {}

  static String write(List<Map<String, Object>> records) {
    if (records.isEmpty()) return "[]";

    StringBuilder yaml = new StringBuilder();
    for (Map<String, Object> record : records) {
      if (yaml.length() > 0) yaml.append('\n');
      if (record.isEmpty()) {
        yaml.append("- {}");
        continue;
      }

      boolean first = true;
      for (Map.Entry<String, Object> entry : record.entrySet()) {
        if (entry.getValue() == null) continue;
        if (!first) yaml.append('\n');
        yaml.append(first ? "- " : "  ")
            .append(scalar(entry.getKey()))
            .append(": ")
            .append(value(entry.getValue()));
        first = false;
      }
    }
    return yaml.toString();
  }

  private static String value(Object value) {
    if (value instanceof Boolean bool) return bool.toString();
    if (value instanceof Number number) return number(number);
    return scalar(value.toString());
  }

  private static String number(Number number) {
    if (number instanceof Double || number instanceof Float) {
      double value = number.doubleValue();
      if (Double.isNaN(value)) return ".nan";
      if (Double.isInfinite(value)) return value > 0 ? ".inf" : "-.inf";
      if (value == 0) return "0";
      return BigDecimal.valueOf(value).stripTrailingZeros().toPlainString();
    }
    return number.toString();
  }

  static String scalar(String value) {
    return needsQuotes(value) ? doubleQuoted(value) : value;
  }

  private static boolean needsQuotes(String value) {
    if (value.isEmpty()) return true;
    if (!value.equals(value.strip())) return true;
    if (CORE_SCHEMA_NON_STRING.matcher(value).matches()) return true;
    if (value.startsWith("---") || value.startsWith("...")) return true;

    char first = value.charAt(0);
    if (INDICATORS.indexOf(first) >= 0) return true;
    if (first == '-' && (value.length() == 1 || value.charAt(1) == ' ')) return true;
    if (value.contains(": ") || value.contains(" #") || value.endsWith(":")) return true;

    for (int index = 0; index < value.length(); index += 1) {
      char character = value.charAt(index);
      if (character < 0x20 || character == 0x7f || character == '\u2028' || character == '\u2029') {
        return true;
      }
    }
    return false;
  }

  private static String doubleQuoted(String value) {
    StringBuilder quoted = new StringBuilder("\"");
    for (int index = 0; index < value.length(); index += 1) {
      char character = value.charAt(index);
      switch (character) {
        case '"' -> quoted.append("\\\"");
        case '\\' -> quoted.append("\\\\");
        case '\n' -> quoted.append("\\n");
        case '\r' -> quoted.append("\\r");
        case '\t' -> quoted.append("\\t");
        default -> {
          if (character < 0x20 || character == 0x7f || character == '\u2028' || character == '\u2029') {
            quoted.append(String.format("\\u%04x", (int) character));
          } else {
            quoted.append(character);
          }
        }
      }
    }
    return quoted.append('"').toString();
  }
}
