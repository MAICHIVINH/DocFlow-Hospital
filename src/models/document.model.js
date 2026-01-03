module.exports = (sequelize, DataTypes) => {
    const Document = sequelize.define('Document', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        creatorId: {
            type: DataTypes.UUID,
            field: 'creator_id'
        },
        departmentId: {
            type: DataTypes.UUID,
            field: 'department_id'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'),
            defaultValue: 'PENDING'
        },
        currentVersionId: {
            type: DataTypes.UUID,
            field: 'current_version_id'
        },
        visibility: {
            type: DataTypes.ENUM('PUBLIC', 'DEPARTMENT', 'PRIVATE'),
            defaultValue: 'DEPARTMENT'
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_archived'
        },
        archivedAt: {
            type: DataTypes.DATE,
            field: 'archived_at'
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
        tableName: 'documents',
        timestamps: true,
        underscored: true
    });

    Document.associate = (models) => {
        Document.belongsTo(models.User, { foreignKey: 'creator_id', as: 'creator' });
        Document.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        Document.hasMany(models.DocumentVersion, { foreignKey: 'document_id', as: 'versions' });
        Document.belongsTo(models.DocumentVersion, { foreignKey: 'current_version_id', as: 'currentVersion', constraints: false });

        Document.belongsToMany(models.Tag, {
            through: 'document_tag_map',
            foreignKey: 'document_id',
            otherKey: 'tag_id',
            as: 'tags'
        });
    };

    return Document;
};
