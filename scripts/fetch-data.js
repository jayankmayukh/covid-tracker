const fetch = require('node-fetch');
const fs = require('fs');
const papa = require('papaparse');
const dataUrl = 'https://covid.ourworldindata.org/data/owid-covid-data.json';
const codeBookUrl = 'https://covid.ourworldindata.org/data/owid-covid-codebook.csv';

fetch(dataUrl)
    .then((resp) => resp.json())
    .then((json) => {
        fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify(json, null, 2));
    });

fetch(codeBookUrl)
    .then((resp) => resp.text())
    .then((text) => papa.parse(text, { header: true }).data)
    .then((json) => {
        fs.writeFileSync(`${__dirname}/../codebook.json`, JSON.stringify(json, null, 2));
    });
