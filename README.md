# 移动端日历插件
![gif][1]


## demo

[https://ffx0s.github.io/calendar/dist/demo.html](https://ffx0s.github.io/calendar/dist/demo.html)

## 安装

Install with [npm](https://www.npmjs.com/package/hotel-calendar): `npm install hotel-calendar --save`

## 使用

``` css
<link rel="stylesheet" href="calendar.css">
<script src="calendar.js"></script>

<script>
  var options = {}
  var calendar = new Calendar(options)
  calendar.init()
</script>
```
或者：
``` js
import 'hotel-calendar/dist/calendar.css'
import Calendar from 'hotel-calendar'

const options = {}
const calendar = new Calendar(options)
calendar.init()
```

## Options

### start

**Type:** _String_

**Value:** `'2017-04-10'`

``` js
start: '2017-04-10'
```

从哪个月开始.

### end

**Type:** _String_ 

**Value:** `'2017-10-01'`

``` js
end: '2017-10-01'
```

到哪个月结束.

### maxDays

**Type:** _Number_

**Value:** `20`

``` js
maxDays: 20
```

允许选择的最大天数

### maxCallback

**Type:** _Function_

``` js
maxCallback: function (startDate, endDate) {}
```

超出选择天数的回调

## startCallback 

**Type:** _Function_

``` js
startCallback: function (date) {}
```

入住点击回调

### endCallback

**Type:** _Function_

``` js
endCallback: function (date) {}
```

离店点击回调

### selectDate

**Type:** _Object_

``` js
selectDate: { start: '2017-04-25', end: '2017-05-10' }
```

当前选中的时间


## Calendar静态方法

### Calendar.format

``` js
Calendar.format(date, 'yyyy年MM月dd日 hh:mm:ss')
```

格式化时间

## Browser support

Android 4+, iOS 6+

  [1]: http://static.webfed.cn/calendar/calendar-1.gif
