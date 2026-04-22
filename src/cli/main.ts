#!/usr/bin/env node
import { Command } from 'commander';
import type { ServeOptions } from './commands/serve.js';

const program = new Command();
program.name('brightspace-mcp').description('MCP server for D2L Brightspace').version('0.1.0');

program
  .command('serve', { isDefault: true })
  .description('Start the MCP server (stdio transport)')
  .option('--profile <name>', 'Profile to use')
  .option('--config <path>', 'Path to config YAML')
  .option('--log-level <level>', 'debug | info | warn | error')
  .action(async (opts: ServeOptions) => {
    try {
      const { runServe } = await import('./commands/serve.js');
      await runServe(opts);
    } catch (err) {
      process.stderr.write(
        `Failed to start server: ${err instanceof Error ? err.message : String(err)}\n`,
      );
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
