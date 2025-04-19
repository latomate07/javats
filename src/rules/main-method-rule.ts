import { SourceFile } from 'ts-morph';
import { BaseRule } from './base-rule';
import { ValidationError } from '../core/validator';

export class MainMethodRule extends BaseRule {
  readonly name = 'MainMethod';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const classes = sourceFile.getClasses();
    
    // Check if any class has a main method
    const hasMain = classes.some(cls => {
      return cls.getMethods().some(method => method.getName() === 'main');
    });

    if (!hasMain) {
      errors.push(new ValidationError(
        'At least one class must define a main() method',
        1, // Line
        1, // Column
        this.name,
        sourceFile.getFilePath()
      ));
    }

    return errors;
  }
}