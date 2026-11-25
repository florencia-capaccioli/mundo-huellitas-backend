import { getDb } from "./connection.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { findAnimalById } from "./animalesData.js";

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
export async function registerUser({ nombre, email, password, rol, telefono }) {
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
        telefono: telefono || "",
        posteos: [],
        animales: [],
        favoritos: []
    };

    const result = await db.collection("users").insertOne(newUser);

    return result;
}

// Nombre y teléfono de cualquier usuario. El teléfono puede ir vacío.
export async function updateCuenta(userId, { nombre, telefono }) {
    const db = getDb();

    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { nombre, telefono: telefono || "" } }
    );

    return result;
}

// Actualiza la ubicación, el teléfono y las coordenadas de un refugio
export async function updateRefugioProfile(userId, { ubicacion, telefono, latitude, longitude }) {
    const db = getDb();

    const campos = {
        ubicacion,
        telefono
    };

    if (typeof latitude === "number" && typeof longitude === "number") {
        campos.latitude = latitude;
        campos.longitude = longitude;
    }

    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: campos }
    );

    return result;
}

// Datos públicos de refugios para el mapa (sin email ni password)
export async function findRefugiosPublicos() {
    const db = getDb();

    const refugios = await db.collection("users")
        .find({ rol: "refugio" })
        .project({
            nombre: 1,
            telefono: 1,
            ubicacion: 1,
            latitude: 1,
            longitude: 1
        })
        .toArray();

    return refugios.map((refugio) => ({
        id: refugio._id.toString(),
        nombre: refugio.nombre || "",
        telefono: refugio.telefono || "",
        ubicacion: refugio.ubicacion || "",
        latitude: typeof refugio.latitude === "number" ? refugio.latitude : null,
        longitude: typeof refugio.longitude === "number" ? refugio.longitude : null
    }));
}

const idDeAnimalValido = (id) =>
    typeof id === "string" && ObjectId.isValid(id);

export async function listarFavoritos(userId) {
    const db = getDb();
    const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { favoritos: 1 } }
    );

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    const lista = Array.isArray(user.favoritos) ? user.favoritos : [];
    return lista.map((id) => String(id));
}

export async function agregarFavorito(userId, animalId) {
    if (!idDeAnimalValido(animalId)) {
        throw new Error("Animal no encontrado");
    }

    const animal = await findAnimalById(animalId);
    if (!animal) {
        throw new Error("Animal no encontrado");
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { favoritos: String(animalId) } }
    );

    if (result.matchedCount === 0) {
        throw new Error("Usuario no encontrado");
    }

    return listarFavoritos(userId);
}

export async function quitarFavorito(userId, animalId) {
    if (!idDeAnimalValido(animalId)) {
        throw new Error("Animal no encontrado");
    }

    const db = getDb();
    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { favoritos: String(animalId) } }
    );

    if (result.matchedCount === 0) {
        throw new Error("Usuario no encontrado");
    }

    return listarFavoritos(userId);
}
