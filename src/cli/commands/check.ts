import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { CheckOptions } from '../options.js';
import { JavatsParser } from '../../core/parser.js';
import { Validator } from '../../core/validator.js';
import { NoProceduralCodeRule } from '../../rules/no-procedural-code.js';
import { MainModifierRule } from '../../rules/main-modifier-rule.js';
import { RequireModifiersRule } from '../../rules/require-modifiers-rule.js';
import { ExplicitTypingRule } from '../../rules/explicit-typing-rule.js';
import { RequireTypeRule } from '../../rules/require-type.js';
import { InterfaceImplementationRule } from '../../rules/interface-implementation-rule.js';
import { ProjectMainMethodRule } from '../../rules/project-main-method.js';
import { SinglePublicClassRule } from '../../rules/single-public-class-rule.js';
import { NamingConventionRule } from '../../rules/naming-convention-rule.js';
import { CliOutput } from '../output.js';

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
      new NoProceduralCodeRule(),  // file
      new RequireTypeRule(),       // file
      new InterfaceImplementationRule(), // file
      new ProjectMainMethodRule(), // project
      new SinglePublicClassRule(), // file
      new NamingConventionRule(), // file
      new MainModifierRule(),      // file
      new RequireModifiersRule(),  // file
      new ExplicitTypingRule(),    // file
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