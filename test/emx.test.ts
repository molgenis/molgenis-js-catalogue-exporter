import { getEmx, getTablename } from '../src/emx'
import { CatalogueDatatype, MolgenisDataType } from '../src/model'

describe('getTablename', () => {
  it('returns non_repeated for non-repeated variable', () => {
    expect(getTablename(1)).toBe('non_repeated')
  })

  it('returns trimester_repeated for variable repeated thrice', () => {
    expect(getTablename(3)).toBe('trimester_repeated')
  })

  it('returns yearly_repeated for variable repeated 17 times', () => {
    expect(getTablename(17)).toBe('yearly_repeated')
  })

  it('returns weekly_repeated for variable repeated 43 times', () => {
    expect(getTablename(43)).toBe('weekly_repeated')
  })

  it('returns monthly_repeated for variable repeated 216 times', () => {
    expect(getTablename(216)).toBe('monthly_repeated')
  })
})

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

  it('only creates options data sheets for categoricals', () => {
    const emx = getEmx([
      {
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
