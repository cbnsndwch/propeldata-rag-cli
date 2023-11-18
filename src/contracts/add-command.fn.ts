import type { Command } from 'commander';

/**
 * A data contract for a function that adds a command to the program
 *
 * @param program Commander instance
 */
export type AddCommandFn = (program: Command) => void;
