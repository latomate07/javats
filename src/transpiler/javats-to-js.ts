import { SourceFile, Project, ts } from 'ts-morph';
import { JavatsToTsTransformer } from './javats-to-ts';

interface TransformOptions {
    enforceMain: boolean;
    requireModifiers: boolean;
    noProceduralCode: boolean;
  }

/**
 * Transforms JavaTS source code to JavaScript, enforcing Java-like OOP rules
 */
export class JavatsToJsTransformer {
    private project: Project;
    private tsTransformer: JavatsToTsTransformer;

    constructor(project: Project) {
        this.project = project;
        this.tsTransformer = new JavatsToTsTransformer(project);
    }

    /**
     * Transforms a JavaTS source file to JavaScript
     * @param sourceFile The JavaTS source file to transform
     * @param options Transformation options (optional)
     * @returns Transformed JavaScript code as a string
     */
    async transform(sourceFile: SourceFile, options: Partial<TransformOptions> = {}): Promise<string> {
        // First, apply TypeScript transformation to validate JavaTS rules
        const tsCode = this.tsTransformer.transform(sourceFile, options);

        // Create a temporary project for JavaScript emission
        const tempProject = new Project({
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                moduleResolution: ts.ModuleResolutionKind.NodeNext,
                strict: true,
                noEmit: false,
                declaration: false // No need for .d.ts files in JS output
            }
        });

        // Add the transformed TypeScript code as a temporary source file
        const tempSourceFile = tempProject.createSourceFile(
            sourceFile.getBaseName().replace('.javats', '.ts'),
            tsCode,
            { overwrite: true }
        );

        // Emit the JavaScript code
        const emitResult = await tempProject.emitToMemory({
            emitOnlyDtsFiles: false,
            customTransformers: {
                before: [],
                after: []
            }
        });

        const emittedFiles = emitResult.getFiles();
        const jsFile = emittedFiles.find(file => file.filePath.endsWith('.js'));

        if (!jsFile) {
            throw new Error(`Failed to emit JavaScript for ${sourceFile.getFilePath()}`);
        }

        return jsFile.text;
    }

    /**
     * Transforms a .javats file to JavaScript and writes it to the output directory
     * 
     * @param sourceFile The JavaTS source file to transform
     * @param outputDir The output directory
     * @param writer The output writer instance
     * @returns The path to the written JavaScript file
     */
    async transformFile(sourceFile: SourceFile, outputDir: string, writer: any): Promise<string> {
        const jsCode = await this.transform(sourceFile); 
        const outputFilePath = writer.getOutputFilePath(sourceFile.getFilePath(), outputDir, '.js');

        writer.writeFile(outputFilePath, jsCode);
        return outputFilePath;
    }
}