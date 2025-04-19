import { SourceFile } from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

export class RequireTypeRule extends BaseRule {
  readonly name = 'RequireType';

  validate(sourceFile: SourceFile): ValidationError[] {
    const hasType =
      sourceFile.getClasses().length > 0 ||
      sourceFile.getInterfaces().length > 0 ||
      sourceFile.getEnums().length > 0 ||
      sourceFile.getTypeAliases().length > 0;

    return hasType
      ? []
      : [
          new ValidationError(
            'File must declare at least one type (class, interface, enum or type alias).',
            1,
            1,
            this.name,
            sourceFile.getFilePath()
          ),
        ];
  }
}