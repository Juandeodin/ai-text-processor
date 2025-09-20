#!/usr/bin/env node

/**
 * Script para instalar dependencias específicas del proveedor de IA
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Leer configuración del proveedor
require('dotenv').config();
const provider = process.env.AI_PROVIDER || 'openai';

console.log(`🤖 Configurando dependencias para el proveedor: ${provider.toUpperCase()}`);

const dependencies = {
    openai: ['openai@^4.20.1'],
    anthropic: ['@anthropic-ai/sdk@^0.24.3'],
    google: ['@google/generative-ai@^0.15.0'],
    azure: ['openai@^4.20.1'], // Azure usa el mismo SDK que OpenAI
    huggingface: ['node-fetch@^2.7.0'], // Ya incluido en dependencies principales
    local: ['node-fetch@^2.7.0'] // Ya incluido en dependencies principales
};

function installDependencies(packages) {
    if (packages.length === 0) {
        console.log('✅ No se requieren dependencias adicionales');
        return;
    }

    console.log(`📦 Instalando: ${packages.join(', ')}`);
    
    try {
        execSync(`npm install ${packages.join(' ')}`, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('✅ Dependencias instaladas correctamente');
    } catch (error) {
        console.error('❌ Error instalando dependencias:', error.message);
        process.exit(1);
    }
}

function createEnvIfNotExists() {
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
        console.log('📋 Creando archivo .env desde .env.example');
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Archivo .env creado. Por favor, configura tus API keys.');
    }
}

function showConfiguration() {
    console.log('\n🔧 CONFIGURACIÓN REQUERIDA:');
    console.log(`Proveedor seleccionado: ${provider.toUpperCase()}\n`);
    
    switch (provider) {
        case 'openai':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=openai');
            console.log('OPENAI_API_KEY=tu_clave_aqui');
            console.log('\n🔗 Obtén tu API key en: https://platform.openai.com/api-keys');
            break;
            
        case 'anthropic':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=anthropic');
            console.log('ANTHROPIC_API_KEY=tu_clave_aqui');
            console.log('\n🔗 Obtén tu API key en: https://console.anthropic.com/');
            break;
            
        case 'google':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=google');
            console.log('GOOGLE_AI_API_KEY=tu_clave_aqui');
            console.log('\n🔗 Obtén tu API key en: https://makersuite.google.com/app/apikey');
            break;
            
        case 'azure':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=azure');
            console.log('AZURE_OPENAI_API_KEY=tu_clave_aqui');
            console.log('AZURE_OPENAI_ENDPOINT=https://tu-recurso.openai.azure.com/');
            console.log('AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo');
            console.log('\n🔗 Configura en: https://portal.azure.com/');
            break;
            
        case 'huggingface':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=huggingface');
            console.log('HUGGINGFACE_API_KEY=tu_clave_aqui');
            console.log('HUGGINGFACE_MODEL=meta-llama/Llama-2-70b-chat-hf');
            console.log('\n🔗 Obtén tu API key en: https://huggingface.co/settings/tokens');
            break;
            
        case 'local':
            console.log('Configura en tu archivo .env:');
            console.log('AI_PROVIDER=local');
            console.log('LOCAL_LLM_ENDPOINT=http://localhost:11434');
            console.log('LOCAL_LLM_MODEL=llama2');
            console.log('\n🔗 Instala Ollama desde: https://ollama.ai/');
            console.log('Ejecuta: ollama pull llama2');
            break;
            
        default:
            console.log('❌ Proveedor no reconocido. Proveedores disponibles:');
            console.log('openai, anthropic, google, azure, huggingface, local');
    }
    
    console.log('\n📚 Más información en el README.md');
}

// Ejecutar script
try {
    createEnvIfNotExists();
    
    const packagesToInstall = dependencies[provider] || [];
    installDependencies(packagesToInstall);
    
    showConfiguration();
    
    console.log('\n🚀 ¡Listo! Ejecuta "npm start" para iniciar la aplicación');
    
} catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
}