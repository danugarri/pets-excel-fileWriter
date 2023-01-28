// sends Excel file to web client requesting the /excel route
const express = require('express');
const { headers } = require('./consts');
const { getDate } = require('./helpers/getDate');
const { getStyles } = require('./set-up/excel-styles');
const { getExcel } = require('./set-up/set-up');
const bodyParser = require('body-parser');
const cors = require('cors');

// const { deleteFile } = require('./helpers/deleteFile');

const app = express();
app.use(bodyParser.json());
const { wb, ws } = getExcel();
const port = 5000;
const formattedDate = getDate();
const { headerStyle, cellsStyle } = getStyles();

// CORS
app.use(cors({ exposedHeaders: '*' }));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.listen(port, function () {
  console.log('App listening on port 5000!');
});

const populateCellsPost = (data) => {
  let counter = 1;
  [data].forEach((pet) => {
    counter++;
    let index = 0;
    for (const property in pet) {
      index++;
      //  write headers
      ws.cell(1, index)
        .string(headers[index - 1])
        .style(headerStyle);
      // Write cells
      if (typeof pet[property] === 'string') {
        ws.cell(counter, index).string(pet[property]).style(cellsStyle);
      } else {
        ws.cell(counter, index).number(pet[property]).style(cellsStyle);
      }
    }
  });
};
// routes
app.get('/', function (req, res) {
  res.redirect('/excel');
});
app.get('/excel', function (req, res) {
  // deleteFile(`${formattedDate}-danugarri-pets.xlsx`);
  wb.write(`${formattedDate}-danugarri-pets.xlsx`, res);
});
app.post('/', async function (req, res) {
  populateCellsPost(req.body);
  wb.write(`generated-file/${formattedDate}-danugarri-pets.xlsx`);
  res.send({ data: `https://${req.hostname}/excel` });
  // res.send({ data: `${req.protocol}://${req.hostname}:${port}/excel` });
});
