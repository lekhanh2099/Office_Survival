export function showToast(message: string): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.append(t);
  setTimeout(() => {
    t.remove();
  }, 2400);
}
