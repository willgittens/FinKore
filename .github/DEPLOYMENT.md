# Deploying FinKore Learn

[Deploy FinKore Learn](workflows/deploy-learn.yml) uploads the contents of
`learn/` to external hosting. The directory is the site root for
`https://finkore.dev/`; HTML, CSS, JavaScript, images, and fonts are committed.
This publishes the documentation site, not a Core release or financial service.

## Triggers and verification

Deployment runs on pushes to `main` changing `learn/**` or
`.github/workflows/deploy-learn.yml`, including merges and authorized direct
pushes. It also supports manual dispatch. Other source changes alone do not
trigger it: regenerate and commit Learn outputs when changing their sources.

The validation job requires `willgittens/FinKore` and `refs/heads/main`, then
runs `npm ci --no-audit`, `npm run verify`, and `npm run learn:build` with Node
24. It checks that regeneration leaves `learn/` unchanged. Stale committed
outputs or a failed build block deployment. This job has no production secrets.
The deployment does not wait for the separate Verify workflow: it enforces the
same authoritative verification command itself.

Only after validation succeeds does the deployment job enter the `production`
Environment. Both checkouts use the same event commit SHA, never an unmerged
PR or a later branch revision. Deployment uses the verified committed files;
it does not build or install repository dependencies in the credential-bearing
job. Both jobs have 15-minute timeouts. The `production-learn` concurrency group
prevents simultaneous uploads and does not cancel a running deployment.
GitHub may replace a pending run when newer runs arrive; this is not a FIFO
release queue.

## Required manual configuration

Open **GitHub → Settings → Environments → production**. Do not place production
credentials in repository-wide or organization-wide secrets used by PR jobs.

Keep these existing **Environment Secrets**; the workflow does not change them:

| Secret | Value |
| --- | --- |
| `FTP_HOST` | Hosting hostname or IP address only, without scheme, port, or path. |
| `FTP_USERNAME` | Dedicated hosting login, using letters, digits, `_`, `.`, `@`, `+`, or `-`. |
| `FTP_PASSWORD` | Hosting password; never put it in a URL or an Environment Variable. |

Configure these **Environment Variables** manually:

| Variable | Required configuration |
| --- | --- |
| `FTP_SERVER_DIR` | Exact existing destination directory, as seen by the hosting account. No default. |
| `FTP_ALLOW_ACCOUNT_ROOT` | Optional; defaults to disabled. Set exactly `true` only after confirming that the account is restricted to the site's publication directory and `/` is that virtual root. |
| `FTP_PROTOCOL` | `sftp` (preferred) or `ftps` (explicit FTP over TLS). No default or plain FTP fallback. |
| `FTP_PORT` | Optional integer from 1 through 65535; defaults to 22 for SFTP or 21 for explicit FTPS. |
| `FTP_HOST_KEY` | Required for SFTP: trusted OpenSSH public host key as `algorithm base64-key`, without hostname or comment. Not a private key or fingerprint. Unused for FTPS. |

The repository does not identify the server's supported protocol. Confirm it
with the hosting provider before configuring these variables. SFTP and FTPS
are different protocols; changing the port does not convert one into the other.
Implicit FTPS is not supported by this workflow.

For `FTP_SERVER_DIR`, obtain the exact publication path from the host. Absolute
and account-relative paths are supported. `/` is blocked by default; an empty
value, `.`, `..`, repeated separators, and traversal components are always
rejected, including when account-root uploads are enabled. Each non-root path
component may contain letters, digits, spaces, `_`, `-`, and `.`, with no leading
hyphen or surrounding whitespace. A trailing slash is accepted and removed
before use. The directory must already exist; it is used only as the upload
destination. Do not enter a URL. Verify it does not resolve through a server
symlink to an unintended location. Restrict or jail the deployment account to
the intended publication directory and grant only the necessary file access.

### FTP accounts whose publication directory is `/`

A hosting account can expose its assigned website folder as a virtual `/`.
If that is the provider-confirmed configuration, `/public_html` or the host's
full filesystem path may not be accessible through that login. Do not use `.`
or traversal sequences to bypass the guard, or create an extra directory merely
to satisfy it.

Confirm in the hosting panel that the deployment account is restricted to the
exact publication folder for `finkore.dev`, with no access to other sites or
the hosting account's broader home directory. Then configure these two
**Environment Variables** in the existing production Environment:

```text
FTP_SERVER_DIR=/
FTP_ALLOW_ACCOUNT_ROOT=true
```

The opt-in permits only the literal `/`; it does not supply a default destination
or weaken protocol, authentication, source-file, or traversal checks. The
workflow cannot prove the server-side account restriction: this variable records
the maintainer's explicit confirmation. Leave it unset or `false` for other
accounts. Never enable it for an unrestricted account or an operating-system
root directory.

Hostinger documents how to [restrict an additional FTP account to a specific folder](https://www.hostinger.com/support/1583246-how-to-create-additional-ftp-accounts-in-hostinger/).
Use that restriction if the current account can access more than the intended
publication directory; the workflow does not create or change hosting accounts.

For SFTP, obtain the public host key from the provider or an independently
trusted administrator. Supported key types are Ed25519, RSA, and NIST ECDSA.
A key collected using `ssh-keyscan` must be verified through that trusted
channel before it is configured. The workflow uses a temporary known-hosts
file, strict host-key checking, and no automatic acceptance or key updates.
Host-key changes require deliberate verification and a manual variable update.

For FTPS, the server must support explicit AUTH TLS with a certificate trusted
by the Ubuntu system CA store and matching `FTP_HOST`. Certificate and hostname
checks are mandatory; control, directory listing, and file transfers use TLS.
Self-signed, expired, and mismatched certificates are not accepted. No insecure
fallback or custom trust exception is configured.

Set **Deployment branches and tags → Selected branches and tags** to permit
only the **branch `main`**, with no tag or PR-ref rule. Retain the protected
branch and lead maintainer `@willgittens`'s final integration authority. Do not
enable a reviewer/self-approval combination that blocks the sole maintainer.
Environment restrictions are essential even if someone modifies a workflow on
another branch. Repository files cannot activate those restrictions for you.

## Published files and synchronization

The deployment job installs Ubuntu's `lftp`, OpenSSH client, and CA certificates.
No third-party Actions are used; GitHub-maintained actions are pinned to commit
SHAs. The token has only `contents: read`.

Only tracked regular files below `learn/` are copied to a temporary staging
directory. The contents are uploaded into `FTP_SERVER_DIR`, preserving names
and subdirectories without adding an enclosing `learn/` folder. Required hidden
files, such as `.htaccess` and `.well-known` content, are included when tracked.
Symlinks are rejected. Git/configuration directories, dependencies, `.env*`,
credential files, private-key/certificate bundles, and common temporary files
are excluded. Nothing from `.github/` or outside `learn/` is uploaded. Staging
and host-key files are removed on normal completion or failure; the hosted
runner is disposable.

The client creates required subdirectories and uploads each selected file to
its exact relative destination. It overwrites matching file contents and
requests no remote deletion, mirror, or cleanup operation. File/directory type
conflicts fail rather than replacing existing remote content. Unrelated remote
files and files removed from Git remain on the server; the maintainer must
review any desired cleanup separately.

All selected files are uploaded on each run. Incremental synchronization is
not enabled: explicit writes avoid a mirror client's automatic file/directory
replacements. There is no server-side checksum or reliable timestamp contract
configured here. This costs additional transfer time but preserves the required
non-deleting behavior without maintaining remote synchronization state.

Transfers are not an atomic site release. A failed or interrupted upload can
leave mixed versions or incomplete files. A successful transfer means the
client completed; it does not verify HTTP availability, CDN freshness, or the
rendered production site. Re-run the reviewed commit from `main` when suitable,
or restore content through the host's separately managed backup process.

## Manual deployment and failures

Open **Actions → Deploy FinKore Learn → Run workflow**, choose **main**, and run.
Do not run a production transfer from a development checkout. No deployment was
performed while preparing this workflow.

Inspect the validation and deployment jobs and their job summaries. Logs show
the commit SHA, `learn/` source, transfer start/completion, and result. Missing or
unsafe settings fail before connection. Client diagnostics are deliberately
withheld because they can repeat secrets or credential-bearing URLs. For a
transfer failure, verify the configured protocol, port, trusted server identity,
directory permissions, and hosting-side logs without pasting credentials into
Issues or logs. A failed transfer exits nonzero and never reports success.

There are no PR deployment triggers, `pull_request_target`, artifact uploads,
or secrets in command-line arguments. Secrets enter only the transfer step's
environment; the password is passed to lftp through its environment, and
connection commands are supplied over standard input without being logged.

See the [lftp manual](https://lftp.yar.ru/lftp-man.html) for transfer behavior and
[GitHub Environment documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
for branch restrictions and Environment secret access.
