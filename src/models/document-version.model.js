module.exports = (sequelize, DataTypes) => {
    const DocumentVersion = sequelize.define('DocumentVersion', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        documentId: {
            type: DataTypes.UUID,
            field: 'document_id'
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'version_number'
        },
        fileUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'file_url'
        },
        fileSize: {
            type: DataTypes.BIGINT,
            field: 'file_size'
        },
        fileType: {
            type: DataTypes.STRING,
            field: 'file_type'
        },
        uploaderId: {
            type: DataTypes.UUID,
            field: 'uploader_id'
        },
        changeLog: {
            type: DataTypes.TEXT,
            field: 'change_log'
        },
        approvedBy: {
            type: DataTypes.UUID,
            field: 'approved_by'
        },
        approvedAt: {
            type: DataTypes.DATE,
            field: 'approved_at'
        },
        approvalSignature: {
            type: DataTypes.STRING,
            field: 'approval_signature'
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
        tableName: 'document_versions',
        timestamps: true,
        underscored: true
    });

    DocumentVersion.associate = (models) => {
        DocumentVersion.belongsTo(models.Document, { foreignKey: 'document_id', as: 'document' });
        DocumentVersion.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader' });
    };

    return DocumentVersion;
};
