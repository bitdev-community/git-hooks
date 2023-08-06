const { execSync } = require('child_process');
const { readFileSync } = require('fs');

/* the name of your repo's main or default branch */
const DEFAULT_BRANCH = 'main';
/* the path to your workspace.jsonc file */
const WORKSPACE_FILE = './workspace.jsonc';

function getDefaultScope() {
  const workspaceString = readFileSync(WORKSPACE_FILE).toString();
  const removedUrl = workspaceString.replace(/(https?:\/\/[^\s]+)/g, '",');
  const json = removedUrl.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
  const workspaceObj = JSON.parse(json);
  return workspaceObj['teambit.workspace/workspace'].defaultScope;
}

function runCommand(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

function brachIsNotNew() {
  /* check if the branch has been checked out before */
  const previousCheckouts = runCommand(
    `git reflog show --grep-reflog="checkout: moving from .* to ${currentBranchName}" | wc -l`
  );
  const neverCheckedOut = previousCheckouts === '1';

  /* check if the branch has been pushed to remote */
  const hasRemote = !!runCommand(
    `git config branch.${currentBranchName}.remote || echo ""`
  );
  return !neverCheckedOut || hasRemote;
}

/**
 * switch to 'main', switch to a lane or create a new lane
 * */
const currentBranchName = runCommand('git branch --show-current');
if (currentBranchName === DEFAULT_BRANCH) {
  execSync('bit lane switch main', { stdio: 'inherit' });
} else if (brachIsNotNew()) {
  const defaultScope = getDefaultScope();
  /* switch to the lane if the branch is not new. use lane id to import the lane if not available locally */
  execSync(`bit lane switch ${defaultScope}/${currentBranchName}`, {
    stdio: 'inherit',
  });
} else {
  execSync(`bit lane create ${currentBranchName}`, { stdio: 'inherit' });
}
