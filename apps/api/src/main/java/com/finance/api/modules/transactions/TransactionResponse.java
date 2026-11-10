package com.finance.api.modules.transactions;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.finance.api.store.model.TransactionType;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransactionResponse(
    String id,
    String description,
    double amount,
    TransactionType type,
    String category,
    String date,
    String account,
    String projectId) {}
