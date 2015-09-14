(function(){
  'use strict';

  var request = require('request');
  var cheerio = require('cheerio');
  var fs = require('fs');
  var multiline = require('multiline');

  var bfUrl = 'http://bootflat.github.io/color-picker.html';

  /***
  Main, first get HTML Data
  extract color names and hex data
  at last, write to File
  ***/
  request.get(bfUrl, function(err, response, body) {
    if(!err && response.statusCode === 200) {
      var $ = cheerio.load(body);

      //Get hexcolors(obj) out of HTML and write it to file
      createHexFile(getColors($));

      //get and convert hex colors to rgba, then write to File
      createRGBAFile(getColors($));

      //Generate HTML and write it to Fle
      htmlInject(getColors($));
    }
  });

  //Get hex values and names from HTML
  function getColors($) {
    var colors = [];
    var colorName = '';
    var colorHex = '';

    $('.color-picker', '.color-wrap').each(function(i, el) {

      colorName = $(this)
        .children('.color-item')
        .children('span[class="color-name"]')
        .text()
        .toLowerCase()
        .replace(/\s+/ig, '-');

      colorHex = $(this)
        .children('.color-item')
        .children('span[class="hex-number"]')
        .text();

      colors.push({name: colorName, hex:colorHex});
    })

    return colors;
  }

  function createHexFile(obj) {
    var colorsHexData = objToStr(obj);
    writeToFile('bf-colors-hex.scss', colorsHexData);
  }

  function createRGBAFile(obj) {
    var rgbaStr = '';
    for(var i = 0, l = obj.length; i < l; i++) {
      rgbaStr += '$' + obj[i].name + ': ' + hex2rgba(obj[i].hex) + ';\r\n';
    }
    writeToFile('bf-colors-rgba.scss', rgbaStr);
  }

  //Duh?
  function hex2rgba(hex) {
    var color = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i);
    color = 'rgba(' +
      parseInt(color[1], 16) + ',' +
      parseInt(color[2], 16) + ',' +
      parseInt(color[1], 16) + ',1)';
    
    return color;
  }

  function writeToFile(filename, data) {
    fs.writeFile(filename, data, function(err) {
      if(err){throw err;}
      console.log(filename + ' written.');
    });
  }

  function objToStr(obj) {
    var colorsStr = '';
    for(var i = 0, l = obj.length; i < l; i++) {
      colorsStr += '$' + obj[i].name + ': ' +
        obj[i].hex + ';\r\n';
    }

    return colorsStr;
  }

  function htmlInject(colors) {
    var htmlSrc;
    var htmlContent = '';
    for(var i = 0, l = colors.length; i < l; i++) {
      htmlContent += divSkeleton(colors[i].hex, colors[i].name) + '\r\n';
    }

    htmlSrc = htmlSkeleton().replace("%CONTENT%", htmlContent);

    writeToFile('bf-colors.html', htmlSrc);
  }

  function divSkeleton(colorHex, colorName) {
    var htmlPart = multiline.stripIndent(function(){/*
      <div class="color-item" style="background:%HEX%">
        <p>
          %NAME%
          <br />
          %HEX%
        </p>
      </div>
    */});

    return htmlPart
      .replace("%HEX%", colorHex)
      .replace("%NAME%", colorName)
      .replace("%HEX%", colorHex);
  }

  function htmlSkeleton() {
    var htmlSrc = multiline.stripIndent(function() {/*
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bootflat Colors</title>
        <style type="text/css">
          body {
            background: #333;
          }
          .color-item {
            height:400px;
            width:400px;
            float:left;
            font-size: 25px;      
            color:#000;
            text-shadow: 1px 1px 1px rgba(255,255,255,0.4);      
            text-align: center;
            font-weight:bold;
          }
          .color-item:hover {
            position: relative;
            z-index: 999;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            border: 2px solid #fff;
            height:396px;
            width:396px;
            font-size: 35px;
            text-shadow: 2px 2px 1px rgba(255,255,255,0.4);
          }
          .content p {
            position: relative;
            top: 80px;
          }
        </style>
      </head>
      <body>

        <div class="content">
          %CONTENT%
        </div>
        
      </body>
    </html>
  */})

  return htmlSrc;
  }
})();