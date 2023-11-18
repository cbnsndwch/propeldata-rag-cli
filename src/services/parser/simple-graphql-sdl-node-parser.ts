import { Document, NodeParser, TextNode } from 'llamaindex';
import { parse, print, stripIgnoredCharacters } from 'graphql';

import { getHashCode } from '../../commands/build-index/utils';

/**
 * A NodeParser generates TextNodes from Documents
 */
export class SimpleGraphqlSdlNodeParser implements NodeParser {
    /**
     * Generates an array of nodes from an array of documents.
     * @param documents - The documents to generate nodes from.
     * @returns An array of nodes.
     */
    getNodesFromDocuments(documents: Document[]): TextNode[] {
        return documents.flatMap(document => {
            const ast = parse(document.text);
            const nodes: TextNode[] = [];

            ast.definitions.forEach(definition => {
                const definitionSdl = stripIgnoredCharacters(print(definition));

                if (!definitionSdl?.length) {
                    return;
                }

                nodes.push(
                    new TextNode({
                        id_: getHashCode(definitionSdl),
                        text: definitionSdl,
                        startCharIdx: definition.loc?.start,
                        endCharIdx: definition.loc?.end
                    })
                );
            });

            return nodes;
        });
    }
}
