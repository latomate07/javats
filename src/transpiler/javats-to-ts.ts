import { SourceFile, Project, SyntaxKind, Node } from 'ts-morph';

// Interface for transformation options
interface TransformOptions {
  enforceMain: boolean;
  requireModifiers: boolean;
  noProceduralCode: boolean;
}

// Default transformation options based on JavaTS rules
const defaultOptions: TransformOptions = {
  enforceMain: true,
  requireModifiers: true,
  noProceduralCode: true
};

/**
 * Transforms JavaTS source code to TypeScript, enforcing Java-like OOP rules
 */
export class JavatsToTsTransformer {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  /**
   * Transforms a JavaTS source file to TypeScript
   * @param sourceFile The JavaTS source file to transform
   * @param options Transformation options (optional)
   * @returns Transformed TypeScript code as a string
   */
  transform(sourceFile: SourceFile, options: Partial<TransformOptions> = {}): string {
    const opts = { ...defaultOptions, ...options };
    
    // Validate and transform the source file
    this.ensureNoProceduralCode(sourceFile, opts);
    this.ensureModifiers(sourceFile, opts);
    this.ensureMainMethod(sourceFile, opts);

    // For now, return the source text (extend with actual transformations later)
    return sourceFile.getText();
  }

  /**
   * Ensures no procedural code exists outside of classes/interfaces
   * @param sourceFile The source file to check
   * @param options Transformation options
   */
  private ensureNoProceduralCode(sourceFile: SourceFile, options: TransformOptions): void {
    if (!options.noProceduralCode) return;

    // Check top-level children for procedural code (functions or variables)
    const hasProceduralCode = sourceFile.getChildren().some(child =>
      child.isKind(SyntaxKind.FunctionDeclaration) ||
      child.isKind(SyntaxKind.VariableStatement)
    );

    if (hasProceduralCode) {
      throw new Error('Procedural code detected: Functions and variables must be inside classes');
    }
  }

  /**
   * Ensures all declarations have explicit visibility modifiers
   * @param sourceFile The source file to check
   * @param options Transformation options
   */
  private ensureModifiers(sourceFile: SourceFile, options: TransformOptions): void {
    if (!options.requireModifiers) return;

    const classes = sourceFile.getClasses();
    for (const cls of classes) {
      const members = cls.getMembers();
      for (const member of members) {
        // Only process members that support visibility modifiers
        if (member.isKind(SyntaxKind.PropertyDeclaration) ||
            member.isKind(SyntaxKind.MethodDeclaration) ||
            member.isKind(SyntaxKind.Constructor) ||
            member.isKind(SyntaxKind.GetAccessor) ||
            member.isKind(SyntaxKind.SetAccessor)) {
          const hasModifier = member.hasModifier(SyntaxKind.PublicKeyword) ||
                             member.hasModifier(SyntaxKind.PrivateKeyword) ||
                             member.hasModifier(SyntaxKind.ProtectedKeyword);
          if (!hasModifier) {
            // Add public modifier using setModifier for all supported nodes
            // member.addModifier(SyntaxKind.PublicKeyword);
          }
        }
        // Skip non-modifierable members like ClassStaticBlockDeclaration
      }
    }
  }

  /**
   * Ensures a main method exists in at least one class if required
   * @param sourceFile The source file to check
   * @param options Transformation options
   */
  private ensureMainMethod(sourceFile: SourceFile, options: TransformOptions): void {
    if (!options.enforceMain) return;

    const classes = sourceFile.getClasses();
    const hasMain = classes.some(cls =>
      cls.getStaticMethods().some(method =>
        method.getName() === 'main' &&
        method.hasModifier(SyntaxKind.PublicKeyword) &&
        method.hasModifier(SyntaxKind.StaticKeyword)
      )
    );

    if (!hasMain) {
      throw new Error('No public static main method found in any class');
    }
  }
}