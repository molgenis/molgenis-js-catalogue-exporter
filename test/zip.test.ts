import { asZip } from '../src/zip'
import { Emx, MolgenisDataType } from '../src/model'

describe('zip', () => {
  it('zips attribute data', async done => {
    const emx: Emx = {
      attributes: [
        { name: 'id', dataType: MolgenisDataType.STRING, entity: 'entity' }
      ],
      data: {}
    }
    const zip = await asZip(emx)
    const attributes = zip.file('attributes.csv')
    expect(attributes.name).toEqual('attributes.csv')
    const data = await attributes.async('text')
    expect(data).toBe(
      'entity,name,description,dataType,labelAttribute,idAttribute,refEntity,rangeMin,rangeMax\nentity,id,,string,,,,,\n'
    )
    done()
  })

  it('zips option data', async done => {
    const emx: Emx = {
      attributes: [],
      data: {
        boolean_options: [
          { id: 1, label: 'Yes' },
          { id: 2, label: 'No' },
          { id: 3, label: 'N/A' }
        ]
      }
    }
    const zip = await asZip(emx)
    const attributes = zip.file('boolean_options.csv')
    const data = await attributes.async('text')
    expect(data).toBe('id,label\n1,Yes\n2,No\n3,N/A\n')
    done()
  })
})
