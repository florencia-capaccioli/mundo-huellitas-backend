import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { subirImagen, listarImagenes, existeImagen, urlPublica, TIPOS_PERMITIDOS } from "../service/imagenesService.js";

const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
        callback(null, `${crypto.randomUUID()}${extension}`);
    }
});

export const subirLocalMiddleware = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
            callback(null, true);
            return;
        }
        callback(new Error("El archivo tiene que ser una imagen"));
    }
}).single("foto");

export function subirLocal(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Falta la foto" });
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ url });
}

const EXTENSIONES_LOCALES = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
};

export function subirDesdeBase64(req, res) {
    const { base64, mime } = req.body || {};

    if (!base64 || typeof base64 !== "string") {
        return res.status(400).json({ message: "Falta la foto" });
    }

    const limpio = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(limpio, "base64");

    if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ message: "La foto es demasiado grande" });
    }

    const extension = EXTENSIONES_LOCALES[mime] || "jpg";
    const nombre = `${crypto.randomUUID()}.${extension}`;

    fs.writeFileSync(path.join(uploadsDir, nombre), buffer);

    const url = `${req.protocol}://${req.get("host")}/uploads/${nombre}`;
    res.status(201).json({ url });
}

export async function subir(req, res) {
    const contentType = req.headers["content-type"];

    if (!TIPOS_PERMITIDOS.includes(contentType)) {
        return res.status(400).json({ message: `El Content-Type debe ser uno de: ${TIPOS_PERMITIDOS.join(", ")}` });
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: "Debés enviar la imagen en el body" });
    }

    try {
        const imagen = await subirImagen(req.body, contentType);
        res.status(201).json(imagen);
    } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ message: "Error al subir la imagen" });
    }
}

export async function listar(req, res) {
    try {
        res.json(await listarImagenes());
    } catch (error) {
        console.error("Error al listar imágenes:", error);
        res.status(500).json({ message: "Error al listar las imágenes" });
    }
}

export async function obtenerUrl(req, res) {
    const { nombre } = req.params;

    try {
        if (!(await existeImagen(nombre))) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }
        res.json({ nombre, url: urlPublica(nombre) });
    } catch (error) {
        console.error("Error al obtener imagen:", error);
        res.status(500).json({ message: "Error al obtener la imagen" });
    }
}
