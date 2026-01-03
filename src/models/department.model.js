module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    }, {
        tableName: 'departments',
        timestamps: true,
        underscored: true
    });

    Department.associate = (models) => {
        Department.hasMany(models.User, { foreignKey: 'department_id' });
        Department.hasMany(models.Document, { foreignKey: 'department_id' });
    };

    return Department;
};
