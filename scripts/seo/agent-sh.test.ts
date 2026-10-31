/**
 * agent.sh end-to-end regression tests.
 *
 * The autonomous agent was BLOCKED from 30 Aug to 31 Oct 2026 after three
 * consecutive "failures", none of which was the agent's fault:
 *   - 27 and 28 Aug: the "src/content was written" gate fired on files the
 *     owner had left uncommitted before the run started.
 *   - 30 Aug: the Mac went to sleep mid-run and the API call was cut off.
 * By October `claude` had also moved to ~/.local/bin, which the script's
 * hard-coded PATH did not include, so a revived job could not even start.
 *
 * Each test runs the real agent.sh inside a throwaway git repo with a fake
 * HOME, so the fake `claude` binary below is the one the script resolves.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SEO = import.meta.dir;
const COPIED = ['agent.sh', 'agent-prompt.md', 'protected-paths.mjs', 'record-run.mjs', 'sync-clone.sh'];

let root: string;
let repo: string;
let home: string;

function git(cwd: string, ...args: string[]) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout;
}

/** Fake claude: records the sleep assertions held for it, runs FAKE_ACTION, prints a result JSON. */
const FAKE_CLAUDE = `#!/bin/bash
cat >/dev/null
printf '%s\\n' "$@" > "$FAKE_OUT/args"
{ pmset -g assertions 2>/dev/null | grep "pid $$)" || true; } > "$FAKE_OUT/ran"
if [ -n "\${FAKE_ACTION:-}" ]; then eval "$FAKE_ACTION"; fi
echo '{"subtype":"success","is_error":false,"num_turns":1,"total_cost_usd":0.01,"duration_ms":1000}'
`;

function runAgent(action = '') {
  const r = spawnSync('bash', [join(repo, 'scripts/seo/agent.sh')], {
    cwd: repo,
    encoding: 'utf8',
    env: {
      HOME: home,
      LANG: 'tr_TR.UTF-8',
      FAKE_OUT: root,
      FAKE_ACTION: action,
      SEO_AGENT_SKIP_SYNC: '1',
      TZ: 'Europe/Istanbul',
    },
  });
  const logs = spawnSync('bash', ['-c', 'cat seo/logs/agent-*.log'], { cwd: repo, encoding: 'utf8' }).stdout;
  const state = JSON.parse(readFileSync(join(repo, 'seo/private/SEO_STATE.private.json'), 'utf8'));
  return { status: r.status, logs, agent: state.scheduler.agent };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'agent-sh-'));
  repo = join(root, 'repo');
  home = join(root, 'home');
  mkdirSync(join(home, '.local/bin'), { recursive: true });
  mkdirSync(join(home, '.bun/bin'), { recursive: true });
  symlinkSync(process.execPath, join(home, '.bun/bin/bun'));
  writeFileSync(join(home, '.local/bin/claude'), FAKE_CLAUDE);
  chmodSync(join(home, '.local/bin/claude'), 0o755);

  mkdirSync(join(repo, 'scripts/seo'), { recursive: true });
  mkdirSync(join(repo, 'src/content/posts'), { recursive: true });
  for (const f of COPIED) copyFileSync(join(SEO, f), join(repo, 'scripts/seo', f));
  writeFileSync(join(repo, 'src/content/posts/a.md'), 'original\n');
  writeFileSync(join(repo, '.gitignore'), '/seo/\n');
  git(repo, 'init', '-q', '-b', 'main');
  git(repo, 'config', 'user.email', 't@t');
  git(repo, 'config', 'user.name', 't');
  git(repo, 'add', '.');
  git(repo, 'commit', '-qm', 'init');
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('agent.sh', () => {
  test('finds claude in ~/.local/bin and records a clean run', () => {
    const { logs, agent } = runAgent();
    expect(existsSync(join(root, 'ran'))).toBe(true);
    expect(logs).not.toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(0);
  });

  test('owner edits made before the run are not counted as an agent violation', () => {
    writeFileSync(join(repo, 'src/content/posts/a.md'), 'owner draft\n');
    writeFileSync(join(repo, 'src/content/posts/owner-new.md'), 'owner new\n');
    const { logs, agent } = runAgent();
    expect(logs).not.toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(0);
    expect(readFileSync(join(repo, 'src/content/posts/a.md'), 'utf8')).toBe('owner draft\n');
    expect(existsSync(join(repo, 'src/content/posts/owner-new.md'))).toBe(true);
  });

  test('a file the agent writes into src/content is a violation and is removed', () => {
    const { logs, agent } = runAgent('echo leak > src/content/posts/leak.md');
    expect(logs).toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(90);
    expect(existsSync(join(repo, 'src/content/posts/leak.md'))).toBe(false);
  });

  test('editing scheduler scripts is a violation and is reverted', () => {
    const { logs, agent } = runAgent('echo evil >> scripts/seo/sync-clone.sh');
    expect(logs).toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(90);
    expect(readFileSync(join(repo, 'scripts/seo/sync-clone.sh'), 'utf8')).not.toContain('evil');
  });

  test('writing a git hook is a violation and the hook is removed', () => {
    const { logs, agent } = runAgent('printf "#!/bin/sh\\n" > .git/hooks/post-merge');
    expect(logs).toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(90);
    expect(existsSync(join(repo, '.git/hooks/post-merge'))).toBe(false);
  });

  test('a symlinked git hook is a violation and is removed', () => {
    const { logs, agent } = runAgent('ln -s /bin/sh .git/hooks/post-checkout');
    expect(logs).toContain('SINIR İHLALİ');
    expect(agent.lastExitCode).toBe(90);
    expect(existsSync(join(repo, '.git/hooks/post-checkout'))).toBe(false);
  });

  test('a hook planted by the agent never runs during the post-run cleanup', () => {
    const marker = join(root, 'hook-ran');
    const hook = `printf "#!/bin/sh\\ntouch ${marker}\\n" > .git/hooks/post-checkout; chmod +x .git/hooks/post-checkout; echo x > src/content/posts/a.md`;
    runAgent(hook);
    expect(existsSync(marker)).toBe(false);
  });

  test('claude gets scoped tools only: writes limited to seo/, no unrestricted shell', () => {
    runAgent();
    const args = readFileSync(join(root, 'args'), 'utf8').split('\n');
    const allowed = args.slice(args.indexOf('--allowedTools') + 1, args.indexOf('--disallowedTools'));
    for (const bare of ['Bash', 'Write', 'Edit']) expect(allowed).not.toContain(bare);
    expect(allowed).toContain('Write(seo/**)');
    expect(allowed).toContain('Edit(seo/**)');
    // Only fixed, side-effect-free shell commands: no interpreters, no git (git diff --output writes files).
    expect(allowed.filter((t) => t.startsWith('Bash('))).toEqual(['Bash(ls:*)', 'Bash(wc:*)']);
    // The git context the agent needs is handed over as a file instead.
    expect(readFileSync(join(repo, 'seo/private/run-context.txt'), 'utf8')).toContain('init');
  });

  test.skipIf(process.platform !== 'darwin')('keeps the Mac awake while claude runs', () => {
    runAgent();
    // caffeinate execs the command and holds the assertion on its behalf.
    expect(readFileSync(join(root, 'ran'), 'utf8')).toContain('caffeinate asserting on behalf of');
  });
});

describe('sync-clone.sh', () => {
  function makeRemote() {
    const remote = join(root, 'remote.git');
    git(root, 'clone', '-q', '--bare', repo, remote);
    git(repo, 'remote', 'add', 'origin', remote);
    git(repo, 'fetch', '-q', 'origin');
    const upstream = join(root, 'upstream');
    git(root, 'clone', '-q', remote, upstream);
    git(upstream, 'config', 'user.email', 't@t');
    git(upstream, 'config', 'user.name', 't');
    writeFileSync(join(upstream, 'new.txt'), 'new\n');
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-qm', 'upstream change');
    git(upstream, 'push', '-q', 'origin', 'main');
  }

  function sync() {
    const log = join(root, 'sync.log');
    const r = spawnSync('bash', [join(repo, 'scripts/seo/sync-clone.sh'), log], { cwd: repo, encoding: 'utf8' });
    return { status: r.status, log: existsSync(log) ? readFileSync(log, 'utf8') : '' };
  }

  test('fast-forwards the clone to origin/main and logs it', () => {
    makeRemote();
    const { status, log } = sync();
    expect(status).toBe(0);
    expect(existsSync(join(repo, 'new.txt'))).toBe(true);
    expect(log).toContain('SENKRON OK');
  });

  test('a diverged clone is left untouched and the failure is logged, not hidden', () => {
    makeRemote();
    writeFileSync(join(repo, 'local.txt'), 'local\n');
    git(repo, 'add', '.');
    git(repo, 'commit', '-qm', 'local only');
    const { status, log } = sync();
    expect(status).not.toBe(0);
    expect(existsSync(join(repo, 'new.txt'))).toBe(false);
    expect(log).toContain('SENKRON BAŞARISIZ');
  });
});
