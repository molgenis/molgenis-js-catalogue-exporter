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

export const opalToCatalogue = (sheets: Dictionary<WorkSheet>): Variable[] => {
  const variablesJson: OpalVariable[] = utils.sheet_to_json(sheets.Variables)
  return variablesJson
    .filter(item => !metaAttributes.includes(item.name))
    .map(convertVariable(getOptionStrings(sheets.Categories)))
}

const convertVariable = (options: Dictionary<string>) => (
  variable: OpalVariable
): Variable => ({
  tablename: variable.table.trim(),
  variable: variable.name.trim(),
  label: variable.label.trim(),
  values: options[variable.name],
  datatype: { id: convertValueType(variable.valueType) }
})

const convertValueType = (valueType: OpalValueType): CatalogueDatatype => {
  switch (valueType) {
    case OpalValueType.DECIMAL:
      return CatalogueDatatype.CONTINUOUS
    case OpalValueType.INTEGER:
      return CatalogueDatatype.INTEGER
    case OpalValueType.TEXT:
      return CatalogueDatatype.CATEGORICAL
  }
  throw new Error(`Unknown value type: ${valueType}`)
}

const getOptionStrings = (sheet: WorkSheet | undefined): Dictionary<string> => {
  if (!sheet) {
    return {}
  }
  const categoriesJson: OpalCategory[] = utils.sheet_to_json(sheet)
  return chain(categoriesJson)
    .groupBy(it => it.variable)
    .entries()
    .map(([variable, options]) => [variable, flattenOptions(options)])
    .fromPairs()
    .value()
}

const flattenOptions = (options: OpalCategory[]): string =>
  options.map(option => `${option.name} = ${option.label}`).join('\n')
