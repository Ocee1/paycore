import User from "../models/user";



const createUser = async (data) => {
    const result = await User.query().insert(data);
    return result;
};

const getUserById = async (id) => {
    const user = await User.query().findById(id);
    return user;
}

const getUserByEmail = async (email) => {
    const user = (await User.query().where({ email }).first());
    return user;
};

const getUserByAccount = async (account_number) => {
    const user = (await User.query().where({ account_number }).first());
    return user;
};

const findByIdAndUpdate = async (data, id) => {
    const user = await User.query().patchAndFetchById(id, data);
    return user;
};

const removeUser = async (id) => {
    const user = await User.query().deleteById(+id);
    return user;
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    findByIdAndUpdate,
    removeUser,
    getUserByAccount
};