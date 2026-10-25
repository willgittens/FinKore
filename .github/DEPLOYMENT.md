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
| `FTP_PORT` | Optional integer from 1 through 65535; defaults to 21 for FTP/explicit FTPS or 22 for SFTP. |
| `FTP_HOST_KEY` | Required only if switching to SFTP: trusted OpenSSH public host key as `algorithm base64-key`, without hostname or comment. Not a private key or fingerprint. Unused for FTP/FTPS. |

The workflow explicitly sets `FTP_PROTOCOL: ftp` for plain FTP, with TLS
negotiation disabled for both control and data connections. Usernames, passwords,
directory listings, and files travel without encryption. `FTP_HOST` can be
`185.166.188.109` or `ftp.finkore.dev`; omit the `ftp://` prefix. Use port `21`.
An Environment Variable named `FTP_PROTOCOL` is not read by this workflow.

The transfer code also supports `ftps` (explicit TLS) and `sftp`; selecting one
requires editing the workflow's `FTP_PROTOCOL` value and configuring its port
and trust requirements. These modes never fall back to plain FTP. SFTP and
FTPS are different protocols; changing the port does not convert one into the
other. Implicit FTPS is not supported by this workflow.

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
Self-signed, expired, and mismatched certificates are not accepted in FTPS mode.
These TLS checks do not apply to the currently selected plain FTP mode, which
does not authenticate the server cryptographically.

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
The **diagnose_only** checkbox defaults to enabled for manual runs: leave it
enabled to test the connection without changing remote files. Clear it for an
actual upload. Push-triggered runs still upload after successful validation.
Do not run a production transfer from a development checkout. No deployment was
performed while preparing this workflow.

Inspect the validation and deployment jobs and their job summaries. Logs show
the commit SHA, `learn/` source, transfer start/completion, and result. Missing or
unsafe settings fail before connection. Raw client diagnostics are deliberately
withheld because they can repeat secrets, remote filenames or credential-bearing
URLs. Failures instead report a fixed diagnostic code, the last attempted phase,
and a client exit status in both logs and the job summary. Classification is
best-effort guidance, not proof of a unique cause. Unknown errors remain
`CLIENT_FAILURE`; check hosting-side logs without publishing credentials.
A failed transfer exits nonzero and never reports success.

### Read-only connection diagnosis

After merging this workflow change into `main`, start a new manual run with
**diagnose_only** enabled. This uses the same Environment, credentials, protocol,
destination guard, and client as deployment, including server verification when
FTPS or SFTP is selected. It forces a connection/login, accesses `FTP_SERVER_DIR`,
and lists that directory. It sends
no upload, mkdir, rename or deletion commands. A diagnostic pass confirms login,
directory access and listing; it does not prove write permission or HTTP health.

| Code | What to check |
| --- | --- |
| `DNS_FAILED`, `CONNECTION_REFUSED`, `CONNECTION_TIMEOUT` | Hostname, port, server availability, firewall and runner IP restrictions. A listing timeout can involve passive data ports. |
| `FTPS_NOT_SUPPORTED` | The endpoint rejected or does not offer explicit TLS. Confirm provider support; do not relabel plain FTP as FTPS or disable TLS checks. |
| `TLS_HOSTNAME_MISMATCH` | Use the FTP hostname matching the provider's certificate. An IP address or the website domain may identify a different certificate. |
| `TLS_CERTIFICATE_FAILED`, `TLS_NEGOTIATION_FAILED` | Certificate chain, expiration, hostname, and TLS compatibility. FileZilla accepting an untrusted certificate does not establish trusted verification. |
| `SSH_HOST_KEY_FAILED` | Confirm the configured public host key through a trusted provider channel. |
| `AUTHENTICATION_FAILED` | Login/password for the selected protocol, account status, and provider restrictions. |
| `DIRECTORY_ACCESS_FAILED` | The destination path as seen by this account and its access permissions. |
| `DATA_CONNECTION_FAILED`, `READ_ACCESS_FAILED` | Directory-listing access and passive FTP/FTPS data connections. |
| `WRITE_ACCESS_FAILED`, `STORAGE_LIMIT` | On an upload run, check write permissions, existing file types, disk/inode quota and hosting restrictions. |

Phases are `LOGIN`, `DIRECTORY`, `LISTING`, `CREATE_DIRECTORIES`, and `UPLOAD`.
SFTP's login phase includes access to the initial directory. A read-only run
never reaches the two write phases. Keep **diagnose_only** enabled until the
connection and listing work. For local comparison, use FileZilla with the same
host/account and **Only use plain FTP** for the current FTP configuration, or
**Require explicit FTP over TLS** when testing FTPS. TLS/SSH diagnostic codes
apply only when the corresponding encrypted protocol is selected. Check login
and listing without uploading, and do not bypass certificate warnings in FTPS
mode. If local access succeeds but the Actions test fails, investigate runner IP restrictions
and networking. Share only the fixed code and phase, not raw logs or credentials.

There are no PR deployment triggers, `pull_request_target`, artifact uploads,
or secrets in command-line arguments. Secrets enter only the transfer step's
environment; the password is passed to lftp through its environment, and
connection commands are supplied over standard input without being logged.

See the [lftp manual](https://lftp.yar.ru/lftp-man.html) for transfer behavior and
[GitHub Environment documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
for branch restrictions and Environment secret access.
