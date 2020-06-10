import { getEmx } from '../src/emx'
import { CatalogueDatatype, MolgenisDataType } from '../src/model'

describe('emx', () => {
  it('transforms binary datatype to boolean', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.BINARY },
        label: 'label'
      }
    ])

    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          dataType: MolgenisDataType.BOOLEAN
        })
      ])
    )
  })

  it('transforms continuous datatype to decimal', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.CONTINUOUS },
        label: 'label'
      }
    ])

    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          dataType: MolgenisDataType.DECIMAL
        })
      ])
    )
  })

  it('transforms string datatype to string', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.STRING },
        label: 'label'
      }
    ])

    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          dataType: MolgenisDataType.STRING
        })
      ])
    )
  })

  it('transforms integer datatype to integer', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.INTEGER },
        label: 'label'
      }
    ])

    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          dataType: MolgenisDataType.INTEGER
        })
      ])
    )
  })

  it('transforms categorical datatype to categorical', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.CATEGORICAL },
        label: 'label',
        values: '1 = Yes\n2 = No\n3 = N/A'
      }
    ])

    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          dataType: MolgenisDataType.CATEGORICAL,
          refEntity: 'name_options'
        })
      ])
    )
  })

  it('only creates options data sheets for categoricals', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.INTEGER },
        label: 'label'
      }
    ])

    expect(emx.data.name_options).not.toBeDefined()
  })

  it('creates options data sheet', () => {
    const emx = getEmx([
      {
        tablename: 'core_nonrep',
        variable: 'name',
        datatype: { id: CatalogueDatatype.CATEGORICAL },
        label: 'label',
        values: '1 = Yes\n2 = No\n3 = N/A'
      }
    ])

    expect(emx.data.name_options).toEqual([
      { id: 1, label: 'Yes' },
      { id: 2, label: 'No' },
      { id: 3, label: 'N/A' }
    ])
  })
})
