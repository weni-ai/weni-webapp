const csvExport = (filename, rows) => {
  let csvContent = 'data:text/csv;charset=utf-8,';

  csvContent += [
    ...rows.map((row) =>
      row
        .map(String)
        .map((column) => {
          if (column.includes(',') || column.includes('"')) {
            return `"${column.replace(/"/g, '""')}"`;
          }

          return column;
        })
        .join(','),
    ),
  ]
    .join('\n')
    .replace(/(^\[)|(\]$)/gm, '');

  const data = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', `${filename}.csv`);
  link.click();
};

export { csvExport };
