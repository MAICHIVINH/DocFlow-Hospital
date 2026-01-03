const db = require('../models');
const { Document, Department, AuditLog, User, sequelize } = db;
const { Op } = require('sequelize');

/**
 * Helper to build accessibility where clause based on user role
 */
const getAccessibilityClause = (req) => {
    console.log('[DEBUG] Stats Access Check:', {
        role: req.userRole,
        deptId: req.userDeptId,
        userId: req.userId
    });

    if (req.userRole === 'ADMIN') return {};

    return {
        [Op.or]: [
            { visibility: 'PUBLIC' },
            {
                visibility: 'DEPARTMENT',
                departmentId: req.userDeptId
            },
            {
                visibility: 'DEPARTMENT',
                departmentId: req.userDeptId
            },
            {
                creatorId: req.userId
            }
        ]
    };
};

const getDocumentStatsByDept = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        // Apply Visibility Filter
        const accessClause = getAccessibilityClause(req);
        Object.assign(where, accessClause);

        const stats = await Document.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Document.id')), 'value'],
                [sequelize.col('department.name'), 'name']
            ],
            where,
            include: [{
                model: Department,
                as: 'department',
                attributes: []
            }],
            group: ['department.name'],
            raw: true
        });

        // Add colors for frontend
        const colors = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];
        const formattedStats = (stats || []).map((s, i) => ({
            name: s.name || 'Unknown',
            value: parseInt(s.value || 0),
            color: colors[i % colors.length]
        }));

        res.status(200).json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsageStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        // Apply Visibility Filter
        const accessClause = getAccessibilityClause(req);
        Object.assign(where, accessClause);

        const totalDocs = await Document.count({ where });
        const pendingDocs = await Document.count({ where: { ...where, status: 'PENDING' } });
        const approvedDocs = await Document.count({ where: { ...where, status: 'APPROVED' } });
        const interactionsWhere = {};
        if (startDate && endDate) {
            interactionsWhere.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }
        const interactions = await AuditLog.count({
            where: {
                ...interactionsWhere,
                action: { [Op.in]: ['VIEW', 'DOWNLOAD'] }
            }
        });

        res.status(200).json({
            totalDocuments: totalDocs,
            pendingApprovals: pendingDocs,
            approvedDocuments: approvedDocs,
            totalInteractions: interactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMonthlyStats = async (req, res) => {
    try {
        // Get data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Query documents grouped by month
        const uploadsByMonth = await Document.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('Document.created_at')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('Document.id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: sixMonthsAgo },
                ...getAccessibilityClause(req)
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('Document.created_at'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('Document.created_at')), 'ASC']],
            raw: true
        });

        // Query view actions from audit logs grouped by month
        const viewsByMonth = await AuditLog.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('AuditLog.created_at')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('AuditLog.id')), 'count']
            ],
            where: {
                action: 'VIEW',
                createdAt: { [Op.gte]: sixMonthsAgo }
            },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('AuditLog.created_at'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('AuditLog.created_at')), 'ASC']],
            raw: true
        });

        // Create a map for easier lookup
        const uploadsMap = {};
        uploadsByMonth.forEach(item => {
            const monthKey = new Date(item.month).toISOString().slice(0, 7);
            uploadsMap[monthKey] = parseInt(item.count);
        });

        const viewsMap = {};
        viewsByMonth.forEach(item => {
            const monthKey = new Date(item.month).toISOString().slice(0, 7);
            viewsMap[monthKey] = parseInt(item.count);
        });

        // Generate last 6 months data
        const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        const result = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7);
            const monthName = monthNames[date.getMonth()];

            result.push({
                name: monthName,
                uploads: uploadsMap[monthKey] || 0,
                views: viewsMap[monthKey] || 0
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Monthly Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getTagStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        // Apply Visibility Filter
        const accessClause = getAccessibilityClause(req);
        Object.assign(where, accessClause);

        const stats = await db.Tag.findAll({
            attributes: [
                'name',
                [sequelize.fn('COUNT', sequelize.col('documents.id')), 'value']
            ],
            include: [{
                model: Document,
                as: 'documents',
                attributes: [],
                where,
                through: { attributes: [] }
            }],
            group: ['Tag.id', 'Tag.name'],
            order: [[sequelize.fn('COUNT', sequelize.col('documents.id')), 'DESC']],
            limit: 10,
            subQuery: false
        });

        res.status(200).json(stats.map(s => ({
            name: s.name,
            value: parseInt(s.get('value'))
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserContributionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        // Apply Visibility Filter
        const accessClause = getAccessibilityClause(req);
        Object.assign(where, accessClause);

        const stats = await User.findAll({
            attributes: [
                'id',
                'fullName',
                [sequelize.fn('COUNT', sequelize.col('documents.id')), 'value']
            ],
            include: [{
                model: Document,
                as: 'documents',
                attributes: [],
                where,
                required: false
            }],
            group: ['User.id', 'User.full_name'],
            order: [[sequelize.fn('COUNT', sequelize.col('documents.id')), 'DESC']],
            limit: 5,
            subQuery: false,
            raw: true
        });

        res.status(200).json(stats.map(s => ({
            name: s.fullName || 'Unknown',
            value: parseInt(s.value) || 0
        })));
    } catch (error) {
        console.error('User Contributions Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const ExcelJS = require('exceljs');

const exportDocumentsToExcel = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.userId);
        const documents = await Document.findAll({
            include: [
                { model: User, as: 'creator', attributes: ['fullName'] },
                { model: Department, as: 'department', attributes: ['name'] }
            ],
            where: getAccessibilityClause(req),
            order: [['createdAt', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách tài liệu');


        // --- 1. Hospital Branding (Top Left) ---
        worksheet.mergeCells('A1:C1');
        const hospitalNameCell = worksheet.getCell('A1');
        hospitalNameCell.value = 'BỆNH VIỆN ĐA KHOA QUỐC TẾ DOCFLOW';
        hospitalNameCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1565C0' } }; // Blue 800
        hospitalNameCell.alignment = { horizontal: 'left', vertical: 'middle' };

        worksheet.mergeCells('A2:C2');
        const sloganCell = worksheet.getCell('A2');
        sloganCell.value = 'Chất lượng - Tận tâm - Chuyên nghiệp';
        sloganCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF546E7A' } }; // Blue Grey
        sloganCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // --- 2. Report Title (Centered) ---
        worksheet.mergeCells('A4:G4');
        const titleCell = worksheet.getCell('A4');
        titleCell.value = 'BÁO CÁO THỐNG KÊ TÀI LIỆU';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1A237E' } }; // Navy Blue
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- 3. Metadata Info ---
        worksheet.getCell('A6').value = 'Ngày xuất báo cáo:';
        worksheet.getCell('A6').font = { bold: true };
        worksheet.getCell('B6').value = new Date().toLocaleString('vi-VN');

        worksheet.getCell('A7').value = 'Người thực hiện:';
        worksheet.getCell('A7').font = { bold: true };
        worksheet.getCell('B7').value = currentUser?.fullName || 'Hệ thống';

        // --- 4. Table Setup ---
        // Define columns keys only, widths will be auto-calculated later
        worksheet.columns = [
            { key: 'id' },
            { key: 'title' },
            { key: 'description' },
            { key: 'department' },
            { key: 'creator' },
            { key: 'status' },
            { key: 'created_at' }
        ];

        // Header Row (Row 9)
        const headerRow = worksheet.getRow(9);
        headerRow.values = ['ID', 'Tiêu đề', 'Mô tả', 'Phòng ban', 'Người tạo', 'Trạng thái', 'Ngày tạo'];

        headerRow.eachCell((cell) => {
            cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0277BD' } // Light Blue 800
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
                left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
                bottom: { style: 'thin', color: { argb: 'FFB0BEC5' } },
                right: { style: 'thin', color: { argb: 'FFB0BEC5' } }
            };
        });
        headerRow.height = 30;

        // --- 5. Data Rows ---
        documents.forEach((doc) => {
            const row = worksheet.addRow([
                doc.id,
                doc.title,
                doc.description,
                doc.department?.name || '',
                doc.creator?.fullName || '',
                doc.status,
                new Date(doc.createdAt).toLocaleDateString('vi-VN')
            ]);

            row.height = 25; // More breathing room

            // Styling for each cell in the row
            row.eachCell((cell, colNumber) => {
                cell.font = { name: 'Arial', size: 11 };
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FFECEFF1' } } // Light border line
                };
                cell.alignment = { vertical: 'middle', wrapText: true };

                // Center align specific columns
                if ([1, 4, 5, 6, 7].includes(colNumber)) {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });

            // Status Styling (Column 6)
            const statusCell = row.getCell(6);
            if (doc.status === 'APPROVED') {
                statusCell.font = { color: { argb: 'FF2E7D32' }, bold: true }; // Green
            } else if (doc.status === 'REJECTED') {
                statusCell.font = { color: { argb: 'FFC62828' }, bold: true }; // Red
            } else if (doc.status === 'PENDING') {
                statusCell.font = { color: { argb: 'FFF9A825' }, bold: true }; // Yellow/Orange
            }
        });

        // ... (data population code remains above)

        // --- Auto-size Columns ---
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            if (column && column.eachCell) {
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnValue = cell.value ? cell.value.toString() : '';
                    if (columnValue.length > maxLength) {
                        maxLength = columnValue.length;
                    }
                });
            }
            // Add a little extra padding and set a minimum/maximum width
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=BaoCao_TaiLieu_BV.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: error.message });
    }
};


const PDFDocument = require('pdfkit');

const exportDocumentsToPDF = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.userId);
        const documents = await Document.findAll({
            include: [
                { model: User, as: 'creator', attributes: ['full_name'] },
                { model: Department, as: 'department', attributes: ['name'] }
            ],
            where: getAccessibilityClause(req),
            order: [['createdAt', 'DESC']]
        });

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=BaoCao_TaiLieu_BV.pdf');

        doc.pipe(res);

        // --- Header ---
        doc.font('Helvetica-Bold').fontSize(18).fillColor('#1565C0')
            .text('BENH VIEN DA KHOA QUOC TE DOCFLOW', { align: 'left' });

        doc.font('Helvetica-Oblique').fontSize(10).fillColor('#546E7A')
            .text('Chat luong - Tan tam - Chuyen nghiep', { align: 'left' });

        doc.moveDown();

        doc.font('Helvetica-Bold').fontSize(20).fillColor('#1A237E')
            .text('BAO CAO THONG KE TAI LIEU', { align: 'center' });

        doc.moveDown();

        // --- Metadata ---
        doc.font('Helvetica').fontSize(10).fillColor('#000000');
        doc.text(`Ngay xuat bao cao: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'left' });
        doc.text(`Nguoi thuc hien: ${currentUser?.full_name || 'He thong'}`, { align: 'left' }); // Limit extended chars

        doc.moveDown();

        // --- Table Header ---
        const tableTop = 200;
        const itemHeight = 20;
        const colX = [30, 80, 250, 450, 580, 680, 750]; // X positions
        const colWidth = [40, 160, 190, 120, 90, 60, 60]; // Widths

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');

        // Draw Header Background
        doc.rect(30, tableTop - 5, 760, 20).fill('#0277BD');
        doc.fillColor('#FFFFFF');

        doc.text('ID', colX[0], tableTop);
        doc.text('Tieu de', colX[1], tableTop);
        doc.text('Mo ta', colX[2], tableTop);
        doc.text('Phong ban', colX[3], tableTop);
        doc.text('Nguoi tao', colX[4], tableTop);
        doc.text('T.Thai', colX[5], tableTop);
        doc.text('Ngay', colX[6], tableTop);

        let y = tableTop + 25;

        // --- Table Rows ---
        doc.font('Helvetica').fontSize(9).fillColor('#000000');

        documents.forEach((docItem, i) => {
            // Check page break
            if (y > 500) {
                doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
                y = 50;
                // Re-draw Header on new page
                doc.rect(30, y - 5, 760, 20).fill('#0277BD');
                doc.fillColor('#FFFFFF');
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('ID', colX[0], y);
                doc.text('Tieu de', colX[1], y);
                doc.text('Mo ta', colX[2], y);
                doc.text('Phong ban', colX[3], y);
                doc.text('Nguoi tao', colX[4], y);
                doc.text('T.Thai', colX[5], y);
                doc.text('Ngay', colX[6], y);

                y += 25;
                doc.font('Helvetica').fontSize(9).fillColor('#000000');
            }

            // Alternating Row Background
            if (i % 2 === 1) {
                doc.rect(30, y - 5, 760, 20).fill('#F5F5F5');
                doc.fillColor('#000000');
            }

            // Clean text to avoid PDFKit encoding issues with Vietnamese characters if using standard fonts
            // For full Vietnamese support custom fonts are needed, but sticking to standard for now.
            // A simple unidecode or regex strip could help if strict ASCII is needed, 
            // but let's assume basic Latin chars for now or that Node handles UTF-8 partially ok 
            // (Standard fonts usually don't support full utf-8 special chars well).
            // For now, let's keep it direct.

            doc.text(docItem.id.toString(), colX[0], y, { width: colWidth[0], lineBreak: false });
            doc.text(docItem.title, colX[1], y, { width: colWidth[1], height: 15, ellipsis: true });
            doc.text(docItem.description, colX[2], y, { width: colWidth[2], height: 15, ellipsis: true });
            doc.text(docItem.department?.name || '', colX[3], y, { width: colWidth[3], ellipsis: true });
            doc.text(docItem.creator?.full_name || '', colX[4], y, { width: colWidth[4], ellipsis: true });

            // Status Color
            doc.save();
            if (docItem.status === 'APPROVED') doc.fillColor('#2E7D32');
            else if (docItem.status === 'REJECTED') doc.fillColor('#C62828');
            else doc.fillColor('#F9A825');

            doc.text(docItem.status, colX[5], y, { width: colWidth[5] });
            doc.restore();

            doc.text(new Date(docItem.createdAt).toLocaleDateString('vi-VN'), colX[6], y, { width: colWidth[6] });

            y += 20;
        });

        doc.end();

    } catch (error) {
        console.error('Export PDF Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDocumentStatsByDept,
    getUsageStats,
    getMonthlyStats,
    getTagStats,
    getUserContributionStats,
    exportDocumentsToExcel,
    exportDocumentsToPDF
};
