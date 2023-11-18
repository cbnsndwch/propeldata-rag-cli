import { Document, NodeParser, TextNode } from 'llamaindex';
import { print, stripIgnoredCharacters } from 'graphql';

import { getHashCode } from '../../commands/build-index/utils';
import { splitSchema } from './schema-splitter';

/**
 * A NodeParser generates TextNodes from Documents
 */
export class NaiveGraphqlSdlNodeParser implements NodeParser {
    /**
     * Generates an array of nodes from an array of documents.
     * @param documents - The documents to generate nodes from.
     * @returns An array of nodes.
     */
    getNodesFromDocuments(documents: Document[]): TextNode[] {
        return documents.flatMap(document => {
            // const ast = parse(document.text);

            // const nodes = ast.definitions
            //     .map(definition => {
            //         let text = '';
            //         switch (definition.kind) {
            //             case 'OperationDefinition':
            //                 text = definition.operation;
            //                 break;
            //             default:
            //                 text = definition.kind;
            //                 break;
            //         }

            //         // if (definition.kind === 'OperationDefinition') {
            //         //     return definition.selectionSet.selections
            //         //         .map(selection => {
            //         //             if (selection.kind === 'Field') {
            //         //                 return selection.name.value;
            //         //             }
            //         //             return '';
            //         //         })
            //         //         .join(' ');
            //         // }
            //         // return undefined;

            //         return new TextNode({
            //             id_: getHashCode(text),
            //             text,
            //             startCharIdx: definition.loc?.start,
            //             endCharIdx: definition.loc?.end
            //         });
            //     })
            //     .filter(Boolean);

            const schemas = splitSchema(document.text).map(ast => {
                const schema = print(ast);
                const minifiedSchema = stripIgnoredCharacters(schema);

                return {
                    ast,
                    schema,
                    minifiedSchema,
                    lengthDiff: schema.length - minifiedSchema.length
                };
            });

            const nodes = schemas.map(
                ({ ast, minifiedSchema: minifiedSchema }) =>
                    new TextNode({
                        id_: getHashCode(minifiedSchema),
                        text: minifiedSchema,
                        startCharIdx: 0,
                        endCharIdx: minifiedSchema.length,
                        metadata: {
                            ast,
                            length: minifiedSchema.length
                        }
                    })
            );
            return nodes;
        });
    }
}
