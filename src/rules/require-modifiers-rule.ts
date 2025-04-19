import { SourceFile, ClassDeclaration, MethodDeclaration, PropertyDeclaration } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

export class RequireModifiersRule extends BaseRule {
  readonly name = 'RequireModifiers';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const classes = sourceFile.getClasses();
    
    for (const cls of classes) {
      // Check methods
      for (const method of cls.getMethods()) {
        if (!this.hasVisibilityModifier(method)) {
          errors.push(this.createError(
            method,
            `Method '${method.getName()}' must have a visibility modifier (public, private, or protected)`
          ));
        }
      }
      
      // Check properties
      for (const prop of cls.getProperties()) {
        if (!this.hasVisibilityModifier(prop)) {
          errors.push(this.createError(
            prop,
            `Property '${prop.getName()}' must have a visibility modifier (public, private, or protected)`
          ));
        }
      }
    }

    return errors;
  }
  
  private hasVisibilityModifier(node: MethodDeclaration | PropertyDeclaration): boolean {
    const modifiers = node.getModifiers().map(m => m.getText());
    return modifiers.includes('public') || modifiers.includes('private') || modifiers.includes('protected');
  }
}