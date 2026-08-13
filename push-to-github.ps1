param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$owner = "tjavanshir"
$repo  = "ld-portfolio"
$root  = "C:\Users\tjava\ld-portfolio"

$headers = @{
    Authorization = "token $Token"
    Accept        = "application/vnd.github.v3+json"
    "User-Agent"  = "PowerShell"
}

# ── 1. Create the repository ──────────────────────────────────────────────────
Write-Host "`nCreating repository '$repo' on GitHub..." -ForegroundColor Cyan

$body = @{ name = $repo; description = "L&D Portfolio - Instructional Designer"; private = $false; auto_init = $false } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "Repository created: $($r.html_url)" -ForegroundColor Green
} catch {
    $msg = $_ | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($msg.errors.message -like "*already exists*" -or $_.Exception.Response.StatusCode -eq 422) {
        Write-Host "Repository already exists — continuing with file upload." -ForegroundColor Yellow
    } else {
        Write-Host "Failed to create repo: $_" -ForegroundColor Red
        exit 1
    }
}

Start-Sleep -Seconds 2

# ── 2. Upload every file ──────────────────────────────────────────────────────
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object { $_.Name -ne "push-to-github.ps1" }
$total = $files.Count
$i     = 0

foreach ($file in $files) {
    $i++
    $rel     = $file.FullName.Substring($root.Length + 1).Replace("\", "/")
    $bytes   = [System.IO.File]::ReadAllBytes($file.FullName)
    $encoded = [System.Convert]::ToBase64String($bytes)

    $fileBody = @{ message = "Add $rel"; content = $encoded } | ConvertTo-Json -Depth 3
    $url      = "https://api.github.com/repos/$owner/$repo/contents/$rel"

    try {
        Invoke-RestMethod -Uri $url -Method PUT -Headers $headers -Body $fileBody -ContentType "application/json" | Out-Null
        Write-Host "[$i/$total] Uploaded: $rel" -ForegroundColor Green
    } catch {
        Write-Host "[$i/$total] FAILED:   $rel — $_" -ForegroundColor Red
    }
}

# ── 3. Done ───────────────────────────────────────────────────────────────────
Write-Host "`nAll done! Your portfolio is on GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/$owner/$repo" -ForegroundColor White
Write-Host "`nNext step: connect this repo to Netlify for live hosting."
