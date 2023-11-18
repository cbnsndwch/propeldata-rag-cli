import { Command } from 'commander';

import { buildIndex } from './action';

export function addBuildIndexCommand(program: Command) {
    program
        .command('index')
        .description('Build an LLM index from the PropelData GraphQL SDL')
		.option('-i, --input-dir <inputDir>', 'Input directory containing SDL files')
        .action(buildIndex);
}
