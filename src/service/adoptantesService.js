import { registerAdoptante, findAdoptanteByCredentials } from "../data/adoptantesData.js";

export const registerAdoptanteService = async ({ username, email, password }) => {
    try {
        return await registerAdoptante({ username, email, password });
    } catch (error) {
        if (error.message === "El email ya está registrado") {
            // Re-lanzar para que el controller lo maneje
            throw error;
        }

        throw new Error("Error al registrar el adoptante");
    }
};

export const loginAdoptanteService = async ({ email, password }) => {
    const adoptante = await findAdoptanteByCredentials(email, password);

    if (!adoptante) {
        throw new Error("Credenciales inválidas");
    }

    // No devolver password
    const { password: _pw, ...adoptanteWithoutPassword } = adoptante;

    return adoptanteWithoutPassword;
};
