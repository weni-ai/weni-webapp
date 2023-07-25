const YAML = require('yaml');

function getEnv(name) {
  const value =
    window?.configs?.[name] ||
    process.env[name] ||
    window?.configs?.[`VUE_APP_${name}`] ||
    process.env[`VUE_APP_${name}`];

  if (/(^|_)yaml($|_)/i.test(name)) {
    return YAML.parse(value);
  }

  return value;
}

module.exports = getEnv;
