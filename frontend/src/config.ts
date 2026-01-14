const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
    ? "http://localhost:8000"          
    : "http://192.168.1.82:8030";   

export const getMediaUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
};
