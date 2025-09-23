class AITextProcessor {
    constructor() {
        this.isProcessing = false;
        this.eventSource = null;
        this.startTime = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateLanguageVisibility();
        this.updateTextStats();
    }

    initializeElements() {
        // Elementos principales
        this.operationSelect = document.getElementById('operation');
        this.targetLanguageSelect = document.getElementById('targetLanguage');
        this.languageConfig = document.getElementById('language-config');
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        
        // Secciones
        this.progressSection = document.getElementById('progressSection');
        this.outputSection = document.getElementById('outputSection');
        
        // Botones
        this.processBtn = document.getElementById('processBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newProcessBtn = document.getElementById('newProcessBtn');
        
        // Elementos de progreso
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressPercent = document.getElementById('progressPercent');
        this.chunksInfo = document.getElementById('chunksInfo');
        
        // Elementos de estadísticas
        this.charCount = document.getElementById('charCount');
        this.wordCount = document.getElementById('wordCount');
        this.estimatedChunks = document.getElementById('estimatedChunks');
        this.outputCharCount = document.getElementById('outputCharCount');
        this.outputWordCount = document.getElementById('outputWordCount');
        this.processingTime = document.getElementById('processingTime');
        
        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Event listeners
        this.operationSelect.addEventListener('change', () => this.updateLanguageVisibility());
        this.inputText.addEventListener('input', () => this.updateTextStats());
        this.processBtn.addEventListener('click', () => this.processText());
        this.clearBtn.addEventListener('click', () => this.clearInput());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.cancelBtn.addEventListener('click', () => this.cancelProcessing());
        this.copyBtn.addEventListener('click', () => this.copyResult());
        this.downloadBtn.addEventListener('click', () => this.downloadResult());
        this.newProcessBtn.addEventListener('click', () => this.resetForNewProcess());
        
        // Prevenir envío accidental del formulario
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter' && !this.isProcessing) {
                e.preventDefault();
                this.processText();
            }
        });
    }

    updateLanguageVisibility() {
        const isTranslate = this.operationSelect.value === 'translate';
        
        if (isTranslate) {
            this.languageConfig.classList.add('show');
        } else {
            this.languageConfig.classList.remove('show');
        }
    }

    updateTextStats() {
        const text = this.inputText.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        // Cálculo optimizado para chunks grandes (12K en lugar de 3K)
        const estimatedChunks = this.calculateOptimizedChunks(text, chars);
        
        this.charCount.textContent = `${chars.toLocaleString()} caracteres`;
        this.wordCount.textContent = `${words.toLocaleString()} palabras`;
        this.estimatedChunks.textContent = `${estimatedChunks} fragmentos (optimizado)`;
    }

    calculateOptimizedChunks(text, chars) {
        if (!text || chars <= 12000) {
            return 1;
        }
        
        // Simulación de la división inteligente automática
        let estimatedChunks = Math.ceil(chars / 12000); // Chunks de 12K en lugar de 3K
        
        // Detección automática de estructura para optimización
        const hasSections = /\n#+\s+|\n\d+\.\s+|^\s*[A-Z][A-Z\s]{8,}\s*$/m.test(text);
        const paragraphs = text.split(/\n\s*\n/).length;
        const hasChapters = /capítulo\s+\d+|chapter\s+\d+|parte\s+\d+/gi.test(text);
        
        // Aplicar optimizaciones automáticas
        if (hasChapters) {
            estimatedChunks = Math.max(1, Math.floor(estimatedChunks * 0.6)); // 40% menos con capítulos
        } else if (hasSections) {
            estimatedChunks = Math.max(1, Math.floor(estimatedChunks * 0.7)); // 30% menos con secciones
        } else if (paragraphs > 5) {
            estimatedChunks = Math.max(1, Math.floor(estimatedChunks * 0.8)); // 20% menos con párrafos
        }
        
        return estimatedChunks;
    }

    updateOutputStats(text) {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        this.outputCharCount.textContent = `${chars.toLocaleString()} caracteres`;
        this.outputWordCount.textContent = `${words.toLocaleString()} palabras`;
    }

    async processText() {
        if (this.isProcessing) return;
        
        const text = this.inputText.value.trim();
        if (!text) {
            this.showToast('Por favor, ingresa el texto a procesar', 'error');
            return;
        }

        const operation = this.operationSelect.value;
        const targetLanguage = this.targetLanguageSelect.value;

        this.isProcessing = true;
        this.startTime = Date.now();
        this.showProgressSection();
        
        try {
            const requestBody = {
                text: text,
                operation: operation,
                targetLanguage: operation === 'translate' ? targetLanguage : undefined,
                options: {
                    maxChunkSize: 12000,      // Chunks optimizados para menos requests
                    overlapSize: 50,          // Superposición mínima
                    model: 'gemini-2.5-flash',      // Modelo gemini
                    optimizeForLargeTexts: true
                }
            };

            // Usar fetch con streaming para evitar límites de URL
            const response = await fetch('/api/text/process-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Procesar el stream de eventos
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            this.updateProgress(0, 'Iniciando procesamiento...');

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                
                // Procesar eventos completos en el buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Mantener la línea incompleta
                
                let currentEventType = 'message';
                
                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEventType = line.substring(6).trim();
                        continue;
                    }
                    
                    if (line.startsWith('data:')) {
                        try {
                            const data = JSON.parse(line.substring(5).trim());
                            this.handleStreamEvent(currentEventType, data);
                        } catch (e) {
                            console.warn('Error parsing SSE data:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error al procesar el texto: ' + error.message, 'error');
            this.isProcessing = false;
            this.hideProgressSection();
        }
    }

    handleStreamEvent(eventType, data) {
        switch (eventType) {
            case 'progress':
                this.updateProgress(data.percentage || 0, data.message);
                if (data.totalChunks) {
                    this.chunksInfo.innerHTML = `
                        <p><strong>Progreso:</strong> ${data.currentChunk}/${data.totalChunks} fragmentos</p>
                        <p>${data.message}</p>
                    `;
                }
                break;
                
            case 'chunk_complete':
                this.outputText.value = data.partialResult;
                this.updateOutputStats(data.partialResult);
                this.outputText.scrollTop = this.outputText.scrollHeight;
                break;
                
            case 'complete':
                this.completeProcessing(data.result);
                break;
                
            case 'error':
                this.showToast(data.message || 'Error durante el procesamiento', 'error');
                this.cancelProcessing();
                break;
                
            default:
                console.log('Evento desconocido:', eventType, data);
        }
    }

    async processTextFallback(requestBody) {
        // Método alternativo usando fetch para casos donde EventSource no funcione
        try {
            const response = await fetch('/api/text/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.completeProcessing(result.result || result.message);
            
        } catch (error) {
            throw error;
        }
    }

    updateProgress(percentage, message) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercent.textContent = `${Math.round(percentage)}%`;
        this.progressText.textContent = message;
    }

    completeProcessing(result) {
        this.outputText.value = result;
        this.updateOutputStats(result);
        
        const endTime = Date.now();
        const processingTime = ((endTime - this.startTime) / 1000).toFixed(1);
        this.processingTime.textContent = `Tiempo: ${processingTime}s`;
        
        this.hideProgressSection();
        this.finalizeResultArea();
        this.enableOutputButtons();
        this.isProcessing = false;
        
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        this.showToast('¡Procesamiento completado exitosamente!', 'success');
        
        // Scroll suave al resultado
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    cancelProcessing() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        
        this.isProcessing = false;
        this.hideProgressSection();
        this.enableOutputButtons();
        
        // Limpiar indicador de tiempo real
        this.outputText.classList.remove('realtime-loading');
        const resultHeader = document.querySelector('#outputSection h2');
        if (resultHeader) {
            resultHeader.classList.remove('processing');
            resultHeader.innerHTML = '<i class="fas fa-check-circle"></i> Resultado';
        }
        
        this.showToast('Procesamiento cancelado', 'info');
    }

    clearInput() {
        this.inputText.value = '';
        this.updateTextStats();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (file.type !== 'text/plain') {
            this.showToast('Solo se permiten archivos de texto (.txt)', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB límite
            this.showToast('El archivo es demasiado grande (máximo 10MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.inputText.value = e.target.result;
            this.updateTextStats();
            this.showToast(`Archivo "${file.name}" cargado exitosamente`, 'success');
        };
        reader.onerror = () => {
            this.showToast('Error al leer el archivo', 'error');
        };
        reader.readAsText(file);
        
        // Limpiar el input para permitir cargar el mismo archivo otra vez
        event.target.value = '';
    }

    copyResult() {
        if (!this.outputText.value) return;
        
        navigator.clipboard.writeText(this.outputText.value).then(() => {
            this.showToast('Resultado copiado al portapapeles', 'success');
            this.copyBtn.classList.add('bounce');
            setTimeout(() => this.copyBtn.classList.remove('bounce'), 600);
        }).catch(() => {
            this.showToast('Error al copiar al portapapeles', 'error');
        });
    }

    downloadResult() {
        if (!this.outputText.value) return;
        
        const operation = this.operationSelect.value;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `resultado-${operation}-${timestamp}.md`;

        const blob = new Blob([this.outputText.value], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`Archivo descargado: ${filename}`, 'success');
    }

    resetForNewProcess() {
        this.clearInput();
        this.hideOutputSection();
        this.inputText.focus();
    }

    showProgressSection() {
        this.progressSection.classList.remove('hidden');
        this.progressSection.classList.add('fade-in');
        this.processBtn.disabled = true;
        this.processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        this.disableOutputButtons();
        this.setupRealtimeResultArea();
    }

    hideProgressSection() {
        this.progressSection.classList.add('hidden');
        this.processBtn.disabled = false;
        this.processBtn.innerHTML = '<i class="fas fa-play"></i> Procesar Texto';
    }

    showOutputSection() {
        this.outputSection.classList.remove('hidden');
        this.outputSection.classList.add('fade-in');
    }

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 4000);
    }

    disableOutputButtons() {
        // Deshabilitar botones de acción del resultado
        this.copyBtn.disabled = true;
        this.downloadBtn.disabled = true;
        this.newProcessBtn.disabled = true;
        
        // Agregar clase visual para mostrar que están deshabilitados
        this.copyBtn.classList.add('disabled');
        this.downloadBtn.classList.add('disabled');
        this.newProcessBtn.classList.add('disabled');
    }

    enableOutputButtons() {
        // Habilitar botones de acción del resultado
        this.copyBtn.disabled = false;
        this.downloadBtn.disabled = false;
        this.newProcessBtn.disabled = false;
        
        // Remover clase visual de deshabilitado
        this.copyBtn.classList.remove('disabled');
        this.downloadBtn.classList.remove('disabled');
        this.newProcessBtn.classList.remove('disabled');
    }

    setupRealtimeResultArea() {
        // Mostrar la sección de resultado con indicador de tiempo real
        this.outputSection.classList.remove('hidden');
        this.outputSection.classList.add('fade-in');
        
        // Limpiar resultado anterior y mostrar indicador de carga
        this.outputText.value = '';
        this.outputText.placeholder = '⏳ Resultado en tiempo real...\n\nEl contenido aparecerá aquí conforme se vaya procesando cada fragmento del texto.';
        
        // Agregar clase CSS para el indicador de carga
        this.outputText.classList.add('realtime-loading');
        
        // Mostrar un header indicando que está en proceso
        const resultHeader = document.querySelector('#outputSection h2');
        if (resultHeader) {
            resultHeader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resultado en tiempo real';
            resultHeader.classList.add('result-header', 'processing');
        }
    }

    finalizeResultArea() {
        // Remover indicador de carga
        this.outputText.classList.remove('realtime-loading');
        this.outputText.placeholder = 'El resultado procesado aparecerá aquí...';
        
        // Actualizar header de resultado
        const resultHeader = document.querySelector('#outputSection h2');
        if (resultHeader) {
            resultHeader.innerHTML = '<i class="fas fa-check-circle"></i> Resultado completado';
            resultHeader.classList.remove('processing');
            resultHeader.classList.add('completed');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AITextProcessor();
});

// Service Worker registration para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(() => console.log('Service Worker no disponible'));
    });
}