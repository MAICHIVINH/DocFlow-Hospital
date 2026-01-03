module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        recipientId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'recipient_id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: DataTypes.TEXT,
        link: DataTypes.TEXT,
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read'
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
        tableName: 'notifications',
        timestamps: true,
        underscored: true
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, { foreignKey: 'recipient_id', as: 'recipient' });
    };

    return Notification;
};
