# AI Text Processor 🤖

Una aplicación web potente para transcribir y traducir textos largos usando Inteligencia Artificial. La aplicación maneja automáticamente los límites de texto de la IA dividiendo documentos extensos en fragmentos y procesándolos secuencialmente.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v16+-green.svg)
![Express](https://img.shields.io/badge/express-v4.18+-orange.svg)

## 🚀 Características

- **Procesamiento de textos largos**: Divide automáticamente textos extensos en fragmentos manejables
- **Transcripción inteligente**: Mejora ortografía, puntuación y formato de textos
- **Traducción multiidioma**: Traduce a más de 10 idiomas diferentes
- **Múltiples proveedores de IA**: Soporte para OpenAI, Anthropic, Google, Azure, Hugging Face y LLMs locales
- **Interfaz moderna**: UI responsive y intuitiva con progreso en tiempo real
- **Streaming en tiempo real**: Muestra resultados parciales mientras procesa
- **Carga de archivos**: Soporte para archivos de texto (.txt)
- **Descarga de resultados**: Exporta los resultados procesados

## 🤖 Proveedores de IA Soportados

| Proveedor | Modelos | Configuración Requerida |
|-----------|---------|------------------------|
| **OpenAI** | GPT-3.5, GPT-4 | `OPENAI_API_KEY` |
| **Anthropic** | Claude 3 Haiku, Sonnet, Opus | `ANTHROPIC_API_KEY` |
| **Google** | Gemini Pro, Ultra | `GOOGLE_AI_API_KEY` |
| **Azure OpenAI** | GPT-3.5, GPT-4 | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` |
| **Hugging Face** | Llama 2, CodeLlama, etc. | `HUGGINGFACE_API_KEY` |
| **Local (Ollama)** | Llama 2, Mistral, etc. | `LOCAL_LLM_ENDPOINT` |

## 🛠️ Tecnologías

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **IA**: Múltiples proveedores (OpenAI, Anthropic, Google, etc.)
- **Streaming**: Server-Sent Events (SSE)

## 📦 Instalación

### Requisitos previos
- Node.js v16 o superior
- NPM o Yarn
- API key del proveedor de IA que elijas

### Instalación Rápida

1. **Clona el repositorio**
```bash
git clone <tu-repositorio-url>
cd ai-text-processor
```

2. **Instala las dependencias base**
```bash
npm install
```

3. **Configura tu proveedor de IA**
```bash
npm run setup
```
Este comando:
- Crea el archivo `.env` automáticamente
- Instala las dependencias específicas del proveedor
- Te muestra las instrucciones de configuración

4. **Configura las variables de entorno**
Edita el archivo `.env` y configura tu proveedor:

```env
# Selecciona tu proveedor
AI_PROVIDER=openai  # openai, anthropic, google, azure, huggingface, local

# Para OpenAI
OPENAI_API_KEY=tu_clave_api_de_openai_aqui

# Para Anthropic
ANTHROPIC_API_KEY=tu_clave_api_de_anthropic_aqui

# Para Google
GOOGLE_AI_API_KEY=tu_clave_api_de_google_aqui

# Para Azure OpenAI
AZURE_OPENAI_API_KEY=tu_clave_azure_openai_aqui
AZURE_OPENAI_ENDPOINT=https://tu-recurso.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo

# Para Hugging Face
HUGGINGFACE_API_KEY=tu_clave_huggingface_aqui
HUGGINGFACE_MODEL=meta-llama/Llama-2-70b-chat-hf

# Para LLM Local (Ollama)
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=llama2
```

5. **Inicia la aplicación**
```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm start
```

6. **Abre tu navegador**
Visita `http://localhost:3000`

## 🔧 Configuración

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `OPENAI_API_KEY` | Tu clave API de OpenAI | Requerido |
| `PORT` | Puerto del servidor | 3000 |
| `MAX_CHUNK_SIZE` | Tamaño máximo de cada fragmento | 3000 |
| `OVERLAP_SIZE` | Superposición entre fragmentos | 200 |

### 🔑 Obtener API Keys

#### OpenAI
1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Inicia sesión o crea una cuenta
3. Navega a "API Keys" 
4. Crea una nueva clave API
5. Copia y agrega: `OPENAI_API_KEY=tu_clave_aqui`

#### Anthropic Claude
1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una cuenta y verifica tu teléfono
3. Ve a "API Keys"
4. Crea una nueva clave
5. Copia y agrega: `ANTHROPIC_API_KEY=tu_clave_aqui`

#### Google AI (Gemini)
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia y agrega: `GOOGLE_AI_API_KEY=tu_clave_aqui`

#### Hugging Face
1. Ve a [Hugging Face](https://huggingface.co/settings/tokens)
2. Inicia sesión en tu cuenta
3. Crea un nuevo token de acceso
4. Copia y agrega: `HUGGINGFACE_API_KEY=tu_clave_aqui`

#### LLM Local (Ollama)
1. Instala [Ollama](https://ollama.ai/)
2. Ejecuta: `ollama pull llama2` (o el modelo que prefieras)
3. Configura: `LOCAL_LLM_ENDPOINT=http://localhost:11434`

## 📖 Uso

### Transcripción de texto
1. Selecciona "Transcribir y Corregir" en el menú de operaciones
2. Pega o escribe el texto que deseas mejorar
3. Haz clic en "Procesar Texto"
4. Observa el progreso en tiempo real
5. Copia o descarga el resultado

### Traducción de texto
1. Selecciona "Traducir" en el menú de operaciones
2. Elige el idioma destino
3. Pega el texto a traducir
4. Haz clic en "Procesar Texto"
5. El sistema dividirá y traducirá automáticamente

### Carga de archivos
1. Haz clic en "Cargar Archivo"
2. Selecciona un archivo de texto (.txt)
3. El contenido se cargará automáticamente
4. Procede con la transcripción o traducción

## 🔄 API Endpoints

### POST `/api/text/process`
Procesa texto largo con streaming de respuesta.

**Request Body:**
```json
{
  "text": "Texto a procesar...",
  "operation": "transcribe" | "translate",
  "targetLanguage": "es",
  "options": {
    "maxChunkSize": 3000,
    "model": "gpt-3.5-turbo"
  }
}
```

**Response:** Server-Sent Events con los siguientes tipos:
- `progress`: Progreso del procesamiento
- `chunk_complete`: Chunk individual completado
- `complete`: Procesamiento total completado
- `error`: Error durante el procesamiento

### GET `/api/text/info`
Obtiene información del servicio.

**Response:**
```json
{
  "service": "AI Text Processor",
  "version": "1.0.0",
  "operations": ["transcribe", "translate"],
  "maxChunkSize": 3000,
  "supportedLanguages": ["es", "en", "fr", ...]
}
```

## 🔍 Comparación de Proveedores

### 💰 **Costos y Velocidad**
- **OpenAI**: Rápido, costo moderado, muy buena calidad
- **Anthropic**: Excelente calidad, un poco más caro
- **Google**: Muy rápido, competitivo en precio
- **Azure**: Integración empresarial, precios por volumen
- **Hugging Face**: Económico, modelos especializados
- **Local (Ollama)**: Gratuito, privacidad total, requiere hardware

### 🎯 **Casos de Uso Recomendados**
- **Transcripción**: OpenAI GPT-4, Google Gemini
- **Traducción**: Anthropic Claude, Google Gemini  
- **Uso masivo**: Hugging Face, Local
- **Empresarial**: Azure OpenAI
- **Privacidad**: Local (Ollama)

### 🔄 **Cambiar de Proveedor**
Simplemente cambia `AI_PROVIDER` en tu `.env`:
```env
AI_PROVIDER=anthropic  # Cambiar a Claude
AI_PROVIDER=google     # Cambiar a Gemini
AI_PROVIDER=local      # Cambiar a LLM local
```

## 🌍 Idiomas soportados

- 🇪🇸 Español
- 🇺🇸 Inglés
- 🇫🇷 Francés
- 🇩🇪 Alemán
- 🇮🇹 Italiano
- 🇵🇹 Portugués
- 🇷🇺 Ruso
- 🇯🇵 Japonés
- 🇰🇷 Coreano
- 🇨🇳 Chino
- 🇸🇦 Árabe
- Y más...

## 🧪 Modo Demo

La aplicación incluye un modo demo que funciona sin clave API para pruebas:

```env
# Para usar modo demo, no configures OPENAI_API_KEY o usa:
OPENAI_API_KEY=demo-key
```

## 📱 Características técnicas

### Fragmentación inteligente
- División por párrafos cuando es posible
- Superposición entre fragmentos para mantener contexto
- Respeto de límites naturales (puntos, espacios)
- Validación de límites de tokens

### Streaming en tiempo real
- Server-Sent Events para updates instantáneos
- Progreso visual detallado
- Resultados parciales en tiempo real
- Manejo robusto de errores

### Interfaz responsiva
- Diseño adaptable para móvil y desktop
- Animaciones suaves y feedback visual
- Carga de archivos drag-and-drop
- Copiar al portapapeles con un clic

## 🚀 Despliegue

### Despliegue local
```bash
npm start
```

### Despliegue en producción
1. Configura las variables de entorno en tu servidor
2. Ejecuta `npm install --production`
3. Inicia con `npm start` o un process manager como PM2

### Docker (opcional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🐛 Reporte de errores

Si encuentras algún error, por favor:

1. Verifica que no haya sido reportado anteriormente
2. Incluye pasos para reproducir el error
3. Agrega logs de error si están disponibles
4. Especifica tu entorno (OS, Node.js version, etc.)

## 📞 Soporte

- 📧 Email: juancas9999@gmail.com


⭐ **¡Si este proyecto te resulta útil, no olvides darle una estrella!** ⭐