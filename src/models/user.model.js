module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password_hash'
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'full_name'
        },
        departmentId: {
            type: DataTypes.UUID,
            field: 'department_id'
        },
        roleId: {
            type: DataTypes.INTEGER,
            field: 'role_id'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            defaultValue: 'ACTIVE'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        underscored: true
    });

    User.associate = (models) => {
        User.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
        User.hasMany(models.Document, { foreignKey: 'creator_id', as: 'documents' });
        User.hasMany(models.Notification, { foreignKey: 'recipient_id', as: 'notifications' });
    };

    return User;
};
