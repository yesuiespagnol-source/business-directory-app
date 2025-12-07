# 🚀 Guía de Despliegue en Vercel

Esta aplicación está configurada para desplegarse fácilmente en Vercel.

## 📋 Requisitos Previos

- Cuenta de GitHub
- Cuenta de Vercel (gratis en [vercel.com](https://vercel.com))
- API Key de Anthropic

## 🎯 Pasos para Desplegar

### 1. Subir el código a GitHub

Si aún no lo has hecho, crea un repositorio en GitHub y sube el código:

```bash
cd /Users/fg/.gemini/antigravity/playground/blazing-gravity

# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Business Directory App"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git

# Subir el código
git push -u origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en **"Add New Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. Click en **"Deploy"**

### 3. Configurar Variables de Entorno

Después del primer despliegue:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega la siguiente variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Tu API key de Anthropic
   - **Environment:** Production, Preview, Development (selecciona todos)
4. Click en **"Save"**

### 4. Re-desplegar

1. Ve a **"Deployments"**
2. Click en los tres puntos del último deployment
3. Click en **"Redeploy"**

¡Listo! Tu aplicación estará disponible en una URL como: `https://tu-proyecto.vercel.app`

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a tu repositorio de GitHub, Vercel automáticamente:
- Detectará los cambios
- Construirá la aplicación
- Desplegará la nueva versión

## 🌐 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio
3. Sigue las instrucciones para configurar el DNS

## 📊 Monitoreo

Vercel te proporciona:
- Analytics de uso
- Logs de las funciones serverless
- Métricas de rendimiento

Accede a todo esto desde el dashboard de tu proyecto.

## ⚡ Características de Vercel

- ✅ HTTPS automático
- ✅ CDN global (rápido en todo el mundo)
- ✅ Despliegues automáticos desde GitHub
- ✅ Preview deployments (cada PR tiene su propia URL)
- ✅ Rollback instantáneo a versiones anteriores
- ✅ Edge Functions (funciones serverless ultra-rápidas)

## 🆘 Solución de Problemas

### Error: "ANTHROPIC_API_KEY is not defined"
- Asegúrate de haber configurado la variable de entorno en Vercel
- Re-despliega después de agregar la variable

### Error: "Build failed"
- Revisa los logs en Vercel
- Asegúrate de que `package.json` tenga todas las dependencias

### La búsqueda tarda mucho
- Normal en el plan gratuito (cold start)
- Después de la primera búsqueda, será más rápido

## 💰 Límites del Plan Gratuito

- ⏱️ 10 segundos de timeout por función
- 📊 100GB de ancho de banda/mes
- 🔄 100 despliegues/día
- 💾 Funciones serverless ilimitadas

**Para esta aplicación, el plan gratuito es más que suficiente.**

## 🎓 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli) (para desplegar desde terminal)
- [Soporte de Vercel](https://vercel.com/support)
