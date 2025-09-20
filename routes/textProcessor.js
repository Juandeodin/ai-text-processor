const express = require('express');
const router = express.Router();
const { processLargeText, getProviderInfo } = require('../services/aiService');
const { chunkText, smartChunkText } = require('../utils/textChunker');

// Endpoint POST para EventSource (Server-Sent Events)
router.post('/process-stream', async (req, res) => {
    try {
        // Obtener los datos del cuerpo de la petición
        const { text, operation, targetLanguage, options = {} } = req.body;

        if (!text) {
            return res.status(400).json({ 
                error: 'El texto es requerido' 
            });
        }

        if (!operation || !['transcribe', 'translate'].includes(operation)) {
            return res.status(400).json({ 
                error: 'Operación debe ser "transcribe" o "translate"' 
            });
        }

        if (operation === 'translate' && !targetLanguage) {
            return res.status(400).json({ 
                error: 'El idioma destino es requerido para traducción' 
            });
        }

        // Configurar SSE para streaming de respuesta
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Función para enviar eventos al cliente
        const sendEvent = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Dividir texto en chunks
        const chunks = chunkText(text, options.maxChunkSize);
        sendEvent('progress', { 
            message: `Texto dividido en ${chunks.length} fragmentos`,
            totalChunks: chunks.length,
            currentChunk: 0
        });

        let processedText = '';
        let currentChunkIndex = 0;

        // Procesar cada chunk
        for (const chunk of chunks) {
            currentChunkIndex++;
            
            sendEvent('progress', {
                message: `Procesando fragmento ${currentChunkIndex} de ${chunks.length}`,
                totalChunks: chunks.length,
                currentChunk: currentChunkIndex,
                percentage: Math.round((currentChunkIndex / chunks.length) * 100)
            });

            try {
                const result = await processLargeText(chunk, operation, targetLanguage, options);
                processedText += result + (currentChunkIndex < chunks.length ? ' ' : '');
                
                sendEvent('chunk_complete', {
                    chunkIndex: currentChunkIndex,
                    result: result,
                    partialResult: processedText
                });

            } catch (error) {
                console.error(`Error procesando chunk ${currentChunkIndex}:`, error);
                sendEvent('error', {
                    message: `Error en fragmento ${currentChunkIndex}: ${error.message}`,
                    chunkIndex: currentChunkIndex
                });
                
                // Continuar con el siguiente chunk en caso de error
                continue;
            }
        }

        // Enviar resultado final
        sendEvent('complete', {
            result: processedText,
            totalChunks: chunks.length,
            message: 'Procesamiento completado exitosamente'
        });

        res.end();

    } catch (error) {
        console.error('Error en /process-stream (POST):', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        } else {
            const sendEvent = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            
            sendEvent('error', {
                message: 'Error interno del servidor: ' + error.message
            });
            res.end();
        }
    }
});

// Endpoint POST para procesamiento directo (fallback)
router.post('/process', async (req, res) => {
    try {
        const { text, operation, targetLanguage, options = {} } = req.body;

        if (!text) {
            return res.status(400).json({ 
                error: 'El texto es requerido' 
            });
        }

        if (!operation || !['transcribe', 'translate'].includes(operation)) {
            return res.status(400).json({ 
                error: 'Operación debe ser "transcribe" o "translate"' 
            });
        }

        if (operation === 'translate' && !targetLanguage) {
            return res.status(400).json({ 
                error: 'El idioma destino es requerido para traducción' 
            });
        }

        // Configurar SSE para streaming de respuesta
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        // Función para enviar eventos al cliente
        const sendEvent = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Dividir texto en chunks
        const chunks = chunkText(text, options.maxChunkSize);
        sendEvent('progress', { 
            message: `Texto dividido en ${chunks.length} fragmentos`,
            totalChunks: chunks.length,
            currentChunk: 0
        });

        let processedText = '';
        let currentChunkIndex = 0;

        // Procesar cada chunk
        for (const chunk of chunks) {
            currentChunkIndex++;
            
            sendEvent('progress', {
                message: `Procesando fragmento ${currentChunkIndex} de ${chunks.length}`,
                totalChunks: chunks.length,
                currentChunk: currentChunkIndex,
                percentage: Math.round((currentChunkIndex / chunks.length) * 100)
            });

            try {
                const result = await processLargeText(chunk, operation, targetLanguage, options);
                processedText += result + (currentChunkIndex < chunks.length ? ' ' : '');
                
                sendEvent('chunk_complete', {
                    chunkIndex: currentChunkIndex,
                    result: result,
                    partialResult: processedText
                });

            } catch (error) {
                console.error(`Error procesando chunk ${currentChunkIndex}:`, error);
                sendEvent('error', {
                    message: `Error en fragmento ${currentChunkIndex}: ${error.message}`,
                    chunkIndex: currentChunkIndex
                });
                
                // Continuar con el siguiente chunk en caso de error
                continue;
            }
        }

        // Enviar resultado final
        sendEvent('complete', {
            result: processedText,
            totalChunks: chunks.length,
            message: 'Procesamiento completado exitosamente'
        });

        res.end();

    } catch (error) {
        console.error('Error en /process:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Error interno del servidor',
                message: error.message 
            });
        } else {
            const sendEvent = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };
            
            sendEvent('error', {
                message: 'Error interno del servidor: ' + error.message
            });
            res.end();
        }
    }
});

// Endpoint para obtener información del servicio
router.get('/info', (req, res) => {
    const providerInfo = getProviderInfo();
    
    res.json({
        service: 'AI Text Processor',
        version: '1.0.0',
        operations: ['transcribe', 'translate'],
        maxChunkSize: process.env.MAX_CHUNK_SIZE || 3000,
        aiProvider: {
            current: providerInfo.provider,
            configured: providerInfo.configured,
            defaultModel: providerInfo.defaultModels[providerInfo.provider]
        },
        supportedProviders: [
            'openai', 'anthropic', 'google', 'azure', 'huggingface', 'local'
        ],
        supportedLanguages: [
            'es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 
            'ja', 'ko', 'zh', 'ar', 'hi', 'th', 'vi'
        ]
    });
});

module.exports = router;