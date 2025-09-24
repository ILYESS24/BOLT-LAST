@echo off
setlocal enabledelayedexpansion

echo 🧪 Exécution de tous les tests CD/CI pour Dyad Web
echo ==================================================

REM Variables pour le suivi des résultats
set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0

REM Fonction pour exécuter les tests
:run_tests
set test_name=%1
set test_command=%2
set test_dir=%3

echo.
echo 🔍 Exécution: %test_name%
echo Commande: %test_command%
echo Répertoire: %test_dir%
echo ----------------------------------------

cd /d "%test_dir%"
call %test_command%
if %errorlevel% equ 0 (
    echo ✅ %test_name%: SUCCÈS
    set /a PASSED_TESTS+=1
) else (
    echo ❌ %test_name%: ÉCHEC
    set /a FAILED_TESTS+=1
)
set /a TOTAL_TESTS+=1
cd /d "%~dp0"
goto :eof

REM Vérifier que nous sommes dans le bon répertoire
if not exist "backend" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le répertoire web-migration
    pause
    exit /b 1
)
if not exist "frontend" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le répertoire web-migration
    pause
    exit /b 1
)

echo 📋 Tests à exécuter:
echo 1. Tests Backend API (Jest)
echo 2. Tests Frontend Components (Vitest)
echo 3. Tests d'Intégration End-to-End
echo 4. Tests WebSocket
echo 5. Tests de Performance
echo 6. Tests de Sécurité

REM 1. Tests Backend API
call :run_tests "Tests Backend API" "npm test" "backend"

REM 2. Tests Frontend Components
call :run_tests "Tests Frontend Components" "npm test" "frontend"

REM 3. Tests d'Intégration (si disponibles)
if exist "backend\src\__tests__\integration" (
    call :run_tests "Tests d'Intégration E2E" "npm run test:integration" "backend"
)

REM 4. Tests de Performance (si disponibles)
findstr /C:"test:performance" backend\package.json >nul 2>&1
if %errorlevel% equ 0 (
    call :run_tests "Tests de Performance" "npm run test:performance" "backend"
)

REM 5. Tests de Sécurité (si disponibles)
findstr /C:"test:security" backend\package.json >nul 2>&1
if %errorlevel% equ 0 (
    call :run_tests "Tests de Sécurité" "npm run test:security" "backend"
)

REM 6. Tests de Linting
call :run_tests "Linting Backend" "npm run lint" "backend"
call :run_tests "Linting Frontend" "npm run lint" "frontend"

REM 7. Tests de Build
call :run_tests "Build Backend" "npm run build" "backend"
call :run_tests "Build Frontend" "npm run build" "frontend"

REM 8. Tests de Type Checking
call :run_tests "Type Checking Backend" "npm run ts" "backend"
call :run_tests "Type Checking Frontend" "npx tsc --noEmit" "frontend"

REM Résumé des résultats
echo.
echo 📊 RÉSUMÉ DES TESTS
echo ==================
echo Total des tests: %TOTAL_TESTS%
echo Tests réussis: %PASSED_TESTS%
echo Tests échoués: %FAILED_TESTS%

REM Calcul du pourcentage de réussite
if %TOTAL_TESTS% gtr 0 (
    set /a SUCCESS_RATE=%PASSED_TESTS% * 100 / %TOTAL_TESTS%
    echo Taux de réussite: %SUCCESS_RATE%%%
    
    if %FAILED_TESTS% equ 0 (
        echo.
        echo 🎉 TOUS LES TESTS SONT PASSÉS !
        echo L'application est prête pour la production !
        pause
        exit /b 0
    ) else (
        echo.
        echo ⚠️  CERTAINS TESTS ONT ÉCHOUÉ
        echo Veuillez corriger les erreurs avant le déploiement.
        pause
        exit /b 1
    )
) else (
    echo.
    echo ❌ AUCUN TEST N'A ÉTÉ EXÉCUTÉ
    pause
    exit /b 1
)
