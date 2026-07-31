export interface DiagramStep {
  label: string;
  activate: () => void;
}

export abstract class DiagramEngine {
  protected container: HTMLElement;
  protected steps: DiagramStep[] = [];
  protected currentStep = -1;
  protected isPlaying = false;
  protected playInterval: ReturnType<typeof setTimeout> | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  abstract render(): void;

  addControls(): void {
    const controls = document.createElement('div');
    controls.className = 'diagram-controls';
    controls.innerHTML = `
      <button class="btn-prev">&#8592; Anterior</button>
      <button class="btn-play">&#9654; Reproducir</button>
      <button class="btn-next">Siguiente &#8594;</button>
      <button class="btn-reset">&#8635; Reiniciar</button>
    `;
    this.container.appendChild(controls);

    const indicator = document.createElement('div');
    indicator.className = 'diagram-step-indicator';
    indicator.textContent = 'Presioná ▶ para iniciar la animación';
    this.container.appendChild(indicator);

    controls.querySelector('.btn-prev')!.addEventListener('click', () => this.prevStep());
    controls.querySelector('.btn-play')!.addEventListener('click', (e) => {
      const btn = e.target as HTMLButtonElement;
      if (this.isPlaying) {
        this.pause();
        btn.textContent = '▶ Reproducir';
      } else {
        this.play();
        btn.textContent = '⏸ Pausar';
      }
    });
    controls.querySelector('.btn-next')!.addEventListener('click', () => this.nextStep());
    controls.querySelector('.btn-reset')!.addEventListener('click', () => {
      this.reset();
      const playBtn = controls.querySelector('.btn-play') as HTMLButtonElement;
      if (playBtn) playBtn.textContent = '▶ Reproducir';
    });
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.steps[this.currentStep].activate();
      this.updateIndicator();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      const target = this.currentStep - 1;
      this.reset();
      for (let i = 0; i <= target; i++) {
        this.steps[i].activate();
      }
      this.currentStep = target;
      this.updateIndicator();
    }
  }

  play(): void {
    this.isPlaying = true;
    const advance = () => {
      if (this.currentStep < this.steps.length - 1) {
        this.nextStep();
        this.playInterval = setTimeout(advance, 1200);
      } else {
        this.pause();
        const playBtn = this.container.querySelector('.btn-play') as HTMLButtonElement;
        if (playBtn) playBtn.textContent = '▶ Reproducir';
      }
    };
    advance();
  }

  pause(): void {
    this.isPlaying = false;
    if (this.playInterval) {
      clearTimeout(this.playInterval);
      this.playInterval = null;
    }
  }

  reset(): void {
    this.pause();
    this.currentStep = -1;
    this.container.querySelectorAll('.diagram-node').forEach(n => {
      n.classList.remove('active', 'success');
    });
    this.container.querySelectorAll('.diagram-arrow').forEach(a => {
      a.classList.remove('animated');
    });
    this.updateIndicator();
  }

  protected updateIndicator(): void {
    const el = this.container.querySelector('.diagram-step-indicator');
    if (el) {
      el.textContent = this.currentStep >= 0
        ? `Paso ${this.currentStep + 1} de ${this.steps.length}: ${this.steps[this.currentStep].label}`
        : 'Presioná ▶ para iniciar la animación';
    }
  }

  protected activateNode(id: string): void {
    this.container.querySelector(`#${id}`)?.classList.add('active');
  }

  protected activateNodeSuccess(id: string): void {
    this.container.querySelector(`#${id}`)?.classList.add('active', 'success');
  }

  protected animateArrow(id: string): void {
    this.container.querySelector(`#${id}`)?.classList.add('animated');
  }
}
