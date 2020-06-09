import JSZip from 'jszip'
import type { Variable, Emx } from './model'
import { getEmx } from './emx'
import { asZip } from './zip'
import { fetchData } from './fetch'
export { convert } from './convert'

export const exportData = async (firstUrl: string): Promise<JSZip> => {
  const variables: Variable[] = await fetchData(firstUrl)
  const emx: Emx = getEmx(variables)
  return asZip(emx)
}
