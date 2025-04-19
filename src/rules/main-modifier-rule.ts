import { SourceFile } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

export class MainModifierRule extends BaseRule {
  readonly name = 'MainModifier';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const classes = sourceFile.getClasses();
    
    for (const cls of classes) {
      const mainMethod = cls.getMethods().find(method => method.getName() === 'main');
      
      if (mainMethod) {
        // Check if main is declared as public
        if (!mainMethod.getModifiers().some(mod => mod.getText() === 'public')) {
          errors.push(this.createError(
            mainMethod,
            'main() method must be declared as public'
          ));
        }
        
        // Check if main is declared as static
        if (!mainMethod.isStatic()) {
          errors.push(this.createError(
            mainMethod,
            'main() method must be declared as static'
          ));
        }
      }
    }

    return errors;
  }
}