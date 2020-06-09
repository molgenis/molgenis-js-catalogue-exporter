import JSZip from 'jszip'
import stringify from 'csv-stringify'
import type { Emx } from 'model'

export const asZip = async (emx: Emx): Promise<JSZip> => {
  const zip: JSZip = new JSZip()
  await addCsv(
    zip,
    [
      'entity',
      'name',
      'description',
      'dataType',
      'labelAttribute',
      'idAttribute',
      'refEntity',
      'rangeMin',
      'rangeMax'
    ],
    'attributes.csv',
    emx.attributes
  )
  await Promise.all(
    Object.entries(emx.data).map(([sheet, options]) =>
      addCsv(zip, ['id', 'label'], `${sheet}.csv`, options)
    )
  )
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
