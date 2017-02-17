import data from './data'
import { noop } from '../util/shared'
import { getCurTime, zeroPadding } from '../util/date'

const { year, month, day } = getCurTime()

function getEnd (_month) {
  const months = 12
  let endMonth = month + _month
  if (endMonth > months) {
    endMonth = months
  }
  const endDay = data[endMonth - 1].days
  return `${year}-${zeroPadding(endMonth)}-${zeroPadding(endDay)}`
}

export default function getDefaultOptions () {
  return {
    data,
    text: {
      holiday: '休',
      workday: '班'
    },
    el: document.body,
    start: `${year}-${zeroPadding(month)}-${zeroPadding(day)}`,
    end: getEnd(6),
    startCallback: noop,
    endCallback: noop,
    selectDate: {},
    maxDays: false,
    maxCallback: noop
  }
}
