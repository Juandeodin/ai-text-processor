const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const textProcessorRoutes = require('./routes/textProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/text', textProcessorRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal en el servidor',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📝 Aplicación disponible en http://localhost:${PORT}`);
});