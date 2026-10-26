import User from "../models/Utilisateur";

export const findAllUsers = async () => {
    return await User.findAll();
};

export const createUser = async (prenom : string, nom : string) => {
    if (!prenom || !nom) {
        throw new Error("Champs manquants");
    }
    return await User.create({prenom, nom});
};

export const deleteUser = async (id_user: number) => {
    const deleted = await User.destroy({where: {id_user}});

    if (deleted === 0) {
        throw new Error("Utilisateur non trouvé");
    }

    return true;
}

export const getUserById = async (id
: number) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error("Utilisateur non trouvé");
    }   

    return user;
};
