import { SourceFile, ClassDeclaration, MethodDeclaration, PropertyDeclaration, ParameterDeclaration } from 'ts-morph';
import { BaseRule } from './base-rule';
import { ValidationError } from '../core/validator';

export class ExplicitTypingRule extends BaseRule {
  readonly name = 'ExplicitTyping';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const classes = sourceFile.getClasses();
    
    for (const cls of classes) {
      // Check methods
      for (const method of cls.getMethods()) {
        // Check return type
        if (!method.getReturnTypeNode()) {
          errors.push(this.createError(
            method,
            `Method '${method.getName()}' must have an explicit return type`
          ));
        }
        
        // Check parameters
        for (const param of method.getParameters()) {
          if (!param.getTypeNode()) {
            errors.push(this.createError(
              param,
              `Parameter '${param.getName()}' in method '${method.getName()}' must have an explicit type`
            ));
          }
        }
      }
      
      // Check properties
      for (const prop of cls.getProperties()) {
        if (!prop.getTypeNode()) {
          errors.push(this.createError(
            prop,
            `Property '${prop.getName()}' must have an explicit type`
          ));
        }
      }
    }

    return errors;
  }
}