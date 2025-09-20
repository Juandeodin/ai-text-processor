/**
 * Utilidad para dividir textos largos en fragmentos manejables
 */

/**
 * Divide un texto largo en chunks optimizados para MÍNIMOS requests
 * Usa división inteligente automáticamente para textos largos
 * @param {string} text - Texto a dividir
 * @param {number} maxChunkSize - Tamaño máximo de cada chunk
 * @param {number} overlapSize - Tamaño de superposición entre chunks
 * @returns {Array<string>} - Array de chunks optimizados
 */
function chunkText(text, maxChunkSize = null, overlapSize = null) {
    const defaultMaxSize = parseInt(process.env.MAX_CHUNK_SIZE) || 12000; // Aumentado para menos requests
    const defaultOverlap = parseInt(process.env.OVERLAP_SIZE) || 50;      // Reducido para menos superposición
    
    const chunkSize = maxChunkSize || defaultMaxSize;
    const overlap = overlapSize || defaultOverlap;
    
    if (!text || text.length <= chunkSize) {
        return [text];
    }

    // OPTIMIZACIÓN AUTOMÁTICA: Usar división inteligente para textos largos
    return optimizedChunkText(text, chunkSize, overlap);
}

/**
 * División optimizada que automáticamente usa la mejor estrategia
 * para minimizar el número de requests sin input del usuario
 */
function optimizedChunkText(text, maxChunkSize, overlap) {
    // ESTRATEGIA 1: Detectar y dividir por secciones grandes (títulos, capítulos)
    const sectionChunks = detectAndDivideBySections(text, maxChunkSize);
    if (sectionChunks.length > 1 && sectionChunks.every(chunk => chunk.length <= maxChunkSize)) {
        return sectionChunks;
    }

    // ESTRATEGIA 2: División agresiva por párrafos (combina múltiples párrafos)
    const paragraphs = text.split(/\n\s*\n/);
    if (paragraphs.length > 1) {
        return aggressiveParagraphCombining(paragraphs, maxChunkSize, overlap);
    }
    
    // ESTRATEGIA 3: División por oraciones maximizando tamaño
    return maximizedChunking(text, maxChunkSize, overlap);
}

/**
 * Detecta automáticamente secciones (títulos, capítulos) y divide eficientemente
 */
function detectAndDivideBySections(text, maxChunkSize) {
    // Patrones para detectar secciones automáticamente
    const sectionPatterns = [
        /\n#+\s+.+/g,                    // Headers de Markdown (# ## ###)
        /\n\d+\.\s+[A-Z][^.]{10,}/g,     // Capítulos numerados (1. Título largo)
        /\n[A-Z][A-Z\s]{8,}\n/g,         // TÍTULOS EN MAYÚSCULAS
        /\n-{5,}\n/g,                    // Separadores largos -----
        /\n={5,}\n/g,                    // Separadores largos =====
        /\nCapítulo\s+\d+/gi,            // "Capítulo X"
        /\nSection\s+\d+/gi,             // "Section X"
        /\nParte\s+\d+/gi                // "Parte X"
    ];

    for (const pattern of sectionPatterns) {
        const sections = text.split(pattern);
        if (sections.length > 1 && sections.some(s => s.trim().length > 100)) {
            return combineIntoMaxChunks(sections, maxChunkSize);
        }
    }
    
    return [text]; // No se encontraron secciones claras
}

/**
 * Combina párrafos de forma agresiva para minimizar chunks
 */
function aggressiveParagraphCombining(paragraphs, maxChunkSize, overlap) {
    const chunks = [];
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;
        
        const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + trimmed;
        
        if (potentialChunk.length <= maxChunkSize) {
            currentChunk = potentialChunk;
        } else {
            // Guardar chunk actual si existe
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            
            // Si el párrafo es muy largo, dividirlo
            if (trimmed.length > maxChunkSize) {
                const subChunks = maximizedChunking(trimmed, maxChunkSize, overlap);
                chunks.push(...subChunks);
                currentChunk = '';
            } else {
                currentChunk = trimmed;
            }
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [paragraphs.join('\n\n')];
}

/**
 * División que maximiza el tamaño de cada chunk
 */
function maximizedChunking(text, maxChunkSize, overlap) {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + maxChunkSize, text.length);
        
        // Si no es el último chunk, buscar el MEJOR punto de corte
        if (endIndex < text.length) {
            const cutPoints = [
                { pos: text.lastIndexOf('. ', endIndex), priority: 4 },    // Punto + espacio (mejor)
                { pos: text.lastIndexOf('.\n', endIndex), priority: 4 },   // Punto + nueva línea
                { pos: text.lastIndexOf('. ', endIndex - 50), priority: 3 }, // Punto cercano
                { pos: text.lastIndexOf('\n\n', endIndex), priority: 3 },  // Párrafo
                { pos: text.lastIndexOf('?', endIndex), priority: 2 },      // Pregunta
                { pos: text.lastIndexOf('!', endIndex), priority: 2 },      // Exclamación
                { pos: text.lastIndexOf('\n', endIndex), priority: 1 },     // Nueva línea
                { pos: text.lastIndexOf(' ', endIndex), priority: 0 }       // Espacio (último recurso)
            ];
            
            // Buscar el mejor punto de corte que esté en un rango aceptable
            const minAcceptable = startIndex + Math.floor(maxChunkSize * 0.75); // Al menos 75% del chunk
            
            cutPoints.sort((a, b) => b.priority - a.priority);
            
            for (const cutPoint of cutPoints) {
                if (cutPoint.pos > minAcceptable && cutPoint.pos < endIndex) {
                    endIndex = cutPoint.pos + 1;
                    break;
                }
            }
        }
        
        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        
        // Superposición mínima para maximizar eficiencia
        startIndex = Math.max(endIndex - overlap, startIndex + Math.floor(maxChunkSize * 0.95));
        
        // Prevenir bucle infinito
        if (startIndex >= endIndex) {
            startIndex = endIndex;
        }
    }

    return chunks.length > 0 ? chunks : [text];
}

/**
 * Combina secciones en chunks del mayor tamaño posible
 */
function combineIntoMaxChunks(sections, maxChunkSize) {
    const chunks = [];
    let currentChunk = '';
    
    for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed) continue;
        
        if (currentChunk.length + trimmed.length + 1 <= maxChunkSize) {
            currentChunk += (currentChunk ? '\n' : '') + trimmed;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            
            if (trimmed.length <= maxChunkSize) {
                currentChunk = trimmed;
            } else {
                // Sección muy grande, dividir con máxima eficiencia
                const subChunks = maximizedChunking(trimmed, maxChunkSize, 50);
                chunks.push(...subChunks);
                currentChunk = '';
            }
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : sections;
}

/**
 * Estima el número de tokens aproximado en un texto
 * @param {string} text - Texto a evaluar
 * @returns {number} - Número estimado de tokens
 */
function estimateTokens(text) {
    // Estimación aproximada: 1 token ≈ 4 caracteres para texto en español/inglés
    return Math.ceil(text.length / 4);
}

/**
 * Divide texto inteligentemente basado en estructura
 * @param {string} text - Texto a dividir
 * @param {number} maxChunkSize - Tamaño máximo de cada chunk
 * @returns {Array<string>} - Array de chunks optimizados
 */
function smartChunkText(text, maxChunkSize = 3000) {
    if (!text || text.length <= maxChunkSize) {
        return [text];
    }

    // Intentar dividir por párrafos primero
    const paragraphs = text.split(/\n\s*\n/);
    
    if (paragraphs.length > 1) {
        const chunks = [];
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
            
            if (potentialChunk.length <= maxChunkSize) {
                currentChunk = potentialChunk;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                
                // Si el párrafo individual es muy largo, dividirlo
                if (paragraph.length > maxChunkSize) {
                    const subChunks = chunkText(paragraph, maxChunkSize);
                    chunks.push(...subChunks);
                    currentChunk = '';
                } else {
                    currentChunk = paragraph;
                }
            }
        }
        
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }
    
    // Si no hay párrafos claros, usar división normal
    return chunkText(text, maxChunkSize);
}

/**
 * Valida que los chunks no excedan el límite de tokens
 * @param {Array<string>} chunks - Chunks a validar
 * @param {number} maxTokens - Límite máximo de tokens por chunk
 * @returns {Array<string>} - Chunks validados y divididos si es necesario
 */
function validateChunkTokens(chunks, maxTokens = 4000) {
    const validatedChunks = [];
    
    for (const chunk of chunks) {
        const estimatedTokens = estimateTokens(chunk);
        
        if (estimatedTokens <= maxTokens) {
            validatedChunks.push(chunk);
        } else {
            // Dividir chunk que excede el límite de tokens
            const charLimit = maxTokens * 3.5; // Aproximadamente 3.5 chars por token
            const subChunks = chunkText(chunk, charLimit);
            validatedChunks.push(...subChunks);
        }
    }
    
    return validatedChunks;
}

module.exports = {
    chunkText,
    smartChunkText,
    estimateTokens,
    validateChunkTokens
};