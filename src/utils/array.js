export function sortByKey(arr, key, order = 'asc') {
  const compareString = arr.every((item) => typeof item[key] === 'string');
  const ordenedArr = compareString
    ? arr.sort((a, b) => a[key].localeCompare(b[key]))
    : arr.toSorted((a, b) => a[key] - b[key]);
  return order === 'desc' ? ordenedArr.reverse() : ordenedArr;
}
