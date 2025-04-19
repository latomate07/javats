# JavaTS

[![Experimental](https://img.shields.io/badge/status-experimental-orange.svg)](https://github.com/latomate07/javats)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A TypeScript preprocessor/transpiler that enforces Java-like OOP principles in TypeScript.

## 🧪 Experimental Status

**IMPORTANT**: JavaTS is currently in experimental status and under active development. API changes may occur frequently, and not all features are fully implemented. Use in production environments is not recommended at this stage.

## 🎯 Overview

JavaTS creates a strict subset of TypeScript that enforces object-oriented programming principles similar to Java. The goal is to provide a familiar environment for Java developers transitioning to TypeScript, or for teams that want to enforce strict OOP principles in their TypeScript codebase.

### Key Features

- ❌ Forbids procedural code (everything must be in a class)
- ✅ Forces class-based architecture with proper `main()` methods
- ✅ Enforces visibility modifiers (`public`, `private`, `protected`)
- ✅ Requires explicit typing for all declarations
- ✅ Supports Java-like OOP features: `extends`, `implements`, `abstract`, `interface`
- ✅ Transpiles to standard TypeScript or directly to JavaScript

## 📦 Installation

```bash
npm install javats --save-dev
```

Or globally:

```bash
npm install -g javats
```

## 🚀 Quick Start

### Initialize a new project

```bash
javats init my-project
cd my-project
npm install
```

### Create your first JavaTS class

```typescript
// src/Main.javats
public class Main {
  private static count: number = 0;
  
  public static main(args: string[]): void {
    console.log("Hello from JavaTS!");
    Main.incrementCount();
    console.log(`Count is now: ${Main.count}`);
  }
  
  private static incrementCount(): void {
    this.count++;
  }
}
```

### Check your code for compliance

```bash
javats check src/**/*.javats
```

### Build your project

```bash
javats build src/**/*.javats -o dist
```

### Run your compiled code

```bash
node dist/Main.js
```

## 🔧 CLI Commands

JavaTS provides the following commands:

### Check

Validates JavaTS files against all rules:

```bash
javats check [files..]
```

Options:
- `--fix`: Automatically fix issues where possible (experimental)

### Build

Transpiles JavaTS files to TypeScript or JavaScript:

```bash
javats build [files..] --out-dir <output-directory>
```

Options:
- `--out-dir <dir>`: Output directory (required)
- `--emit-js`: Also generate JavaScript files

### Init

Creates a new JavaTS project:

```bash
javats init [project-name]
```

Options:
- `--name <name>`: Project name

## 🧩 API Usage

You can also use JavaTS programmatically:

```typescript
import { JavatsParser, Validator, JavatsTransformer, Rules } from 'javats';

// Parse a file
const parser = new JavatsParser();
const sourceFile = parser.parseFile('path/to/file.javats');

// Validate the file
const validator = new Validator();
validator.addRules(Rules.createDefaultRules());
const errors = validator.validate(sourceFile);

// Transform to TypeScript
const transformer = new JavatsTransformer();
const tsCode = transformer.transform(sourceFile);
```

## 📝 Configuration

JavaTS can be configured with a `javats.config.json` file in your project root:

```json
{
  "rules": {
    "requireMain": true,
    "noProceduralCode": true,
    "requireModifiers": true,
    "explicitTyping": true
  },
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext"
  }
}
```

## 🛣️ Roadmap

- [x] Core rules implementation
- [x] Basic CLI
- [x] TypeScript transpilation
- [ ] VSCode extension for real-time validation
- [ ] Advanced configuration options
- [ ] Integration with popular build tools
- [ ] Online playground

## 🤝 Contributing

Contributions are welcome!

## 📄 License

MIT

---

**Note**: This project is not affiliated with Oracle's Java or Microsoft's TypeScript.