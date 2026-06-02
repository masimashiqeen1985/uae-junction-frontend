# GIT-INIT.ps1 — run on Windows (PowerShell) from the repo folder.
# Safe: removes the half-written .git, re-inits cleanly, makes a baseline commit.
# Nothing in your source files is touched or deleted.

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot"

Write-Host "Repo: $PSScriptRoot" -ForegroundColor Cyan

# 1. Remove the corrupt/partial .git created over the mount (if present)
if (Test-Path ".git") {
    Write-Host "Removing partial .git ..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

# 2. Clean init
git init
git config user.email "masimashiqeen@gmail.com"
git config user.name "ASIM"

# 3. Stage everything (.gitignore already excludes node_modules/.next/.env)
git add -A

# 4. Safety check — confirm nothing sensitive is staged
$bad = git diff --cached --name-only | Select-String -Pattern 'node_modules|\.next/|^\.env$'
if ($bad) {
    Write-Host "STOP: sensitive files staged:" -ForegroundColor Red
    $bad
    exit 1
}

# 5. Baseline commit
git commit -m "chore: initial commit - baseline snapshot of uae-junction-frontend"

Write-Host "`nDone. Baseline:" -ForegroundColor Green
git log --oneline
git status --short
