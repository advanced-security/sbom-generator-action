# SBOM Generator

This repository uses GitHub's dependency graph to automatically build an SBOM in SPDX 2.3 format. It supports the same [ecosystems](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph) as the dependency graph, and does not support dependencies from the [dependency submission API](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/using-the-dependency-submission-api). If you need support for a different set of formats, we recommend having a look at the [Microsoft SBOM Tool](https://github.com/microsoft/sbom-tool), or Anchore's [Syft](https://github.com/anchore/syft). 

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

      - uses: jhutchings1/sbom-generator@v1.0.0
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
2. Run `node . "githubtoken" "owner/name"` where githubtoken is a legacy GitHub token with repository read permission and owner/name matches a GitHub repository. Alternatively, this script will automatically populate those values from the `GITHUB_TOKEN` and `GITHUB_REPOSITORY` environment variables. 

## License
This repository is licensed under the MIT License. 
