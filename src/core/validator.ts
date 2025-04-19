import { SourceFile } from 'ts-morph';
import { BaseRule } from '../rules/base-rule.js';

export interface ProjectRule {
  readonly name: string;
  validateProject(sourceFiles: SourceFile[]): ValidationError[];
}

export class ValidationError {
  constructor(
    public readonly message: string,
    public readonly line: number,
    public readonly column: number,
    public readonly ruleName: string,
    public readonly fileName: string
  ) {}

  toString(): string {
    return `[${this.ruleName}] ${this.fileName}:${this.line}:${this.column} - ${this.message}`;
  }
}

export class Validator {
  private fileRules: BaseRule[] = [];
  private projectRules: ProjectRule[] = [];

  /* ---------- rule registration ---------- */

  addRule(rule: BaseRule | ProjectRule): void {
    this.isProjectRule(rule)
      ? this.projectRules.push(rule)
      : this.fileRules.push(rule as BaseRule);
  }

  addRules(rules: (BaseRule | ProjectRule)[]): void {
    for (const r of rules) this.addRule(r);
  }

  /* ---------- file validation ---------- */

  /** Back‑compat alias */
  validate(sourceFile: SourceFile): ValidationError[] {
    return this.validateFile(sourceFile);
  }

  validateFile(sourceFile: SourceFile): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.fileRules) errors.push(...rule.validate(sourceFile));
    return errors;
  }

  validateFiles(sourceFiles: SourceFile[]): Map<string, ValidationError[]> {
    const map = new Map<string, ValidationError[]>();
    for (const sf of sourceFiles) {
      const errs = this.validateFile(sf);
      if (errs.length) map.set(sf.getFilePath(), errs);
    }
    return map;
  }

  /* ---------- project validation ---------- */

  validateProject(sourceFiles: SourceFile[]): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.projectRules)
      errors.push(...rule.validateProject(sourceFiles));
    return errors;
  }

  /* ---------- helpers ---------- */

  private isProjectRule(rule: any): rule is ProjectRule {
    return typeof rule?.validateProject === 'function';
  }
}