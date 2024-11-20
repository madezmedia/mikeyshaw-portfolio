# 🌍 Internationalization (i18n) & Localization Strategy

## 🎯 i18n Objectives
- Create a globally accessible portfolio
- Support multiple languages
- Provide culturally sensitive user experiences
- Enhance global reach and engagement

## 🛠 Internationalization Architecture

### 1. Translation Management System
```typescript
// src/utils/i18n.ts
interface TranslationConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
}

class I18nManager {
  private translations: Record<string, Record<string, string>> = {};
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
  }

  async loadTranslations(): Promise<void> {
    const locales = this.config.supportedLocales;
    
    for (const locale of locales) {
      try {
        const module = await import(`../locales/${locale}.json`);
        this.translations[locale] = module.default;
      } catch (error) {
        console.error(`Failed to load translations for ${locale}`, error);
      }
    }
  }

  translate(key: string, locale?: string): string {
    locale = locale || this.config.defaultLocale;
    
    const localeTranslations = this.translations[locale];
    if (!localeTranslations) {
      console.warn(`No translations found for locale: ${locale}`);
      return key;
    }

    return localeTranslations[key] || 
           this.translations[this.config.fallbackLocale]?.[key] || 
           key;
  }

  detectUserLocale(): string {
    const browserLocale = 
      navigator.language || 
      (navigator as any).userLanguage;
    
    return this.config.supportedLocales.includes(browserLocale)
      ? browserLocale
      : this.config.defaultLocale;
  }
}

export const i18n = new I18nManager({
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'zh', 'ar'],
  fallbackLocale: 'en'
});
```

### 2. Locale JSON Structure
```json
// src/locales/en.json
{
  "nav": {
    "home": "Home",
    "projects": "Projects",
    "about": "About",
    "contact": "Contact"
  },
  "hero": {
    "title": "Digital Architect & AI Innovator",
    "subtitle": "Crafting transformative technological solutions"
  },
  "projects": {
    "title": "Featured Projects",
    "viewMore": "View More"
  }
}

// src/locales/es.json
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos",
    "about": "Sobre mí",
    "contact": "Contacto"
  },
  "hero": {
    "title": "Arquitecto Digital e Innovador en IA",
    "subtitle": "Creando soluciones tecnológicas transformadoras"
  },
  "projects": {
    "title": "Proyectos Destacados",
    "viewMore": "Ver Más"
  }
}
```

### 3. Locale-Aware Component
```typescript
// src/components/LocaleSelector.astro
---
import { i18n } from '../utils/i18n';

const supportedLocales = i18n.config.supportedLocales;
const currentLocale = i18n.detectUserLocale();
---

<div class="locale-selector">
  {supportedLocales.map((locale) => (
    <button 
      class={`locale-btn ${currentLocale === locale ? 'active' : ''}`}
      data-locale={locale}
    >
      {getLocaleName(locale)}
    </button>
  ))}
</div>

<script>
  function getLocaleName(locale: string): string {
    const localeNames = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'zh': '中文',
      'ar': 'العربية'
    };
    return localeNames[locale] || locale;
  }

  document.querySelectorAll('.locale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const locale = btn.getAttribute('data-locale');
      // Update locale preference, potentially using localStorage
      localStorage.setItem('preferredLocale', locale);
      // Reload page or update content dynamically
      window.location.reload();
    });
  });
</script>
```

### 4. Right-to-Left (RTL) Support
```css
/* src/styles/rtl.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .layout-container {
  flex-direction: row-reverse;
}

[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}
```

## 🚦 i18n Enhancement Checklist
- [ ] Create translation management system
- [ ] Develop locale JSON files
- [ ] Implement locale selector
- [ ] Add RTL language support
- [ ] Configure dynamic content translation
- [ ] Test cross-language compatibility
- [ ] Implement locale persistence
- [ ] Validate cultural sensitivities

## 📊 Internationalization Targets
- Supported Languages: 5+
- Translation Completeness: 95%
- Locale Switching Performance: < 100ms
- RTL Language Support: Comprehensive
- User Locale Detection Accuracy: 90%

## 🔍 Recommended i18n Tools
- i18next
- react-intl
- formatjs
- Crowdin
- Transifex

---

**Breaking language barriers, connecting global experiences.**
