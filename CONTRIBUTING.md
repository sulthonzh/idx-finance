# Contributing to idx-finance

Thanks for your interest! Here's how to get started.

## Setup

```bash
git clone https://github.com/sulthonzh/idx-finance.git
cd idx-finance
npm install
```

## Development

```bash
npm run build        # Build with tsup (CJS + ESM)
npm test             # Run tests with Vitest
npm run test:watch   # Watch mode
npm run lint         # Type check only
```

## Making Changes

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with micro commits (conventional format)
3. Add tests for new functionality
4. Ensure `npm run build && npm test` passes
5. Open a pull request

## Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add sector breakdown command
fix(client): handle timeout on slow connection
docs(readme): add batch quotes example
```

## Code Style

- TypeScript strict mode
- Input validation on all user inputs
- No `any` types
- No hardcoded secrets or API keys
- Async/await (no `.then()` chains)

## Reporting Issues

- Include the stock symbol and command you ran
- Include Node.js version (`node -v`)
- Include package version

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
