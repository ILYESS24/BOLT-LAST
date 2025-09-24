@echo off
setlocal enabledelayedexpansion

echo 🚀 Déploiement de Dyad Web en production...

REM Vérifier que les variables d'environnement sont définies
if not exist ".env.prod" (
    echo ❌ Fichier .env.prod non trouvé. Copiez env.prod.example vers .env.prod et configurez-le.
    pause
    exit /b 1
)

echo 📦 Construction des images Docker...
docker-compose -f docker-compose.prod.yml build --no-cache
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la construction des images
    pause
    exit /b 1
)

echo 🛑 Arrêt des services existants...
docker-compose -f docker-compose.prod.yml down

echo 🗄️ Sauvegarde de la base de données (si elle existe)...
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U %POSTGRES_USER% %POSTGRES_DB% > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql 2>nul
if %errorlevel% equ 0 (
    echo ✅ Sauvegarde créée
)

echo 🚀 Démarrage des services...
docker-compose -f docker-compose.prod.yml up -d
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du démarrage des services
    pause
    exit /b 1
)

echo ⏳ Attente du démarrage des services...
timeout /t 30 /nobreak >nul

echo 🔍 Vérification de la santé des services...
curl -f http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend opérationnel
) else (
    echo ❌ Backend non accessible
    docker-compose -f docker-compose.prod.yml logs backend
    pause
    exit /b 1
)

curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend opérationnel
) else (
    echo ❌ Frontend non accessible
    docker-compose -f docker-compose.prod.yml logs frontend
    pause
    exit /b 1
)

echo 🎉 Déploiement terminé avec succès !
echo.
echo 🌐 Application accessible sur :
echo    - Frontend: http://localhost:3000
echo    - Backend: http://localhost:3001
echo.
echo 📊 Pour voir les logs :
echo    docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 🛑 Pour arrêter :
echo    docker-compose -f docker-compose.prod.yml down
echo.
pause
