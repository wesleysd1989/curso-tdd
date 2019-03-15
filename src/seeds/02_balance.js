const moment = require('moment');

exports.seed = (knex) => {
  knex('users').insert([
    {id: 101000, name: 'User #3', email: 'user3@mail.com', password: '$2a$10$8oHNpn4V1L7BZBgEiOIrBOm3.gdHRHjUsqF2UB8RftdJlMS1Murja'},
    {id: 101001, name: 'User #4', email: 'user4@mail.com', password: '$2a$10$8oHNpn4V1L7BZBgEiOIrBOm3.gdHRHjUsqF2UB8RftdJlMS1Murja'},
    {id: 101002, name: 'User #5', email: 'user5@mail.com', password: '$2a$10$8oHNpn4V1L7BZBgEiOIrBOm3.gdHRHjUsqF2UB8RftdJlMS1Murja'},
  ])
  .then(() => knex('accounts').insert([
    {id: 101000, name: 'Acc Saldo Principal', user_id: 101000 },
    {id: 101001, name: 'Acc Saldo Secundário', user_id: 101000 },
    {id: 101002, name: 'Acc Alternativa 1', user_id: 101001 },
    {id: 101003, name: 'Acc Alternativa 2', user_id: 101001 },
    {id: 101004, name: 'Acc Geral Principal', user_id: 101002 },
    {id: 101005, name: 'Acc Geral Secundário', user_id: 101002 },
  ]))
  .then(() => knex('transfers').insert([
    {id: 101000, description: 'Transfer #1', user_id: 101002, acc_ori_id: 101005, acc_dest_id: 101004, ammount: 256, date: new Date() },
    {id: 101001, description: 'Transfer #2', user_id: 101001, acc_ori_id: 101002, acc_dest_id: 101003, ammount: 512, date: new Date() },
  ]))
  .then(() => knex('transactions').insert([
    //transacao positiva / saldo = 2
    { description: '2', date: new Date(), ammount: 2, type: 'I', acc_id: 101004, status: true },
    //transacao usuario errado / saldo = 2
    { description: '2', date: new Date(), ammount: 4, type: 'I', acc_id: 101002, status: true },
    //transacao outra conta / saldo = 2 / saldo2 = 8
    { description: '2', date: new Date(), ammount: 8, type: 'I', acc_id: 101005, status: true },
    //transacao pendente / saldo = 2 / saldo2 = 8
    { description: '2', date: new Date(), ammount: 16, type: 'I', acc_id: 101004, status: false },
    //transacao pasada / saldo = 34 / saldo2 = 8
    { description: '2', date: moment().subtract({ days: 5 }), ammount: 32, type: 'I', acc_id: 101004, status: true },
    //transacao futura / saldo = 34 / saldo2 = 8
    { description: '2', date: moment().add({ days: 5 }), ammount: 64, type: 'I', acc_id: 101004, status: true },
    //transacao negativa / saldo = -94 / saldo2 = 8
    { description: '2', date: new Date(), ammount: -128, type: 'O', acc_id: 101004, status: true },
    //transferencia / saldo = 162 / saldo2 = -248
    { description: '2', date: new Date(), ammount: 256, type: 'I', acc_id: 101004, status: true },
    { description: '2', date: new Date(), ammount: -256, type: 'O', acc_id: 101005, status: true },
    //transferencia / saldo = 162 / saldo2 = -248
    { description: '2', date: new Date(), ammount: 512, type: 'I', acc_id: 101003, status: true },
    { description: '2', date: new Date(), ammount: -512, type: 'O', acc_id: 101002, status: true },
  ]));
};
