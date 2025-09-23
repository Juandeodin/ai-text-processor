// Importar librerías según el proveedor configurado
const AIProviders = {
    openai: null,
    anthropic: null,
    google: null,
    azure: null
};

// Configurar el proveedor de IA
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Inicializar el proveedor seleccionado
async function initializeAIProvider() {
    try {
        switch (AI_PROVIDER) {
            case 'openai':
                if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key') {
                    const { OpenAI } = require('openai');
                    AIProviders.openai = new OpenAI({
                        apiKey: process.env.OPENAI_API_KEY
                    });
                    console.log('✅ OpenAI provider inicializado');
                }
                break;
                
            case 'anthropic':
                if (process.env.ANTHROPIC_API_KEY) {
                    const Anthropic = require('@anthropic-ai/sdk');
                    AIProviders.anthropic = new Anthropic({
                        apiKey: process.env.ANTHROPIC_API_KEY
                    });
                    console.log('✅ Anthropic provider inicializado');
                }
                break;
                
            case 'google':
                if (process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'tu_clave_api_de_google_aqui') {
                    const { GoogleGenerativeAI } = require('@google/generative-ai');
                    AIProviders.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
                    console.log('✅ Google AI provider inicializado');
                    console.log(`📝 API Key configurada: ${process.env.GOOGLE_AI_API_KEY.substring(0, 10)}...`);
                } else {
                    console.warn('⚠️  Google AI API key no está configurada o es una key de placeholder');
                }
                break;
                
            case 'azure':
                if (process.env.AZURE_OPENAI_API_KEY) {
                    const { OpenAI } = require('openai');
                    AIProviders.azure = new OpenAI({
                        apiKey: process.env.AZURE_OPENAI_API_KEY,
                        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
                        defaultQuery: { 'api-version': '2024-02-15-preview' },
                        defaultHeaders: {
                            'api-key': process.env.AZURE_OPENAI_API_KEY,
                        }
                    });
                    console.log('✅ Azure OpenAI provider inicializado');
                }
                break;
        }
    } catch (error) {
        console.warn(`⚠️  Error inicializando ${AI_PROVIDER} provider:`, error.message);
    }
}

// Inicializar al importar el módulo
initializeAIProvider();

/**
 * Procesa un fragmento de texto usando IA
 * @param {string} text - Texto a procesar
 * @param {string} operation - 'transcribe' o 'translate'
 * @param {string} targetLanguage - Idioma destino (para traducción)
 * @param {object} options - Opciones adicionales
 * @returns {Promise<string>} - Texto procesado
 */
async function processLargeText(text, operation, targetLanguage = 'es', options = {}) {
    try {
        // Seleccionar el método de procesamiento según el proveedor
        switch (AI_PROVIDER) {
            case 'openai':
                return await processWithOpenAI(text, operation, targetLanguage, options);
            case 'anthropic':
                return await processWithAnthropic(text, operation, targetLanguage, options);
            case 'google':
                return await processWithGoogle(text, operation, targetLanguage, options);
            case 'azure':
                return await processWithAzure(text, operation, targetLanguage, options);
            case 'huggingface':
                return await processWithHuggingFace(text, operation, targetLanguage, options);
            case 'local':
                return await processWithLocal(text, operation, targetLanguage, options);
            default:
                throw new Error(`Proveedor de IA no soportado: ${AI_PROVIDER}`);
        }
    } catch (error) {
        console.error(`Error en processLargeText con ${AI_PROVIDER}:`, error);
        throw error;
    }
}

/**
 * Procesamiento con OpenAI
 */
async function processWithOpenAI(text, operation, targetLanguage, options) {
    if (!AIProviders.openai) {
        throw new Error('OpenAI no está configurado correctamente');
    }

    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);

    const response = await AIProviders.openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3
    });

    if (!response.choices || response.choices.length === 0) {
        throw new Error('No se recibió respuesta de OpenAI');
    }

    return response.choices[0].message.content.trim();
}

/**
 * Procesamiento con Anthropic Claude
 */
async function processWithAnthropic(text, operation, targetLanguage, options) {
    if (!AIProviders.anthropic) {
        throw new Error('Anthropic no está configurado correctamente');
    }

    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);

    const response = await AIProviders.anthropic.messages.create({
        model: options.model || 'claude-3-haiku-20240307',
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3,
        system: systemMessage,
        messages: [
            { role: 'user', content: prompt }
        ]
    });

    if (!response.content || response.content.length === 0) {
        throw new Error('No se recibió respuesta de Anthropic');
    }

    return response.content[0].text.trim();
}

/**
 * Procesamiento con Google Gemini
 */
async function processWithGoogle(text, operation, targetLanguage, options) {
    if (!AIProviders.google) {
        throw new Error('Google AI no está configurado correctamente');
    }

    // Mapear modelos de otros proveedores a modelos de Google disponibles
    let googleModel = 'gemini-1.5-flash';
    if (options.model) {
        const modelMapping = {
            'gpt-3.5-turbo': 'gemini-2.5-flash',
            'gpt-4': 'gemini-2.5-pro',
            'gpt-4-turbo': 'gemini-2.5-pro',
            'gemini-pro': 'gemini-2.5-flash',
            'gemini-1.5-pro': 'gemini-2.5-pro',
            'gemini-1.5-flash': 'gemini-2.5-flash',
            'gemini-2.5-flash': 'gemini-2.5-flash',
        };
        googleModel = modelMapping[options.model] || 'gemini-1.5-flash';
        console.log(`🔄 Modelo solicitado: ${options.model}, usando: ${googleModel}`);
    }

    const model = AIProviders.google.getGenerativeModel({ 
        model: googleModel 
    });

    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);
    const fullPrompt = `${systemMessage}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    if (!response.text()) {
        throw new Error('No se recibió respuesta de Google AI');
    }

    return response.text().trim();
}

/**
 * Procesamiento con Azure OpenAI
 */
async function processWithAzure(text, operation, targetLanguage, options) {
    if (!AIProviders.azure) {
        throw new Error('Azure OpenAI no está configurado correctamente');
    }

    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);

    const response = await AIProviders.azure.chat.completions.create({
        model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo',
        messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3
    });

    if (!response.choices || response.choices.length === 0) {
        throw new Error('No se recibió respuesta de Azure OpenAI');
    }

    return response.choices[0].message.content.trim();
}

/**
 * Procesamiento con Hugging Face
 */
async function processWithHuggingFace(text, operation, targetLanguage, options) {
    const fetch = require('node-fetch');
    
    if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error('Hugging Face API key no está configurada');
    }

    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);
    const fullPrompt = `${systemMessage}\n\n${prompt}`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
                max_length: options.maxTokens || 4000,
                temperature: options.temperature || 0.3,
                return_full_text: false
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Error de Hugging Face: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !result[0] || !result[0].generated_text) {
        throw new Error('No se recibió respuesta de Hugging Face');
    }

    return result[0].generated_text.trim();
}

/**
 * Procesamiento con LLM local (Ollama, etc.)
 */
async function processWithLocal(text, operation, targetLanguage, options) {
    const fetch = require('node-fetch');
    
    const prompt = buildPrompt(text, operation, targetLanguage);
    const systemMessage = getSystemMessage(operation);

    const response = await fetch(`${process.env.LOCAL_LLM_ENDPOINT}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: process.env.LOCAL_LLM_MODEL || 'llama2',
            prompt: `${systemMessage}\n\n${prompt}`,
            stream: false,
            options: {
                temperature: options.temperature || 0.3,
                num_predict: options.maxTokens || 4000
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Error del LLM local: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || !result.response) {
        throw new Error('No se recibió respuesta del LLM local');
    }

    return result.response.trim();
}

/**
 * Construye el prompt según la operación
 */
function buildPrompt(text, operation, targetLanguage) {
    if (operation === 'transcribe') {
        return `Por favor, transcribe y mejora la ortografía y puntuación del siguiente texto, manteniendo su significado original. Conserva el formato y estructura del texto:

${text}`;
    } else if (operation === 'translate') {
        const languageNames = {
            'es': 'español', 'en': 'inglés', 'fr': 'francés', 'de': 'alemán',
            'it': 'italiano', 'pt': 'portugués', 'ru': 'ruso', 'ja': 'japonés',
            'ko': 'coreano', 'zh': 'chino', 'ar': 'árabe', 'hi': 'hindi',
            'th': 'tailandés', 'vi': 'vietnamita'
        };
        
        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        
        return `Traduce el siguiente texto al ${targetLangName}. Mantén el formato, estructura y estilo del texto original. Proporciona una traducción natural y fluida:

${text}`;
    }
    
    throw new Error(`Operación no soportada: ${operation}`);
}

/**
 * Obtiene el mensaje del sistema según la operación
 */
function getSystemMessage(operation) {
    if (operation === 'transcribe') {
        return 'Eres un experto en transcripción y corrección de textos. Tu trabajo es mejorar la ortografía, puntuación y formato manteniendo el significado original.';
    } else if (operation === 'translate') {
        return 'Eres un traductor profesional experto. Tu trabajo es proporcionar traducciones precisas y naturales manteniendo el contexto y estilo del texto original.';
    }
    
    return 'Eres un asistente de IA experto en procesamiento de texto.';
}

/**
 * Función de demostración que simula el procesamiento cuando no hay API key
 */
async function demoProcessText(text, operation, targetLanguage) {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    if (operation === 'transcribe') {
        return `[DEMO - ${AI_PROVIDER.toUpperCase()}] Texto transcrito y corregido: ${text.substring(0, 100)}...`;
    } else {
        return `[DEMO - ${AI_PROVIDER.toUpperCase()}] Texto traducido a ${targetLanguage}: ${text.substring(0, 100)}...`;
    }
}

/**
 * Verifica si el proveedor está configurado correctamente
 */
function isProviderConfigured() {
    switch (AI_PROVIDER) {
        case 'openai':
            return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-key';
        case 'anthropic':
            return process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'demo-key';
        case 'google':
            return process.env.GOOGLE_AI_API_KEY && process.env.GOOGLE_AI_API_KEY !== 'demo-key';
        case 'azure':
            return process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT;
        case 'huggingface':
            return process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_MODEL;
        case 'local':
            return process.env.LOCAL_LLM_ENDPOINT && process.env.LOCAL_LLM_MODEL;
        default:
            return false;
    }
}

// Exportar función que verifica si usar demo o API real
async function processText(text, operation, targetLanguage, options = {}) {
    if (!isProviderConfigured()) {
        console.log(`⚠️  Usando modo demo - configura las variables para ${AI_PROVIDER.toUpperCase()}`);
        return demoProcessText(text, operation, targetLanguage);
    }
    
    return processLargeText(text, operation, targetLanguage, options);
}

/**
 * Obtiene información del proveedor actual
 */
function getProviderInfo() {
    return {
        provider: AI_PROVIDER,
        configured: isProviderConfigured(),
        supportedOperations: ['transcribe', 'translate'],
        defaultModels: {
            openai: 'gpt-3.5-turbo',
            anthropic: 'claude-3-haiku-20240307',
            google: 'gemini-1.5-flash',
            azure: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo',
            huggingface: process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-2-70b-chat-hf',
            local: process.env.LOCAL_LLM_MODEL || 'llama2'
        }
    };
}

module.exports = {
    processLargeText: processText,
    processText,
    getProviderInfo,
    isProviderConfigured
};