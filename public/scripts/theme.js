// Theme Management Script
document.addEventListener('DOMContentLoaded', () => {
  const getStoredTheme = () => localStorage.getItem('theme') || 'dark';
  const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const themeChangeEvent = new CustomEvent('theme-changed', { 
      detail: { 
        theme, 
        duration: 300 
      } 
    });
    document.dispatchEvent(themeChangeEvent);
  };

  // Initialize theme
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme);

  // Theme toggle listener
  window.addEventListener('themeToggle', (e) => {
    const newTheme = e.detail.theme;
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  });

  // Optional: System theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  });
});
