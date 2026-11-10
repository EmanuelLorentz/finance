package com.finance.api.web;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.finance.api.store.StoreException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** Client errors answer {@code {message}}; the web app shows that message to the user. */
@RestControllerAdvice
public class ApiExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(StoreException.class)
  public ResponseEntity<Map<String, Object>> store(StoreException error) {
    if (error.statusCode() >= 500) {
      log.error("Erro no armazenamento", error);
      return detailed(HttpStatus.valueOf(error.statusCode()), error.getMessage());
    }
    return message(HttpStatus.valueOf(error.statusCode()), error.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> invalidBody(MethodArgumentNotValidException error) {
    String text =
        error.getBindingResult().getFieldErrors().stream()
            .sorted(Comparator.comparing(FieldError::getField))
            .map(FieldError::getDefaultMessage)
            .distinct()
            .collect(Collectors.joining(" "));
    return message(HttpStatus.BAD_REQUEST, text.isEmpty() ? "Dados inválidos." : text);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> unreadableBody(HttpMessageNotReadableException error) {
    if (error.getCause() instanceof JsonMappingException mapping && !mapping.getPath().isEmpty()) {
      String field = mapping.getPath().get(mapping.getPath().size() - 1).getFieldName();
      if (field != null) return message(HttpStatus.BAD_REQUEST, "Valor inválido no campo " + field + ".");
    }
    return message(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido.");
  }

  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  public ResponseEntity<Map<String, Object>> unsupportedMediaType(HttpMediaTypeNotSupportedException error) {
    return detailed(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported Media Type: " + error.getContentType());
  }

  @ExceptionHandler({
    NoHandlerFoundException.class,
    NoResourceFoundException.class,
    HttpRequestMethodNotSupportedException.class
  })
  public ResponseEntity<Map<String, Object>> notFound(HttpServletRequest request) {
    return detailed(
        HttpStatus.NOT_FOUND, "Route " + request.getMethod() + ":" + request.getRequestURI() + " not found");
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> unexpected(Exception error) {
    log.error("Erro inesperado", error);
    return detailed(HttpStatus.INTERNAL_SERVER_ERROR, error.getMessage());
  }

  private static ResponseEntity<Map<String, Object>> message(HttpStatus status, String text) {
    return ResponseEntity.status(status).body(Map.of("message", text));
  }

  private static ResponseEntity<Map<String, Object>> detailed(HttpStatus status, String text) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("statusCode", status.value());
    body.put("error", status.getReasonPhrase());
    body.put("message", text == null ? status.getReasonPhrase() : text);
    return ResponseEntity.status(status).body(body);
  }
}
