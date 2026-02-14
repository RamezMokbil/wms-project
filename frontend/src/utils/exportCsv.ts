export const exportToCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const escaped = String(cell ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
