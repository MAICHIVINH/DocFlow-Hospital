module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'role'
        },
        permission: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'permission'
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
        tableName: 'permissions',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['role', 'permission']
            }
        ]
    });

    return Permission;
};
