// UX Interaction and Animation Utilities

export const UX_CONFIG = {
    TRANSITION_DURATION: 300,  // ms
    HOVER_SCALE: 1.02,
    HOVER_OPACITY: 0.9,
    ANIMATION_EASE: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

export function applyHoverEffect(element: HTMLElement, options = {}) {
    const config = { ...UX_CONFIG, ...options };
    
    element.style.transition = `all ${config.TRANSITION_DURATION}ms ${config.ANIMATION_EASE}`;
    
    element.addEventListener('mouseenter', () => {
        element.style.transform = `scale(${config.HOVER_SCALE})`;
        element.style.opacity = `${config.HOVER_OPACITY}`;
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
    });
}

export function createAccessibleInteraction(element: HTMLElement, callback: () => void) {
    element.addEventListener('click', callback);
    element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            callback();
        }
    });
    
    element.setAttribute('tabindex', '0');
    element.setAttribute('role', 'button');
}

export function animateInView(element: HTMLElement, animationClass: string) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(element);
}

export function preloadImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

export function reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
