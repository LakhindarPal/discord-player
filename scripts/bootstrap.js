const { stripIndents } = require('common-tags');
const { copy, exists, ensureDir, writeFile } = require('fs-extra');
const chalk = require('ansi-colors');

const destName = process.argv[2];
const DP_PKG = /^@discord\-player\/(.+)$/;
const TARGET_DIR = `${__dirname}/../packages`;

function getData(name) {
    return [
        { name: 'LICENSE', data: getLicense() },
        { name: 'package.json', data: getPackageJSON(name) },
        { name: 'README.md', data: getReadMe(name) }
    ];
}

function getLicense() {
    return stripIndents`MIT License

    Copyright (c) ${new Date().getFullYear()} Androz2091

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    `;
}

function getReadMe(name) {
    return stripIndents`# \`${name}\`\n
    Discord Player ${name} library\n
    ## Installation\n
    \`\`\`sh
    $ npm install --save ${name}
    \`\`\`\n
    ## Example\n
    \`\`\`js\n\`\`\`\n`;
}

function getPackageJSON(name) {
    const packageJson = JSON.stringify(
        {
            name: name,
            version: '0.1.0',
            description: 'A complete framework to simplify the implementation of music commands for Discord bots',
            keywords: ['discord-player', 'music', 'bot', 'discord.js', 'javascript', 'voip', 'lavalink', 'lavaplayer'],
            author: 'Androz2091 <androz2091@gmail.com>',
            homepage: 'https://discord-player.js.org',
            license: 'MIT',
            main: 'dist/index.js',
            module: 'dist/index.mjs',
            types: 'dist/index.d.ts',
            directories: {
                dist: 'dist',
                src: 'src'
            },
            files: ['dist'],
            repository: {
                type: 'git',
                url: 'git+https://github.com/Androz2091/discord-player.git'
            },
            scripts: {
                prepublish: 'tsup',
                typecheck: 'tsc --noEmit'
            },
            bugs: {
                url: 'https://github.com/Androz2091/discord-player/issues'
            },
            devDependencies: {
                '@discord-player/tsconfig': '^0.0.0',
                tsup: '^6.2.2'
            }
        },
        null,
        2
    );

    return packageJson;
}

async function main() {
    if (!destName) return console.log(chalk.redBright('✘ Package name is required!'));
    const match = destName.match(DP_PKG);
    const name = match?.[1] || destName;

    if (await exists(`${TARGET_DIR}/${name}`)) return console.log(chalk.redBright(`✘ Cannot create ${name} as it already exists.`));

    console.log(chalk.cyanBright(`△ Generating project...`));
    await ensureDir(`${TARGET_DIR}/${name}`);

    await copy(`${__dirname}/package_sample`, `${TARGET_DIR}/${name}`);

    for (const data of getData(destName)) {
        await writeFile(`${TARGET_DIR}/${name}/${data.name}`, data.data);
    }

    console.log(chalk.greenBright(`✔ Successfully bootstrapped ${name}!`));
}

main().catch((e) => {
    console.log(`${chalk.redBright('Failed to bootstrap!')}\n\n${chalk.red(`${e}`)}`);
});
