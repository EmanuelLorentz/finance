package com.finance.api.modules.projects;

import com.finance.api.modules.transactions.TransactionPresenter;
import com.finance.api.modules.transactions.TransactionResponse;
import com.finance.api.store.MarkdownStore;
import com.finance.api.store.StoreException;
import com.finance.api.store.model.StoredCategory;
import com.finance.api.store.model.StoredProject;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

  private final MarkdownStore store;

  public ProjectService(MarkdownStore store) {
    this.store = store;
  }

  public List<ProjectResponse> list() {
    return store.listProjects().stream().map(ProjectResponse::from).toList();
  }

  public ProjectResponse get(String id) {
    return ProjectResponse.from(find(id));
  }

  public ProjectResponse create(CreateProjectRequest request) {
    StoredProject project =
        store.createProject(
            request.name(),
            request.description(),
            request.budget(),
            request.deadline(),
            request.impactsBalance(),
            request.color());
    return ProjectResponse.from(project);
  }

  public List<TransactionResponse> transactions(String id) {
    find(id);
    List<StoredCategory> categories = store.listCategories();
    return store.listTransactions(id).stream()
        .map(transaction -> TransactionPresenter.present(transaction, categories))
        .toList();
  }

  private StoredProject find(String id) {
    return store.getProject(id).orElseThrow(() -> new StoreException("Project not found", 404));
  }
}
