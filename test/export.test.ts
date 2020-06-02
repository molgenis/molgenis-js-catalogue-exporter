import { exportData } from '../src'
import fs from 'fs'

jest.setTimeout(30000)

describe('exportData', () => {
  it('Can download lifecycle data', async (done) => {
    const emxModel = await exportData('https://molgenis36.gcc.rug.nl/api/v2/LifeCycle_CoreVariables?attrs=variable,label,datatype,values&num=10000')
    emxModel.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('model.zip'))
      .on('finish', done);
  });
});
