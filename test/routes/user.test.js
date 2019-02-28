const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app')

const email = `${Date.now()}@mail.com`;
let user;

beforeAll(async () => {
    const res = await app.services.user.save({name: 'User Account', email, password: '123456'});
    user = { ... res[0] };
    user.token = jwt.encode(user, 'Segredo!');
});

test('Deve listar todos os usuarios', () => {
    return request(app).get('/users')
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuário com sucesso', () => {
    return request(app).post('/users')
    .send({ name: 'maria veridiane', email: `${Date.now()}@mail.com`, password: '123456'})
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('maria veridiane');
        expect(res.body).not.toHaveProperty('password');
    })
});

test('Deve Armazenar senha criptografada', async () => {
    const res = await request(app).post('/users')
        .send({ name: 'maria veridiane', email: `${Date.now()}@mail.com`, password: '123456' })
        .set('authorization', `bearer ${user.token}`)
    expect(res.status).toBe(201);

    const { id } = res.body
    const userDB = await app.services.user.findOne({ id });
    expect(userDB.password).not.toBeUndefined();
    expect(userDB.password).not.toBe('123456');
});

test('Não deve inserir usuário sem nome', () => {
    return request(app).post('/users')
    .send({ email: 'wesley@mail.com', password: '123456'})
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Nome é um atributo obrigatório.');
    });
});

test('Não deve inserir usuário sem email', async () => {
    const result = await request(app).post('/users')
        .send({ name: 'wesley dias', password: '123456'})
        .set('authorization', `bearer ${user.token}`);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Email é um atributo obrigatório.');
});

test('Não deve inserir usuário sem senha', (done) => {
    request(app).post('/users')
        .send({ name: 'wesley dias', email: 'wesley@mail.com'})
        .set('authorization', `bearer ${user.token}`)
        .then((res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Senha é um atributo obrigatório.');
            done();
        })
        .catch(err => done.fail(err));
});

test('Não deve inserir usuário com email já existente', () => {
    return request(app).post('/users')
    .send({ name: 'maria veridiane', email, password: '123456'})
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Já existe um usuário com esse email.');
    })
});
