import JSZip from 'jszip'
import type { Variable, Emx, Menu, Harmonisation } from './model'
import { getSourceEmx, getTargetEmx } from './emx'
import { asSourceZip, asZip } from './zip'
import { fetchData } from './fetch'
import { RequestInit } from 'node-fetch'

export const exportTarget = async (variableUrl: string, topicUrl: string): Promise<JSZip> => {
  const variables: Variable[] = await fetchData(variableUrl)
  const topics: Menu[] = await fetchData(topicUrl)
  const emx: Emx = getTargetEmx(variables, topics)
  return asZip(emx)
}

export const exportSource = async (variableUrl: string, harmonisationUrl: string, init?: RequestInit): Promise<JSZip> => {
  const variables: Variable[] = await fetchData(variableUrl, init)
  const harmonisations: Harmonisation[] = await fetchData(harmonisationUrl, init)
  const emx: Emx = getSourceEmx(variables, harmonisations)
  return asSourceZip(emx)
}