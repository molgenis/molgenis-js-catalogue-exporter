import {
  convertValueType,
  convertVariable,
  getOptionStrings,
  convert
} from '../src/opal'
import {
  CatalogueDatatype,
  OpalValueType,
  OpalVariable,
  OpalCategory,
  Variable
} from '../src/model'

describe('convert', () => {
  it('filters out meta variables', () => {
    expect(
      convert(
        [{
          name: 'age_weeks',
          label: 'Age in weeks',
          unit: 'weeks',
          table: 'week_rep',
          valueType: OpalValueType.INTEGER
        }],
        {}
      )
    ).toEqual([])
  })
})

describe('convertValueType', () => {
  it('Converts decimal to continuous', () => {
    expect(convertValueType(OpalValueType.DECIMAL)).toBe(
      CatalogueDatatype.CONTINUOUS
    )
  })

  it('Converts integer to integer', () => {
    expect(convertValueType(OpalValueType.INTEGER)).toBe(
      CatalogueDatatype.INTEGER
    )
  })

  it('Converts text to string', () => {
    expect(convertValueType(OpalValueType.TEXT)).toBe(CatalogueDatatype.STRING)
  })

  it('throws error when it encounters unknown data type', () => {
    expect(() => convertValueType('unknown' as OpalValueType)).toThrowError(
      'Unknown value type: unknown'
    )
  })
})

describe('convertVariable', () => {
  it('keeps unit', () => {
    const variable: OpalVariable = {
      name: 'age',
      label: 'Age',
      unit: 'years',
      table: 'year_rep',
      valueType: OpalValueType.INTEGER
    }
    expect(convertVariable({})(variable)).toEqual(
      expect.objectContaining({ unit: { id: 'years' } })
    )
  })

  it('converts categoricals with options', () => {
    const variable: OpalVariable = {
      name: 'age',
      label: 'Age',
      table: 'year_rep',
      valueType: OpalValueType.INTEGER
    }
    expect(convertVariable({ age: 'options' })(variable)).toEqual(
      expect.objectContaining({
        datatype: { id: CatalogueDatatype.CATEGORICAL },
        values: 'options'
      })
    )
  })

  it('converts non-categorical', () => {
    const variable: OpalVariable = {
      name: 'age',
      label: 'Age',
      table: 'year_rep',
      valueType: OpalValueType.INTEGER
    }
    const expected: Variable = {
      datatype: { id: CatalogueDatatype.INTEGER },
      tablename: 'year_rep',
      variable: 'age',
      label: 'Age'
    }
    expect(convertVariable({})(variable)).toEqual(expected)
  })
})

describe('getOptionStrings', () => {
  it('returns empty object when options are undefined', () => {
    expect(getOptionStrings(undefined)).toEqual({})
  })

  it('groups options by variable', () => {
    const categories: OpalCategory[] = [
      {
        isMissing: false,
        label: 'Yes',
        name: '1',
        variable: 'cohab'
      },
      {
        isMissing: false,
        label: 'Yes',
        name: '1',
        variable: 'occup'
      }
    ]
    expect(Object.keys(getOptionStrings(categories))).toEqual([
      'cohab',
      'occup'
    ])
  })

  it('glues options together', () => {
    const categories: OpalCategory[] = [
      {
        isMissing: false,
        label: 'Yes',
        name: '1',
        variable: 'cohab'
      },
      {
        isMissing: false,
        label: 'No',
        name: '2',
        variable: 'cohab'
      }
    ]
    expect(getOptionStrings(categories).cohab).toEqual('1 = Yes\n2 = No')
  })
})
