import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { RequireClassRule } from '../../src/rules/require-class';

describe('RequireClassRule', () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const rule = new RequireClassRule();

    it('should report errors for files without classes', () => {
        // Create a test source file without any class
        const sourceFile = project.createSourceFile(
            'test.javats',
            `
      interface Test {
        doSomething(): void;
      }
      
      function test(): void {
        console.log('No class here');
      }
      `,
            { overwrite: true }
        );

        const errors = rule.validate(sourceFile);

        expect(errors.length).toBe(1);
        expect(errors[0].message).toContain('must contain at least one class');
    });

    it('should not report errors for files with classes', () => {
        // Create a test source file with a class
        const sourceFile = project.createSourceFile(
            'test.javats',
            `
      public class ValidClass {
        public static main(args: string[]): void {
          console.log('Hello, world!');
        }
      }
      `,
            { overwrite: true }
        );

        const errors = rule.validate(sourceFile);

        expect(errors.length).toBe(0);
    });
});