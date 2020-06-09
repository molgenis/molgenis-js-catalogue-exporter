const XLSX = require('xlsx')
const fs = require('fs')
const stringify = require('csv-stringify')
const convert = require('../dist/catalogue-exporter.cjs.development').convert

fs.readdir('data/sources/opal/core', (_, coreFiles) => {
  fs.readdir('data/sources/opal/outcome', (__, outcomeFiles) => {
    const sheets = [
      ...coreFiles.map(it => `data/sources/opal/core/${it}`),
      ...outcomeFiles.map(it => `data/sources/opal/outcome/${it}`)
    ]
      .map(file => XLSX.readFile(file))
      .map(workbook => workbook.Sheets)
    const variables = sheets.flatMap(convert).map(it => ({
      ...it,
      unit: it.unit && it.unit.id,
      datatype: it.datatype.id
    }))
    const columns = [
      'tablename',
      'variable',
      'label',
      'datatype',
      'values',
      'unit'
    ]
    stringify(variables, { columns, header: true }, (_, data) => {
      fs.writeFile('data/target/cohort-catalogue_variables.csv', data, (__, msg) => {
        console.log(msg)
      })
    })
  })
})
