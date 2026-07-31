// Bootstrap: import styles and initialize all modules in correct order.
// Order: styles → nav → diagram → renderSnippets → Prism.highlightAll → annotateCodeBlock → initTooltips

import './styles/theme.css';
import './styles/layout.css';
import './styles/tooltip.css';
import './styles/tree.css';

import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';

import { initNavigation } from './modules/navigation';
import { initDiagram } from './modules/diagram';
import { initTooltips } from './modules/tooltip';
import { annotateCodeBlock, renderSnippets } from './modules/annotate';
import { snippets } from './content/annotations';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDiagram();

  const container = document.getElementById('snippets-container');
  if (container) {
    renderSnippets(container, snippets);
  }

  // CRITICAL: Prism.highlightAll MUST run after renderSnippets injects code blocks
  // so that PrismJS tokenises the raw text before annotateCodeBlock splits by line.
  Prism.highlightAll();

  // Annotate each snippet's <pre> after Prism has tokenised it.
  snippets.forEach(snippet => {
    const pre = document.getElementById(`snippet-${snippet.id}`);
    if (pre) {
      annotateCodeBlock(pre as HTMLElement, snippet.annotations);
    }
  });

  // initTooltips MUST run after annotateCodeBlock has wrapped lines in .anno spans.
  initTooltips();
});
