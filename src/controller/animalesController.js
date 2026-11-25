import {
    createAnimalService,
    getAnimalsService,
    getMisAnimalesService,
    getAnimalByIdService,
    updateAnimalService,
    deleteAnimalService
} from "../service/animalesService.js";

import { ObjectId } from "mongodb";

// Validar los campos de un animal
function validarAnimal(data, parcial = false) {
    const campos = [
        "nombre",
        "especie",
        "raza",
        "edad",
        "sexo",
        "descripcion",
        "imagen"
    ];

    for (const campo of campos) {
        if (!parcial && (data[campo] === undefined || data[campo] === null || data[campo] === "")) {
            return `El campo ${campo} es obligatorio`;
        }
    }

    if (data.edad !== undefined) {
        if (!Number.isInteger(data.edad) || data.edad < 0) {
            return "La edad debe ser un número entero mayor o igual a cero";
        }
    }

    for (const campo of campos) {
        if (data[campo] !== undefined && campo !== "edad") {
            if (typeof data[campo] !== "string" || !data[campo].trim()) {
                return `El campo ${campo} debe ser un texto válido`;
            }
        }
    }

    return null;
}

// Crear animal
export async function createAnimalController(req, res) {
    const errorValidacion = validarAnimal(req.body);

    if (errorValidacion) {
        return res.status(400).json({ message: errorValidacion });
    }

    try {
        const animalData = {
            nombre: req.body.nombre.trim(),
            especie: req.body.especie.trim(),
            raza: req.body.raza.trim(),
            edad: req.body.edad,
            sexo: req.body.sexo.trim(),
            descripcion: req.body.descripcion.trim(),
            imagen: req.body.imagen.trim(),
            user_id: new ObjectId(req.user.id)
        };

        const result = await createAnimalService(animalData);

        return res.status(201).json({
            message: "Animal registrado exitosamente",
            animalId: result.insertedId
        });

    } catch (error) {
        console.error("Error creando animal:", error);

        return res.status(500).json({
            message: "Error interno al crear el animal"
        });
    }
}

// Obtener todos los animales
export async function getAnimalsController(req, res) {
    try {
        const { especie, sexo, raza } = req.query;

        const animales = await getAnimalsService({especie, sexo, raza});

        return res.json(animales);

    } catch (error) {
        console.error("Error obteniendo animales:", error);

        return res.status(500).json({
            message: "Error interno al obtener los animales"
        });
    }
}

//Obtener mis animales (por usuario rol refugio)
export async function getMisAnimalesController(req, res) {
    try {
        const animales = await getMisAnimalesService(req.user.id);

        return res.status(200).json(animales);

    } catch (error) {
        console.error("Error al obtener mis animales:", error);
        return res.status(500).json({
            message: "Error al obtener los animales del refugio"
        });
    }
}

// Obtener un animal por ID
export async function getAnimalByIdController(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de animal inválido" });
    }

    try {
        const animal = await getAnimalByIdService(id);

        if (!animal) {
            return res.status(404).json({ message: "Animal no encontrado" });
        }

        return res.json(animal);

    } catch (error) {
        console.error("Error obteniendo animal:", error);

        return res.status(500).json({
            message: "Error interno al obtener el animal"
        });
    }
}

// Actualizar animal
export async function updateAnimalController(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de animal inválido" });
    }

    const errorValidacion = validarAnimal(req.body, true);

    if (errorValidacion) {
        return res.status(400).json({ message: errorValidacion });
    }

    try {
        const camposPermitidos = [
            "nombre",
            "especie",
            "raza",
            "edad",
            "sexo",
            "descripcion",
            "imagen"
        ];

        const animalData = {};

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                animalData[campo] =
                    typeof req.body[campo] === "string"
                        ? req.body[campo].trim()
                        : req.body[campo];
            }
        }

        if (typeof req.body.adoptado === "boolean") {
            animalData.adoptado = req.body.adoptado;
        }

        if (Object.keys(animalData).length === 0) {
            return res.status(400).json({
                message: "No se enviaron campos para actualizar"
            });
        }

        const result = await updateAnimalService(
            id,
            req.user.id,
            animalData
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Animal no encontrado o no pertenece a este refugio"
            });
        }

        return res.json({
            message: "Animal actualizado exitosamente"
        });

    } catch (error) {
        console.error("Error actualizando animal:", error);

        return res.status(500).json({
            message: "Error interno al actualizar el animal"
        });
    }
}

// Eliminar animal y sus posteos
export async function deleteAnimalController(req, res) {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de animal inválido" });
    }

    try {
        const result = await deleteAnimalService(id, req.user.id);

        return res.json({
            message: "Animal y sus posteos eliminados exitosamente",
            animalEliminado: result.animalEliminado,
            posteosEliminados: result.posteosEliminados
        });

    } catch (error) {
        if (error.message === "Animal no encontrado") {
            return res.status(404).json({ message: error.message });
        }

        console.error("Error eliminando animal:", error);

        return res.status(500).json({
            message: "Error interno al eliminar el animal"
        });
    }
}