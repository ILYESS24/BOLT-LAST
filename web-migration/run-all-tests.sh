#!/bin/bash

echo "🧪 Exécution de tous les tests CD/CI pour Dyad Web"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables pour le suivi des résultats
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour exécuter les tests et capturer les résultats
run_tests() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    echo -e "\n${BLUE}🔍 Exécution: $test_name${NC}"
    echo "Commande: $test_command"
    echo "Répertoire: $test_dir"
    echo "----------------------------------------"
    
    cd "$test_dir"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name: SUCCÈS${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $test_name: ÉCHEC${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    cd - > /dev/null
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire web-migration${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Tests à exécuter:${NC}"
echo "1. Tests Backend API (Jest)"
echo "2. Tests Frontend Components (Vitest)"
echo "3. Tests d'Intégration End-to-End"
echo "4. Tests WebSocket"
echo "5. Tests de Performance"
echo "6. Tests de Sécurité"

# 1. Tests Backend API
run_tests "Tests Backend API" "npm test" "backend"

# 2. Tests Frontend Components
run_tests "Tests Frontend Components" "npm test" "frontend"

# 3. Tests d'Intégration (si disponibles)
if [ -d "backend/src/__tests__/integration" ]; then
    run_tests "Tests d'Intégration E2E" "npm run test:integration" "backend"
fi

# 4. Tests de Performance (si disponibles)
if [ -f "backend/package.json" ] && grep -q "test:performance" backend/package.json; then
    run_tests "Tests de Performance" "npm run test:performance" "backend"
fi

# 5. Tests de Sécurité (si disponibles)
if [ -f "backend/package.json" ] && grep -q "test:security" backend/package.json; then
    run_tests "Tests de Sécurité" "npm run test:security" "backend"
fi

# 6. Tests de Linting
run_tests "Linting Backend" "npm run lint" "backend"
run_tests "Linting Frontend" "npm run lint" "frontend"

# 7. Tests de Build
run_tests "Build Backend" "npm run build" "backend"
run_tests "Build Frontend" "npm run build" "frontend"

# 8. Tests de Type Checking
run_tests "Type Checking Backend" "npm run ts" "backend"
run_tests "Type Checking Frontend" "npx tsc --noEmit" "frontend"

# Résumé des résultats
echo -e "\n${BLUE}📊 RÉSUMÉ DES TESTS${NC}"
echo "=================="
echo -e "Total des tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests réussis: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests échoués: ${RED}$FAILED_TESTS${NC}"

# Calcul du pourcentage de réussite
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Taux de réussite: ${BLUE}$SUCCESS_RATE%${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
        echo -e "${GREEN}L'application est prête pour la production !${NC}"
        exit 0
    else
        echo -e "\n${RED}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
        echo -e "${YELLOW}Veuillez corriger les erreurs avant le déploiement.${NC}"
        exit 1
    fi
else
    echo -e "\n${RED}❌ AUCUN TEST N'A ÉTÉ EXÉCUTÉ${NC}"
    exit 1
fi
