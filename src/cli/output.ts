import chalk from 'chalk';
import { ValidationError } from '../core/validator.js';

export class CliOutput {
  static printTitle(title: string): void {
    console.log(chalk.bold.blue(`\n${title}`));
    console.log(chalk.blue('='.repeat(title.length)));
  }
  
  static printValidationErrors(errorsMap: Map<string, ValidationError[]>): void {
    if (errorsMap.size === 0) {
      console.log(chalk.green('✓ All files passed validation'));
      return;
    }
    
    let totalErrors = 0;
    
    for (const [file, errors] of errorsMap.entries()) {
      console.log(chalk.underline(`\nFile: ${file}`));
      
      for (const error of errors) {
        console.log(`  ${chalk.red('✗')} ${chalk.gray(`[${error.ruleName}]`)} ${chalk.whiteBright(`Line ${error.line}, Col ${error.column}:`)} ${error.message}`);
      }
      
      totalErrors += errors.length;
    }
    
    console.log(chalk.red(`\n✗ Found ${totalErrors} errors in ${errorsMap.size} files`));
  }
  
  static printBuildResults(builtFiles: string[]): void {
    console.log(chalk.green(`\n✓ Successfully built ${builtFiles.length} files:`));
    
    for (const file of builtFiles) {
      console.log(`  ${chalk.gray('•')} ${file}`);
    }
  }
  
  static printError(error: Error): void {
    console.error(chalk.red(`\n✗ Error: ${error.message}`));
    
    if (error.stack && process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
  }
}