export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string; transform?: (value: any) => string }[]
) {
  if (!data.length) return;

  const headers = columns
    ? columns.map(c => c.label)
    : Object.keys(data[0]);

  const rows = data.map(item => {
    if (columns) {
      return columns.map(c => {
        const value = item[c.key];
        return c.transform ? c.transform(value) : formatValue(value);
      });
    }
    return Object.values(item).map(formatValue);
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value.toDate) return value.toDate().toLocaleString();
    return JSON.stringify(value).replace(/"/g, '""');
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportFieldsToCSV(fields: any[]) {
  const columns = [
    { key: 'name', label: 'Field Name' },
    { key: 'userName', label: 'Farmer Name' },
    { key: 'userEmail', label: 'Farmer Email' },
    { key: 'userPhone', label: 'Farmer Phone' },
    { key: 'userProvince', label: 'Province' },
    { key: 'variety', label: 'Variety' },
    { key: 'size', label: 'Size (ha)', transform: (v) => v ? String(v) : '' },
    { key: 'irrigationType', label: 'Irrigation' },
    { key: 'status', label: 'Status' },
    { key: 'plantingDate', label: 'Planting Date', transform: (v) => v?.toDate ? v.toDate().toLocaleDateString() : '' },
  ];
  exportToCSV(fields, `fields-export-${new Date().toISOString().slice(0,10)}.csv`, columns);
}

export function exportUsersToCSV(users: any[]) {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'province', label: 'Province' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created At', transform: (v) => v?.toDate ? v.toDate().toLocaleString() : '' },
  ];
  exportToCSV(users, `users-export-${new Date().toISOString().slice(0,10)}.csv`, columns);
}