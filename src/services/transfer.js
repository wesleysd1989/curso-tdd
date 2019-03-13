const bcrypt = require('bcrypt-nodejs');

//const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers')
        .where(filter)
        .select();
    };

    return { find }
};
