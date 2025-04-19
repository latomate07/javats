import {
    SourceFile,
    InterfaceDeclaration,
    ClassDeclaration,
    Node
  } from 'ts-morph';
  import { BaseRule } from './base-rule.js';
  import { ValidationError } from '../core/validator.js';
  
  /**
   * InterfaceImplementationRule
   * ---------------------------
   * Ensures that every class provides all members declared in each interface
   * it says it implements.
   */
  export class InterfaceImplementationRule extends BaseRule {
    readonly name = 'InterfaceImplementation';
  
    validate(sourceFile: SourceFile): ValidationError[] {
      const errors: ValidationError[] = [];
  
      /* Build a quick lookup of every interface in the whole project */
      const projectInterfaces = new Map<
        string,
        { members: Set<string>; node: InterfaceDeclaration }
      >();
  
      for (const sf of sourceFile.getProject().getSourceFiles()) {
        for (const intf of sf.getInterfaces()) {
          const members = new Set<string>(
            intf
              .getMembers()
              .map(m => (m as any).getName?.())
              .filter((n): n is string => !!n)
          );
          projectInterfaces.set(intf.getName(), { members, node: intf });
        }
      }
  
      /* Validate each class in the current .javats file */
      for (const cls of sourceFile.getClasses()) {
        for (const impl of cls.getImplements()) {
          const interfaceName = impl.getExpression().getText();
          const iface = projectInterfaces.get(interfaceName);
          if (!iface) {
            /* Unknown interface → skip (could be from a .d.ts or runtime JS) */
            continue;
          }
  
          for (const memberName of iface.members) {
            if (!hasMember(cls, memberName)) {
              errors.push(
                this.createError(
                  cls,
                  `Class '${cls.getName()}' is missing '${memberName}' required by interface '${interfaceName}'.`
                )
              );
            }
          }
        }
      }
  
      return errors;
    }
  }
  
  /* ---------- helpers ---------- */
  
  /** True if the class declares a method or property with the given name */
  function hasMember(cls: ClassDeclaration, name: string): boolean {
    return cls
      .getMembers()
      .some(m => (m as any).getName?.() === name);
  }
  