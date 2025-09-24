Write-Host "🧪 Exécution de tous les tests CD/CI pour Dyad Web" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

$totalTests = 0
$passedTests = 0
$failedTests = 0

function Run-Test {
    param(
        [string]$TestName,
        [string]$TestCommand,
        [string]$TestDir
    )
    
    Write-Host "`n🔍 Exécution: $TestName" -ForegroundColor Yellow
    Write-Host "Commande: $TestCommand" -ForegroundColor Gray
    Write-Host "Répertoire: $TestDir" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    Push-Location $TestDir
    
    try {
        Invoke-Expression $TestCommand
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $TestName : SUCCÈS" -ForegroundColor Green
            $script:passedTests++
        } else {
            Write-Host "❌ $TestName : ÉCHEC" -ForegroundColor Red
            $script:failedTests++
        }
    } catch {
        Write-Host "❌ $TestName : ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        $script:failedTests++
    }
    
    $script:totalTests++
    Pop-Location
}

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire web-migration" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Tests à exécuter:" -ForegroundColor Cyan
Write-Host "1. Tests Backend API (Jest)"
Write-Host "2. Tests Frontend Components (Vitest)"
Write-Host "3. Tests d'Intégration End-to-End"
Write-Host "4. Tests WebSocket"
Write-Host "5. Tests de Performance"
Write-Host "6. Tests de Sécurité"

# 1. Tests Backend API
Run-Test "Tests Backend API" "npm test" "backend"

# 2. Tests Frontend Components
Run-Test "Tests Frontend Components" "npm test" "frontend"

# 3. Tests de Linting
Run-Test "Linting Backend" "npm run lint" "backend"
Run-Test "Linting Frontend" "npm run lint" "frontend"

# 4. Tests de Build
Run-Test "Build Backend" "npm run build" "backend"
Run-Test "Build Frontend" "npm run build" "frontend"

# 5. Tests de Type Checking
Run-Test "Type Checking Backend" "npm run ts" "backend"
Run-Test "Type Checking Frontend" "npx tsc --noEmit" "frontend"

# Résumé des résultats
Write-Host "`n📊 RÉSUMÉ DES TESTS" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue
Write-Host "Total des tests: $totalTests" -ForegroundColor Blue
Write-Host "Tests réussis: $passedTests" -ForegroundColor Green
Write-Host "Tests échoués: $failedTests" -ForegroundColor Red

# Calcul du pourcentage de réussite
if ($totalTests -gt 0) {
    $successRate = [math]::Round(($passedTests * 100 / $totalTests), 1)
    Write-Host "Taux de réussite: $successRate%" -ForegroundColor Blue
    
    if ($failedTests -eq 0) {
        Write-Host "`n🎉 TOUS LES TESTS SONT PASSÉS !" -ForegroundColor Green
        Write-Host "L'application est prête pour la production !" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`n⚠️  CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Yellow
        Write-Host "Veuillez corriger les erreurs avant le déploiement." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "`n❌ AUCUN TEST N'A ÉTÉ EXÉCUTÉ" -ForegroundColor Red
    exit 1
}
