# Contributing to Mikey Shaw's Portfolio

## Welcome Contributors! 🎉

We appreciate your interest in contributing to this portfolio project. This document provides guidelines for contributing.

## 🌳 Branch Strategy

### Main Branches
- `main`: Stable production code
- `develop`: Integration branch for features

### Branch Types
- `feature/`: New features or enhancements
- `hotfix/`: Quick fixes for production issues
- `release/`: Preparing new production releases

## 🚀 Contributing Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/madezmedia/mikey-shaw-portfolio.git
   cd mikey-shaw-portfolio
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Add/update tests if applicable
   - Ensure no linting errors

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Describe your feature/change"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open Pull Request**
   - Target the `develop` branch
   - Provide a clear description of changes
   - Link any related issues

## 📋 Contribution Guidelines

### Code Style
- Follow Astro and TypeScript best practices
- Use consistent formatting
- Write clear, concise comments

### Commit Messages
- Use conventional commits format
- Prefix with:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting
  - `refactor:` for code improvements
  - `test:` for test-related changes
  - `chore:` for maintenance tasks

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Get approval from maintainers

## 🛠 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Collaborate and support each other

## 📞 Contact

For questions or discussions, open an issue or contact the maintainer.

## 📄 License

This project is licensed under the MIT License.
