import {
    SourceFile,
    ClassDeclaration,
    InterfaceDeclaration,
    EnumDeclaration,
    MethodDeclaration,
    PropertyDeclaration,
    SyntaxKind
} from 'ts-morph';
import { BaseRule } from './base-rule.js';
import { ValidationError } from '../core/validator.js';

/**
 * NamingConventionRule
 * --------------------
 * *  PascalCase          → classes, interfaces, enums
 * *  camelCase           → methods, non‑static properties
 * *  UPPER_SNAKE_CASE    → static readonly constants
 */
export class NamingConventionRule extends BaseRule {
    readonly name = 'NamingConvention';

    /* -------- regex helpers -------- */
    private readonly pascal = /^[A-Z][A-Za-z0-9]*$/;
    private readonly camel = /^[a-z][A-Za-z0-9]*$/;
    private readonly snake = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

    validate(sourceFile: SourceFile): ValidationError[] {
        const errors: ValidationError[] = [];

        /* ---- type declarations ---- */
        for (const decl of [
            ...sourceFile.getClasses(),
            ...sourceFile.getInterfaces(),
            ...sourceFile.getEnums()
        ] as (ClassDeclaration | InterfaceDeclaration | EnumDeclaration)[]) {
            const name = decl.getName();
            if (name && !this.pascal.test(name)) {
                errors.push(
                    this.createError(
                        decl.getNameNode() ?? decl,
                        `Type name '${name}' must be in PascalCase.`
                    )
                );
            }
        }

        /* ---- class members ---- */
        for (const cls of sourceFile.getClasses()) {
            for (const m of cls.getMembers()) {
                // Methods ------------------------------------------------------------
                if (NodeIsMethod(m)) {
                    const n = m.getName();
                    if (n && !this.camel.test(n)) {
                        errors.push(
                            this.createError(
                                m.getNameNode(),
                                `Method name '${n}' must be in camelCase.`
                            )
                        );
                    }
                }

                // Properties ---------------------------------------------------------
                if (NodeIsProperty(m)) {
                    const n = m.getName();
                    if (!n) continue;

                    const isConst = m.isStatic() && m.isReadonly();
                    if (isConst) {
                        if (!this.snake.test(n)) {
                            errors.push(
                                this.createError(
                                    m.getNameNode(),
                                    `Constant '${n}' must be in UPPER_SNAKE_CASE.`
                                )
                            );
                        }
                    } else {
                        if (!this.camel.test(n)) {
                            errors.push(
                                this.createError(
                                    m.getNameNode(),
                                    `Property name '${n}' must be in camelCase.`
                                )
                            );
                        }
                    }
                }
            }
        }

        return errors;
    }
}

/* ---------- type guards ---------- */
function NodeIsMethod(
    n: any
): n is MethodDeclaration {
    return n.getKind?.() === SyntaxKind.MethodDeclaration;
}

function NodeIsProperty(
    n: any
): n is PropertyDeclaration {
    return n.getKind?.() === SyntaxKind.PropertyDeclaration;
}