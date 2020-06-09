import { convertValueType, convertVariable, getOptionStrings } from '../src/opal'
import { CatalogueDatatype, OpalValueType, OpalVariable } from '../src/model'

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
})

describe('getOptionStrings', () => {
  it('returns empty object when options are undefined', () => {
    expect(getOptionStrings(undefined)).toEqual({})
  })
})
