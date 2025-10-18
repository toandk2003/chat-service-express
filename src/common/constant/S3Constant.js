const S3_CONSTANTS = {
    // Buckets
    AVATAR_PRIVATE_BUCKET: "avatar-private-chat-app-bucket",
    AVATAR_GROUP_BUCKET: "avatar-group-chat-app-bucket",
    CHAT_MEDIA_BUCKET: "chat-media-chat-app-bucket",
    COUNTRY_BUCKET: "country-chat-app-bucket",
    
    // Expire times
    PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours
    PRESIGN_URL_DOWNLOAD_MEDIA_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 hours
    
    // Size limits
    MAX_LIMIT_RESOURCE: 0.5 * 1024 * 1024 * 1024, // 1GB
    MAX_FILE_SIZE_AVATAR: 1 * 1024 * 1024, // 1MB
    EXPIRE_TIME_ATTACHMENT: 1, // 1 day
    
    // Allowed content types
    ALLOWED_CONTENT_TYPES: [
        // Images - Hình ảnh
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",

        // Videos - Video
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",

        // Audio - Âm thanh
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/mp4",
        "audio/aac",
        "audio/mp3",

        // Documents - Tài liệu
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "text/plain",
        "text/csv",

        // Archives - File nén
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/x-tar",
        "application/gzip",

        // Other common types
        "application/json",
        "application/xml",
        "text/xml"
    ],
    
    // Allowed extensions
    ALLOWED_EXTENSIONS: [
        // Images
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",

        // Videos
        ".mp4", ".mov", ".avi", ".webm",

        // Audio
        ".mp3", ".wav", ".ogg", ".m4a", ".aac",

        // Documents
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",

        // Archives
        ".zip", ".rar", ".7z", ".tar", ".gz"
    ]
};

module.exports = S3_CONSTANTS;