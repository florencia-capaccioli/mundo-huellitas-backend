import { getDb } from "./connection.js";
import bcrypt from "bcrypt";

// Busca un adoptante por email y compara el password usando bcrypt
export async function findAdoptanteByCredentials(email, password) {
    const db = getDb();
    const adoptante = await db.collection("adoptantes").findOne({ email });

    if (!adoptante) {
        return null;
    }

    const isMatch = await bcrypt.compare(password, adoptante.password);

    if (!isMatch) {
        return null;
    }

    return adoptante;
}

// Registra un nuevo adoptante
export async function registerAdoptante({ username, email, password }) {
    const db = getDb();

    // Verificar si el adoptante ya existe
    const existingAdoptante = await db.collection("adoptantes").findOne({ email });

    if (existingAdoptante) {
        throw new Error("El email ya está registrado");
    }

    // Hashear el password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdoptante = {
        username,
        email,
        password: hashedPassword
    };

    const result = await db.collection("adoptantes").insertOne(newAdoptante);

    return result;
}
