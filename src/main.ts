#!/usr/bin/env node
import { program } from 'commander';

// eslint-disable-next-line import/no-unassigned-import
import './config';

import { commands } from './commands';

program
    .name('propel')
    .description('PropelData RAG/LLM CLI')
    .version('0.1.0')
    .showSuggestionAfterError(true);

for (const addCommand of commands) {
    addCommand(program);
}

program
    .parseAsync()
    .then(data => {
        if (data.args.length === 0) {
            program.help();
        }
    })
    .catch(err => {
        console.error(err);
    });
