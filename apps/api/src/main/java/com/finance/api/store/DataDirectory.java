package com.finance.api.store;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.api.config.FinanceProperties;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/** Locates the {@code data/} folder at the root of the npm workspace, unless DATA_DIR is set. */
@Component
public class DataDirectory {

  private static final int MAX_DEPTH = 8;

  private final FinanceProperties properties;
  private final ObjectMapper json = new ObjectMapper();
  private volatile Path resolved;

  public DataDirectory(FinanceProperties properties) {
    this.properties = properties;
  }

  public Path path() {
    Path current = resolved;
    if (current != null) return current;

    if (properties.dataDir() != null) {
      current = Paths.get(properties.dataDir()).toAbsolutePath().normalize();
    } else {
      current = findWorkspaceRoot().resolve("data");
    }
    resolved = current;
    return current;
  }

  private Path findWorkspaceRoot() {
    for (Path start : searchStarts()) {
      Path current = start;
      for (int depth = 0; depth < MAX_DEPTH && current != null; depth += 1) {
        if (isWorkspaceRoot(current.resolve("package.json"))) return current;
        current = current.getParent();
      }
    }
    throw new StoreException("Não foi possível localizar a pasta data/ na raiz do repositório.", 500);
  }

  private List<Path> searchStarts() {
    List<Path> starts = new ArrayList<>();
    starts.add(Paths.get(System.getProperty("user.dir")).toAbsolutePath());
    try {
      Path codeSource =
          Paths.get(DataDirectory.class.getProtectionDomain().getCodeSource().getLocation().toURI());
      starts.add(codeSource.toAbsolutePath());
    } catch (URISyntaxException | RuntimeException ignored) {
      // The working directory is enough when the code source cannot be resolved.
    }
    return starts;
  }

  private boolean isWorkspaceRoot(Path packageJson) {
    if (!Files.isRegularFile(packageJson)) return false;
    try {
      JsonNode workspaces = json.readTree(packageJson.toFile()).get("workspaces");
      return workspaces != null && !workspaces.isNull();
    } catch (IOException error) {
      return false;
    }
  }
}
