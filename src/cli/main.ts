#!/usr/bin/env node
import { createProgram } from './options';

// Create and run the CLI program
const program = createProgram();
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}