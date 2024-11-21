# Inter Variable Font Integration Guide

## Recommended Font Acquisition Methods

### 1. Google Fonts (Recommended)
- Visit: https://fonts.google.com/specimen/Inter
- Select "Inter Variable"
- Download the Variable Font (`.woff2`)

### 2. GitHub Repository
- Official Inter Font Repository: https://github.com/rsms/inter
- Download the latest release
- Use the `Inter-Variable.woff2` file

## Web Font Optimization

### Recommended Font Weights
- 400 (Regular)
- 500 (Medium)
- 600 (Semi-Bold)

### CSS Font-Face Declaration
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

### Performance Considerations
- Use `font-display: swap`
- Preload the font in HTML
- Consider using `font-subset` for faster loading

## Licensing
- Inter Font is licensed under the SIL Open Font License
- Free for personal and commercial use
- Attribution appreciated but not required

## Troubleshooting
- Ensure `.woff2` file is web-optimized
- Check file permissions
- Verify font file integrity

## Recommended Tools
- Google Fonts
- Font Squirrel Webfont Generator
- Transfonter
