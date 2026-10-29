import { getDb } from "./connection.js";
import bcrypt from "bcrypt";

// Busca un refugio por email y compara el password usando bcrypt
export async function findRefugioByCredentials(email, password) {
    const db = getDb();
    const refugio = await db.collection("refugios").findOne({ email });

    if (!refugio) {
        return null;
    }

    const isMatch = await bcrypt.compare(password, refugio.password);

    if (!isMatch) {
        return null;
    }

    return refugio;
}

// Registra un nuevo refugio
export async function registerRefugio({ nombre, email, password }) {
    const db = getDb();

    // Verificar si el refugio ya existe
    const existingRefugio = await db.collection("refugios").findOne({ email });

    if (existingRefugio) {
        throw new Error("El email ya está registrado");
    }

    // Hashear el password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newRefugio = {
        nombre,
        email,
        password: hashedPassword
    };

    const result = await db.collection("refugios").insertOne(newRefugio);

    return result;
}
