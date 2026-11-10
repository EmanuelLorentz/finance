package com.finance.api.store;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class YamlWriterTest {

  @ParameterizedTest
  @CsvSource(
      delimiter = '|',
      value = {
        "Alimentação|Alimentação",
        "Nubank - Emanuel|Nubank - Emanuel",
        "2026-12-31|2026-12-31",
        "6d15fa14-7d6d-4e96-9de4-8bdb10de7e91|6d15fa14-7d6d-4e96-9de4-8bdb10de7e91",
        "#4ade80|\"#4ade80\"",
        "123|\"123\"",
        "1.5|\"1.5\"",
        "true|\"true\"",
        "null|\"null\"",
        "a: b|\"a: b\"",
        "- item|\"- item\"",
        "-item|-item",
      })
  void quotesOnlyWhenPlainScalarWouldChangeMeaning(String input, String expected) {
    assertThat(YamlWriter.scalar(input)).isEqualTo(expected);
  }

  @Test
  void escapesSpecialCharacters() {
    assertThat(YamlWriter.scalar("")).isEqualTo("\"\"");
    assertThat(YamlWriter.scalar(" leading")).isEqualTo("\" leading\"");
    assertThat(YamlWriter.scalar("linha\n\"dois\"")).isEqualTo("\"linha\\n\\\"dois\\\"\"");
  }
}
