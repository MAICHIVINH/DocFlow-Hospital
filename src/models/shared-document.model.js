module.exports = (sequelize, DataTypes) => {
    const SharedDocument = sequelize.define('SharedDocument', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        documentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'document_id'
        },
        sharedWithUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'shared_with_user_id'
        },
        sharedByUserId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'shared_by_user_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        }
    }, {
        tableName: 'shared_documents',
        timestamps: true,
        updatedAt: false, // Only track creation, not updates
        underscored: true
    });

    SharedDocument.associate = (models) => {
        SharedDocument.belongsTo(models.Document, {
            foreignKey: 'document_id',
            as: 'document'
        });
        SharedDocument.belongsTo(models.User, {
            foreignKey: 'shared_with_user_id',
            as: 'sharedWithUser'
        });
        SharedDocument.belongsTo(models.User, {
            foreignKey: 'shared_by_user_id',
            as: 'sharedByUser'
        });
    };

    return SharedDocument;
};
