module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection: {
            host: 'host',
            user:   'user',
            password: 'password',
            database: 'database',
        },
        migrations: {
            directory: 'src/migrations'
        },
    },
};
