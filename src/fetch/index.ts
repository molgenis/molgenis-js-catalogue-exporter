import fetch from 'node-fetch'
import type { Variable } from '../model'

export const fetchData = async (firstUrl: string): Promise<Variable[]> => {
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