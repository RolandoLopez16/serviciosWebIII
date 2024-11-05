import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';

// Definir __filename y __dirname para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Habilita CORS para todas las solicitudes
app.use(cors());

// Configura bodyParser para manejar JSON en las solicitudes
app.use(bodyParser.json());

// Middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal de la API
app.get("/", (req, res) => {
    res.send("Bienvenido a nuestra API..");
});

// Función para leer datos de db.json
const readData = () => {
    const data = fs.readFileSync("./db.json");
    return JSON.parse(data);
};

// Función para escribir datos en db.json
const writeData = (data) => {
    try {
        fs.writeFileSync("./db.json", JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
};

// Definición de rutas para manejar los libros
app.get("/books", (req, res) => {
    const data = readData();
    res.json(data.books);
});

app.get("/books/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const book = data.books.find((book) => book.id === id);
    res.json(book);
});

app.post("/books", (req, res) => {
    const data = readData();
    const body = req.body;
    const newBook = {
        id: data.books.length + 1,
        ...body,
    };
    data.books.push(newBook);
    writeData(data);
    res.json(newBook);
});

app.put("/books/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex((book) => book.id === id);
    if (bookIndex === -1) {
        return res.status(204).json({ message: "Libro no encontrado" });
    }
    data.books[bookIndex] = {
        ...data.books[bookIndex],
        ...body,
    };
    writeData(data);
    res.json({ message: "Libro actualizado" });
});

app.delete("/books/:id", (req, res) => {
    try {
        const data = readData();
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }
        const bookIndex = data.books.findIndex((book) => book.id === id);
        if (bookIndex === -1) {
            return res.status(404).json({ error: "Libro no encontrado" });
        }
        data.books.splice(bookIndex, 1);
        writeData(data);
        res.json({ message: "Libro eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Ocurrió un error al eliminar el libro" });
    }
});

// Inicia el servidor en el puerto 3001 o en el puerto proporcionado por Vercel
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Aplicación escuchando por el puerto ${PORT}`);
});
app.get("/books", (req, res) => {
    console.log("Petición recibida en /books");
    const data = readData();
    console.log("Datos leídos de db.json:", data);
    res.json(data.books);
});
