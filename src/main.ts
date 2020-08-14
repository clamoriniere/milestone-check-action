import * as core from '@actions/core'
import * as github from '@actions/github'
import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const context = github.context;
    const owner = context.repo.owner
    const repo = context.repo.repo
    const pull_number = getPrNumber()
    if (!pull_number) {
      console.log('Could not get pull request number from context, exiting');
      return;
    }

    const token = core.getInput('github_token') || process.env['GITHUB_TOKEN']
    if (!token) {
      throw new Error('github token not provided')
    }


    github.context.payload.get()

    // Create the octokit client
    const client = github.getOctokit(token);
      // Fetches information from the pull request
    const pullRequest = await client.pulls.get({
      owner,
      repo,
      pull_number
    })

    if (!pullRequest) {
      throw new Error('unable to retrive the PullRequest')
    }

    const milestone = pullRequest.data.milestone
    if (!milestone) {
      throw new Error('Not milestone attached to this PR, please set a milestone')
    }

    core.setOutput('milestone_title', milestone.title)
    core.setOutput('milestone_id', milestone.id)
  } catch (error) {
    core.setFailed(error.message)
  }
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

run()
