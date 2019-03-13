const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwLCJuYW1lIjoiVXNlciAjMSIsImVtYWlsIjoidXNlcjFAbWFpbC5jb20ifQ.IFFrpO2juS3NIhBcWrx9YoMZ-mjzA_CYt5UMbKBmTfg'

beforeAll(async () => {
    //await app.db.migrate.rollback();
    //await app.db.migrate.latest();
    await app.db.seed.run();
});

test('Deve listar apenas as transferências do usuários', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .then((res) => {
         expect(res.status).toBe(200);
         expect(res.body).toHaveLength(1);
         expect(res.body[0].description).toBe('Transfer #1');
    });
});

test('Deve inserir uma transferência com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date() })
        .then(async (res) => {
            expect(res.status).toBe(201);
            expect(res.body.description).toBe('Regular Transfer');

            const transactions = await app.db('transactions').where({ transfer_id: res.body.id });
            expect(transactions).toHaveLength(2);
            expect(transactions[0].description).toBe('Transfer to acc #100001');
            expect(transactions[1].description).toBe('Transfer from acc #100000');
            expect(transactions[0].ammount).toBe('-100.00');
            expect(transactions[1].ammount).toBe('100.00');
            expect(transactions[0].acc_id).toBe(100000);
            expect(transactions[1].acc_id).toBe(100001);
    });
});
