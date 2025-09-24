@echo off
echo 🚀 Démarrage de Dyad Web en mode local...

echo.
echo 📦 Installation des dépendances backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances backend
    pause
    exit /b 1
)

echo.
echo 📦 Installation des dépendances frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances frontend
    pause
    exit /b 1
)

echo.
echo 🗄️ Initialisation de la base de données...
cd ..\backend
call npm run db:push
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'initialisation de la base de données
    pause
    exit /b 1
)

echo.
echo 🎉 Installation terminée avec succès !
echo.
echo Pour démarrer l'application :
echo 1. Ouvrez un terminal et exécutez : cd backend && npm run dev
echo 2. Ouvrez un autre terminal et exécutez : cd frontend && npm run dev
echo.
echo L'application sera accessible sur :
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo.
pause
