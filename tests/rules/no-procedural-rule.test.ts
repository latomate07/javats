import { describe, it, expect } from 'vitest';
import { Project } from 'ts-morph';
import { NoProceduralCodeRule } from '../../src/rules/no-procedural-code';

describe('NoProceduralCodeRule', () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const rule = new NoProceduralCodeRule();

  it('should report errors for top-level functions', () => {
    // Create a test source file with a top-level function
    const sourceFile = project.createSourceFile(
      'test.javats',
      `
      function doSomething(): void {
        console.log('This is a top-level function');
      }
      
      public class ValidClass {
        public static main(args: string[]): void {
          console.log('Hello, world!');
        }
      }
      `,
      { overwrite: true }
    );

    const errors = rule.validate(sourceFile);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('must be declared inside a class');
  });

  it('should report errors for top-level variables', () => {
    // Create a test source file with a top-level variable
    const sourceFile = project.createSourceFile(
      'test.javats',
      `
      const x = 10;
      
      public class ValidClass {
        public static main(args: string[]): void {
          console.log('Hello, world!');
        }
      }
      `,
      { overwrite: true }
    );

    const errors = rule.validate(sourceFile);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('must be declared inside a class');
  });

  it('should not report errors for valid code', () => {
    // Create a test source file with only class-based code
    const sourceFile = project.createSourceFile(
      'test.javats',
      `
      public class ValidClass {
        private static x: number = 10;
        
        public static main(args: string[]): void {
          console.log('Hello, world!');
        }
        
        private static doSomething(): void {
          console.log('This is a method, not a function');
        }
      }
      `,
      { overwrite: true }
    );

    const errors = rule.validate(sourceFile);

    expect(errors.length).toBe(0);
  });
});