import YAML from 'yaml';

export default function getEnv(name) {
  const value =
    process.env?.[name] || window?.configs?.[name] || import.meta.env[name];

  if (/(^|_)yaml($|_)/i.test(name)) {
    return YAML.parse(value);
  }

  return value;
}
