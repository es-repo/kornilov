'use strict';

const fs = { ...require('fs'), ...require('fs-extra') };
const rimraf = require('rimraf');
const path = require('path');

const configFile = process.argv[2];
const config = JSON.parse(fs.readFileSync(configFile));

const baseDir = path.dirname(path.resolve(configFile));
const distDir = path.join(baseDir, config.distDir);

rimraf.sync(distDir);
fs.mkdirSync(distDir);

const templateFile = path.join(baseDir, config.template);
const template = fs.readFileSync(templateFile, "utf-8");

for (let replaces of config.replaces) {
  const emailDir = path.join(distDir, replaces.__DIR__);
  fs.mkdirSync(emailDir);
  const htmlFile = path.join(emailDir, "index.html");

  let html = template;

  //console.log(html.indexOf("__REGISTER_BUTTON_COLOR__"))

  for (const k of Object.keys(replaces)) {
    let v = replaces[k];
    if (v.indexOf("file://") === 0) {
      const file = path.join(baseDir, v.replace("file://", ""));
      v = fs.readFileSync(file, "utf-8");
    }
    html = html.replace(new RegExp(k, "g"), v);
  }

  fs.writeFileSync(htmlFile, html);

  const imagesDirSource = path.join(baseDir, replaces.__DIR__, "images");
  const commonImagesDirSource = path.join(baseDir, "images");
  const imagesDirDest = path.join(emailDir, "images");
  fs.copySync(imagesDirSource, imagesDirDest);
  fs.copySync(commonImagesDirSource, imagesDirDest);
}
