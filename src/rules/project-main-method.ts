import { SourceFile } from 'ts-morph';
import { ValidationError, ProjectRule } from '../core/validator.js';

/**
 * ProjectMainMethodRule
 * ---------------------
 * Fails the build if *no* class in the whole project defines a `main()` method.
 */
export class ProjectMainMethodRule implements ProjectRule {
  readonly name = 'MainMethod';

  validateProject(sourceFiles: SourceFile[]): ValidationError[] {
    const hasMain = sourceFiles.some(sf =>
      sf.getClasses().some(cls =>
        cls.getMethods().some(m => m.getName() === 'main')
      )
    );

    if (hasMain) return [];

    const first = sourceFiles[0];
    return [
      new ValidationError(
        'The project must declare at least one main() method.',
        1,
        1,
        this.name,
        first ? first.getFilePath() : ''
      ),
    ];
  }
}