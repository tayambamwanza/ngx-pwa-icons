const Jimp = require('jimp');
const favicons = require('favicons');
const colors = require('colors');
const toIco = require('to-ico');
const fs = require('fs');

let icon = './icon.png';
let output = './src/assets/icons';
let faviconOutput = './src';
let size = '512, 384, 192, 152, 144, 128, 96, 72';
let name = 'icon-*x*.png';
let dry;

const faviconsConfig = {
  path: './src',
  icons: {
    android: false,
    appleIcon: false,
    appleStartup: false,
    coast: false,
    favicons: [
        "favicon-48x48.png",
        "favicon-32x32.png",
        "favicon-16x16.png",
    ],
    firefox: false,
    windows: false,
    yandex: false,
  }
};

argv = require('yargs')
  .usage('Generate Angular-PWA icons\nUsage: $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .options({
    'dry-run': {
      alias: 'd',
      description: 'Run through without making any changes.',
    },
    icon: {
      alias: 'i',
      description: 'Input file',
      default: icon,
      requiresArg: true,
      required: false,
    },
    output: {
      alias: 'o',
      description: 'Output folder',
      default: output,
      requiresArg: true,
      required: false,
    },
    faviconOutput: {
      alias: 'fo',
      description: 'Output folder for favicon.ico',
      default: faviconOutput,
      requiresArg: true,
      required: false,
    },
    size: {
      alias: 's',
      description: 'Resize to',
      default: size,
      requiresArg: true,
      required: false,
    },
    name: {
      alias: 'n',
      description: 'Icon names (replace wildcard * with size)',
      default: name,
      requiresArg: true,
      required: false,
    },
  }).argv;

icon = argv.icon ? argv.icon : icon;
output = argv.output ? argv.output : output;
faviconOutput = argv.faviconOutput ? argv.faviconOutput : faviconOutput;
name = argv.name ? argv.name : name;
dry = argv.d ? true : false;
console.log('dry', dry);
if (argv.size) {
  let sizeStr = '' + argv.size;
  size = sizeStr.split(' ').join(',').split(',');
}

var iconExists = function () {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(icon)) {
      console.log(`✓ '${icon}' exists.`.blue);
      console.log(`--------------------------------------`.blue);
      resolve(true);
    } else {
      let err = `'${icon}' does not exist!`;
      reject(err);
    }
  });
};

var generateIcons = function () {
  Jimp.read(icon)
    .then((image) => {
      const fileExtension = name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 2);
      const inputFileExtension = icon.slice(
        ((icon.lastIndexOf('.') - 1) >>> 0) + 2,
      );
      if (fileExtension == 'png' || fileExtension == 'jpg') {
        console.log(`🛈  Generating PWA icons`.blue);
        size.forEach((wh) => {
          const outputName = name.split('*').join(wh);
          wh = parseInt(wh);
          if (Number.isInteger(wh)) {
            const outFolder = `${output}/${outputName}`;
            if (!dry) {
              image.resize(wh, wh).write(outFolder);
            }
            console.log(`✓ ${outFolder}`.green);
          }
        });

        if (inputFileExtension == 'png' && !dry) {
          console.log(`🛈  Generating Favicon`.blue);
          favicons(icon, faviconsConfig, faviconsCallback);
        } else {
          console.log(`🛈  Input .png file to auto-generate favicons`.blue);
        }

        if (dry) {
          console.log(`NOTE: Run with "dry run" no changes were made.`.yellow);
        }
      } else {
        console.log(`✗  use file extension .png or .jpg`.red);
      }
    })
    .catch((err) => {
      console.log(`✗  ${err}`.red);
    });
};

faviconsCallback = function (error, response) {
  if (error) {
    console.log(`✗ favicon error: ${error.message}`.red);
  } else {
    response.images.map((image) => {
    fs.writeFileSync (`${faviconOutput}/${image.name}`, image.contents);
      console.log(`✓ ${faviconOutput}/${image.name}`.green);
    });
  }
};

iconExists()
  .then((iconOk) => generateIcons())
  .catch((err) => console.log(`✗  ${err}`.red));
