const exportTarget = require('../dist/catalogue-exporter.cjs.development')
  .exportTarget
const fs = require('fs')

const doExport = async (url, url2) => new Promise(async (resolve) => {
  const emxModel = await exportTarget(url, url2)
  emxModel
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('model.zip'))
    .on('finish', () => {
      resolve()
    })
})

doExport(
  'https://lifecycle.molgeniscloud.org/api/v2/LifeCycle_CoreVariables?attrs=variable,label,datatype,unit,comments,values&num=10000',
  'https://lifecycle.molgeniscloud.org/api/v2/UI_Menu?attrs=key,title,parent(key),position,variables(variable)&num=50'
).then(() => console.log('Created model.zip'))
