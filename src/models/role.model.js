module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'roles',
        underscored: true,
        timestamps: false
    });

    Role.associate = (models) => {
        Role.hasMany(models.User, { foreignKey: 'role_id' });
    };

    return Role;
};
