import {
    parse,
    Kind,
    DocumentNode,
    ObjectTypeDefinitionNode,
    FieldDefinitionNode,
    TypeNode,
    OperationTypeNode
} from 'graphql';

function getQueryType(ast: DocumentNode) {
    const type = ast.definitions.find(
        def =>
            def.kind === Kind.OBJECT_TYPE_DEFINITION &&
            def.name.value === 'Query'
    )!;

    return type as ObjectTypeDefinitionNode;
}

function collectTypes(node: TypeNode, types: Set<string>) {
    switch (node.kind) {
        case Kind.NAMED_TYPE:
            types.add(node.name.value);
            break;
        case Kind.LIST_TYPE:
        case Kind.NON_NULL_TYPE:
            collectTypes(node.type, types);
            break;
    }
}

/**
 * Helper function to find all types referenced by a given field
 */
function findReferencedTypes(
    field: FieldDefinitionNode,
    ast: DocumentNode,
    types: Set<string>
) {
    collectTypes(field.type, types);

    // Recursively find all related types
    types.forEach(typeName => {
        const type = ast.definitions.find(
            def =>
                def.kind === Kind.OBJECT_TYPE_DEFINITION &&
                def.name.value === typeName
        ) as ObjectTypeDefinitionNode;

        type?.fields?.forEach(field => {
            collectTypes(field.type, types);
        });
    });

    return Array.from(types);
}

export function splitSchema(sdl: string) {
    // parse the original schema
    const ast = parse(sdl);

    const types = new Set<string>();

    // extract the root query type
    const queryType = getQueryType(ast);
    if (!queryType?.fields) {
        return [];
    }

    /**
     * Create individual schemas for each query field
     */
    const individualSchemas = queryType.fields.map(queryField => {
        console.log(`Query field: ${queryField.name.value}`);

        const referencedTypes = findReferencedTypes(queryField, ast, types);

        // Filter the necessary type definitions
        const necessaryTypeDefs = ast.definitions.filter(
            def =>
                def.kind === Kind.OBJECT_TYPE_DEFINITION &&
                referencedTypes.includes(def.name.value)
        );

        // Construct a new schema AST for each query
        const newSchemaAST: DocumentNode = {
            kind: Kind.DOCUMENT,
            definitions: [
                ...necessaryTypeDefs,
                {
                    kind: Kind.SCHEMA_DEFINITION,
                    operationTypes: [
                        {
                            kind: Kind.OPERATION_TYPE_DEFINITION,
                            operation: OperationTypeNode.QUERY,
                            type: {
                                kind: Kind.NAMED_TYPE,
                                name: { kind: Kind.NAME, value: 'Query' }
                            }
                        }
                    ]
                },
                {
                    kind: Kind.OBJECT_TYPE_DEFINITION,
                    name: { kind: Kind.NAME, value: 'Query' },
                    fields: [queryField]
                }
            ]
        };

        // return buildASTSchema(newSchemaAST);

        return newSchemaAST;
    });

    return individualSchemas;
}
