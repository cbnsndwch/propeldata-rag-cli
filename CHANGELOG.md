# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/cbnsndwch/propeldata-rag-cli/compare/v0.2.0...v0.3.0) (2023-11-19)

### Features

- add MetricConnection and MetricEdge types to the metrics SDL file ([4140b90](https://github.com/cbnsndwch/propeldata-rag-cli/commit/4140b90ee900b84c7f3ff23e371ab082dd05bb41))
- rebuild vector index with updated GraphQL file contents ([83c2228](https://github.com/cbnsndwch/propeldata-rag-cli/commit/83c2228ce78e6160c59ccbb174f9ecba22762a8d))
- use source GraphQL module file names as document IDs ([9bb2b27](https://github.com/cbnsndwch/propeldata-rag-cli/commit/9bb2b27fd9bf06a2e9f913c29ae8ef713753681b))

## [0.2.0](https://github.com/cbnsndwch/propeldata-rag-cli/compare/v0.1.0...v0.2.0) (2023-11-19)

### Features

- add custom implementations for llamaindex interfaces ([9b62e11](https://github.com/cbnsndwch/propeldata-rag-cli/commit/9b62e11c92fa09b5845f29519df73e7192f832a9))
- use JSON response mode in OpenAI calls ([bc99afb](https://github.com/cbnsndwch/propeldata-rag-cli/commit/bc99afb45acd858c1497ddf56fc6f390ab203150))

## 0.1.0 (2023-11-18)

### Features

- add command to build a vector index from a directory of GraphQL SDL files
- add command to build query a persisted vector index
