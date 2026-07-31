/**
 * annotate.ts
 * Line-annotation engine for PrismJS-highlighted code blocks.
 *
 * annotateCodeBlock():
 *   Given a <pre><code> element already highlighted by PrismJS,
 *   splits the rendered HTML into individual lines, wraps each line
 *   that has an annotation in <span class="anno" data-annotation="…" tabindex="0">,
 *   and leaves unannotated lines as plain text spans.
 *
 * renderSnippets():
 *   Creates <pre><code> elements for each CodeSnippet, appends them to a
 *   container, and calls annotateCodeBlock on each one. Prism.highlightElement
 *   must be called after this (in main.ts integration, Task 09).
 */

import type { AnnotationMap, CodeSnippet } from '../content/annotations';

/**
 * Wraps each line of a PrismJS-highlighted <pre><code> element in a span.
 * Lines with a matching annotation get class "anno" + data-annotation + tabindex.
 * Call this AFTER Prism.highlightElement so the inner HTML is already tokenised.
 */
export function annotateCodeBlock(
  pre: HTMLElement,
  annotations: AnnotationMap
): void {
  const code = pre.querySelector('code');
  if (!code) return;

  // Split the rendered HTML on newlines to get per-line HTML fragments.
  // This preserves Prism token spans within each line.
  const rawHtml = code.innerHTML;
  const lines = rawHtml.split('\n');

  // Remove trailing empty entry produced by a final newline
  if (lines.at(-1) === '') lines.pop();

  const wrappedLines = lines.map((lineHtml, idx) => {
    const lineNum = idx + 1; // 1-based
    const annotation = annotations[lineNum];

    if (annotation) {
      const escaped = annotation.replace(/"/g, '&quot;');
      return `<span class="anno" data-annotation="${escaped}" tabindex="0" aria-label="Línea ${lineNum}: ${escaped}">${lineHtml}</span>`;
    }

    return `<span class="line-plain">${lineHtml}</span>`;
  });

  code.innerHTML = wrappedLines.join('\n');
}

/**
 * Renders an array of CodeSnippet objects into the given container element.
 * For each snippet:
 *  1. Creates a wrapper div with an h3 title.
 *  2. Creates a <pre><code class="language-{lang}"> with the raw code.
 *  3. Appends to container.
 *  4. Calls annotateCodeBlock (before Prism highlight — Batch B wires the order).
 *
 * NOTE: In Batch B (Task 09), main.ts must call Prism.highlightAll() AFTER
 * renderSnippets() and BEFORE the tooltip engine attaches to .anno spans.
 */
export function renderSnippets(
  container: HTMLElement,
  snippets: CodeSnippet[]
): void {
  for (const snippet of snippets) {
    const wrapper = document.createElement('div');
    wrapper.className = 'snippet-block';
    wrapper.id = `snippet-${snippet.id}`;

    const heading = document.createElement('h3');
    heading.textContent = snippet.title;
    wrapper.appendChild(heading);

    const pre = document.createElement('pre');
    pre.className = 'line-numbers';

    const code = document.createElement('code');
    code.className = `language-${snippet.language}`;
    // Set raw text — Prism.highlightElement in main.ts will tokenise it
    code.textContent = snippet.code;

    pre.appendChild(code);
    wrapper.appendChild(pre);
    container.appendChild(wrapper);

    // Annotate after inserting so the DOM is stable.
    // At this stage code.innerHTML is still plain text (not yet Prism-highlighted).
    // Task 09 must call Prism.highlightAll() before tooltip engine attaches.
    annotateCodeBlock(pre, snippet.annotations);
  }
}
