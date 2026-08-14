# ============================================
# Blood Buddy - Next.js Professional Structure
# ============================================

$folders = @(
    "src\app",
    "src\components\ui",
    "src\components\layout",
    "src\components\common",

    "src\features\auth\components",
    "src\features\auth\hooks",
    "src\features\auth\services",
    "src\features\auth\types",
    "src\features\auth\validations",

    "src\features\recipient\components",
    "src\features\recipient\hooks",
    "src\features\recipient\services",
    "src\features\recipient\types",
    "src\features\recipient\validations",

    "src\features\donor\components",
    "src\features\donor\hooks",
    "src\features\donor\services",
    "src\features\donor\types",
    "src\features\donor\validations",

    "src\features\blood-centre\components",
    "src\features\blood-centre\hooks",
    "src\features\blood-centre\services",
    "src\features\blood-centre\types",
    "src\features\blood-centre\validations",

    "src\features\profile\components",
    "src\features\profile\hooks",
    "src\features\profile\services",
    "src\features\profile\types",
    "src\features\profile\validations",

    "src\services\api",
    "src\services\storage",

    "src\hooks",

    "src\lib",

    "src\theme",

    "src\types",

    "src\config",

    "public\images",
    "public\icons",
    "public\fonts"
)

Write-Host ""
Write-Host "Creating Blood Buddy project structure..." -ForegroundColor Cyan
Write-Host ""

foreach ($folder in $folders) {

    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "Created: $folder" -ForegroundColor Green
    }
    else {
        Write-Host "Already exists: $folder" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Project structure created successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""