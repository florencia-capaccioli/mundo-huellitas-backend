import { getDb } from "./connection.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// Busca un usuario por email y compara el password usando bcrypt
export async function findUserByCredentials(email, password) {
    const db = getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
        return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return null;
    }

    return user;
}

// Registra un nuevo usuario
export async function registerUser({ nombre, email, password, rol }) {
    const db = getDb();

    // Verificar si el usuario ya existe
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
        throw new Error("El email ya está registrado");
    }

    // Hashear el password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
        nombre,
        email,
        password: hashedPassword,
        rol,
        posteos: [],
        animales: []
    };

    const result = await db.collection("users").insertOne(newUser);

    return result;
}

// Actualiza la ubicación y el teléfono de un refugio
export async function updateRefugioProfile(userId, { ubicacion, telefono }) {
    const db = getDb();

    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                ubicacion,
                telefono
            }
        }
    );

    return result;
}
