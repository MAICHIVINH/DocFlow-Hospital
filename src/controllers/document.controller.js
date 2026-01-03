const { minioClient, bucketName } = require('../config/minio.config');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const { Document, DocumentVersion, User, Department, Tag, sequelize } = db;
const { Op } = require('sequelize');
const auditService = require('../services/audit.service');
const notificationService = require('../services/notification.service');

/**
 * Helper function to check document access based on visibility and user role
 */
const checkDocumentAccess = async (userId, userRole, userDeptId, documentId) => {
    const doc = await Document.findByPk(documentId);
    if (!doc) return { allowed: false, message: 'Document not found' };

    // Admin can access everything
    if (userRole === 'ADMIN') return { allowed: true, document: doc };

    // Check visibility
    if (doc.visibility === 'PUBLIC') return { allowed: true, document: doc };
    if (doc.visibility === 'DEPARTMENT' && doc.departmentId === userDeptId) {
        return { allowed: true, document: doc };
    }
    if (doc.visibility === 'PRIVATE' && doc.creatorId === userId) {
        return { allowed: true, document: doc };
    }

    return { allowed: false, message: 'Access denied' };
};

/**
 * Helper function to upload buffer to MinIO
 */
const uploadToMinIO = async (fileBuffer, originalName, contentType) => {
    const extension = path.extname(originalName);
    const fileName = `${uuidv4()}${extension}`;
    const objectName = `documents/${fileName}`;

    const metaData = {
        'Content-Type': contentType
    };

    await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, metaData);

    return {
        secure_url: objectName,
        public_id: objectName
    };
};

const uploadDocument = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file!' });
        }

        const { title, description, department_id, visibility = 'DEPARTMENT' } = req.body;

        // 1. Upload to MinIO
        const result = await uploadToMinIO(req.file.buffer, req.file.originalname, req.file.mimetype);

        // 2. Create Document record
        const newDoc = await Document.create({
            title: title || req.file.originalname,
            description,
            creatorId: req.userId,
            departmentId: department_id || req.userDeptId, // Fallback to user's dept
            visibility,
            status: 'PENDING'
        }, { transaction });

        // 3. Create First Version
        const newVersion = await DocumentVersion.create({
            documentId: newDoc.id,
            versionNumber: 1,
            fileUrl: result.secure_url,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            uploaderId: req.userId,
            changeLog: 'Initial upload'
        }, { transaction });

        // 4. Update Document with current version
        await newDoc.update({ currentVersionId: newVersion.id }, { transaction });

        await transaction.commit();

        // Audit & Notification (with error handling)
        try {
            await auditService.logAction(req.userId, 'UPLOAD', 'documents', newDoc.id, { title: newDoc.title }, req);
            await notificationService.notifyManagers(newDoc.departmentId, 'Tài liệu mới chờ duyệt', `Nhân viên đã tải lên: ${newDoc.title}`, `/approvals`);
        } catch (auditError) {
            console.error('Audit/Notification error:', auditError);
        }

        res.status(201).json({ message: 'Document uploaded successfully!', data: newDoc });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const listDocuments = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department_id, status, visibility, creator_id, tag_id, start_date, end_date, is_archived } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};

        // 1. Role-based Access Control (Enforce Visibility)
        if (req.userRole !== 'ADMIN') {
            whereClause[Op.and] = [
                {
                    [Op.or]: [
                        { visibility: 'PUBLIC' },
                        {
                            visibility: 'DEPARTMENT',
                            departmentId: req.userDeptId
                        },
                        {
                            visibility: 'PRIVATE',
                            creatorId: req.userId
                        }
                    ]
                }
            ];
        }
        if (is_archived === 'true') {
            whereClause.isArchived = true;
        } else {
            // For active documents, show those where is_archived is false OR null
            whereClause.isArchived = { [Op.or]: [false, null] };
        }

        // Basic Search (Title, Description)
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Filters
        if (department_id) whereClause.departmentId = department_id;
        if (status) whereClause.status = status;
        if (visibility) whereClause.visibility = visibility;
        if (creator_id) whereClause.creatorId = creator_id;

        // Date Range Filter
        if (start_date && end_date) {
            whereClause.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            whereClause.createdAt = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            whereClause.createdAt = { [Op.lte]: new Date(end_date) };
        }

        // Build include models
        const includeModels = [
            {
                model: User,
                as: 'creator',
                attributes: ['id', 'fullName', 'username']
            },
            {
                model: Department,
                as: 'department',
                attributes: ['id', 'name']
            }
        ];

        // Handle tag filtering
        let query = Document.findAndCountAll({
            where: whereClause,
            include: includeModels,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        // If tag_id is provided, we need a separate approach with subquery
        if (tag_id) {
            query = Document.findAndCountAll({
                where: whereClause,
                include: [
                    ...includeModels,
                    {
                        model: Tag,
                        as: 'tags',
                        where: { id: tag_id },
                        through: { attributes: [] },
                        required: true
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                distinct: true,
                subQuery: false
            });
        } else {
            query = Document.findAndCountAll({
                where: whereClause,
                include: includeModels,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                distinct: true
            });
        }

        const { count, rows } = await query;

        res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('ListDocuments Error:', error);
        res.status(500).json({ message: error.message });
    }
};;

const approveDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findByPk(id);

        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const approvedAt = new Date();
        const approvalSignature = `DIGITAL_SIG_${req.userId}_${approvedAt.getTime()}`;

        await doc.update({
            status: 'APPROVED',
            approvedBy: req.userId,
            approvedAt: approvedAt,
            approvalSignature: approvalSignature
        });

        // Also update the current version with approval info
        if (doc.currentVersionId) {
            await DocumentVersion.update({
                approvedBy: req.userId,
                approvedAt: approvedAt,
                approvalSignature: approvalSignature
            }, { where: { id: doc.currentVersionId } });
        }

        // Audit & Notification
        try {
            await auditService.logAction(req.userId, 'APPROVE', 'documents', id, { signature: approvalSignature }, req);
            await notificationService.createNotification(doc.creatorId, 'Tài liệu đã được duyệt', `Tài liệu "${doc.title}" đã được phê duyệt.`, `/docs`);
        } catch (auditError) {
            console.error('Audit/Notification error:', auditError);
        }

        res.status(200).json({ message: 'Document approved successfully!', document: doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const doc = await Document.findByPk(id);

        if (!doc) return res.status(404).json({ message: 'Document not found' });

        await doc.update({ status: 'REJECTED' });

        // Audit & Notification
        try {
            await auditService.logAction(req.userId, 'REJECT', 'documents', id, { reason }, req);
            await notificationService.createNotification(doc.creatorId, 'Tài liệu bị từ chối', `Tài liệu "${doc.title}" bị từ chối. Lý do: ${reason}`, `/docs`);
        } catch (auditError) {
            console.error('Audit/Notification error:', auditError);
        }

        res.status(200).json({ message: 'Document rejected.', document: doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const access = await checkDocumentAccess(req.userId, req.userRole, req.userDeptId, id);

        if (!access.allowed) {
            return res.status(403).json({ message: access.message });
        }

        const doc = await Document.findByPk(id, {
            include: [
                { model: DocumentVersion, as: 'versions', include: [{ model: User, as: 'uploader', attributes: ['full_name'] }], order: [['version_number', 'DESC']] },
                { model: User, as: 'creator', attributes: ['full_name', 'username'] },
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Tag, as: 'tags', through: { attributes: [] } },
                { model: DocumentVersion, as: 'currentVersion', attributes: ['fileUrl', 'fileType', 'fileSize'] }
            ]
        });

        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Audit log
        try {
            await auditService.logAction(req.userId, 'VIEW', 'documents', id, {}, req);
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const access = await checkDocumentAccess(req.userId, req.userRole, req.userDeptId, id);

        if (!access.allowed) {
            return res.status(403).json({ message: access.message });
        }

        const doc = await Document.findByPk(id, {
            include: [{ model: DocumentVersion, as: 'currentVersion' }]
        });

        if (!doc || !doc.currentVersion) {
            return res.status(404).json({ message: 'Document version not found' });
        }

        // Log download action
        try {
            await auditService.logAction(req.userId, 'DOWNLOAD', 'documents', id, {}, req);
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        // For MinIO, we store the object path in fileUrl
        const objectPath = doc.currentVersion.fileUrl;

        // Return proxy URL for preview and a direct signed URL for download if possible
        // For simplicity, we'll use the proxy for both or generate a signed URL here
        const expiry = 24 * 60 * 60; // 24 hours
        const downloadUrl = await minioClient.presignedGetObject(bucketName, objectPath, expiry);
        const proxyUrl = `${req.protocol}://${req.get('host')}/api/proxy/file/${encodeURIComponent(objectPath)}`;

        res.status(200).json({
            downloadUrl: downloadUrl,
            proxyUrl: proxyUrl,
            fileName: doc.title,
            fileType: doc.currentVersion.fileType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const doc = await Document.findByPk(id);

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Only creator or ADMIN can delete
        if (doc.creatorId !== req.userId && req.userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Only document creator or admin can delete' });
        }

        // Delete associated versions
        await DocumentVersion.destroy({ where: { document_id: id }, transaction });

        // Delete document (tags will be auto-removed via cascade)
        await doc.destroy({ transaction });

        await transaction.commit();

        // Audit log
        try {
            await auditService.logAction(req.userId, 'DELETE', 'documents', id, { title: doc.title }, req);
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const tagDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { tagNames } = req.body; // Array of tag names

        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const tags = await Promise.all(tagNames.map(async name => {
            const [tag] = await Tag.findOrCreate({ where: { name } });
            return tag;
        }));

        await doc.setTags(tags);

        // Audit log
        try {
            await auditService.logAction(req.userId, 'TAG', 'documents', id, { tags: tagNames }, req);
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json({ message: 'Tags updated successfully', tags: tagNames });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createNewVersion = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { change_log } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a new file!' });
        }

        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Upload to MinIO
        const result = await uploadToMinIO(req.file.buffer, req.file.originalname, req.file.mimetype);

        // Get latest version number
        const latestVersion = await DocumentVersion.findOne({
            where: { document_id: id },
            order: [['version_number', 'DESC']]
        });

        const nextVersionNumber = (latestVersion ? latestVersion.versionNumber : 0) + 1;

        // Create New Version
        const newVersion = await DocumentVersion.create({
            documentId: id,
            versionNumber: nextVersionNumber,
            fileUrl: result.secure_url,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            uploaderId: req.userId,
            changeLog: change_log || `Updated to version ${nextVersionNumber}`
        }, { transaction });

        // Update Document with new current version
        await doc.update({ currentVersionId: newVersion.id }, { transaction });

        await transaction.commit();

        // Audit & Notification
        try {
            await auditService.logAction(req.userId, 'UPDATE_VERSION', 'documents', id, { version: nextVersionNumber }, req);
            await notificationService.notifyManagers(doc.departmentId, 'Phiên bản mới tài liệu', `Nhân viên đã cập nhật phiên bản ${nextVersionNumber} cho: ${doc.title}`, `/docs/${id}`);
        } catch (auditError) {
            console.error('Audit/Notification error:', auditError);
        }

        res.status(201).json({ message: 'New version uploaded successfully!', version: newVersion });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const restoreVersion = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id, versionId } = req.params;

        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const versionToRestore = await DocumentVersion.findOne({
            where: { id: versionId, document_id: id }
        });

        if (!versionToRestore) {
            return res.status(404).json({ message: 'Version not found for this document' });
        }

        // Update Document's current version and approval state from that version
        await doc.update({
            currentVersionId: versionToRestore.id,
            approvedBy: versionToRestore.approvedBy,
            approvedAt: versionToRestore.approvedAt,
            approvalSignature: versionToRestore.approvalSignature,
            status: versionToRestore.approvedBy ? 'APPROVED' : 'PENDING'
        }, { transaction });

        await transaction.commit();

        // Audit
        try {
            await auditService.logAction(req.userId, 'RESTORE_VERSION', 'documents', id, {
                restored_to_version: versionToRestore.version_number,
                was_approved: !!versionToRestore.approved_by
            }, req);
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json({ message: 'Version restored successfully!', current_version_id: versionToRestore.id });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const archiveDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        await doc.update({
            isArchived: true,
            archivedAt: new Date()
        });

        await auditService.logAction(req.userId, 'ARCHIVE', 'documents', id, {}, req);

        res.status(200).json({ message: 'Document archived successfully!', document: doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unarchiveDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Document.findByPk(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        await doc.update({
            isArchived: false,
            archivedAt: null
        });

        await auditService.logAction(req.userId, 'UNARCHIVE', 'documents', id, {}, req);

        res.status(200).json({ message: 'Document unarchived successfully!', document: doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    approveDocument,
    rejectDocument,
    getDocument,
    downloadDocument,
    deleteDocument,
    listDocuments,
    tagDocument,
    createNewVersion,
    restoreVersion,
    archiveDocument,
    unarchiveDocument
};
