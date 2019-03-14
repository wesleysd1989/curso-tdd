
exports.seed = (knex) => {
  knex('users').insert([
    {id: 101000, name: 'User #3', email: 'user3@mail.com', password: '$2a$10$8oHNpn4V1L7BZBgEiOIrBOm3.gdHRHjUsqF2UB8RftdJlMS1Murja'},
    {id: 101001, name: 'User #4', email: 'user4@mail.com', password: '$2a$10$8oHNpn4V1L7BZBgEiOIrBOm3.gdHRHjUsqF2UB8RftdJlMS1Murja'},
  ])
  .then(() => knex('accounts').insert([
    {id: 101000, name: 'Acc Saldo Principal', user_id: 101000 },
    {id: 101001, name: 'Acc Saldo Secundário', user_id: 101000 },
    {id: 101002, name: 'Acc Alternativa 1', user_id: 101001 },
    {id: 101003, name: 'Acc Alternativa 2', user_id: 101001 },
  ]))
};
