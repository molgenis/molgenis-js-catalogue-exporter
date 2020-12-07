import JSZip from 'jszip'
import type { Variable, Emx, Menu } from './model'
import { getEmx } from './emx'
import { asZip } from './zip'
import { fetchData } from './fetch'

export const exportData = async (variableUrl: string, topicUrl: string): Promise<JSZip> => {
  const variables: Variable[] = await fetchData(variableUrl)
  const topics: Menu[] = await fetchData(topicUrl)
  const emx: Emx = getEmx(variables, topics)
  return asZip(emx)
}
