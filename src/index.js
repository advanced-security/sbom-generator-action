const core = require('@actions/core');
const { Octokit } = require('@octokit/core');
const wait = require('./wait');
require('dotenv').config();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN});


// most @actions toolkit packages have async methods
async function run() {
  try {
    const ms = core.getInput('milliseconds');
    core.info(`Waiting ${ms} milliseconds ...`);

    core.debug((new Date()).toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    await wait(parseInt(ms));
    core.info((new Date()).toTimeString());

    core.setOutput('time', new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }

  getDependencyGraph()
}

async function getDependencyGraph() {
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
    owner: process.env.GITHUB_REPOSITORY.split('/')[0],
    name: process.env.GITHUB_REPOSITORY.split('/')[1], 
    mediaType: {
      previews: ["hawkgirl"],
    }
  });
  console.log(dependencyGraph);
}

run();
