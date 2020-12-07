const exportData = require('../dist/catalogue-exporter.cjs.development')
  .exportData
const fs = require('fs')

const doExport = async (url, url2) => new Promise(async (resolve) => {
  const emxModel = await exportData(url, url2)
  emxModel
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('model.zip'))
    .on('finish', () => {
      resolve()
    })
})

doExport(
  'https://molgenis88.gcc.rug.nl/api/v2/LifeCycle_CoreVariables?attrs=variable,label,datatype,unit,comments,values&num=10000',
  'https://molgenis88.gcc.rug.nl/api/v2/UI_Menu?attrs=key,title,parent(key),position,variables(variable)&num=50'
).then(() => console.log('Created model.zip'))
