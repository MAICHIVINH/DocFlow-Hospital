const cloudinary = require('../config/cloudinary.config');
const axios = require('axios');

/**
 * Proxy endpoint to serve files from Cloudinary
 * This allows frontend to display PDFs in iframe without 401 errors
 */
const proxyFile = async (req, res) => {
    try {
        const { publicId } = req.params;
        const decodedPublicId = decodeURIComponent(publicId);

        // 1. Get authoritative details from Cloudinary Admin API
        // This is the source of truth for the file's location and type
        const resource = await cloudinary.api.resource(decodedPublicId);

        console.log(`[PROXY] Resource found: type=${resource.type}, resource_type=${resource.resource_type}, format=${resource.format}`);

        // 2. Use the secure_url provided by Cloudinary
        // We ALWAYS re-generate a signed URL to be safe
        // This handles cases where 'upload' type might still have access restrictions
        // or if the frontend needs a temporary access token
        let targetUrl = cloudinary.url(decodedPublicId, {
            resource_type: resource.resource_type,
            type: resource.type,
            format: resource.format,
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour validity
        });

        console.log(`[PROXY] Returning URL: ${targetUrl}`);

        // Return URL for frontend to use in iframe directly
        // This avoids axios blob fetching network issues
        return res.json({ url: targetUrl });

    } catch (error) {
        console.error('[PROXY] Error:', error.message);
        if (error.response) {
            console.error('[PROXY] Upstream error:', error.response.status, error.response.statusText);
        } else if (error.error && error.error.http_code) {
            // Cloudinary API error
            console.error('[PROXY] Cloudinary API error:', error.error.message);
        }

        res.status(500).json({ message: 'Failed to proxy file', details: error.message });
    }
};

module.exports = {
    proxyFile
};
