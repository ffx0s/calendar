import { isLeapYear } from '../util/date'

const jan = {
  days: 31,
  fest: { 1: '元旦', 5: '腊八', 20: '小年', 27: '除夕', 28: '春节' },
  holidays: { 1: true, 2: true, 27: true, 28: true, 29: true, 30: true, 31: true },
  workdays: { 22: true }
}

const feb = {
  days: isLeapYear(new Date().getFullYear()) ? 29 : 28,
  fest: { 11: '元宵节', 14: '情人节' },
  holidays: { 1: true, 2: true },
  workdays: { 4: true }
}

const mar = {
  days: 31,
  fest: { 8: '妇女节' },
  holidays: {},
  workdays: {}
}

const apr = {
  days: 30,
  fest: { 4: '清明节' },
  holidays: { 2: true, 3: true, 4: true, 29: true, 30: true },
  workdays: { 1: true }
}

const may = {
  days: 31,
  fest: { 1: '劳动节', 14: '母亲节', 30: '端午节' },
  holidays: { 1: true, 28: true, 29: true, 30: true },
  workdays: { 27: true }
}

const jun = {
  days: 30,
  fest: { 1: '儿童节', 18: '父亲节' },
  holidays: {},
  workdays: {}
}

const jul = {
  days: 31,
  fest: { 1: '建党节' },
  holidays: {},
  workdays: {}
}

const aug = {
  days: 31,
  fest: { 1: '建军节', 28: '七夕节' },
  holidays: {},
  workdays: {}
}

const sep = {
  days: 30,
  fest: { 5: '中元节', 10: '教师节' },
  holidays: {},
  workdays: { 30: true }
}

const oct = {
  days: 31,
  fest: { 1: '国庆节', 4: '中秋节', 28: '重阳节', 31: '万圣节' },
  holidays: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
  workdays: {}
}

const nov = {
  days: 30,
  fest: { 23: '感恩节' },
  holidays: {},
  workdays: {}
}

const dec = {
  days: 31,
  fest: { 24: '平安夜', 25: '圣诞节' },
  holidays: {},
  workdays: {}
}

export default [ jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec ]
