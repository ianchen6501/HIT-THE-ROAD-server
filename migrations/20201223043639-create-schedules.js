'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      scheduleName: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      dailyRoutines: {
        type: Sequelize.JSON
      },
      dateRange: {
        type: Sequelize.JSON
      },
      isFinished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      spots: {
        type: Sequelize.JSON
      },
      spotsIds: {
        type: Sequelize.JSON
      },
      spotId: { 
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      markers: {
        type: Sequelize.JSON
      },
      routes: {
        type: Sequelize.JSON
      },
      postItId: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      UserId: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Schedules');
  }
};