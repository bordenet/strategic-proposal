# Contributing to Strategic Proposal Generator

We welcome contributions to this project!

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/strategic-proposal.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature`
4. **Set up** the project: `npm install`

## Development Workflow

### Before You Start

Read these documents:
- [`CLAUDE.md`](CLAUDE.md) - AI assistant instructions and standards
- [`README.md`](README.md) - Project overview

### Making Changes

1. **Write tests first** (TDD approach):
   ```bash
   npm run test:watch
   ```

2. **Write your code** following the style guide:
   - Use ES6+ features
   - Double quotes for strings
   - 2-space indentation
   - Descriptive variable names
   - JSDoc comments for functions

3. **Lint your code**:
   ```bash
   npm run lint:fix
   ```

4. **Run all tests**:
   ```bash
   npm test
   ```

## Code Style Guide

**JavaScript**:
- ES6+ syntax (const/let, arrow functions, async/await)
- Double quotes: `"string"`
- 2-space indentation
- Semicolons required
- No console.log in production code
- JSDoc comments for all functions

**Example**:
```javascript
/**
 * Save a project to storage
 * @param {Object} project - The project to save
 * @returns {Promise<string>} The project ID
 */
export async function saveProject(project) {
  if (!project.title) {
    throw new Error("Project title is required");
  }
  
  const result = await storage.saveProject(project);
  return result;
}
```

## Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Maintenance

Examples:
```
feat: Add proposal export to PDF
fix: Resolve dark mode toggle issue
docs: Update deployment guide
test: Add integration tests for workflow
```

## Pull Request Process

1. **Update your branch**: `git pull origin main`
2. **Push your changes**: `git push origin feature/your-feature`
3. **Create a Pull Request** on GitHub
4. **Describe your changes**: What problem does this solve?
5. **Link related issues**: "Fixes #123"
6. **Wait for review**: Maintainers will review your code

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages are descriptive

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- storage.test.js

# Run in watch mode
npm run test:watch
```

## Documentation

When adding features, update:
- README.md (if user-facing)
- Comments in code
- This file (if process changes)

## Questions?

- Check existing [Issues](https://github.com/bordenet/strategic-proposal/issues)
- Review sibling projects for similar patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Strategic Proposal Generator!**

