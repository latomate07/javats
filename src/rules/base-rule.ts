import { SourceFile, Node } from 'ts-morph';
import { ValidationError } from '../core/validator';

export abstract class BaseRule {
  abstract readonly name: string;
  
  abstract validate(sourceFile: SourceFile): ValidationError[];

  protected createError(node: Node, message: string): ValidationError {
    const { line, column } = node.getSourceFile().getLineAndColumnAtPos(node.getStart());
    return new ValidationError(
      message,
      line,
      column,
      this.name,
      node.getSourceFile().getFilePath()
    );
  }
}