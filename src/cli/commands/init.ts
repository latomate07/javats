// Exemple pour src/cli/commands/init.ts (fichier exemple à créer)
import * as fs from 'fs';
import * as path from 'path';
import { InitOptions } from '../options';
import { CliOutput } from '../output';
import chalk from 'chalk';

export async function execute(options: InitOptions): Promise<void> {
    try {
        const projectName = options.name || 'javats-project';
        const projectDir = path.join(process.cwd(), projectName);

        CliOutput.printTitle(`Initializing new Javats project: ${projectName}`);

        // Create project directory if it doesn't exist
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        // Create src directory
        const srcDir = path.join(projectDir, 'src');
        fs.mkdirSync(srcDir, { recursive: true });

        const exampleContent = fs.readFileSync(path.join(__dirname, '../../../examples/valid/Main.javats'), 'utf-8');
        fs.writeFileSync(path.join(srcDir, 'Main.javats'), exampleContent);

        // Create package.json
        const packageJson = {
            name: projectName,
            version: '0.1.0',
            description: 'A Javats project',
            scripts: {
                check: 'javats check src/**/*.javats',
                build: 'javats build src/**/*.javats -o dist',
                start: 'node dist/Main.js'
            },
            dependencies: {},
            devDependencies: {
                javats: 'latest'
            }
        };

        fs.writeFileSync(
            path.join(projectDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Create .gitignore
        const gitignore = `
            node_modules
            dist
            .DS_Store
        `;
        fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);

        // Create README.md
        const readme = `
            # ${projectName}

            A Javats project that enforces Java-like OOP principles in TypeScript.

            ## Getting Started

            \`\`\`bash
            # Install dependencies
            npm install

            # Check code
            npm run check

            # Build project
            npm run build

            # Run project
            npm run start
            \`\`\`
        `;
        fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

        console.log(chalk.green(`\n✓ Successfully initialized project: ${projectName}`));
        console.log(`\nNext steps:`);
        console.log(`  1. cd ${projectName}`);
        console.log(`  2. npm install`);
        console.log(`  3. npm run check`);
        console.log(`  4. npm run build`);
        console.log(`  5. npm run start`);
    } catch (error) {
        if (error instanceof Error) {
            CliOutput.printError(error);
          } else {
            console.error(`Unknown fatal error :`, error);
          }
        process.exit(1);
    }
}