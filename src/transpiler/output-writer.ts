import * as fs from 'fs';
import * as path from 'path';

/**
 * Handles writing transformed code to the filesystem
 */
export class OutputWriter {
  /**
   * Writes code to a file, creating directories if necessary
   * @param outputPath The path where the file should be written
   * @param content The content to write
   */
  writeFile(outputPath: string, content: string): void {
    const dir = path.dirname(outputPath); // Extracts the directory path

    // Creates the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Writes the content to the file
    fs.writeFileSync(outputPath, content);
  }

  /**
   * Generates the output file path for a transformed file
   * @param sourceFilePath The original source file path
   * @param outputDir The output directory
   * @param extension The target file extension (e.g., '.ts', '.js')
   * @returns The output file path
   */
  getOutputFilePath(sourceFilePath: string, outputDir: string, extension: string): string {
    const baseName = path.basename(sourceFilePath, '.javats');
    return path.join(outputDir, `${baseName}${extension}`);
  }
}