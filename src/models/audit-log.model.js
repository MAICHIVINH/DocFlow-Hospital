module.exports = (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.UUID,
            field: 'user_id'
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        targetTable: {
            type: DataTypes.STRING,
            field: 'target_table'
        },
        targetId: {
            type: DataTypes.UUID,
            field: 'target_id'
        },
        payload: DataTypes.JSONB,
        ipAddress: {
            type: DataTypes.INET,
            field: 'ip_address'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        }
    }, {
        tableName: 'audit_logs',
        underscored: true,
        updatedAt: false,
        timestamps: true,
        createdAt: 'created_at'
    });

    AuditLog.associate = (models) => {
        AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return AuditLog;
};
