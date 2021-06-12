const exportData = require('../dist/catalogue-exporter.cjs.development')
  .exportData
const fs = require('fs')

const doExport = async url => new Promise(async (resolve) => {
  const emxModel = await exportData(url)
  emxModel
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('model.zip'))
    .on('finish', () => {
      resolve()
    })
})

doExport(
  'http://localhost/api/v2/cohort-catalogue_variables?attrs=tablename,variable,label,datatype,values&num=10000'
).then(() => console.log('Created model.zip'))
