package com.finance.api.modules.categories;

import com.finance.api.store.MarkdownStore;
import com.finance.api.store.model.StoredCategory;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

  private final MarkdownStore store;

  public CategoryService(MarkdownStore store) {
    this.store = store;
  }

  public List<StoredCategory> list() {
    return store.listCategories();
  }

  public StoredCategory create(CreateCategoryRequest request) {
    return store.createCategory(request.name(), request.color());
  }

  public void delete(String id) {
    store.deleteCategory(id);
  }
}
