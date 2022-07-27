import { csvExport } from '@/utils/plugins/csvExport.js';

describe('csvExport.js', () => {
  it('should return an anchor with the right attributes', () => {
    const anchor = csvExport('users', [
      ['name', 'age'],
      ['Alex', 18],
    ]);

    expect(anchor).toBeInstanceOf(HTMLAnchorElement);

    expect(anchor.getAttribute('download')).toBe('users.csv');

    expect(anchor.getAttribute('href')).toBe(
      'data:text/csv;charset=utf-8,name,age%0AAlex,18',
    );
  });

  it('should generate a csv content with escape characters', () => {
    const anchor = csvExport('users', [
      ['name', "user's age"],
      ['Alex', 'Maybe "18", but do not know'],
    ]);

    expect(anchor.getAttribute('href')).toBe(
      "data:text/csv;charset=utf-8,name,user's%20age%0AAlex,%22Maybe%20%22%2218%22%22,%20but%20do%20not%20know%22",
    );
  });
});
