export const getFormatDate = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
export const getISODate = () => new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
