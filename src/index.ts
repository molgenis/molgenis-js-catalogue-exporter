import fetch from 'node-fetch'
import JSZip from 'jszip'
import type { Variable, Emx } from './model'
import { getEmx } from './emx'
import { asZip } from './zip'

const fetchData = async (firstUrl: string): Promise<Variable[]> => {
  let result: Variable[] = []
  let url = firstUrl
  while (url) {
    const response = await fetch(url)
    const jsonResponse = await response.json()
    result = [...result, ...jsonResponse.items]
    url = jsonResponse.nextHref
  }
  return result
}

export const exportData = async (firstUrl: string): Promise<JSZip> => {
  const variables = await fetchData(firstUrl)
  const emx: Emx = getEmx(variables)
  return asZip(emx)
}
