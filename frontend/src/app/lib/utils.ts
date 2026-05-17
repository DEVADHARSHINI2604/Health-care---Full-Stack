export const generateUniqueId = (prefix: 'FAM' | 'APT' | 'PAT'): string => {
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}-${randomStr}`;
};
