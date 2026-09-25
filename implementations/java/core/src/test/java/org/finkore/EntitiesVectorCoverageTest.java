// SPDX-License-Identifier: MPL-2.0
package org.finkore;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** Executes Entity conformance vectors directly against the Java core API. */
final class EntitiesVectorCoverageTest {
  private static final List<Path> VECTOR_FILES = List.of(
      Path.of("conformance/entities/behavior.json"),
      Path.of("conformance/entities/evolution.json"),
      Path.of("conformance/entities/import.json"),
      Path.of("conformance/entities/readiness-regressions.json"));

  @Test
  void nativeEvolutionRegressions() throws IOException {
    EntityEvolutionTest.main(new String[0]);
    ReadinessRegressionTest.entities();
    BoundaryRegressionTest.main(new String[]{"entity."});
  }

  @Test
  void entityVectorsExecuteAgainstCoreImplementation() throws IOException {
    Path repositoryRoot = Path.of("../../..").toAbsolutePath().normalize();
    int executed = 0;
    for (Path vectorFile : VECTOR_FILES) {
      @SuppressWarnings("unchecked")
      Map<String, Object> document = (Map<String, Object>) Json.parse(Files.readString(repositoryRoot.resolve(vectorFile)));
      for (Object vectorObject : list(document.get("vectors"))) {
        @SuppressWarnings("unchecked")
        Map<String, Object> vector = (Map<String, Object>) vectorObject;
        assertEquals(vector.get("expected"), execute(vector), (String) vector.get("id"));
        executed += 1;
      }
    }
    assertTrue(executed > 0, "Entity vectors must be discovered");
  }

  private static Map<String, Object> execute(Map<String, Object> vector) {
    @SuppressWarnings("unchecked")
    Map<String, Object> input = (Map<String, Object>) vector.get("input");
    String operation = (String) vector.get("operation");
    try {
      return switch (operation) {
        case "finkore.entity.create" -> success(Entities.create(
            input.get("definition"),
            input.get("id"),
            input.get("data")), null);
        case "finkore.entity.mutate" -> {
          Map<String, Object> result = Entities.mutate(input.get("definition"), input.get("entity"), input.get("changes"));
          yield success(result, Map.of("identity", result.get("id"), "state", result.get("state")));
        }
        case "finkore.entity.transition" -> {
          Map<String, Object> result = Entities.transition(input.get("definition"), input.get("entity"), input.get("target"));
          yield success(result, Map.of("identity", result.get("id")));
        }
        case "entity.import" -> success(Entities.importEntity(input.get("definition"), input.get("import")), null);
        case "finkore.entity.evolution.correct" -> executeEntityEvolution("CORRECTION", input);
        case "finkore.entity.evolution.reverse" -> executeEntityEvolution("REVERSAL", input);
        case "finkore.entity.evolution.supersede" -> executeEntityEvolution("SUPERSESSION", input);
        case "finkore.entity.evolution.void" -> executeEntityEvolution("VOID", input);
        default -> throw new IllegalArgumentException(operation);
      };
    } catch (FinKoreException error) {
      return error(error.code(), observationsFor(operation, input));
    }
  }

  private static Map<String, Object> observationsFor(String operation, Map<String, Object> input) {
    if ("finkore.entity.mutate".equals(operation)) {
      Map<String, Object> observations = entityObservation(input.get("entity"));
      if (observations != null) {
        List<Map<String, Object>> findings = Entities.validationFindingsForMutation(
            input.get("definition"),
            input.get("entity"),
            input.get("changes"));
        if (!findings.isEmpty()) {
          observations.put("findings", findings);
        }
      }
      return observations;
    }
    if ("finkore.entity.transition".equals(operation)) {
      return entityObservation(input.get("entity"));
    }
    if ("entity.import".equals(operation) && input.get("import") instanceof Map<?, ?> imported) {
      return entityObservation(imported.get("entity"));
    }
    if (operation.startsWith("finkore.entity.evolution.")) {
      return Entities.evolutionObservation(input, true);
    }
    return null;
  }

  private static Map<String, Object> entityObservation(Object entity) {
    if (entity instanceof Map<?, ?>) {
      Map<String, Object> observations = new LinkedHashMap<>();
      observations.put("entity", entity);
      return observations;
    }
    return null;
  }

  private static Map<String, Object> executeEntityEvolution(String kind, Map<String, Object> input) {
    Map<String, Object> observations = new LinkedHashMap<>();
    observations.put("auditHistory", Entities.evolutionObservation(input, true).get("auditHistory"));
    Map<String, Object> request = new LinkedHashMap<>(input);
    Object history = input.get("evolutionHistory");
    request.put("evolutionHistory", history instanceof List<?> ? Map.of("relations", history) : history);
    try {
      observations.put("evolutionHistory", Entities.importEvolutionHistory(request.get("evolutionHistory")));
      Map<String, Object> imported = new LinkedHashMap<>(); imported.put("entity", input.get("source"));
      observations.put("source", Entities.importEntity(input.get("definition"), imported).get("entity"));
      if (!"VOID".equals(kind)) {
        imported.put("entity", input.get("SUPERSESSION".equals(kind) ? "successor" : "related"));
        observations.put("related", Entities.importEntity(input.get("definition"), imported).get("entity"));
      }
      return success(Entities.evolve(kind, input.get("definition"), request), Entities.evolutionObservation(input, !"CORRECTION".equals(kind)));
    } catch (FinKoreException failure) {
      return error(failure.code(), observations);
    }
  }

  private static Map<String, Object> success(Object value, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "success");
    result.put("value", value);
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private static Map<String, Object> error(String code, Map<String, Object> observations) {
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("status", "error");
    result.put("error", Map.of("code", code));
    if (observations != null) {
      result.put("observations", observations);
    }
    return result;
  }

  private static List<?> list(Object value) {
    return (List<?>) value;
  }
}
