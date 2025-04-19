import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { BuildOptions } from '../options';
import { JavatsParser } from '../../core/parser';
import { Validator } from '../../core/validator';
import { JavatsTransformer } from '../../core/transformer';
import { NoProceduralCodeRule } from '../../rules/no-procedural-code';
import { RequireClassRule } from '../../rules/require-class';
import { MainMethodRule } from '../../rules/main-method-rule';
import { MainModifierRule } from '../../rules/main-modifier-rule';
import { RequireModifiersRule } from '../../rules/require-modifiers-rule';
import { ExplicitTypingRule } from '../../rules/explicit-typing-rule';
import { CliOutput } from '../output';

export async function execute(patterns: string[], options: BuildOptions): Promise<void> {
  try {
    const files = await findJavatsFiles(patterns);

    if (files.length === 0) {
      console.log('No .javats files found');
      return;
    }

    CliOutput.printTitle(`Building ${files.length} .javats files`);

    const parser = new JavatsParser();
    const validator = new Validator();
    const transformer = new JavatsTransformer();

    // Add all rules
    validator.addRules([
      new NoProceduralCodeRule(),
      new RequireClassRule(),
      new MainMethodRule(),
      new MainModifierRule(),
      new RequireModifiersRule(),
      new ExplicitTypingRule()
    ]);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(options.outDir)) {
      fs.mkdirSync(options.outDir, { recursive: true });
    }

    // Parse, validate, and transform all files
    const sourceFiles = [];
    const validFiles = [];

    for (const file of files) {
      try {
        const sourceFile = parser.parseFile(file);
        sourceFiles.push(sourceFile);

        // Validate the file
        const errors = validator.validate(sourceFile);

        if (errors.length > 0) {
          console.error(`Validation failed for ${file}, skipping`);
          continue;
        }

        validFiles.push(sourceFile);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error parsing ${file}: ${error.message}`);
        } else {
          console.error(`Unknown error parsing ${file}:`, error);
        }
      }
    }

    // Transform all valid files
    const builtFiles = [];

    for (const sourceFile of validFiles) {
      try {
        const outputTsPath = transformer.transformFile(sourceFile, options.outDir);
        builtFiles.push(outputTsPath);

        // Compile to JS if requested
        if (options.emitJs) {
          const outputJsPath = await transformer.compileToJs(sourceFile, options.outDir);
          builtFiles.push(outputJsPath);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error transforming ${sourceFile.getFilePath()}: ${error.message}`);
        } else {
          console.error(`Unknown error transforming file:`, error);
        }
      }
    }

    CliOutput.printBuildResults(builtFiles);
  } catch (error) {
    if (error instanceof Error) {
      CliOutput.printError(error);
    } else {
      console.error(`Unknown fatal error :`, error);
    }
    process.exit(1);
  }
}

async function findJavatsFiles(patterns: string[]): Promise<string[]> {
  // Same implementation as in check.ts
  const files: string[] = [];

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      // It's a glob pattern
      const matches = glob.sync(pattern);
      files.push(...matches.filter(file => file.endsWith('.javats')));
    } else if (fs.existsSync(pattern)) {
      const stats = fs.statSync(pattern);

      if (stats.isDirectory()) {
        // It's a directory, find all .javats files
        const dirFiles = glob.sync(path.join(pattern, '**/*.javats'));
        files.push(...dirFiles);
      } else if (stats.isFile() && pattern.endsWith('.javats')) {
        // It's a .javats file
        files.push(pattern);
      }
    }
  }

  return files;
}