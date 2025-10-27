import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
let filePath = path.resolve(fileURLToPath(import.meta.url).replace(/\\/g, '/'), '../../..');
if (!fs.existsSync(path.join(filePath, 'package.json'))) {
    filePath = path.resolve(fileURLToPath(import.meta.url).replace(/\\/g, '/'), '../..');
}
const pkg = JSON.parse(fs.readFileSync(path.join(filePath, 'package.json'), 'utf-8'));
export const Root = {
    pluginName: pkg.name,
    pluginVersion: pkg.version,
    pluginPath: filePath
};
