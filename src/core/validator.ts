import { SourceFile } from 'ts-morph';
import { BaseRule } from '../rules/base-rule';

export class ValidationError {
    constructor(
        public readonly message: string,
        public readonly line: number,
        public readonly column: number,
        public readonly ruleName: string,
        public readonly fileName: string
    ) { }

    toString(): string {
        return `[${this.ruleName}] ${this.fileName}:${this.line}:${this.column} - ${this.message}`;
    }
}

export class Validator {
    private rules: BaseRule[] = [];

    constructor() { }

    addRule(rule: BaseRule): void {
        this.rules.push(rule);
    }

    addRules(rules: BaseRule[]): void {
        this.rules.push(...rules);
    }

    validate(sourceFile: SourceFile): ValidationError[] {
        const errors: ValidationError[] = [];

        for (const rule of this.rules) {
            const ruleErrors = rule.validate(sourceFile);
            errors.push(...ruleErrors);
        }

        return errors;
    }

    validateFiles(sourceFiles: SourceFile[]): Map<string, ValidationError[]> {
        const errorsMap = new Map<string, ValidationError[]>();

        for (const sourceFile of sourceFiles) {
            const errors = this.validate(sourceFile);
            if (errors.length > 0) {
                errorsMap.set(sourceFile.getFilePath(), errors);
            }
        }

        return errorsMap;
    }
}