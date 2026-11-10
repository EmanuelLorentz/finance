package com.finance.api.modules.projects;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.finance.api.store.model.StoredProject;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProjectResponse(
    String id,
    String name,
    String description,
    Double budget,
    String deadline,
    boolean impactsBalance,
    String color,
    String createdAt) {

  public static ProjectResponse from(StoredProject project) {
    return new ProjectResponse(
        project.id(),
        project.name(),
        project.description(),
        project.budget(),
        project.deadline(),
        project.impactsBalance(),
        project.color(),
        project.createdAt());
  }
}
