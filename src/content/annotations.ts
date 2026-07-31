/**
 * annotations.ts
 * Type definitions for code annotation data.
 * Stub exports — filled in Task 08 (Batch B).
 */

/** Maps a 1-based line number to a Spanish explanation string. */
export interface AnnotationMap {
  [lineNumber: number]: string;
}

/** A single annotated code snippet shown in section 5. */
export interface CodeSnippet {
  /** Unique identifier used as the HTML element id. */
  id: string;
  /** Display title shown above the code block (Spanish). */
  title: string;
  /** PrismJS language identifier, e.g. "yaml", "bash", "jinja2". */
  language: string;
  /** Raw source code string (typically imported via ?raw). */
  code: string;
  /** Per-line annotations; keys are 1-based line numbers. */
  annotations: AnnotationMap;
}

/**
 * The list of annotated snippets rendered in section 5.
 * Populated in Batch B (Task 08).
 */
export const snippets: CodeSnippet[] = [];
