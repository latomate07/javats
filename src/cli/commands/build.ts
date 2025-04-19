import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { BuildOptions } from '../options.js';
import { JavatsParser } from '../../core/parser.js';
import { JavatsTransformer } from '../../core/transformer.js';
import { Validator } from '../../core/validator.js';

import { NoProceduralCodeRule } from '../../rules/no-procedural-code.js';
import { RequireTypeRule } from '../../rules/require-type.js';
import { ProjectMainMethodRule } from '../../rules/project-main-method.js';
import { MainModifierRule } from '../../rules/main-modifier-rule.js';
import { RequireModifiersRule } from '../../rules/require-modifiers-rule.js';
import { ExplicitTypingRule } from '../../rules/explicit-typing-rule.js';

import { CliOutput } from '../output.js';

export async function execute(
  patterns: string[],
  options: BuildOptions
): Promise<void> {
  try {
    const files = await findJavatsFiles(patterns);
    if (!files.length) {
      console.log('No .javats files found');
      return;
    }

    CliOutput.printTitle(`Building ${files.length} .javats files`);

    const parser = new JavatsParser();
    const transformer = new JavatsTransformer();
    const validator = new Validator();

    /* ---------- register validation rules ---------- */
    validator.addRules([
      new NoProceduralCodeRule(),  // file
      new RequireTypeRule(),       // file
      new ProjectMainMethodRule(), // project
      new MainModifierRule(),      // file
      new RequireModifiersRule(),  // file
      new ExplicitTypingRule(),    // file
    ]);

    /* ---------- ensure output directory exists ---------- */
    if (!fs.existsSync(options.outDir)) {
      fs.mkdirSync(options.outDir, { recursive: true });
    }

    /* ---------- parse & validate each file ---------- */
    const sourceFiles = [];
    const validFiles = [];

    for (const file of files) {
      try {
        const sf = parser.parseFile(file);
        sourceFiles.push(sf);

        const errs = validator.validateFile(sf);
        if (errs.length) {
          console.error(`Validation errors in ${file}:`);
          errs.forEach(e => console.error(`  ${e.toString()}`));
          console.error(`Skipping ${file} due to validation errors.`);
          continue;
        }
        validFiles.push(sf);
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Error parsing ${file}: ${err.message}`);
        } else {
          console.error(`Unknown error parsing ${file}:`, err);
        }
      }
    }

    /* ---------- project‑level validation ---------- */
    const projectErrors = validator.validateProject(validFiles);
    if (projectErrors.length) {
      console.error('Project validation errors:');
      projectErrors.forEach(e => console.error(`  ${e.toString()}`));
      console.error('Build aborted: project validation failed.');
      return;
    }

    /* ---------- code generation ---------- */
    const builtFiles: string[] = [];

    for (const sf of validFiles) {
      try {
        const jsPath = await transformer.compileToJs(sf, options.outDir);
        builtFiles.push(jsPath);

        if (options.emitTs) {
          const tsPath = transformer.transformFile(sf, options.outDir);
          builtFiles.push(tsPath);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(`Error transforming ${sf.getFilePath()}: ${err.message}`);
        } else {
          console.error(`Unknown error transforming file:`, err);
        }
      }
    }

    CliOutput.printBuildResults(builtFiles);
  } catch (err) {
    if (err instanceof Error) {
      CliOutput.printError(err);
    } else {
      console.error('Unknown fatal error:', err);
    }
    process.exit(1);
  }
}

async function findJavatsFiles(patterns: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      files.push(...glob.sync(pattern).filter(f => f.endsWith('.javats')));
    } else if (fs.existsSync(pattern)) {
      const stat = fs.statSync(pattern);
      if (stat.isDirectory()) {
        files.push(...glob.sync(path.join(pattern, '**/*.javats')));
      } else if (stat.isFile() && pattern.endsWith('.javats')) {
        files.push(pattern);
      }
    }
  }
  return files;
}