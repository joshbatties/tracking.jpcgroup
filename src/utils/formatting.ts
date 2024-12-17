export const formatDate = (dateStr: string): string => {
  if (dateStr.toUpperCase() === 'TBA') return 'TBA';
  
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) return dateStr;

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const escapeHTML = (str: string): string => {
  const escapeChars: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, match => escapeChars[match]);
};

export const formatContainerNumbers = (containers: string): string[] => {
  return containers
    .split(',')
    .map(container => container.trim())
    .filter(Boolean);
};