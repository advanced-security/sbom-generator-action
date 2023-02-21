const core = require('@actions/core');
const { Octokit } = require('@octokit/core');
const { randomUUID } = require('crypto');
const fs = require('fs');
require('dotenv').config();

// For local usage without GitHub Actions, we can accept the token and repository nwo from the command line.
const token = process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN : process.argv[2];
const repository = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : process.argv[3];

const octokit = new Octokit({ auth: token});

// most @actions toolkit packages have async methods
async function run() {
  const fileName = createFileName('spdx');
  let sbom = await buildSBOM(await getDependencyGraph(), fileName);
  
  await writeFile(sbom, fileName);
  core.setOutput("fileName", fileName);
}

function createFileName(name) {
  const directory = process.env.GITHUB_WORKSPACE ?? ".";
  return `${directory}/${name}-${randomUUID()}.spdx.json`;
}

// Writes the given contents to a file and returns the file name. 
async function writeFile(contents, filePath) {
  //open a file called filePath and write contents to it
  fs.writeFile(filePath, contents, function (err) {
    if (err) {
      return console.log(err);
    }
    core.info("Wrote file to " + filePath);
  });
}

// Builds a SPDX license file from the given dependency graph.
async function buildSBOM(dependencyGraph, fileName) {
  core.debug("Building SPDX file");
  let spdx = { 
    "spdxVersion": "SPDX-2.3",
    "SPDXID": "SPDXRef-DOCUMENT",
    "dataLicense": "CC0-1.0",
    "name": fileName,
    "creationInfo": {
      "created": new Date(Date.now()).toISOString(),
      "creators": [
        "Tool: github.com/advanced-security/sbom-generator-action"
      ]
    },
    "packages": []
  };

  dependencyGraph?.repository?.dependencyGraphManifests?.nodes?.forEach(function (manifest){
    manifest?.dependencies?.nodes?.forEach(function(dependency) {
        let pkg = {
          "SPDXID": "SPDXRef-" + dependency.packageName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase(),
          "name" : dependency.packageName,
          "versionInfo": getPackageVersion(dependency.requirements),
          "filesAnalyzed": "false", 
          "licenseDeclared": "NOASSERTION",
          "licenseConcluded": "NOASSERTION",
          "downloadLocation": "NOASSERTION",
          "filesAnalyzed": false,
          "externalRefs"  : [
            {
              "referenceCategory": "PACKAGE-MANAGER",
              "referenceLocator": getPurl(dependency),
              "referenceType": "purl",
            },
          ]
        }
        spdx.packages.push(pkg);
    })
  });

  return JSON.stringify(spdx);
}

// Returns the PURL for the given dependency.
function getPurl(dependency) {
  let version = getPackageVersion(dependency.requirements);
  return `pkg:${dependency.packageManager}/${dependency.packageName}@${version}`;
}
// Returns the package version for the given requirements.
function getPackageVersion(version) {
  // requirements strings are formatted like '= 1.1.0'
  
  try {
    return version.match('= (.*)')[1];
  } catch (err ) {
    return version; //TODO, handle other cases better
  }
}

// Returns the dependency graph for the repository.
async function getDependencyGraph() {
  core.debug("Getting repository dependency graph");
  var dependencyGraph = await octokit.graphql(`query($name: String!, $owner: String! ) { 
    repository (owner: $owner, name: $name) {
      dependencyGraphManifests {
        nodes {
            filename
            dependencies {
                nodes {
                    packageManager
                    packageName
                    requirements
                }
            }
        }
      }
    }
  }`, 
  {
    owner: repository.split('/')[0],
    name: repository.split('/')[1], 
    mediaType: {
      previews: ["hawkgirl"],
    }
  });

  return dependencyGraph;
}

run();
