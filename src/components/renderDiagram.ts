import { ArquitecturaDiagram } from '../diagrams/nivel1/arquitectura-diagram';
import { FlujoInternoDiagram } from '../diagrams/nivel2/flujo-interno-diagram';
import { InventarioDiagram } from '../diagrams/nivel3/inventario-diagram';
import { PlaybookDiagram } from '../diagrams/nivel5/playbook-diagram';
import { YamlDiagram } from '../diagrams/nivel0/yaml-diagram';

export function renderDiagram(level: number, module: number): void {
  const slot = document.getElementById('diagram-slot');
  if (!slot) return;
  slot.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'diagram-container';
  slot.appendChild(wrapper);

  let diagramCreated = false;

  if (level === 0 && module === 3) {
    new YamlDiagram(wrapper).render();
    diagramCreated = true;
  } else if (level === 1 && module === 2) {
    new ArquitecturaDiagram(wrapper).render();
    diagramCreated = true;
  } else if (level === 2 && module === 1) {
    new FlujoInternoDiagram(wrapper).render();
    diagramCreated = true;
  } else if (level === 3 && module === 1) {
    new InventarioDiagram(wrapper).render();
    diagramCreated = true;
  } else if (level === 5 && module === 2) {
    new PlaybookDiagram(wrapper).render();
    diagramCreated = true;
  }

  if (!diagramCreated) {
    slot.innerHTML = '';
  }
}
