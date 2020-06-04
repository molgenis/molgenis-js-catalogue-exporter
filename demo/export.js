const exportData = require('../dist/catalogue-exporter.cjs.development')
  .exportData
const fs = require('fs')

const doExport = async url => {
  const emxModel = await exportData(url)
  emxModel
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('model.zip'))
    .on('finish', () => {
      console.log('Created model.zip')
    })
}

doExport(
  'https://molgenis36.gcc.rug.nl/api/v2/LifeCycle_CoreVariables?attrs=variable,label,datatype,values&num=10000')
