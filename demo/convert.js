const XLSX = require('xlsx')

const monthly_rep = XLSX.readFile('../data/sources/opal/core/2_1_monthly_rep.xlsx')
const json = XLSX.utils.sheet_to_json(monthly_rep.Sheets.Variables)
console.log(json)