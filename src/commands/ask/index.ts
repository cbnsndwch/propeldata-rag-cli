import { Command } from 'commander';

import { multiLine } from '../../utils';

import { ask } from './action';

export function addAskCommand(program: Command) {
    program
        .command('ask')
        .description(
            multiLine(
                'Ask the PropelData LLM index a question.',
                '',
                'NOTE: You must run the `build-index` command first to build the index.'
            )
        )
        .option('-q, --question <question>', 'Input question to ask the index.')
        .action(ask);
}
