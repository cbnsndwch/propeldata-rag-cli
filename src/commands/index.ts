import type { AddCommandFn } from '../contracts';

import { addAskCommand } from './ask';
import { addBuildIndexCommand } from './build-index';

/**
 * The list of command to add to the CLI. Add new command factories here to have
 * them available for invocation.
 */
export const commands: AddCommandFn[] = [
    addAskCommand,
    addBuildIndexCommand
    // add more command factories here as needed
];
