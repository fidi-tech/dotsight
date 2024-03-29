export const parse = (content: string): Array<Record<string, string>> => {
  const lines = content
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const separator = lines[0].split(',').length > 1 ? ',' : ';';

  const header = lines[0].split(separator);
  const body = lines.slice(1);

  const result = [];
  for (const line of body) {
    const obj = {};
    const columns = line.split(separator);
    for (let i = 0; i < columns.length; i++) {
      obj[header[i]] = columns[i];
    }
    result.push(obj);
  }

  return result;
};
