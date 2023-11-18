import { createHash } from 'node:crypto';

/**
 * Returns a SHA512 hash using SHA-2 for the given `content`.
 *
 * @param content The string content to hash
 */
export function getHashCode(content: string) {
    return createHash('sha512').update(content).digest('hex');
}
