# SBOM Generator

## Deprecated: please use the REST API

The [REST API for Dependency Graph to generate an SPDX SBOM](https://docs.github.com/en/rest/dependency-graph/sboms?apiVersion=2022-11-28#export-a-software-bill-of-materials-sbom-for-a-repository) is much easier to use and has had many improvements over time, so it should be used instead of this action.

## Old content follows

This repository uses GitHub's dependency graph to automatically build an SBOM in SPDX 2.3 format. It supports the same [ecosystems](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph) as the dependency graph. If you need support for a different set of formats, we recommend having a look at the [Microsoft SBOM Tool](https://github.com/microsoft/sbom-tool), or Anchore's [Syft](https://github.com/anchore/syft). 

## Usage
### GitHub Actions

You can add this Action to a GitHub Actions workflow by adding the following YAML to a workflow file. This publishes the SBOM as an artifact in the Actions workflow run. 

```yaml
name: SBOM Generator

on:
  push:
    branches: [ "main" ]

  workflow_dispatch:

permissions: read-all

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: advanced-security/sbom-generator-action@v0.0.1
        id: sbom
        env: 
          GITHUB_TOKEN: ${{ github.token }}
      - uses: actions/upload-artifact@v3.1.0
        with: 
          path: ${{steps.sbom.outputs.fileName }}
          name: "SBOM"
```

### As a CLI

1. Clone this repository to your local machine. 
2. Change to that directory and run `npm install -g .`  to install this CLI locally
2. Run `sbom-generator "githubtoken" "owner/name"` where githubtoken is a legacy GitHub token with repository read permission and owner/name matches a GitHub repository. Alternatively, this script will automatically populate those values from the `GITHUB_TOKEN` and `GITHUB_REPOSITORY` environment variables. 

# License
This project is licensed under the terms of the MIT open source license. Please refer to [MIT](LICENSE.md) for the full terms.
