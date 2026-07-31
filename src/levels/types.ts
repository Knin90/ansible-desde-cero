export interface StepContent {
  title: string;
  body: string;
}

export interface ModuleContent {
  levelId: number;
  moduleId: number;
  title: string;
  objective: string;
  duration?: string;
  steps: StepContent[];
}
