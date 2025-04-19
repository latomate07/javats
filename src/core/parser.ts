import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, SyntaxKind, ClassDeclaration, FunctionDeclaration, VariableStatement, ts } from 'ts-morph';

export interface CodeStructureReport {
    fileName: string;
    classes: ClassInfo[];
    interfaces: InterfaceInfo[];
    topLevelFunctions: string[];
    topLevelVariables: string[];
}

interface ClassInfo {
    name: string;
    isAbstract: boolean;
    extends?: string;
    implements: string[];
    methods: MethodInfo[];
    properties: PropertyInfo[];
    hasMain: boolean;
    mainIsStatic: boolean;
    mainIsPublic: boolean;
}

interface MethodInfo {
    name: string;
    isStatic: boolean;
    visibility: 'public' | 'private' | 'protected' | 'none';
    returnType: string;
}

interface PropertyInfo {
    name: string;
    isStatic: boolean;
    visibility: 'public' | 'private' | 'protected' | 'none';
    type: string;
}

interface InterfaceInfo {
    name: string;
    methods: string[];
    properties: string[];
}

export class JavatsParser {
    private project: Project;

    constructor() {
        this.project = new Project({
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                moduleResolution: ts.ModuleResolutionKind.NodeNext,
                strict: true
            },
            useInMemoryFileSystem: true
        });
    }

    /**
     * Parse a .javats file and return the source file
     */
    parseFile(filePath: string): SourceFile {
        if (!filePath.endsWith('.javats')) {
            throw new Error(`File must have .javats extension: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const fileName = path.basename(filePath);

        // Add the file to the in-memory file system
        return this.project.createSourceFile(fileName, fileContent, { overwrite: true });
    }

    /**
     * Parse multiple .javats files
     */
    parseFiles(filePaths: string[]): SourceFile[] {
        return filePaths.map(filePath => this.parseFile(filePath));
    }

    /**
     * Generate a report of the code structure
     */
    generateStructureReport(sourceFile: SourceFile): CodeStructureReport {
        const classes = sourceFile.getClasses();
        const interfaces = sourceFile.getInterfaces();
        const functions = sourceFile.getFunctions();
        const variables = sourceFile.getVariableStatements();

        return {
            fileName: sourceFile.getBaseName(),
            classes: classes.map(cls => this.extractClassInfo(cls)),
            interfaces: interfaces.map(intf => ({
                name: intf.getName() || 'Anonymous',
                methods: intf.getMethods().map(m => m.getName()),
                properties: intf.getProperties().map(p => p.getName())
            })),
            topLevelFunctions: functions.map(fn => fn.getName() || 'Anonymous'),
            topLevelVariables: this.extractTopLevelVariables(variables)
        };
    }

    private extractClassInfo(cls: ClassDeclaration) {
        const methods = cls.getMethods();
        const mainMethod = methods.find(m => m.getName() === 'main');

        return {
            name: cls.getName() || 'Anonymous',
            isAbstract: cls.isAbstract(),
            extends: cls.getExtends()?.getText(),
            implements: cls.getImplements().map(i => i.getText()),
            methods: methods.map(m => ({
                name: m.getName(),
                isStatic: m.isStatic(),
                visibility: this.getVisibility(m.getModifiers().map(m => m.getText())),
                returnType: m.getReturnType().getText()
            })),
            properties: cls.getProperties().map(p => ({
                name: p.getName(),
                isStatic: p.isStatic(),
                visibility: this.getVisibility(p.getModifiers().map(m => m.getText())),
                type: p.getType().getText()
            })),
            hasMain: !!mainMethod,
            mainIsStatic: mainMethod?.isStatic() || false,
            mainIsPublic: mainMethod?.getModifiers().some(m => m.getText() === 'public') || false
        };
    }

    private getVisibility(modifiers: string[]): 'public' | 'private' | 'protected' | 'none' {
        if (modifiers.includes('public')) return 'public';
        if (modifiers.includes('private')) return 'private';
        if (modifiers.includes('protected')) return 'protected';
        return 'none';
    }

    private extractTopLevelVariables(statements: VariableStatement[]): string[] {
        const variables: string[] = [];

        for (const statement of statements) {
            const declarations = statement.getDeclarations();
            for (const declaration of declarations) {
                variables.push(declaration.getName());
            }
        }

        return variables;
    }
}