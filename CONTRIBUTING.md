# 🤝 Contributing to Michael Shaw's Portfolio

## 🌟 Welcome Contributors!

Thank you for your interest in contributing to our portfolio project. This document provides guidelines and instructions for effective collaboration.

## 🎯 Contribution Philosophy

### Core Principles
- **Innovation**: Push technological boundaries
- **Quality**: Maintain high coding standards
- **Inclusivity**: Welcoming to all skill levels
- **Transparency**: Clear communication
- **Continuous Improvement**: Iterative enhancement

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm
- Git
- Basic understanding of:
  - TypeScript
  - Astro
  - React
  - Web Performance
  - Accessibility Principles

### Development Setup
```bash
# Fork the repository
# Clone your forked repository
git clone https://github.com/[YOUR_USERNAME]/mikeyshaw-portfolio.git

# Navigate to project directory
cd mikeyshaw-portfolio

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🔍 Contribution Workflow

### 1. Issue Creation
- Check existing issues before creating new ones
- Use provided issue templates
- Clearly describe:
  - Problem statement
  - Proposed solution
  - Potential implementation approach

### 2. Branch Strategy
```bash
# Create a new branch
git checkout -b [type/issue-description]

# Branch Naming Conventions:
# - feature/add-dark-mode-toggle
# - bugfix/resolve-mobile-layout-issue
# - docs/update-readme
# - refactor/optimize-performance
```

### 3. Development Guidelines

#### Code Quality
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write comprehensive tests
- Maintain 80%+ code coverage
- Document new features/changes

#### Performance Considerations
- Optimize bundle size
- Minimize render-blocking resources
- Use lazy loading
- Implement code splitting

#### Accessibility Requirements
- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigability
- Provide screen reader support
- Maintain color contrast standards

## 🧪 Testing

### Test Types
- Unit Tests
- Integration Tests
- Performance Tests
- Accessibility Tests

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test:unit
pnpm test:integration
pnpm test:performance
```

## 📝 Commit Guidelines

### Conventional Commits
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding/modifying tests
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### Example Commit
```bash
feat(a11y): add keyboard navigation to project grid
- Implement tab indexing
- Add focus management
- Enhance screen reader compatibility
```

## 🔄 Pull Request Process

### PR Checklist
- [ ] Linked to relevant issue
- [ ] Follows coding standards
- [ ] Passes all tests
- [ ] Updated documentation
- [ ] Performance impact assessed
- [ ] Accessibility verified

### Review Process
- Minimum two approvals required
- Automated checks must pass
- Performance and accessibility metrics evaluated

## 🛡️ Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Collaborate with empathy
- Celebrate diverse perspectives

## 📊 Contribution Impact Tracking
- Contributions tracked via:
  - GitHub Insights
  - Performance metrics
  - User experience improvements

## 🏆 Recognition
- Contributors acknowledged in README
- Potential feature highlights
- Open-source community recognition

## 📞 Contact & Support
- **Discussion**: GitHub Discussions
- **Issues**: GitHub Issues
- **Email**: michael@madezmedia.com

---

**Together, we build extraordinary digital experiences.**
