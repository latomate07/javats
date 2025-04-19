import { SourceFile, FunctionDeclaration, VariableStatement, SyntaxKind } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

export class NoProceduralCodeRule extends BaseRule {
  readonly name = 'NoProceduralCode';

  validate(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for top-level functions
    const functions = sourceFile.getFunctions();
    for (const func of functions) {
      errors.push(this.createError(
        func, 
        `Function '${func.getName() || 'anonymous'}' must be declared inside a class`
      ));
    }

    // Check for top-level variables
    const variables = sourceFile.getVariableStatements();
    for (const variable of variables) {
      for (const declaration of variable.getDeclarations()) {
        errors.push(this.createError(
          declaration,
          `Variable '${declaration.getName()}' must be declared inside a class`
        ));
      }
    }

    return errors;
  }
}