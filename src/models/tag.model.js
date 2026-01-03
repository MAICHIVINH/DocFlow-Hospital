module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
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
        tableName: 'document_tags',
        timestamps: true,
        underscored: true
    });

    Tag.associate = (models) => {
        Tag.belongsToMany(models.Document, {
            through: 'document_tag_map',
            foreignKey: 'tag_id',
            otherKey: 'document_id',
            as: 'documents'
        });
    };

    return Tag;
};
