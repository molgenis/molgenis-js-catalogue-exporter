const exportSource = require('../dist/catalogue-exporter.cjs.development')
  .exportSource
const fs = require('fs')
const Headers = require('node-fetch').Headers
const init = {
  headers: new Headers({
    'X-Molgenis-Token': 'eaWeetan8jihohbeu2ooloh9nai9adoo'
  })
}

const doExport = async (url, url2) => {
  const emxModel = await exportSource(url, url2, init)
  await new Promise(resolve => {
    emxModel
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('elfe.zip'))
      .on('finish', resolve)
  })
}

doExport(
  'https://lifecycle-acc.molgeniscloud.org/api/v2/LifeCycle_ELFE_SourceVariables',
  'https://lifecycle-acc.molgeniscloud.org/api/v2/LifeCycle_ELFE_Harmonizations'
).then(() => console.log('Created elfe.zip'))
