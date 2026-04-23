#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Command } from 'commander';

import { runServe } from './commands/serve.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')) as {
  version: string;
};

const program = new Command();
program.name('brightspace-mcp').description('MCP server for D2L Brightspace').version(pkg.version);

program
  .command('serve', { isDefault: true })
  .description('Start the MCP server (stdio transport)')
  .option('--profile <name>', 'Profile to use')
  .option('--config <path>', 'Path to config YAML')
  .option('--log-level <level>', 'debug | info | warn | error')
  .action(async (opts) => {
    try {
      await runServe(opts);
    } catch (err) {
      process.stderr.write(
        `Failed to start server: ${err instanceof Error ? err.message : String(err)}\n`,
      );
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
