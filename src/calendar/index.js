import { extend } from '../util/shared'
import { getCurTime, format, zeroPadding } from '../util/date'
import { header, dayItem, monthTitle, daySelect } from './tpl'
import getDefaultOptions from './options'

export default class Calendar {
  constructor (options) {
    this.options = extend(getDefaultOptions(), options)
    this.props = {
      holidayText: '休',
      workdayText: '班',
      startText: '入住',
      endText: '离店'
    }
    this.el = this.options.el
    this.data = this.options.data
    this.startDate = new Date(this.options.start)
    this.endDate = new Date(this.options.end)
    this.isMoving = false
    this.touchStartTime = null
    this.start = {}
    this.end = {}
    this.selectDayElems = []
  }

  init () {
    const html = this.create()
    this.render(html)
    setTimeout(() => {
      this.attachEvent()
      const { start, end } = this.options.selectDate
      if (start && end) {
        this.selectDate(start, end)
      }
    }, 10)
  }

  create () {
    const months = this.createMonths()
    const haeder = header()
    return `
      ${haeder}
      <div class="calendar-items">
        ${months}
      </div>
    `
  }

  createMonths () {
    const year = this.startDate.getFullYear()
    const startMonth = this.startDate.getMonth() + 1
    const endMonth = this.endDate.getMonth() + 1
    // 遍历月期
    const months = this.data.map((item, index) => {
      let month = index + 1
      if (!item.days || startMonth > month || endMonth < month) return ''
      // 标题
      const title = monthTitle(`${year}年${zeroPadding(month)}月`)
      // 天
      const days = this.createDays(year, month)
      return `<section class="calendar-month">${title}<ul class="calendar-days">${days}</ul></section>`
    })
    return months.join('')
  }

  createDays (year, month) {
    const date = new Date(year, month - 1, 1)
    const curMonthData = this.data[month - 1]
    const preDayCount = date.getDay()
    const isStartMonth = this.monthType('start', month)
    const isEndMonth = this.monthType('end', month)
    let preDayCounter = preDayCount
    let days = []
    // 记录每月开始前的补齐数量
    this.data[month - 1].preDayCount = preDayCount
    // 补齐当前月开始前的日期
    while (preDayCounter-- > 0) days.push(dayItem('disabled', '', ''))
    // 当前日
    let day = 1
    // 日期循环
    while (day <= curMonthData.days) {
      const value = `${year}-${zeroPadding(month)}-${zeroPadding(day)}`
      let type = this.dayType(year, month, day)
      let text = curMonthData.fest[day] || day
      // 禁用日期
      if (isStartMonth && day < this.startDate.getDate() || isEndMonth && day > this.endDate.getDate()) {
        type += ' disabled'
      } else if (this.isToday(year, month, day)) {
        type += ' today'
        text = '今天'
      }
      const remark = this.isHoliday(month, day) ? this.props.holidayText : this.isWorkDay(month, day) ? this.props.workdayText : ''
      const index = day + preDayCount - 1
      days.push(dayItem(type.trim(), text, remark, value, index))
      day++
    }
    return days.join('')
  }

  render (html) {
    const content = document.createElement('div')
    content.className = 'calendar-content'
    content.innerHTML = html
    this.contentEl = content
    this.el.appendChild(content)
  }

  attachEvent () {
    this.contentEl.addEventListener('touchstart', this, false)
    this.contentEl.addEventListener('touchmove', this, false)
    this.contentEl.addEventListener('touchend', this, false)
  }

  handleEvent (e) {
    const calendar = this
    switch (e.type) {
      case 'touchstart':
        calendar.touchstart(e)
        break
      case 'touchmove':
        calendar.touchmove(e)
        break
      case 'touchend':
        calendar.touchend(e)
        break
    }
  }

  touchstart (e) {
    this.touchStartTime = Date.now()
  }

  touchmove (e) {
    // 置0防止拖动的时候选中日期
    this.touchStartTime = 0
  }

  touchend (e) {
    const time = Date.now() - this.touchStartTime
    if (time > 500) return
    const targetEl = e.target
    const targetAttr = targetEl.getAttribute('data-date')
    if (targetAttr) {
      this.chooseDay(targetEl, targetAttr)
    } else {
      const parent = Calendar.getParent(targetEl)
      const parentAttr = parent.getAttribute('data-date')
      if (parentAttr) {
        this.chooseDay(parent, parentAttr)
      } else {
        const dayElem = Calendar.getParent(parent)
        const dayAttr = dayElem.getAttribute('data-date')
        if (dayAttr) {
          this.chooseDay(dayElem, dayAttr)
        }
      }
    }
  }

  chooseDay (el, dateStr) {
    if (el.className.indexOf('disabled') !== -1) return
    // 已选择入住和离店，则重置状态
    if (this.start.html && this.end.html) {
      this.reset()
    }
    const index = +el.getAttribute('data-index')
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    if (this.start.index === index) { // 取消选择入住时间
      this.reset()
    } else if (!this.start.html) { // 选择入住时间
      this.setDayState(el, 'start', index)
      // 入住回调
      this.options.startCallback.call(this, date)
    } else { // 选择离店时间
      const startMonth = this.start.date.getMonth() + 1
      // 当前日期所在的月份节点
      const curMonthElem = Calendar.getParent(el)
      // 当前选择的月份所有日期节点
      const daysElems = curMonthElem.getElementsByTagName('li')
      if (month !== startMonth) { // 跨月选择
        // 离店日期小于入住日期则不做任何操作, 因为是跨月选择，所以这里用月份判断
        if (month < startMonth) return false
        if (!this.isValidMaxDays(this.start.date, date)) {
          this.options.maxCallback.call(this, this.start.date, date)
          return false
        }
        // 第一个月份节点
        const startMonthElem = Calendar.getParent(this.start.el)
        const startDaysElems = startMonthElem.getElementsByTagName('li')
        // 设置离店样式
        this.setDayState(el, 'end', index)
        // 找出第一个月选择的日期节点
        this.findSelectDayElems(startDaysElems, this.start.index, startDaysElems.length - 1)
        // 找出中间月份的的日期节点
        const curTime = getCurTime()
        const monthCount = month - startMonth
        const monthsElems = this.el.querySelectorAll('.calendar-days')
        for (let i = 1; i < monthCount; i++) {
          const elems = monthsElems[startMonth - curTime.month + i].getElementsByTagName('li')
          this.findSelectDayElems(elems, 0, elems.length - 1)
        }
        // 找出结束的节点
        this.findSelectDayElems(daysElems, 0, index)
        // 给选中的日期节点添加class
        this.selectDayStyle({ type: 'add', className: 'active' })
      } else { // 同月选择
        // 离店日期小于入住日期则不做任何操作
        if (this.start.index > index) return false
        if (!this.isValidMaxDays(this.start.date, date)) {
          this.options.maxCallback.call(this, this.start.date, date)
          return false
        }
        // 设置离店样式
        this.setDayState(el, 'end', index)
        // 找出开始到结束选中的日期节点
        this.findSelectDayElems(daysElems, this.start.index, index)
        // 给选中的日期节点添加class
        this.selectDayStyle({ type: 'add', className: 'active' })
      }
      // 离店回调
      this.options.endCallback.call(this, date, this.getSelectNumberOfDays(this.start.date, date))
    }
  }

  // 是否有超过最大天数
  isValidMaxDays (startDate, endDate) {
    if (typeof this.options.maxDays === 'boolean') return true
    return this.getSelectNumberOfDays(startDate, endDate) < this.options.maxDays
  }

  // 获取选择的天数
  getSelectNumberOfDays (startDate, endDate) {
    const startTime = getCurTime(startDate)
    const startMonth = startTime.month
    const startDay = startTime.day
    const endTime = getCurTime(endDate)
    const endMonth = endTime.month
    const endDay = endTime.day
    return startMonth === endMonth ? endDay - startDay : this.data[startMonth - 1].days - startDay + endDay
  }

  selectDate (startDateStr, endDateStr) {
    if (this.start.html && this.end.html) {
      this.reset()
    }
    const firstMonth = this.startDate.getMonth() + 1
    const monthsElems = this.el.querySelectorAll('.calendar-days')
    // 入住时间
    const startDate = new Date(startDateStr)
    const startMonth = startDate.getMonth() + 1
    const startDay = startDate.getDate()
    const startIndex = startDay + this.data[startMonth - 1].preDayCount - 1
    const startDaysElems = monthsElems[startMonth - firstMonth].getElementsByTagName('li')

    // 离店时间
    const endDate = new Date(endDateStr)
    const endMonth = endDate.getMonth() + 1
    const endDay = endDate.getDate()
    const endIndex = endDay + this.data[endMonth - 1].preDayCount - 1

    const startElem = startDaysElems[startIndex]
    let endElem = null
    // 跨月
    if (startMonth !== endMonth) {
      const endDaysElems = monthsElems[endMonth - firstMonth].getElementsByTagName('li')
      let monthCount = endMonth - startMonth
      endElem = endDaysElems[endIndex]
      // 当前住店的月期
      this.findSelectDayElems(startDaysElems, startIndex, startDaysElems.length - 1)
      for (let i = 1; i < monthCount; i++) {
        const elems = monthsElems[startMonth - firstMonth + i].getElementsByTagName('li')
        this.findSelectDayElems(elems, 0, elems.length - 1)
      }
      // 当前离店的月期
      this.findSelectDayElems(endDaysElems, 0, endIndex)
    } else {
      endElem = startDaysElems[endIndex]
      this.findSelectDayElems(startDaysElems, startIndex, endIndex)
    }
    this.selectDayStyle({ type: 'add', className: 'active' })
    this.setDayState(startElem, 'start', startIndex)
    this.setDayState(endElem, 'end', endIndex)
  }

  reset () {
    this.start.el.innerHTML = this.start.html
    this.end.html && (this.end.el.innerHTML = this.end.html)
    this.start = {}
    this.end = {}
    this.selectDayStyle({ type: 'remove', className: 'active' })
    this.selectDayElems = []
  }

  findSelectDayElems (daysElems, startIndex, endIndex) {
    Calendar.forEach(daysElems, (elem, elemIndex) => {
      if (elemIndex > endIndex) return false
      if (elemIndex >= startIndex && elemIndex <= endIndex) {
        this.selectDayElems.push(elem)
      }
      return true
    })
  }

  // 给选中的日期添加class
  selectDayStyle (state) {
    Calendar.forEach(this.selectDayElems, (elem, elemIndex, elemLength) => {
      if (elemIndex !== 0 && elemIndex !== elemLength - 1) {
        elem.classList[state.type](state.className)
      }
      return true
    })
  }

  // 设置入住和离店显示状态
  setDayState (el, type, index) {
    const date = new Date(el.getAttribute('data-date'))
    const day = date.getDate()
    this[type] = { html: el.innerHTML, date, index, el }
    el.innerHTML = daySelect(day, type, this.props[`${type}Text`])
  }

  dayType (year, month, day) {
    let type = []
    this.isHoliday(month, day) && type.push('holiday')
    this.isFest(month, day) && type.push('fest')
    this.isWeekend(year, month, day) && type.push('weekend')
    this.isWorkDay(month, day) && type.push('workday')
    return type.join(' ')
  }

  monthType (name, month) {
    const date = this[`${name}Date`]
    return date.getMonth() + 1 === month
  }

  // 是否休息日
  isHoliday (month, day) {
    return this.data[month - 1].holidays[day]
  }
  // 是否工作日
  isWorkDay (month, day) {
    return this.data[month - 1].workdays[day]
  }
  // 是否节日
  isFest (month, day) {
    return this.data[month - 1].fest[day]
  }
  // 是否是周末
  isWeekend (year, month, day) {
    const curMonth = month - 1
    const date = new Date(year, zeroPadding(curMonth), zeroPadding(day))
    const curDay = date.getDay()
    return curDay === 0 || curDay === 6
  }
  // 是否是当前月
  isCurMonth (_year, _month) {
    const { year, month } = getCurTime()
    return _year === year && _month === month
  }
  // 是否是今天
  isToday (_year, _month, _day) {
    const { year, month, day } = getCurTime()
    return _year === year && _month === month && _day === day
  }

  static getParent (el) {
    const parent = el.parentNode
    if (parent && parent.nodeType !== 11) {
      return parent
    }
    return false
  }

  static forEach (obj, callback) {
    let i = 0
    let length = obj.length
    for (i; i < length; i++) {
      if (!callback(obj[i], i, length)) break
    }
  }

  static format (date, tpl) {
    return format(date, tpl)
  }
}

