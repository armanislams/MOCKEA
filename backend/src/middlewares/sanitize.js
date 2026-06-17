const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove script tags and their content
    let sanitized = str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove iframe/object/embed/applet tags
    sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
    sanitized = sanitized.replace(/<applet[^>]*>[\s\S]*?<\/applet>/gi, '');
    
    // Remove inline event handlers (e.g. onload, onerror, onclick, etc.)
    sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(["'])(?:(?!\1)[\s\S])*\1/gi, '');
    sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*[^\s>]+/gi, '');
    
    // Remove javascript: URIs (e.g. href="javascript:alert(1)" or href=javascript:alert(1))
    sanitized = sanitized.replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*javascript:[^\s>]+/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*javascript:[^\s>]+/gi, 'src=""');
    
    // Remove data: URIs in src attributes
    sanitized = sanitized.replace(/src\s*=\s*(["'])\s*data:[^"']*\1/gi, 'src=""');
    
    return sanitized;
};

const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitizedObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // MongoDB Injection prevention: Strip keys starting with $ or containing .
            if (key.startsWith('$') || key.includes('.')) {
                continue;
            }
            sanitizedObj[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitizedObj;
};

export const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        const sanitized = sanitizeObject(req.query);
        for (const key in req.query) {
            delete req.query[key];
        }
        Object.assign(req.query, sanitized);
    }
    if (req.params) {
        const sanitized = sanitizeObject(req.params);
        for (const key in req.params) {
            delete req.params[key];
        }
        Object.assign(req.params, sanitized);
    }
    next();
};
