'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Schedules.belongsTo(models.Users)
    }
  };
  Schedules.init({
    scheduleName: DataTypes.STRING,
    location: DataTypes.STRING,
    dailyRoutines: DataTypes.JSON,
    dateRange: DataTypes.JSON,
    isFinished: DataTypes.BOOLEAN,
    spots: DataTypes.JSON,
    spotsIds: DataTypes.JSON,
    spotId: DataTypes.INTEGER,
    markers: DataTypes.JSON,
    routes: DataTypes.JSON,
    postItId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Schedules',
  });
  return Schedules;
};