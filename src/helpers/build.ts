export function buildFindingQueryInRange(fromDate: Date, toDate: Date) {
  let findingQuery: any = { }

  if (!fromDate && !toDate) {
    return findingQuery
  }

  if (fromDate) {
    findingQuery.gte = fromDate
  }

  if (toDate) {
    findingQuery.lte = toDate
  }

  return findingQuery
}