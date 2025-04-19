import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { CheckOptions } from '../options';
import { JavatsParser } from '../../core/parser';
import { Validator } from '../../core/validator';
import { NoProceduralCodeRule } from '../../rules/no-procedural-code';
import { RequireClassRule } from '../../rules/require-class';
import { MainMethodRule } from '../../rules/main-method-rule';
import { MainModifierRule } from '../../rules/main-modifier-rule';
import { RequireModifiersRule } from '../../rules/require-modifiers-rule';
import { ExplicitTypingRule } from '../../rules/explicit-typing-rule';
import { CliOutput } from '../output';

export async function execute(patterns: string[], options: CheckOptions): Promise<void> {
  try {
    const files = await findJavatsFiles(patterns);

    if (files.length === 0) {
      console.log('No .javats files found');
      return;
    }

    CliOutput.printTitle(`Checking ${files.length} .javats files`);

    const parser = new JavatsParser();
    const validator = new Validator();

    // Add all rules
    validator.addRules([
      new NoProceduralCodeRule(),
      new RequireClassRule(),
      new MainMethodRule(),
      new MainModifierRule(),
      new RequireModifiersRule(),
      new ExplicitTypingRule()
    ]);

    // Parse and validate all files
    const sourceFiles = [];
    for (const file of files) {
      try {
        const sourceFile = parser.parseFile(file);
        sourceFiles.push(sourceFile);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error parsing ${file}: ${error.message}`);
        } else {
          console.error(`Unknown error parsing ${file}:`, error);
        }
      }
    }

    const errorsMap = validator.validateFiles(sourceFiles);
    CliOutput.printValidationErrors(errorsMap);

    // Exit with error code if any errors were found
    if (errorsMap.size > 0) {
      process.exit(1);
    }
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