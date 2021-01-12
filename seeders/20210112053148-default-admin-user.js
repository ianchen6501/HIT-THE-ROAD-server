'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.bulkInsert('users', [{
       username: 'demo',
       password: 'demo',
       nickname: 'demo',
       email: "demo@hittheroad.tw"
     }], {});
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.bulkDelete('users', null, {});
  }
};