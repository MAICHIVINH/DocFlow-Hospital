const { minioClient, bucketName } = require('../config/minio.config');

/**
 * Proxy endpoint to serve files from MinIO
 * This allows frontend to display PDFs in iframe without CORS issues
 */
const proxyFile = async (req, res) => {
    try {
        const { publicId } = req.params;
        const objectPath = decodeURIComponent(publicId);

        // Get object metadata to find content type
        const stat = await minioClient.statObject(bucketName, objectPath);

        // Set headers for inline preview
        res.setHeader('Content-Type', stat.metaData['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');

        // Stream the data directly to the response
        const dataStream = await minioClient.getObject(bucketName, objectPath);
        dataStream.pipe(res);

    } catch (error) {
        console.error('[PROXY] Error:', error.message);
        res.status(500).json({ message: 'Failed to proxy file', details: error.message });
    }
};

module.exports = {
    proxyFile
};
