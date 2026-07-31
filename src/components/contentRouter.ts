import type { ModuleContent } from '../levels/types';
import { nivel0Modules } from '../levels/nivel0';
import { nivel1Modules } from '../levels/nivel1';
import { nivel2Modules } from '../levels/nivel2';
import { nivel3Modules } from '../levels/nivel3';
import { nivel4Modules } from '../levels/nivel4';
import { nivel5Modules } from '../levels/nivel5';
import { getNivel6to22Content } from '../levels/nivel6to22';

export function getModuleContent(level: number, module: number): ModuleContent | undefined {
  switch (level) {
    case 0: return nivel0Modules.find(m => m.moduleId === module);
    case 1: return nivel1Modules.find(m => m.moduleId === module);
    case 2: return nivel2Modules.find(m => m.moduleId === module);
    case 3: return nivel3Modules.find(m => m.moduleId === module);
    case 4: return nivel4Modules.find(m => m.moduleId === module);
    case 5: return nivel5Modules.find(m => m.moduleId === module);
    default: return getNivel6to22Content(level, module);
  }
}
