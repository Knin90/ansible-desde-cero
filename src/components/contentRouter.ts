import type { ModuleContent } from '../levels/types';
import { nivel0Modules } from '../levels/nivel0/index';
import { nivel1Modules } from '../levels/nivel1/index';
import { nivel2Modules } from '../levels/nivel2/index';
import { nivel3Modules } from '../levels/nivel3/index';
import { nivel4Modules } from '../levels/nivel4/index';
import { nivel5Modules } from '../levels/nivel5/index';
import { nivel6Modules } from '../levels/nivel6/index';
import { nivel7Modules } from '../levels/nivel7/index';
import { nivel8Modules } from '../levels/nivel8/index';
import { nivel9Modules } from '../levels/nivel9/index';
import { nivel10Modules } from '../levels/nivel10/index';
import { nivel11Modules } from '../levels/nivel11/index';
import { nivel12Modules } from '../levels/nivel12/index';
import { nivel13Modules } from '../levels/nivel13/index';
import { nivel14Modules } from '../levels/nivel14/index';
import { nivel15Modules } from '../levels/nivel15/index';
import { nivel16Modules } from '../levels/nivel16/index';
import { nivel17Modules } from '../levels/nivel17/index';
import { nivel18Modules } from '../levels/nivel18/index';
import { nivel19Modules } from '../levels/nivel19/index';
import { nivel20Modules } from '../levels/nivel20/index';
import { nivel21Modules } from '../levels/nivel21/index';
import { nivel22Modules } from '../levels/nivel22/index';

export function getModuleContent(level: number, module: number): ModuleContent | undefined {
  switch (level) {
    case 0: return nivel0Modules.find(m => m.moduleId === module);
    case 1: return nivel1Modules.find(m => m.moduleId === module);
    case 2: return nivel2Modules.find(m => m.moduleId === module);
    case 3: return nivel3Modules.find(m => m.moduleId === module);
    case 4: return nivel4Modules.find(m => m.moduleId === module);
    case 5: return nivel5Modules.find(m => m.moduleId === module);
    case 6: return nivel6Modules.find(m => m.moduleId === module);
    case 7: return nivel7Modules.find(m => m.moduleId === module);
    case 8: return nivel8Modules.find(m => m.moduleId === module);
    case 9: return nivel9Modules.find(m => m.moduleId === module);
    case 10: return nivel10Modules.find(m => m.moduleId === module);
    case 11: return nivel11Modules.find(m => m.moduleId === module);
    case 12: return nivel12Modules.find(m => m.moduleId === module);
    case 13: return nivel13Modules.find(m => m.moduleId === module);
    case 14: return nivel14Modules.find(m => m.moduleId === module);
    case 15: return nivel15Modules.find(m => m.moduleId === module);
    case 16: return nivel16Modules.find(m => m.moduleId === module);
    case 17: return nivel17Modules.find(m => m.moduleId === module);
    case 18: return nivel18Modules.find(m => m.moduleId === module);
    case 19: return nivel19Modules.find(m => m.moduleId === module);
    case 20: return nivel20Modules.find(m => m.moduleId === module);
    case 21: return nivel21Modules.find(m => m.moduleId === module);
    case 22: return nivel22Modules.find(m => m.moduleId === module);
    default: return undefined;
  }
}
