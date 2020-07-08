const path = require('path');
const ROOT_FOLDER = path.resolve('..');
const BUILD_FOLDER = path.resolve(ROOT_FOLDER, 'build', 'dist');
const SERVICE_FOLDER = path.resolve(ROOT_FOLDER, 'bundle-service');
module.exports = {
  ROOT_FOLDER,
  BUILD_FOLDER,
  SERVICE_FOLDER
};
