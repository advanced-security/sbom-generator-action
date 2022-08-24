# SBOM Generator

This repository uses GitHub's dependency graph to automatically build an SBOM in SPDX 2.3 format. 

## Usage
### GitHub Actions

You can add this Action to a GitHub Actions workflow by adding the following YAML to a workflow file. 

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
