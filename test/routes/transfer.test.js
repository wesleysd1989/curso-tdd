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

describe('Ao tentar salvar uma transferência inválida ..', () =>{
    const validTranfer = { description: 'Regular Transfer', user_id: 100000, acc_ori_id: 100000, acc_dest_id: 100001, ammount: 100, date: new Date() };

    const template = (newdata, errorMessage) => {
        return request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${TOKEN}`)
            .send({ ... validTranfer, ... newdata })
            .then((res) => {
             expect(res.status).toBe(400);
             expect(res.body.error).toBe(errorMessage);
        });
    };

    test('Não deve inserir sem descrição', () => template({ description: null}, 'Descrição e um atributo obrigatório'));
    test('Não deve inserir sem valor', () => template({ ammount: null}, 'Valor é um atributo obrigatório'));
    test('Não deve inserir sem data', () => template({ date: null}, 'Data é um atributo obrigatório'));
    test('Não deve inserir sem conta de origem', () => template({ acc_ori_id: null}, 'Conta de origem é um atributo obrigatório'));
    test('Não deve inserir sem conta de destino', () => template({ acc_dest_id: null}, 'Conta de destino é um atributo obrigatório'));
    test('Não deve inserir se as contas de origem e destinos forem as mesmas', () => template({ acc_dest_id: 100000}, 'Não ê possível transferir de uma conta para ela mesma'));
    test('Não deve inserir se as contas pertencerem a outro usuário', () => template({ acc_ori_id: 100002}, 'Conta #100002 não pertence ao usuário'));
});
