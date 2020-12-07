import { Variable, VariableData, Emx, Dictionary,
  Code, CodeList, LifeCycleCatalogueDatatype, Menu, Topic } from '../model'
import { CatalogueDatatype } from '../model'
import groupBy from 'lodash.groupby'

const BASELINE = 'baseline'
const WEEK = 'week'
const MONTH = 'month'
const YEAR = 'year'
const TRIMESTER = 'trimester'

export const getEmx = (variables: Variable[], menu: Menu[]): Emx => {
  const uniqueVariables: Dictionary<Variable[]> = groupBy(
    variables,
    item => item.variable && deduplicatedName(item.variable)
  )
  const variableData = getVariables(Object.values(uniqueVariables), menu)
  return {
    data: {
      variables: variableData,
      codes: getCodeListOptions(Object.values(uniqueVariables)),
      codeLists: getCodeLists(Object.values(uniqueVariables)),
      topics: getTopics(menu)
    }
  }
}

const getTopics = (menuItems: Menu[]): Topic[] => 
  menuItems.map(item => ({
    name: item.key,
    label: item.title,
    order: item.position,
    parentTopic: item.parent && item.parent.key
  }))

const getCodeLists = (variableGroups: Variable[][]): CodeList[] => {
  const categoricals: Variable[] = variableGroups
  .map(it => it[0])
  .filter(it => it.datatype.id === LifeCycleCatalogueDatatype.CATEGORICAL)
  return categoricals.map(categorical => ({
    name: `${deduplicatedName(categorical.variable)}_options`,
    label: `${deduplicatedName(categorical.variable)} options`
  }))
}

const getCodeListOptions = (variableGroups: Variable[][]): Code[] => {
  const categoricals: Variable[] = variableGroups
  .map(it => it[0])
  .filter(it => it.datatype.id === LifeCycleCatalogueDatatype.CATEGORICAL)
  return categoricals.flatMap(getVariableCodes)
}

const getTopic = (variable: Variable, menu: Menu[]) : string | undefined => {
  const menuItem: Menu | undefined = menu.find(item => 
    item.variables && item.variables.some(candidate =>
      candidate.variable === variable.variable))
  return menuItem && menuItem.key
}

const getVariables = (variableGroups: Variable[][], menu: Menu[]): VariableData[] =>
  variableGroups.reduce(
    (soFar: VariableData[], variables: Variable[]) => [
      ...soFar,
      getVariableData(variables[0],
        getCollectionEvent(variables.length),
        getTopic(variables[0], menu))
    ],
    []
  )

const convertDataType = (from: LifeCycleCatalogueDatatype): CatalogueDatatype => {
  switch(from) {
    case LifeCycleCatalogueDatatype.BINARY:
      return CatalogueDatatype.BOOLEAN
    case LifeCycleCatalogueDatatype.CATEGORICAL:
      return CatalogueDatatype.CATEGORICAL
    case LifeCycleCatalogueDatatype.CONTINUOUS:
      return CatalogueDatatype.CONTINUOUS
    case LifeCycleCatalogueDatatype.INTEGER:
      return CatalogueDatatype.INTEGER
    case LifeCycleCatalogueDatatype.STRING:
      return CatalogueDatatype.STRING
  }
}

const getVariableData = (variable: Variable,
    collectionEvent: string,
    topic: string|undefined): VariableData => {
  const name = deduplicatedName(variable.variable)
  return {
    name,
    format: variable.datatype && convertDataType(variable.datatype.id),
    label: variable.label,
    mandatory: 'false',
    description: variable.comments,
    codeList: variable.datatype.id === LifeCycleCatalogueDatatype.CATEGORICAL? `${name}_options` : undefined,
    unit: variable.unit && variable.unit.id,
    collectionEvent,
    topic
  }
}

export const getCollectionEvent = (repeatCount: number) => {
  let tableName = BASELINE
  if (repeatCount > 100) {
    tableName = MONTH
  } else if (repeatCount > 30) {
    tableName = WEEK
  } else if (repeatCount > 3) {
    tableName = YEAR
  } else if (repeatCount > 1) {
    tableName = TRIMESTER
  }
  return tableName
}

const deduplicatedName = (variable: string) => {
  if (variable.indexOf('_') >= 0) {
    return variable.substring(0, variable.lastIndexOf('_'))
  } else {
    return variable
  }
}

const getVariableCodes = (variable: Variable): Code[] => {
  const values = variable.values
  if (!values) {
    return []
  }

  let separator = '\n'
  if (values.indexOf(separator) === -1) {
    separator = ','
  }
  const options = values.split(separator).map(value => value.trim())

  const matches = /[^\d\s]/.exec(options[0])
  if (!matches) {
    throw new Error('separator not found')
  }
  const optionSeparator = matches[0]

  return options.map((option, index) => ({
    codeList: `${deduplicatedName(variable.variable)}_options`,
    value: parseInt(
      option.substring(0, option.indexOf(optionSeparator)).trim(),
      10
    ),
    label: option.substring(option.indexOf(optionSeparator) + 1).trim(),
    order: index,
    isNullFlavor: false
  }))
}
