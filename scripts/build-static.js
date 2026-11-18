import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as brands from '@fortawesome/free-brands-svg-icons';

const sets = { solid, brands };
const configDir = 'src/main/resources/config';
const staticDir = 'src/main/resources/static';

const iconNames = new Set(readdirSync(configDir).flatMap(file =>
    [...readFileSync(`${configDir}/${file}`, 'utf8').matchAll(/^\s*name:\s*((?:solid|brands)\/[a-z0-9-]+)\s*$/gm)].map(match => match[1])));

const exportName = icon => 'fa' + icon.replace(/(?:^|-)([a-z0-9])/g, (_, letter) => letter.toUpperCase());

const symbols = [...iconNames].sort().map(name => {
    const [set, icon] = name.split('/');
    const definition = sets[set][exportName(icon)];
    if (!definition) throw new Error(`Unknown Font Awesome icon: ${name}`);
    const [width, height, , , path] = definition.icon;
    const paths = [path].flat().map(d => `<path d="${d}"/>`).join('');
    return `<symbol id="${set}-${icon}" viewBox="0 0 ${width} ${height}">${paths}</symbol>`;
});

writeFileSync(`${staticDir}/icons.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg"><!-- Font Awesome Free 7 by @fontawesome - https://fontawesome.com/license/free --><defs>${symbols.join('')}</defs></svg>\n`);

mkdirSync(`${staticDir}/fonts`, { recursive: true });
copyFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', `${staticDir}/fonts/inter-latin.woff2`);
copyFileSync('node_modules/@fontsource-variable/inter/LICENSE', `${staticDir}/fonts/inter-LICENSE.txt`);
