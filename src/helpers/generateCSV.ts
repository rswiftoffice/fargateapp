import { parse } from 'json2csv'

export function generateCSV(data: any[]) {
  if (!data?.length) {
    return ''
  }

  const fields = Object.keys(data[0])

  const csv = parse(data, fields)

  return csv
}