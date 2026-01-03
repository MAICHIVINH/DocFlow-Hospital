const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/db.config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import models
db.Role = require('./role.model')(sequelize, Sequelize.DataTypes);
db.Department = require('./department.model')(sequelize, Sequelize.DataTypes);
db.User = require('./user.model')(sequelize, Sequelize.DataTypes);
db.Document = require('./document.model')(sequelize, Sequelize.DataTypes);
db.DocumentVersion = require('./document-version.model')(sequelize, Sequelize.DataTypes);
db.Tag = require('./tag.model')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification.model')(sequelize, Sequelize.DataTypes);
db.AuditLog = require('./audit-log.model')(sequelize, Sequelize.DataTypes);

// Set up associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
