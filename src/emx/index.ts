import { Variable, VariableData, Emx, Dictionary,
  Code, CodeList, LifeCycleCatalogueDatatype, Menu, Topic, Harmonisation, HarmonisationData, HarmonisationDataMatch, HarmonisationDataStatus, HarmonisationStatus } from '../model'
import { CatalogueDatatype } from '../model'
import groupBy from 'lodash.groupby'

const BASELINE = 'baseline'
const WEEK = 'week'
const MONTH = 'month'
const YEAR = 'year'
const TRIMESTER = 'trimester'

export const getSourceEmx = (variables: Variable[], harmonisations: Harmonisation[]): Emx => {
  const categoricals = variables.filter(it => it.datatype.id === LifeCycleCatalogueDatatype.CATEGORICAL)
  const codes: Code[] = categoricals.flatMap(it => getVariableCodes(it, false))
  const codeLists: CodeList[] = categoricals.map(it => it.variable)
    .map(name => ({ name: `${name}_options`, label: `${name} options` }))
  
  return {
    data: {
      variables: variables.map(variable => getVariableData(variable, undefined, undefined, false)),
      codes,
      codeLists,
      harmonisations: harmonisations.map(getHarmonisationData)
    }
  }
}

const getHarmonisationData = (harmonisation:Harmonisation): HarmonisationData => ({
  id: harmonisation.id,
  target: deduplicatedName(harmonisation.target.variable),
  sources: harmonisation.sources && 
    harmonisation.sources.map(source => source.variable).join(","),
  sourceIndex: 1,
  targetIndex: 1,
  match: getMatch(harmonisation.status.id),
  status: HarmonisationDataStatus.FINAL,
  syntax: harmonisation.syntax,
  description: harmonisation.description
})

const getMatch = (status: HarmonisationStatus): HarmonisationDataMatch => {
  switch(status) {
    case HarmonisationStatus.COMPLETE: return HarmonisationDataMatch.COMPLETE
    case HarmonisationStatus.PARTIAL: return HarmonisationDataMatch.PARTIAL
    case HarmonisationStatus.ZNA: return HarmonisationDataMatch.NA
  }
}

export const getTargetEmx = (variables: Variable[], menu: Menu[]): Emx => {
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
  return categoricals.flatMap(it => getVariableCodes(it, true))
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
        getTopic(variables[0], menu),
        true)
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
    collectionEvent: string|undefined,
    topic: string|undefined,
    deduplicate: boolean): VariableData => {
  const name = deduplicate ? deduplicatedName(variable.variable) : variable.variable
  return {
    name,
    format: variable.datatype && convertDataType(variable.datatype.id),
    label: variable.label,
    mandatory: 'false',
    description: variable.comments,
    codeList: variable.datatype && variable.datatype.id === LifeCycleCatalogueDatatype.CATEGORICAL? `${name}_options` : undefined,
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

// Als het gedeelte achter de laatste '_' een number is dan mag het weg , anders niet 
// foo_bar1 -> foo_bar
// foo_bar_1 -> foo_bar
const deduplicatedName = (variable: string) => {
  if (variable.indexOf('_') >= 0) {

    const beforeLastUnderScore = variable.substring(0, variable.lastIndexOf('_'))
    const afterLastUnderScore = variable.substring(variable.lastIndexOf('_'))
    const cleaned = afterLastUnderScore.replace(/\d+/gm,"")
    const tempResult = beforeLastUnderScore + cleaned
    return tempResult.charAt(tempResult.length -1) === '_' ? tempResult.substring(0, tempResult.length -1) : tempResult
  } else {
    return variable
  }
}

const getVariableCodes = (variable: Variable, deduplicate: boolean): Code[] => {
  const name = deduplicate ? deduplicatedName(variable.variable) : variable.variable
  const values = variable.values
  const result: Code[] = []
  if (!values) {
    return result
  }
  // options start with a number followed by = or )
  const optionStart = /(\d)+\s*[=)]\s*/g
  const split = values.trim().split(optionStart)
  split.splice(0, 1)
  let index = 0
  while (split.length > 1) {
    let [value, label] = split.splice(0, 2)
    label = label.trim().replace(/,$/g, '').substring(0, 255)
    if (!label) {
      continue
    }
    result.push({
      codeList: `${name}_options`,
      value: parseInt(value, 10),
      label,
      order: index++,
      isNullFlavor: false
    })
  }
  return result
}
