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

describe('Ao salvar uma tranferência valida ...', () => {
    let transferId;
    let income;
    let outcome

    test('Deve retornar o status 201 e os dados da transferência', () => {
        return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${TOKEN}`)
        .send({ description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date() })
        .then(async (res) => {
            expect(res.status).toBe(201);
            expect(res.body.description).toBe('Regular Transfer');
            transferId = res.body.id;
        });
    });

    test('As transações equivalentes devem ter sido geradas', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount');
        expect(transactions).toHaveLength(2);
        [outcome, income] = transactions;
    });

    test('A transação de saída deve ser negativa', () => {
        expect(outcome.description).toBe('Transfer to acc #100001');
        expect(outcome.ammount).toBe('-100.00');
        expect(outcome.acc_id).toBe(100000);
        expect(outcome.type).toBe('O');
    });

    test('A transação de entrada deve ser positiva', () => {
        expect(income.description).toBe('Transfer from acc #100000');
        expect(income.ammount).toBe('100.00');
        expect(income.acc_id).toBe(100001);
        expect(income.type).toBe('I');
    });

    test('ambas devem referenciar a transferência que as originou', () => {
        expect(income.transfer_id).toBe(transferId);
        expect(outcome.transfer_id).toBe(transferId);
    });
});
