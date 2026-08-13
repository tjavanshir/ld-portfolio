# Upload CAE SCORM package to SCORM Cloud via REST API v2
# Fetches the ZIP from GitHub Pages — no local file upload needed.
# Reads credentials from scormcloud.env in the same folder.

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Load credentials ──────────────────────────────────────────────────────────
$envFile = Join-Path $ScriptDir "scormcloud.env"
if (-not (Test-Path $envFile)) { throw "scormcloud.env not found at $envFile" }
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
        [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
    }
}
$AppId     = [System.Environment]::GetEnvironmentVariable("SCORMCLOUD_APP_ID")
$SecretKey = [System.Environment]::GetEnvironmentVariable("SCORMCLOUD_SECRET_KEY")
if (-not $AppId -or -not $SecretKey) { throw "Missing SCORMCLOUD_APP_ID or SCORMCLOUD_SECRET_KEY in .env" }

$CourseId  = "cae-teacher-cpd"
$ZipUrl    = "https://tjavanshir.github.io/ld-portfolio/samples/cae-teacher-cpd-scorm.zip"
$BaseUrl   = "https://cloud.scorm.com/api/v2"

$creds      = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${AppId}:${SecretKey}"))
$authHeader = @{ Authorization = "Basic $creds" }

# ── Step 1: Create import job (URL-based) ─────────────────────────────────────
Write-Host "`n[1/2] Submitting import job..." -ForegroundColor Cyan
Write-Host "  Source: $ZipUrl" -ForegroundColor Gray

$body = @{ url = $ZipUrl } | ConvertTo-Json
$importResponse = Invoke-RestMethod `
    -Uri "$BaseUrl/courses/importJobs?courseId=$CourseId&mayCreateNewVersion=true" `
    -Method POST `
    -Headers $authHeader `
    -ContentType "application/json" `
    -Body $body

$jobId = $importResponse.result
Write-Host "  Job ID: $jobId" -ForegroundColor Green

# ── Step 2: Poll until complete ───────────────────────────────────────────────
Write-Host "`n[2/2] Waiting for import to complete..." -ForegroundColor Cyan

$pollUrl  = "$BaseUrl/courses/importJobs/$jobId"
$maxWait  = 120
$interval = 3
$elapsed  = 0

do {
    Start-Sleep -Seconds $interval
    $elapsed += $interval
    $status = Invoke-RestMethod -Uri $pollUrl -Method GET -Headers $authHeader
    Write-Host "  [$elapsed`s] $($status.status)" -ForegroundColor Gray
} while ($status.status -notin @("COMPLETE","ERROR") -and $elapsed -lt $maxWait)

if ($status.status -eq "COMPLETE") {
    $course = $status.importResult.course
    Write-Host "`nSuccess!" -ForegroundColor Green
    Write-Host "  Title   : $($course.title)"
    Write-Host "  ID      : $($course.id)"
    Write-Host "  Standard: $($course.courseLearningStandard)"
    Write-Host "  Version : $($course.version)"
    Write-Host "`nOpen SCORM Cloud dashboard to preview or create an invitation link."
} elseif ($status.status -eq "ERROR") {
    Write-Host "`nImport failed:" -ForegroundColor Red
    $status | ConvertTo-Json -Depth 5 | Write-Host
} else {
    Write-Host "`nTimed out after ${maxWait}s. Check SCORM Cloud dashboard for job: $jobId" -ForegroundColor Yellow
}
