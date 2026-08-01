export interface StepContent {
  title: string;
  body: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TroubleshootingItem {
  error: string;
  cause: string;
  fix: string;
}

export interface ModuleContent {
  levelId: number;
  moduleId: number;
  title: string;
  objective: string;
  duration?: string;
  objectives?: string[];
  prerequisites?: string[];
  steps: StepContent[];
  quiz?: QuizQuestion[];
  realWorldCase?: string;
  troubleshooting?: TroubleshootingItem[];
}
