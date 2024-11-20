export const THEME_TRANSITION_DURATION = 300;

export function applyThemeTransition() {
    document.documentElement.style.transition = `all ${THEME_TRANSITION_DURATION}ms ease`;
}

export function getCurrentTheme(): 'dark' | 'light' {
    return (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
}

export function addThemeChangeListener(callback: (theme: 'dark' | 'light') => void) {
    document.addEventListener('theme-changed', ((event: CustomEvent) => {
        callback(event.detail.theme);
    }) as EventListener);
}

export function dispatchThemeChange(theme: 'dark' | 'light') {
    const themeChangeEvent = new CustomEvent('theme-changed', { 
        detail: { theme } 
    });
    document.dispatchEvent(themeChangeEvent);
}
