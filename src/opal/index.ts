import { utils, WorkSheet } from 'xlsx'
import type { OpalVariable, Variable, Dictionary, OpalCategory } from '../model'
import { CatalogueDatatype, OpalValueType } from '../model'
import { chain } from 'lodash'

const metaAttributes: string[] = [
  'row_id',
  'child_id',
  'age_weeks',
  'age_trimester',
  'age_months',
  'age_years'
]

export const opalToCatalogue = (sheets: Dictionary<WorkSheet>): Variable[] =>
  convert(
    utils.sheet_to_json(sheets.Variables),
    getOptionStrings(
      sheets.Categories && utils.sheet_to_json(sheets.Categories)
    )
  )

export const convert = (
  variables: OpalVariable[],
  options: Dictionary<string>
) => {
  return variables
    .filter(item => !metaAttributes.includes(item.name))
    .map(convertVariable(options))
}

export const convertVariable = (options: Dictionary<string>) => (
  variable: OpalVariable
): Variable => {
  const result: any = {
    tablename: variable.table.trim(),
    variable: variable.name.trim(),
    label: variable.label.trim()
  }
  const values = options[variable.name]
  if (values) {
    result.values = values
    result.datatype = { id: CatalogueDatatype.CATEGORICAL }
  } else {
    result.datatype = { id: convertValueType(variable.valueType) }
  }
  if (variable.unit) {
    result.unit = {
      id: variable.unit
    }
  }
  return result as Variable
}

export const convertValueType = (
  valueType: OpalValueType
): CatalogueDatatype => {
  switch (valueType) {
    case OpalValueType.DECIMAL:
      return CatalogueDatatype.CONTINUOUS
    case OpalValueType.INTEGER:
      return CatalogueDatatype.INTEGER
    case OpalValueType.TEXT:
      return CatalogueDatatype.STRING
  }
  throw new Error(`Unknown value type: ${valueType}`)
}

export const getOptionStrings = (
  categories: OpalCategory[] | undefined
): Dictionary<string> =>
  chain(categories)
    .groupBy(it => it.variable)
    .entries()
    .map(([variable, options]) => [variable, flattenOptions(options)])
    .fromPairs()
    .value()

export const flattenOptions = (options: OpalCategory[]): string =>
  options.map(option => `${option.name} = ${option.label}`).join('\n')
