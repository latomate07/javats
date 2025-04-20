import { SourceFile } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

/**
 * SinglePublicClassRule
 * ---------------------
 * Ensures that each file contains **at most one** exported class and that the
 * file name matches that class.
 */
export class SinglePublicClassRule extends BaseRule {
  readonly name = 'SinglePublicClass';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];

    const exportedClasses = sourceFile
      .getClasses()
      .filter(c => c.isExported());

    if (exportedClasses.length > 1) {
      errors.push(
        this.createError(
          exportedClasses[1],
          'A file may declare only one exported class.'
        )
      );
    }

    if (exportedClasses.length === 1) {
      const cls = exportedClasses[0];
      const expected = cls.getName() + '.javats';
      const actual = sourceFile.getBaseName();
      if (expected !== actual) {
        errors.push(
          this.createError(
            cls,
            `File name must match the exported class: expected '${expected}'.`
          )
        );
      }
    }

    return errors;
  }
}