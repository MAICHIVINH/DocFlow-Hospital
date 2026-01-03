const db = require('../models');
const Tag = db.Tag;

const listTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Tag name is required' });

        const [tag, created] = await Tag.findOrCreate({
            where: { name: name.trim() }
        });

        res.status(created ? 201 : 200).json(tag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        await tag.destroy();
        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Tag name is required' });

        const tag = await Tag.findByPk(id);
        if (!tag) return res.status(404).json({ message: 'Tag not found' });

        tag.name = name.trim();
        await tag.save();

        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    listTags,
    createTag,
    updateTag,
    deleteTag
};
