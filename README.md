# PropelData RAG CLI

[![PropelData: Customer-Facing Analytics for Fast-Moving Teams][PropelData Logo]][PropelData Website]

A simple Retrieval-Augmented Generation (RAG) Command Line Interface (CLI) for PropelData's GraphQL API. It's designed to enhance data retrieval and processing by leveraging advanced querying capabilities.

> &nbsp;
> :warning: **NOTE**
> &nbsp;
> This project requires a recent version of NodeJS installed on your machine. The current LTS version is NodeJS 20.x but you should be OK using NodeJS 18.x until the end of the maintenance period in April 2025.
>
> For more information on NodeJS LTS releases, see the [NodeJS Release Schedule].
> &nbsp;

## Getting Started

Clone this repository, install the dependencies, and start TSC in watch mode.

```shell
git clone https://github.com/cbnsndwch/propeldata-rag-cli propeldata-rag-cli
yarn
yarn dev
```

## Usage

There are two ways to use this CLI:

Using the included VSCode launch configurations:

- `CMD: Build Index`
- `CMD: Ask`

Calling the CLI directly from your terminal. Run `yarn propel -h` to see a help message similar to the one below:

```shell
> yarn propel -h
Usage: propel [options] [command]

PropelData RAG/LLM CLI

Options:
  -V, --version    output the version number
  -h, --help       display help for command

Commands:
  index [options]  Build an LLM index from the PropelData GraphQL SDL
  ask   [options]  Ask the PropelData LLM index a question.
  
                   NOTE: You must run the `index` command first to build the index.
  help  [command]  display help for command
```

## Contributing

Contributions to this repository are welcome. I'll provide more in depth guidelines in the future but for now please feel free to just open issues or PRs.

## License

The contents of this repository are licensed as described in [LICENSE.md].

[PropelData Logo]: https://assets-global.website-files.com/63bd88046a1e930f29e4b697/640221cfb657647e2ce4f6c5_paulina-01.svg
[PropelData Website]: https://www.propeldata.com/
[LICENSE.md]: ./LICENSE.md
