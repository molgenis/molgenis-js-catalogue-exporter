import { getEmx } from '../src/emx'
import { CatalogueDatatype, MolgenisDataType } from '../src/model'

describe('emx', () => {
  it('transforms binary datatype to boolean', () => {
    const emx = getEmx([
      {
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

  it('transforms integer datatype to integer', () => {
    const emx = getEmx([
      {
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

  it('creates options data sheet', () => {
    const emx = getEmx([
      {
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

  it('groups repeating attributes', () => {
    const emx = getEmx([
      {
        variable: 'name_0',
        datatype: { id: CatalogueDatatype.CATEGORICAL },
        label: 'label',
        values: '1 = Yes\n2 = No\n3 = N/A'
      },
      {
        variable: 'name_1',
        datatype: { id: CatalogueDatatype.CATEGORICAL },
        label: 'label',
        values: '1 = Yes\n2 = No\n3 = N/A'
      }
    ])

    expect(emx.data.name_options).toBeDefined()
    expect(emx.attributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity: 'trimester_repeated',
          name: 'name',
          refEntity: 'name_options'
        }),
        expect.objectContaining({ entity: 'name_options', name: 'id' }),
        expect.objectContaining({ entity: 'name_options', name: 'label' })
      ])
    )
  })
})
