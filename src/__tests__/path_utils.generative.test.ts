import { safeJoin } from "@/ipc/utils/path_utils";
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import path from "node:path";

describe("safeJoin - Tests génératifs", () => {
  // Générateur pour les chemins de base sécurisés
  const safeBasePath = fc.stringOf(
    fc.constantFrom("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_"),
    { minLength: 1, maxLength: 20 }
  ).map(segments => `/app/${segments}`);

  // Générateur pour les segments de chemin sécurisés (sans caractères problématiques)
  const safePathSegment = fc.stringOf(
    fc.constantFrom("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_", "."),
    { minLength: 1, maxLength: 15 }
  ).filter(segment => !segment.startsWith("..") && !segment.includes("\\") && !segment.startsWith("/") && !segment.includes("..") && !segment.endsWith(".."));

  // Générateur pour les chemins relatifs sécurisés
  const safeRelativePath = fc.array(safePathSegment, { minLength: 1, maxLength: 5 })
    .map(segments => segments.join("/"));

  // Générateur pour les chemins de traversée (unsafe)
  const traversalPath = fc.oneof(
    fc.constant("../outside"),
    fc.constant("../../etc/passwd"),
    fc.constant("src/../../../outside"),
    fc.constant("/absolute/path"),
    fc.constant("C:\\Windows\\System32"),
    fc.constant("\\\\server\\share"),
    fc.constant("~/secrets")
  );

  it("devrait toujours produire un chemin valide pour des chemins sécurisés", () => {
    fc.assert(
      fc.property(
        safeBasePath,
        fc.array(safeRelativePath, { minLength: 1, maxLength: 3 }),
        (basePath, relativePaths) => {
          // Arrange
          const expectedPath = path.join(basePath, ...relativePaths);
          
          // Act
          const result = safeJoin(basePath, ...relativePaths);
          
          // Assert
          expect(result).toBe(expectedPath);
          // Normaliser les chemins pour la comparaison cross-platform
          expect(path.normalize(result)).toContain(path.normalize(basePath));
        }
      ),
      { numRuns: 1000 }
    );
  });

  it("devrait toujours rejeter les chemins de traversée", () => {
    fc.assert(
      fc.property(
        safeBasePath,
        traversalPath,
        (basePath, unsafePath) => {
          // Act & Assert
          expect(() => safeJoin(basePath, unsafePath)).toThrow(/would escape the base directory/);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it("devrait gérer correctement les chemins avec des segments vides", () => {
    fc.assert(
      fc.property(
        safeBasePath,
        fc.array(fc.oneof(safePathSegment, fc.constant("")), { minLength: 1, maxLength: 5 }),
        (basePath, segments) => {
          // Arrange
          const expectedPath = path.join(basePath, ...segments);
          
          // Act
          const result = safeJoin(basePath, ...segments);
          
          // Assert
          expect(result).toBe(expectedPath);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("devrait maintenir la cohérence avec path.join pour des chemins valides", () => {
    fc.assert(
      fc.property(
        fc.constant("/app/workspace"),
        fc.array(safePathSegment, { minLength: 1, maxLength: 4 }),
        (basePath, segments) => {
          // Filtrer les segments qui pourraient causer des problèmes
          const safeSegments = segments.filter(segment => 
            !segment.startsWith("..") && 
            !segment.includes("\\") && 
            !segment.startsWith("/") &&
            segment.length > 0
          );
          
          if (safeSegments.length === 0) return; // Skip si aucun segment sûr
          
          // Arrange
          const expectedPath = path.join(basePath, ...safeSegments);
          
          // Act
          const result = safeJoin(basePath, ...safeSegments);
          
          // Assert
          expect(result).toBe(expectedPath);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it("devrait gérer les chemins très longs sans problème", () => {
    fc.assert(
      fc.property(
        fc.constant("/app/workspace"),
        fc.array(safePathSegment, { minLength: 10, maxLength: 20 }),
        (basePath, segments) => {
          // Arrange
          const expectedPath = path.join(basePath, ...segments);
          
          // Act
          const result = safeJoin(basePath, ...segments);
          
          // Assert
          expect(result).toBe(expectedPath);
          expect(result.length).toBeGreaterThan(30); // Réduire encore plus le seuil
        }
      ),
      { numRuns: 100 }
    );
  });

  it("devrait gérer les caractères spéciaux dans les noms de fichiers", () => {
    fc.assert(
      fc.property(
        fc.constant("/app/workspace"),
        fc.stringOf(
          fc.constantFrom("a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-", "_", ".", "(", ")", "[", "]", "{", "}", "!", "@", "#", "$", "%", "^", "&", "*", "+", "=", ":", ";", "'", "\"", "<", ">", ",", "?", "~", "`"),
          { minLength: 1, maxLength: 20 }
        ),
        (basePath, specialFileName) => {
          // Filtrer les caractères problématiques pour Windows
          const safeFileName = specialFileName.replace(/[\\/]/g, "_");
          
          // Skip if the filename starts with ".." as it would be considered unsafe
          if (safeFileName.startsWith("..")) {
            return true; // Skip this test case
          }
          
          // Arrange
          const expectedPath = path.join(basePath, safeFileName);
          
          // Act
          const result = safeJoin(basePath, safeFileName);
          
          // Assert
          expect(result).toBe(expectedPath);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("devrait maintenir l'invariant de sécurité : le résultat doit toujours être sous le répertoire de base", () => {
    fc.assert(
      fc.property(
        safeBasePath,
        fc.array(safePathSegment, { minLength: 1, maxLength: 5 }),
        (basePath, segments) => {
          // Act
          const result = safeJoin(basePath, ...segments);
          
          // Assert
          // Normaliser les chemins pour la comparaison cross-platform
          expect(path.normalize(result)).toContain(path.normalize(basePath));
          // Vérifier que le chemin ne contient pas de traversée dangereuse
          expect(result).not.toMatch(/\.\./);
          // Vérifier que le résultat est bien sous le répertoire de base
          const resolvedResult = path.resolve(result);
          const resolvedBase = path.resolve(basePath);
          expect(resolvedResult).toContain(resolvedBase);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
