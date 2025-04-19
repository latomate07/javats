import { SourceFile } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

export class RequireClassRule extends BaseRule {
  readonly name = 'RequireClass';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const classes = sourceFile.getClasses();

    if (classes.length === 0) {
      errors.push(new ValidationError(
        'File must contain at least one class',
        1, // Line
        1, // Column
        this.name,
        sourceFile.getFilePath()
      ));
    }

    return errors;
  }
}