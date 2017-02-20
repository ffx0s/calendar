export const header = function () {
  return `<ul class="calendar-bar"><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul>`
}

export const monthTitle = function (title) {
  return `<h1 class="calendar-title">${title}</h1>`
}

export const dayItem = function (type, text, remark = '', value = '', index = '') {
  if (!text) return `<li class="${type}"></li>`
  return `<li data-index="${index}" data-date="${value}" class="${type}"><span class="calendar-text">${text}</span><span class="calendar-remark">${remark}</span></li>`
}

export const daySelect = function (day, type, typeText) {
  return `<div class="calendar-day-select select-${type}"><span class="day">${day}</span><span class="text">${typeText}</span><div class="elem-proxy"></div></div>`
}
