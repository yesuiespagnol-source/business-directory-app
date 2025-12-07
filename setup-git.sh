#!/bin/bash

# Script para subir la aplicación a GitHub
# Uso: ./setup-git.sh https://github.com/TU-USUARIO/TU-REPO.git

echo "🚀 Configurando Git para Business Directory App"
echo ""

# Verificar que se proporcionó la URL del repositorio
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la URL del repositorio de GitHub"
    echo ""
    echo "Uso: ./setup-git.sh https://github.com/TU-USUARIO/TU-REPO.git"
    echo ""
    echo "Pasos:"
    echo "1. Ve a https://github.com/new"
    echo "2. Crea un nuevo repositorio"
    echo "3. Copia la URL del repositorio"
    echo "4. Ejecuta: ./setup-git.sh URL-DEL-REPO"
    exit 1
fi

REPO_URL=$1

echo "📦 Repositorio: $REPO_URL"
echo ""

# Inicializar git si no existe
if [ ! -d .git ]; then
    echo "🔧 Inicializando repositorio Git..."
    git init
    echo "✅ Git inicializado"
else
    echo "✅ Git ya está inicializado"
fi

# Agregar todos los archivos
echo ""
echo "📝 Agregando archivos..."
git add .
echo "✅ Archivos agregados"

# Hacer commit
echo ""
echo "💾 Creando commit..."
git commit -m "Initial commit - Business Directory App ready for Vercel"
echo "✅ Commit creado"

# Configurar rama principal como 'main'
echo ""
echo "🌿 Configurando rama principal..."
git branch -M main
echo "✅ Rama configurada"

# Agregar remote
echo ""
echo "🔗 Conectando con GitHub..."
git remote add origin $REPO_URL 2>/dev/null || git remote set-url origin $REPO_URL
echo "✅ Repositorio remoto configurado"

# Subir código
echo ""
echo "⬆️  Subiendo código a GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Éxito! Tu código está en GitHub"
    echo ""
    echo "📍 Próximos pasos:"
    echo "1. Ve a https://vercel.com"
    echo "2. Haz login con GitHub"
    echo "3. Click en 'New Project'"
    echo "4. Selecciona tu repositorio"
    echo "5. Agrega la variable de entorno ANTHROPIC_API_KEY"
    echo "6. Click en 'Deploy'"
    echo ""
    echo "🌐 Tu app estará en vivo en minutos!"
else
    echo ""
    echo "❌ Error al subir el código"
    echo "Verifica que:"
    echo "- Tengas permisos para el repositorio"
    echo "- La URL del repositorio sea correcta"
    echo "- Hayas iniciado sesión en Git (git config user.name y user.email)"
fi
