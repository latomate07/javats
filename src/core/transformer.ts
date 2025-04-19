import * as path from 'path';
import { SourceFile, Project, ts } from 'ts-morph';
import { JavatsToTsTransformer } from '../transpiler/javats-to-ts.js';
import { JavatsToJsTransformer } from '../transpiler/javats-to-js.js';
import { OutputWriter } from '../transpiler/output-writer.js';

/**
 * Main transformer class for converting JavaTS to TypeScript and JavaScript
 */
export class JavatsTransformer {
  private project: Project;
  private tsTransformer: JavatsToTsTransformer;
  private jsTransformer: JavatsToJsTransformer;
  private writer: OutputWriter;

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        strict: true
      }
    });
    this.tsTransformer = new JavatsToTsTransformer(this.project);
    this.jsTransformer = new JavatsToJsTransformer(this.project);
    this.writer = new OutputWriter();
  }

  /**
   * Transform JavaTS code to TypeScript
   * @param sourceFile The source file to transform
   * @returns Transformed TypeScript code
   */
  transform(sourceFile: SourceFile): string {
    return this.tsTransformer.transform(sourceFile);
  }

  /**
   * Transform a .javats file and write output to a .ts file
   * @param sourceFile The source file to transform
   * @param outputDir The output directory
   * @returns The path to the written TypeScript file
   */
  transformFile(sourceFile: SourceFile, outputDir: string): string {
    const transformedCode = this.transform(sourceFile);
    const outputFilePath = this.writer.getOutputFilePath(sourceFile.getFilePath(), outputDir, '.ts');
    
    this.writer.writeFile(outputFilePath, transformedCode);
    return outputFilePath;
  }

  /**
   * Compile JavaTS to JavaScript and write output to a .js file
   * @param sourceFile The JavaTS source file
   * @param outputDir The output directory
   * @returns The path to the compiled JavaScript file
   */
  async compileToJs(sourceFile: SourceFile, outputDir: string): Promise<string> {
    return this.jsTransformer.transformFile(sourceFile, outputDir, this.writer);
  }
}