import YAML from 'yaml';

export default function getEnv(name) {
  const value =
    window?.configs?.[name] ||
    import.meta.env[name] ||
    window?.configs?.[`VITE_${name}`] ||
    import.meta.env[`VITE_${name}`];

  if (/(^|_)yaml($|_)/i.test(name)) {
    return YAML.parse(value);
  }

  return value;
}
