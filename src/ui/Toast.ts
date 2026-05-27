export class Toast {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
      zIndex: '90',
    });
    document.getElementById('game-container')!.appendChild(this.container);
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    const colors = {
      success: { bg: 'rgba(40, 100, 40, 0.9)', border: '#88cc88', text: '#ccffcc' },
      error: { bg: 'rgba(100, 30, 30, 0.9)', border: '#cc5555', text: '#ffcccc' },
      info: { bg: 'rgba(20, 20, 40, 0.9)', border: 'rgba(212,201,168,0.4)', text: '#d4c9a8' },
    };
    const c = colors[type];

    Object.assign(toast.style, {
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '4px',
      padding: '6px 14px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif",
      fontSize: '12px',
      color: c.text,
      marginBottom: '4px',
      opacity: '1',
      transition: 'opacity 0.3s',
      whiteSpace: 'nowrap',
    });

    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }
}
