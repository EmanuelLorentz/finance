package com.finance.api.store;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.cfg.CoercionAction;
import com.fasterxml.jackson.databind.cfg.CoercionInputShape;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.databind.type.LogicalType;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import jakarta.validation.Validator;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.FileSystemException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Reads and writes one Markdown file per collection, each holding a single fenced YAML block. */
@Component
class MarkdownCollections {

  private static final Pattern YAML_FENCE = Pattern.compile("```ya?ml\\r?\\n([\\s\\S]*?)```");
  private static final TypeReference<LinkedHashMap<String, Object>> RECORD_MAP = new TypeReference<>() {};

  private final DataDirectory dataDirectory;
  private final Validator validator;
  private final ObjectMapper yaml;
  private final ObjectMapper records;

  MarkdownCollections(DataDirectory dataDirectory, Validator validator) {
    this.dataDirectory = dataDirectory;
    this.validator = validator;
    this.yaml = strict(YAMLMapper.builder(new YAMLFactory()));
    this.records = JsonMapper.builder().build();
  }

  private static ObjectMapper strict(YAMLMapper.Builder builder) {
    ObjectMapper mapper =
        builder
            .disable(MapperFeature.ALLOW_COERCION_OF_SCALARS)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
    mapper
        .coercionConfigFor(LogicalType.Textual)
        .setCoercion(CoercionInputShape.Integer, CoercionAction.Fail)
        .setCoercion(CoercionInputShape.Float, CoercionAction.Fail)
        .setCoercion(CoercionInputShape.Boolean, CoercionAction.Fail);
    return mapper;
  }

  <T> List<T> read(CollectionDefinition<T> definition) {
    Path file = pathOf(definition);
    createParent(file);

    String markdown;
    try {
      markdown = Files.readString(file, StandardCharsets.UTF_8);
    } catch (NoSuchFileException missing) {
      writeAtomic(file, render(definition, List.of()));
      return new ArrayList<>();
    } catch (IOException error) {
      throw new UncheckedIOException(error);
    }

    Matcher fenced = YAML_FENCE.matcher(markdown);
    if (!fenced.find()) {
      throw new StoreException("O arquivo " + definition.fileName() + " não tem um bloco YAML.", 500);
    }

    JsonNode parsed;
    try {
      parsed = yaml.readTree(fenced.group(1));
    } catch (IOException error) {
      throw new StoreException("YAML inválido em " + definition.fileName() + ".", 500);
    }

    if (parsed == null || parsed.isMissingNode() || parsed.isNull()) return new ArrayList<>();
    if (!parsed.isArray()) throw invalidData(definition);

    List<T> result = new ArrayList<>();
    for (JsonNode item : parsed) {
      T record;
      try {
        record = yaml.treeToValue(item, definition.type());
      } catch (JsonProcessingException | IllegalArgumentException error) {
        throw invalidData(definition);
      }
      if (record == null || !validator.validate(record).isEmpty()) throw invalidData(definition);
      result.add(record);
    }
    return result;
  }

  <T> void write(CollectionDefinition<T> definition, List<T> items) {
    Path file = pathOf(definition);
    createParent(file);
    writeAtomic(file, render(definition, items));
  }

  private <T> String render(CollectionDefinition<T> definition, List<T> items) {
    List<Map<String, Object>> maps = items.stream().<Map<String, Object>>map(item -> records.convertValue(item, RECORD_MAP)).toList();
    return "# "
        + definition.title()
        + "\n\n"
        + definition.description()
        + "\n\n```yaml\n"
        + YamlWriter.write(maps)
        + "\n```\n";
  }

  private Path pathOf(CollectionDefinition<?> definition) {
    return dataDirectory.path().resolve(definition.fileName());
  }

  private static StoreException invalidData(CollectionDefinition<?> definition) {
    return new StoreException("Dados inválidos em " + definition.fileName() + ".", 500);
  }

  private static void createParent(Path file) {
    try {
      Files.createDirectories(file.getParent());
    } catch (IOException error) {
      throw new UncheckedIOException(error);
    }
  }

  private static void writeAtomic(Path file, String contents) {
    Path temporary = file.resolveSibling(file.getFileName() + "." + ProcessHandle.current().pid() + ".tmp");
    try {
      Files.writeString(temporary, contents, StandardCharsets.UTF_8);
      try {
        Files.move(temporary, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
      } catch (AtomicMoveNotSupportedException unsupported) {
        Files.move(temporary, file, StandardCopyOption.REPLACE_EXISTING);
      } catch (FileSystemException locked) {
        // Windows refuses to replace a file another process holds open; retry without atomicity.
        Files.deleteIfExists(file);
        Files.move(temporary, file);
      }
    } catch (IOException error) {
      try {
        Files.deleteIfExists(temporary);
      } catch (IOException ignored) {
        // The original error is more useful than a cleanup failure.
      }
      throw new UncheckedIOException(error);
    }
  }
}
