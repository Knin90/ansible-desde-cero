import { Icons } from '../utils/icons';

export function handleCopy(btn: HTMLElement, text: string): void {
  const copyText = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback: textarea + execCommand
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  copyText()
    .then(() => {
      btn.innerHTML = `${Icons.copySuccess} COPIADO`;
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = `${Icons.copy} COPIAR CÓDIGO`;
        btn.classList.remove('copied');
      }, 2000);
    })
    .catch(() => {
      btn.innerHTML = `${Icons.copyError} ERROR`;
      btn.classList.add('copy-error');
      setTimeout(() => {
        btn.innerHTML = `${Icons.copy} COPIAR CÓDIGO`;
        btn.classList.remove('copy-error');
      }, 2000);
    });
}

export function handleCopySimple(btn: HTMLElement, text: string): void {
  const originalHtml = btn.innerHTML;
  const copyAsync = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };
  copyAsync()
    .then(() => {
      btn.innerHTML = '✓';
      setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
    })
    .catch(() => {
      btn.innerHTML = '✗';
      setTimeout(() => { btn.innerHTML = originalHtml; }, 1500);
    });
}
