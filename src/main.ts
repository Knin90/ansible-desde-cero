// Bootstrap: import styles and initialize all modules in order.
// Styles → content inject → Prism highlight → tooltip → nav → diagram
// Full wiring happens in Task 09 (Batch B); this is the stub entry point.

import './styles/theme.css';
import './styles/layout.css';
import './styles/tooltip.css';
import './styles/tree.css';

import { initNavigation } from './modules/navigation';
import { initTooltips } from './modules/tooltip';
import { initDiagram } from './modules/diagram';

// Batch B will: import snippets ?raw, call renderSnippets, call Prism.highlightAll
// then wire annotate + tooltip attach.

initNavigation();
initTooltips();
initDiagram();
