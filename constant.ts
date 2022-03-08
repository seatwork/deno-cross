// 请求方法主键
export const enum Method {
    ALL = "ALL",
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
}

// 常用HTTP状态码
export const enum HttpStatus {
    SUCCESS = 200,
    NO_CONTENT = 204,

    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    REQUEST_TIMEOUT = 408,
    PAYLOAD_TOO_LARGE = 413,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,

    INTERNAL_SERVER_ERROR = 500,
}

// 常用静态文件类型
export const Mime: Record<string, string> = {
    ".htm": "text/html;charset:utf-8",
    ".html": "text/html;charset:utf-8",
    ".xml": "text/xml;charset:utf-8",
    ".css": "text/css;charset:utf-8",
    ".txt": "text/plain;charset:utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".tif": "image/tiff",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".json": "application/json",
    ".zip": "application/zip",
}