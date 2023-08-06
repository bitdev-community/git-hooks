const { execSync } = require('child_process');

function verifyComponentsAreSnapped() {
  const statusRaw = execSync('bit status --json', { encoding: 'utf8' }).trim();
  const status = JSON.parse(statusRaw);
  if (status.newComponents.length || status.modifiedComponents.length) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      'error: new/modified components are not snapped!\n'
    );
    console.log(
      'run `bit snap` and commit any modifications to the .bitmap file before pushing to the remote.\n'
    );
    process.exit(1);
  }
}

verifyComponentsAreSnapped();
execSync('bit export', { stdio: 'inherit' });
