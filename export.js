const fetch = require('node-fetch')
const groupBy = require('lodash.groupby')
const stringify = require('csv-stringify')
const JSZip = require("jszip")
const fs = require('fs')

const TABLE_NON_REPEATED = 'non_repeated'
const TABLE_TRIMESTER_REPEATED = 'trimester_repeated'
const TABLE_MONTHLY_REPEATED = 'monthly_repeated'
const TABLE_YEARLY_REPEATED = 'yearly_repeated'

const fetchData = async () => {
  let result = []
  let url = 'https://molgenis36.gcc.rug.nl/api/v2/LifeCycle_CoreVariables?attrs=variable,label,datatype,values&num=10000'
  while (url) {
    const response = await fetch(url)
    const jsonResponse = await response.json()
    result = [...result, ...jsonResponse.items]
    url = jsonResponse.nextHref
  }
  return result
}

const exportData = async () => {
  const attributes = [
    {
      name: 'child_id',
      dataType: 'string',
      entity: TABLE_NON_REPEATED,
      idAttribute: 'TRUE'
    },
    {
      name: 'id',
      dataType: 'string',
      entity: TABLE_TRIMESTER_REPEATED,
      idAttribute: 'AUTO'
    },
    {
      name: 'child_id',
      dataType: 'string',
      entity: TABLE_TRIMESTER_REPEATED
    },
    {
      name: 'age_trimester',
      dataType: 'int',
      entity: TABLE_TRIMESTER_REPEATED,
      rangeMin: '1',
      rangeMax: '3'
    },
    {
      name: 'id',
      dataType: 'string',
      entity: TABLE_MONTHLY_REPEATED,
      idAttribute: 'AUTO'
    },
    {
      name: 'child_id',
      dataType: 'string',
      entity: TABLE_MONTHLY_REPEATED
    },
    {
      name: 'age_months',
      dataType: 'int',
      entity: TABLE_MONTHLY_REPEATED,
      rangeMin: '0',
      rangeMax: '215'
    },
    {
      name: 'id',
      dataType: 'string',
      entity: TABLE_YEARLY_REPEATED,
      idAttribute: 'AUTO'
    },
    {
      name: 'child_id',
      dataType: 'string',
      entity: TABLE_YEARLY_REPEATED
    },
    {
      name: 'age_years',
      dataType: 'int',
      entity: TABLE_YEARLY_REPEATED,
      rangeMin: '0',
      rangeMax: '17'
    }
  ]
  const variables = await fetchData()
  const uniqueVariables = groupBy(variables, (item) => item.variable && attributeNameOfVariable(item.variable))
  const variableKeys = Object.keys(uniqueVariables)
  const emxModel = new JSZip()

  for (let i = 0; i < variableKeys.length; i++) {
    let key = variableKeys[i]
    let variable = uniqueVariables[key][0]
    let tableName = createTableName(uniqueVariables[key].length)

    switch (variable.datatype.id) {
      case 'categorical':
        doCategorical(tableName, attributes, key, variable, emxModel)
        break
      case 'int':
        doBasic(tableName, attributes, key, variable, 'int')
        break
      case 'binary':
        doBasic(tableName, attributes, key, variable, 'bool')
        break
      case 'continuous':
        doBasic(tableName, attributes, key, variable, 'decimal')
        break
      default:
        console.log("Unknown datatype:", variable.datatype.id, key)
    }
  }

  await writeAttributesCsv(emxModel, attributes)
  emxModel.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream('model.zip'))
}

const createTableName = (repeatCount) => {
  let tableName = TABLE_NON_REPEATED
  if (repeatCount > 100) {
    tableName = TABLE_MONTHLY_REPEATED
  } else if (repeatCount > 3) {
    tableName = TABLE_YEARLY_REPEATED
  } else if (repeatCount > 1) {
    tableName = TABLE_TRIMESTER_REPEATED
  }
  return tableName
}

const doBasic = async (tableName, attributes, key, variable, dataType) =>
  attributes.push(
    {
      name: key,
      dataType,
      description: variable.label,
      entity: tableName
    })

const doCategorical = async (tableName, attributes, key, variable, emxModel) => {
  const values = variable.values
  const description = variable.label
  const options = getCategoricalOptions(values)
  attributes.push(
    {
      name: key,
      dataType: 'categorical',
      description,
      entity: tableName,
      refEntity: `${key}_options`
    },
    {
      name: 'id',
      dataType: 'string',
      entity: `${key}_options`,
      idAttribute: 'TRUE'
    },
    {
      name: 'label',
      dataType: 'string',
      entity: `${key}_options`,
      labelAttribute: 'TRUE'
    })
  await writeOptionsCsv(emxModel, options, `${key}_options.csv`)
}

const writeAttributesCsv = async (emxModel, attributes) => {
  return new Promise((resolve, reject) => {
    stringify(attributes,
      {
        header: true,
        columns: ['entity', 'name', 'description', 'dataType', 'labelAttribute', 'idAttribute', 'refEntity', 'rangeMin', 'rangeMax']
      }, function (err, data) {
        if (err) {
          reject(err)
        } else {
          emxModel.file('attributes.csv', data)
          resolve()
        }
      })
  })
}


const writeOptionsCsv = async (emxModel, options, fileName) => {
  return new Promise((resolve, reject) => {
    stringify(options,
      {
        header: true,
        columns: [{ key: 'key', header: 'id' }, { key: 'value', header: 'label' }]
      }, function (err, data) {
        if (err) {
          reject(err)
        } else {
          emxModel.file(fileName, data)
          resolve()
        }
      })
  })
}

const getCategoricalOptions = (values) => {
  let seperator = '\n'
  if (values.indexOf(seperator) == -1) {
    seperator = ','
  }
  const options = values.split(seperator).map(value => value.trim())

  const matches = /[^\d\s]/.exec(options[0])
  const optionSeperator = matches[0]

  return options.map(option => ({
    key: option.substring(0, option.indexOf(optionSeperator)).trim(),
    value: option.substring(option.indexOf(optionSeperator) + 1).trim()
  }))
}

const attributeNameOfVariable = (variable) => {
  if (variable.indexOf('_') >= 0) {
    return variable.substring(0, variable.lastIndexOf('_'))
  } else {
    return variable
  }
}

exportData()