# LangGraphJS Development Guide

## Project Overview

LangGraphJS is the JavaScript/TypeScript implementation of LangGraph, a low-level orchestration framework for building controllable AI agents with LLMs. It enables developers to build stateful, multi-actor applications with customizable architectures, long-term memory, and human-in-the-loop capabilities.

The project is organized as a monorepo using pnpm workspaces with Turbo for build orchestration.

**Repository**: https://github.com/langchain-ai/langgraphjs
**Documentation**: https://langchain-ai.github.io/langgraphjs/
**Package Registry**: https://www.npmjs.com/package/@langchain/langgraph

## Technology Stack

- **Language**: TypeScript 4.9.5+ or 5.4.5+
- **Runtime**: Node.js 18+ (Node.js 20+ recommended)
- **Package Manager**: pnpm 10.27.0
- **Build Tool**: Turbo 2.5.4 + Custom build scripts (`@langchain/build`)
- **Bundler**: Rolldown/tsdown for library builds
- **Testing**: Vitest 3.2.4 (browser and node modes), Playwright for browser tests
- **Linting**: ESLint with Airbnb config + TypeScript plugin
- **Formatting**: Prettier
- **Versioning**: Changesets

## Project Structure

```
langgraphjs/
├── libs/                          # Main packages
│   ├── langgraph-core/           # Core library (@langchain/langgraph) - main implementation
│   ├── langgraph/                # Legacy wrapper package (re-exports from core)
│   ├── checkpoint/               # Base checkpointing interfaces
│   ├── checkpoint-postgres/      # PostgreSQL checkpointer
│   ├── checkpoint-sqlite/        # SQLite checkpointer
│   ├── checkpoint-mongodb/       # MongoDB checkpointer
│   ├── checkpoint-redis/         # Redis checkpointer
│   ├── checkpoint-validation/    # Checkpoint validation utilities
│   ├── sdk/                      # Client SDK for LangGraph API (@langchain/langgraph-sdk)
│   ├── sdk-react/                # React integration
│   ├── sdk-vue/                  # Vue.js integration
│   ├── sdk-angular/              # Angular integration
│   ├── sdk-svelte/               # Svelte integration
│   ├── langgraph-api/            # LangGraph API server implementation
│   ├── langgraph-cli/            # CLI tool (@langchain/langgraph-cli)
│   ├── langgraph-ui/             # UI components
│   ├── langgraph-supervisor/     # Supervisor pattern implementation
│   ├── langgraph-swarm/          # Swarm pattern implementation
│   ├── langgraph-cua/            # CUA (Computer Use Agent) implementation
│   └── create-langgraph/         # Project scaffolding CLI
├── examples/                      # Example applications
│   ├── how-tos/                  # How-to guides
│   ├── ui-react/                 # React UI example
│   ├── ui-vue/                   # Vue UI example
│   ├── ui-angular/               # Angular UI example
│   ├── ui-svelte/                # Svelte UI example
│   ├── agent_executor/           # Agent executor pattern
│   ├── multi_agent/              # Multi-agent examples
│   └── ...
├── docs/                         # Documentation source
├── internal/                     # Internal tooling
│   ├── build/                    # Build system (@langchain/build)
│   ├── bench/                    # Benchmarks
│   └── environment_tests/        # Environment/export tests
└── scripts/                      # Utility scripts
```

## Library Architecture

The core library (`@langchain/langgraph`) is organized in layers:

### System Layers

1. **Channels Layer** (`src/channels/`)
   - Base communication & state management primitives
   - Key classes: `BaseChannel`, `LastValue`, `Topic`, `BinaryOperatorAggregate`
   - Located in: `libs/langgraph-core/src/channels/`

2. **Checkpointer Layer** (`libs/checkpoint/`)
   - Persistence and state serialization
   - Supports multiple backends (Postgres, SQLite, MongoDB, Redis)
   - Enables time-travel debugging and human-in-the-loop

3. **Pregel Layer** (`src/pregel/`)
   - Message passing execution engine
   - Superstep-based computation model (inspired by Google's Pregel)
   - Core execution logic in `src/pregel/index.ts`

4. **Graph Layer** (`src/graph/`)
   - High-level APIs for workflow definition
   - `Graph`: Base graph class
   - `StateGraph`: Graph with shared state management
   - Annotation-based state definition system

### Key Dependencies Between Layers

```
Graph Layer (StateGraph)
    ↓ (builds on)
Pregel Layer (execution engine)
    ↓ (uses)
Channels Layer (state management)
    ↓ (optionally uses)
Checkpointer Layer (persistence)
```

### Package Exports

The main package (`@langchain/langgraph`) exports multiple entrypoints:

- `@langchain/langgraph` - Core exports
- `@langchain/langgraph/web` - Browser-optimized exports
- `@langchain/langgraph/pregel` - Pregel execution engine
- `@langchain/langgraph/channels` - Channel primitives
- `@langchain/langgraph/prebuilt` - Prebuilt agents (createReactAgent, etc.)
- `@langchain/langgraph/remote` - Remote graph client
- `@langchain/langgraph/zod` - Zod schema integration

## Build and Test Commands

All commands should be run from the repository root (`langgraphjs/`):

### Setup
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Testing
```bash
# Run all unit tests
pnpm test

# Run a single test file
pnpm test:single /path/to/test.test.ts

# Run integration tests (requires Docker)
pnpm test:int

# Start integration test dependencies (PostgreSQL)
pnpm test:int:deps

# Stop integration test dependencies
pnpm test:int:deps:down
```

### Linting and Formatting
```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```

### Release
```bash
# Create a changeset
pnpm changeset

# Publish packages
pnpm release
```

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2021
- **Module System**: NodeNext
- **Strict Mode**: Enabled
- **Declaration Files**: Generated for all packages

### Formatting (Prettier)
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### ESLint Rules
- Base config: Airbnb + TypeScript recommended
- **Critical Rules**:
  - `no-process-env`: ERROR (use explicit configuration)
  - `no-instanceof/no-instanceof`: ERROR (use proper type guards)
  - `@typescript-eslint/no-floating-promises`: ERROR
  - `@typescript-eslint/no-misused-promises`: ERROR
  - `import/extensions`: ERROR (must include file extensions)

### Naming Conventions
- **Variables/Functions**: camelCase
- **Classes/Types**: PascalCase
- **Constants**: UPPER_CASE
- **Files**: lowercase `.ts`
- **Tests**: `.test.ts` (unit), `.int.test.ts` (integration)

### Import Order
1. External dependencies
2. Internal modules (with `.js` extensions)
3. Type-only imports

Example:
```typescript
import { something } from "external-lib";
import { internalUtil } from "./utils.js";
import type { MyType } from "./types.js";
```

### Error Handling
All errors must extend `BaseLangGraphError`:

```typescript
import { BaseLangGraphError } from "@langchain/langgraph/errors";

export class MyCustomError extends BaseLangGraphError {
  constructor(message?: string, fields?: BaseLangGraphErrorFields) {
    super(message, fields);
    this.name = "MyCustomError";
  }

  static get unminifiable_name() {
    return "MyCustomError";
  }
}
```

Error codes for troubleshooting docs:
- `GRAPH_RECURSION_LIMIT`
- `INVALID_CONCURRENT_GRAPH_UPDATE`
- `INVALID_GRAPH_NODE_RETURN_VALUE`
- `MISSING_CHECKPOINTER`
- `MULTIPLE_SUBGRAPHS`
- `UNREACHABLE_NODE`

## Testing Instructions

### Unit Tests
- Location: `src/tests/` or alongside source files
- Naming: `*.test.ts`
- Framework: Vitest
- Run: `pnpm test` (in package directory)

### Integration Tests
- Location: `src/tests/` or `*.int.test.ts`
- Requirements: Docker for PostgreSQL tests
- Setup: `pnpm test:int:deps` (starts PostgreSQL)
- Run: `pnpm test:int`

### Browser Tests
- Separate workflow in CI
- Uses Playwright
- Framework-specific tests in `sdk-react`, `sdk-vue`, `sdk-angular`, `sdk-svelte`

### Test Environment
Integration tests require environment variables. Create a `.env` file in `libs/langgraph/`:
```bash
# Example from libs/langgraph/.env.example
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

## Adding New Entrypoints

To add a new subpath export (e.g., `@langchain/langgraph/tools`):

1. Create the source file: `src/tools/index.ts`
2. Add entrypoint in `package.json` exports:
```json
{
  "exports": {
    "./tools": {
      "input": "./src/tools/index.ts",
      "import": {
        "types": "./dist/tools/index.d.ts",
        "default": "./dist/tools/index.js"
      }
    }
  }
}
```

## Development Conventions

### New Features
- Match patterns of existing code
- Ensure proper test coverage
- Discuss major abstractions in GitHub issues first
- Keep APIs consistent with Python LangGraph where possible

### Git Workflow
- Use "fork and pull request" workflow
- Do not push directly to main repo
- Reference issues in PRs

### Commit Messages
- Clear and descriptive
- Reference issue numbers when applicable

### Documentation
- Tutorials: `docs/docs/tutorials/`
- How-to guides: `docs/docs/how-tos/`
- Concepts: `docs/docs/concepts/`
- API Reference: Generated from TypeScript

## Security Considerations

- Never commit API keys or credentials
- Use `.env` files for local configuration (already in `.gitignore`)
- Integration tests check for environment variables and skip if not present
- No `instanceof` checks (enforced by ESLint) to avoid cross-realm issues

## Deployment Process

The project uses Changesets for version management:

1. **Create Changeset**: `pnpm changeset` (select packages, describe changes)
2. **PR with Changeset**: Include changeset file in PR
3. **Release**: Maintainers run `pnpm release` to publish

Versioning follows SemVer, though pre-1.0 releases may contain breaking changes in minor/patch versions.

## Useful Resources

- **CLAUDE.md**: Additional development guidelines
- **CONTRIBUTING.md**: Detailed contribution guide
- **Pregel Spec**: `libs/langgraph-core/spec/pregel-execution-model.md`
- **Architecture Spec**: `libs/langgraph-core/spec/langgraph-architecture-spec.md`
