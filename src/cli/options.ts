import { Command, Option } from 'commander';

export interface CheckOptions {
  fix?: boolean;
}

export interface BuildOptions {
  outDir: string;
  emitJs?: boolean;
}

export interface InitOptions {
  name?: string;
}

export function createProgram(): Command {
  const program = new Command();
  
  program
    .name('javats')
    .description('A TypeScript preprocessor that enforces Java-like OOP principles')
    .version('0.1.0');
    
  // Check command
  program
    .command('check')
    .description('Check .javats files for compliance with Java-like OOP rules')
    .argument('<files...>', 'Files or patterns to check')
    .option('--fix', 'Automatically fix issues where possible')
    .action((files: string[], options: CheckOptions) => {
      require('./commands/check').execute(files, options);
    });
    
  // Build command
  program
    .command('build')
    .description('Transpile .javats files to TypeScript or JavaScript')
    .argument('<files...>', 'Files or patterns to build')
    .requiredOption('-o, --out-dir <dir>', 'Output directory for transpiled files')
    .option('--emit-js', 'Emit JavaScript files in addition to TypeScript')
    .action((files: string[], options: BuildOptions) => {
      require('./commands/build').execute(files, options);
    });
    
  // Init command
  program
    .command('init')
    .description('Initialize a new Javats project')
    .option('-n, --name <name>', 'Project name')
    .action((options: InitOptions) => {
      require('./commands/init').execute(options);
    });
    
  return program;
}