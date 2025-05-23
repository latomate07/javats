import fs from 'fs';

export function appendMainRunner(jsFilePath: string, className: string) {
    const content = fs.readFileSync(jsFilePath, 'utf-8');

    const runner = `${className}.main(process.argv.slice(2));`;

    const newContent = content.trimEnd() + '\n' + runner;
    fs.writeFileSync(jsFilePath, newContent, 'utf-8');
}