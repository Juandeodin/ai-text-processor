# 🤖 AI Text Processor - Configuración Multi-Proveedor

## Configuración Rápida por Proveedor

### OpenAI (Recomendado para principiantes)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```
**Ventajas**: Fácil configuración, excelente calidad, documentación extensa
**Costo**: ~$0.002/1K tokens (GPT-3.5)

### Anthropic Claude (Mejor para textos largos)
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```
**Ventajas**: Excelente con contextos largos, muy seguro, buena en español
**Costo**: ~$0.008/1K tokens (Claude Haiku)

### Google Gemini (Más rápido)
```env
AI_PROVIDER=google
GOOGLE_AI_API_KEY=AI...
```
**Ventajas**: Muy rápido, multimodal, bien optimizado para traducción
**Costo**: Gratis hasta 60 requests/minuto

### Azure OpenAI (Para empresas)
```env
AI_PROVIDER=azure
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://tu-recurso.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
```
**Ventajas**: Cumplimiento empresarial, SLA garantizado, ubicación de datos
**Costo**: Similar a OpenAI con facturación empresarial

### Hugging Face (Económico)
```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MODEL=meta-llama/Llama-2-70b-chat-hf
```
**Ventajas**: Muy económico, muchos modelos disponibles, open source
**Costo**: ~$0.0008/1K tokens

### Local con Ollama (Gratuito y privado)
```env
AI_PROVIDER=local
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=llama2
```
**Ventajas**: Completamente gratuito, total privacidad, sin límites de uso
**Requerimientos**: 8GB+ RAM, GPU recomendada

## Instalación por Pasos

### 1. Configuración Básica
```bash
git clone <repo-url>
cd ai-text-processor
npm install
npm run setup  # Script automático de configuración
```

### 2. Para Ollama (LLM Local)
```bash
# Windows
winget install Ollama.Ollama

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Descargar modelo
ollama pull llama2
ollama pull mistral
```

### 3. Modelos Recomendados por Caso de Uso

#### Transcripción (corrección de texto)
- **OpenAI**: `gpt-3.5-turbo` (rápido y económico)
- **Anthropic**: `claude-3-haiku-20240307` (mejor contexto)
- **Local**: `llama2` o `mistral`

#### Traducción
- **Google**: `gemini-pro` (especializado en idiomas)
- **OpenAI**: `gpt-4` (mejor calidad)
- **Anthropic**: `claude-3-sonnet-20240229` (balance calidad/precio)

#### Uso masivo/empresarial
- **Azure**: `gpt-35-turbo` (SLA empresarial)
- **Hugging Face**: `meta-llama/Llama-2-70b-chat-hf` (económico)
- **Local**: Cualquier modelo compatible

## Troubleshooting

### Error: "Provider not configured"
Verifica que tengas todas las variables necesarias en `.env`

### Error: "API key invalid" 
Revisa que tu API key sea válida y tenga créditos

### Error: "Model not found" (Hugging Face)
Algunos modelos pueden estar en cola. Usa modelos alternativos:
- `microsoft/DialoGPT-large`
- `google/flan-t5-large`

### Error: "Connection refused" (Local)
Asegúrate de que Ollama esté ejecutándose:
```bash
ollama serve
```

### Performance lento
- **OpenAI/Anthropic**: Considera usar modelos más pequeños
- **Local**: Usa GPU si está disponible
- **Hugging Face**: Algunos modelos tienen cold start

## Scripts Útiles

### Cambiar proveedor rápidamente
```bash
# Cambiar a Claude
echo "AI_PROVIDER=anthropic" >> .env

# Cambiar a Gemini  
echo "AI_PROVIDER=google" >> .env

# Reinstalar dependencias del nuevo proveedor
npm run setup
```

### Test de conectividad
```bash
# Crear script de test
node -e "
const { processText } = require('./services/aiService');
processText('Hola mundo', 'transcribe', 'es')
  .then(result => console.log('✅ Funciona:', result))
  .catch(err => console.log('❌ Error:', err.message));
"
```

¡Con esta configuración puedes usar cualquier proveedor de IA que necesites! 🚀