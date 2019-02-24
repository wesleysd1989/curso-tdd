module.exports = (app) => {
    const save = async (account) => {
        return app.db('accounts').insert(account, '*');
    };

    const findAll = () => {
        return app.db('accounts');
    }

    return { save, findAll }
};