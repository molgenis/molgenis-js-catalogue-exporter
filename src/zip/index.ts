import JSZip from 'jszip'
import stringify from 'csv-stringify'
import type { Emx } from 'model'

export const asZip = async (emx: Emx): Promise<JSZip> => {
  const zip: JSZip = new JSZip()
  await Promise.all([
    addCsv(zip,
      ['codeList', 'value', 'label', 'order', 'isNullFlavor'],
      'Code.csv',
      emx.data.codes),
    addCsv(zip,
      ['name', 'label', 'description'], 
      'CodeList.csv',
      emx.data.codeLists),
    addCsv(zip,
      ['name', 'label', 'description', 'mandatory', 'format', 'unit', 'codeList', 'topic', 'population', 'collectionEvent'], 
      'Variable.csv',
      emx.data.variables),
    addCsv(zip,
        ['name', 'label', 'order', 'parentTopic'], 
        'Topic.csv',
        emx.data.topics)
  ])
  return zip
}

export const asSourceZip = async (emx: Emx): Promise<JSZip> => {
  const zip: JSZip = new JSZip()
  await Promise.all([
    addCsv(zip,
      ['codeList', 'value', 'label', 'order', 'isNullFlavor'],
      'Code.csv',
      emx.data.codes),
    addCsv(zip,
      ['name', 'label', 'description'], 
      'CodeList.csv',
      emx.data.codeLists),
    addCsv(zip,
      ['name', 'label', 'description', 'mandatory', 'format', 'unit','codeList', 'topic', 'population', 'collectionEvent'], 
      'Variable.csv',
      emx.data.variables),
    addCsv(zip,
        ['id',
        'target',
        'sources',
        'sourceIndex',
        'targetIndex',
        'match',
        'status',
        'syntax',
        'description'], 
        'Harmonisation.csv',
        emx.data.harmonisations)
  ])
  return zip
}

const addCsv = async (
  zip: JSZip,
  columns: string[],
  filename: string,
  data: object[]
) => {
  return new Promise((resolve, reject) => {
    stringify(
      data,
      {
        header: true,
        columns
      },
      function (err, csvString) {
        if (err) {
          reject(err)
        }
        if (csvString) {
          zip.file(filename, csvString)
          resolve()
        }
      }
    )
  })
}
