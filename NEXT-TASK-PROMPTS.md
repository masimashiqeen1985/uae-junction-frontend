# UAE Junction — Next-Task Prompts

Two self-contained prompts. Run **Track A first** (security/irreversible), then **Track B**.
Repo: `C:\Users\lenovo\Documents\Claude\Projects\Final Website The UAE Junction\uae-junction-frontend`
Stack: Headless WordPress (cms.theuaejunction.cloud) + Next.js 15 / React 19 / Tailwind v4.
Git: initialized, clean. Last commits: `51427cd` (font/perf), `cad8fc6` (css/alt fix), `8d47d50` (baseline).
Safety rule: nothing destructive without a backup + verify; never push secrets to a remote.

---

## TRACK A — Repo Safety & Security (do this FIRST, in order)

```
Context: My Next.js repo is at "C:\Users\lenovo\Documents\Claude\Projects\Final Website The UAE Junction\uae-junction-frontend".
It's a git repo (clean, last commit 51427cd). There are plaintext credential files in the PARENT
folder ("Final Website The UAE Junction") — names include UAE-JUNCTION-CREDENTIALS.txt,
WordPress-CMS-Credentials.txt, UAE_JUNCTION_CREDENTIALS.txt, UAE_JUNCTION_CREDENTIALS.txt.
I want to (1) finish the pending Next.js security upgrade, (2) get all secrets out of the repo
tree, and (3) push a clean baseline to a NEW PRIVATE GitHub repo.

Do this in strict order and STOP for my confirmation before the push:

1. SECURITY UPGRADE: have me run `npm install next@15` + `npm run build` + `npm audit`.
   Confirm the critical CVE (CVE-2025-66478) is cleared. Tell me if the remaining moderate
   advisory is production-reachable or safe to leave. Commit the result.

2. SECRETS AUDIT: search the WHOLE project tree (repo AND parent folder) for any file
   containing credentials, API keys, tokens, passwords, .env values, or connection strings.
   List every hit by path. DO NOT print the secret values. Confirm none are git-tracked
   (`git ls-files | grep -i cred/secret/key/env`). If any are tracked, STOP and tell me.

3. REMEDIATE: recommend where secrets should live instead (password manager / untracked
   local .env). Make sure .gitignore covers them. Give me copy-paste commands to MOVE the
   credential .txt files out of the project tree to a safe location I choose.

4. PRE-PUSH GATE: show me `git status` and the full `git ls-files` list so I can confirm
   NOTHING sensitive is staged. WAIT for my explicit "yes, push".

5. PUSH: walk me through creating a PRIVATE GitHub repo and pushing. Prefer the gh CLI or a
   personal access token. Verify the remote shows only the intended files.

Play safe: this is the irreversible, security-sensitive path. Backups/verify at each step.
```

---

## TRACK B — CMS / ACF Options Page Wiring (do AFTER Track A push)

```
Context: Same repo as above. The frontend already expects a WordPress ACF Options Page:
lib/queries.ts has a GET_SITE_OPTIONS query that is currently just a STUB returning an id.
The CMS is headless WordPress at cms.theuaejunction.cloud using WPGraphQL + ACF.
I want to wire the ACF options page (and any menus) so the frontend can query global site
options (header/footer/contact/social, etc.) through GraphQL, then update the frontend stub
to use the real fields.

Before doing anything, ask me for and confirm:
- How you can reach the WP backend (SSH/wp-cli access? admin login? a connector?). You have
  NO WP access by default — do not assume.
- The real ACF field-group name(s) and the exact fields I want exposed.
- The desired graphql_field_name for the options page.

Then:
1. Tell me exactly what to set on the WP side: acf_add_options_page() with
   'show_in_graphql' => true + 'graphql_field_name', and the field group's "Show in GraphQL"
   toggle + GraphQL field name. Then flush the schema cache.
2. Give me a verification GraphQL query to run in the WPGraphQL IDE that returns real data.
3. ONLY after the query returns data, update lib/queries.ts (replace the GET_SITE_OPTIONS
   stub) and add the matching types in types/index.ts. Build + verify green. Commit on a
   branch, not straight to main.

Additive only — this task should not delete anything. Verify the build stays green.
```

---

### Parallel-safe note
You can gather Track B's inputs (WP access method + ACF field names) while Track A runs —
that's just info-collection, zero conflict. The only thing that must NOT happen concurrently
is committing to the repo from both tracks, or pushing before secrets are secured.
