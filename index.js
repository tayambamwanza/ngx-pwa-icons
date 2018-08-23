const Jimp = require('jimp');
const colors = require('colors');
const fs = require('fs');

let icon = './icon.png';
let output = './src/assets/icons';
let size = '512, 384, 192, 152, 144, 128, 96, 72';
let name = 'icon-*x*.png';

argv = require('yargs')
    .usage('Generate Angular-PWA icons\nUsage: $0 [options]')
    .help('help').alias('help', 'h')
    .version().alias('version', 'v')
    .options({
        icon: {
            alias: 'i',
            description: "Input file",
            default: icon,
            requiresArg: true,
            required: false
        },
        output: {
            alias: 'o',
            description: "Output folder",
            default: output,
            requiresArg: true,
            required: false
        },
        size: {
            alias: 's',
            description: "Resize to",
            default: size,
            requiresArg: true,
            required: false
        },
        name: {
            alias: 'n',
            description: "Icon names (replace wildcard * with size)",
            default: name,
            requiresArg: true,
            required: false
        }
    })
    .argv;

icon = argv.icon ? argv.icon : icon;
output = argv.output ? argv.output : output;
name = argv.name ? argv.name : name;
if (argv.size) {
    let sizeStr = argv.size;
    size = sizeStr.split(' ').join(',').split(',');
}

var iconExists = function () {
    return new Promise(
        (resolve, reject) => {
            if (fs.existsSync(icon)) {
                console.log(`✓ '${icon}' exists.`.blue);
                console.log(`--------------------------------------`.blue);
                resolve(true);
            } else {
                let err = `'${icon}' does not exist!`;
                reject(err);
            }
        }
    );
};

var generateIcons = function () {
    Jimp.read(icon)
        .then(image => {
            const fileExtension = name.slice((name.lastIndexOf(".") - 1 >>> 0) + 2);
            if (fileExtension == 'png' || fileExtension == 'jpg') {
                size.forEach((wh) => {
                    const outputName = name.split('*').join(wh);
                    wh = parseInt(wh);
                    if (Number.isInteger(wh)) {
                        const outFolder = `${output}/${outputName}`;
                        image.resize(wh, wh).write(outFolder);
                        console.log(`✓ ${outFolder}`.green);
                    }
                });
            } else {
                console.log(`✗  use file extension .png or .jpg`.red);
            }
        })
        .catch(err => {
            console.log(`✗  ${err}`.red);
        });
};

iconExists()
    .then(
        iconOk => generateIcons()
    )
    .catch(
        err => console.log(`✗  ${err}`.red)
    )
;