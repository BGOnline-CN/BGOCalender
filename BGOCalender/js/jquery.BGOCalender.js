/**
 * jquery.BGOCalender.js 
 * author: BGOnline
 * version 1.0 2016-05-08
 * 
 * html 格式按照demo里的table格式写好之后直接调用就行了。
 * 本版作为1.0版，虽然代码粗鄙了点但是功能是完善的，可以放心使用！
 * ps.后续会持续做扩展。
 */

;(function($) {
    
    $.fn.extend({
        
        'BGOCalender': function(options) {
            
            var date = new Date(); 
            var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var td = $('> .calender > table > tbody > tr > td', this);
            var cn = {
                weekLang: ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u65e5'],
                //monthLang: ['\u4e00\u6708', '\u4e8c\u6708', '\u4e09\u6708', '\u56db\u6708', '\u4e94\u6708', '\u516d\u6708', '\u4e03\u6708', '\u516b\u6708', '\u4e5d\u6708', '\u5341\u6708', '\u5341\u4e00\u6708', '\u5341\u4e8c\u6708']
            }
            
            var defaultOpts = {
                today: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                day: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(),
                classData: [], // 开课时间数据
                stuData: [],
                language: cn,
                pattern: 1, // 班级日历1 学生日历2
                callback: function() {}
            } 
            
            
            var opts = $.extend(defaultOpts, options || {});    
                    

            // 判断是否为闰年，并返回该月天数
            var isLeapYear = function(y, m) {
                if(m < 0) {
                    m = 11;
                }
                if(m > 11) {
                    m = 0;
                }
                if(m == 1) {
                    return ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) ? 29 : 28;
                }else {
                    return monthDays[m];
                }
            }
            
            

            // 返回上一个月天数
            var preMonthDays = function(y, m) {
                return isLeapYear(y, m-1);
            }
            

            // 返回该月第一天是星期几
            var firstDayWeek = function(y, m) {
                return new Date(y, m, 1).getDay() == 0 ? 7 : new Date(y, m, 1).getDay();
            }
            
            // 日历表头
            for(var i = 0; i < cn.weekLang.length; i++) {
                $('> .calender > table > thead > tr > th', this).eq(i).html(opts.language.weekLang[i]);
            }
            
            
            // // 载入今天
            // $('.cur').click(function() {
            //     opts.month = date.getMonth();
            //     opts.year = date.getFullYear();
            //     opts.today = date.getDate();
            //     td.removeClass('selectDate');
            //     initCalender(opts.year, opts.month);
            // });
            
            // // 载入当月
            // $('.cur').click(function() {
            //     opts.month = date.getMonth();
            //     opts.year = date.getFullYear();
            //     initCalender(opts.year, opts.month);
            // });
            
            
            // 载入上一个月
            $('.preClass').click(function() {
                opts.month--;
                if(opts.month < 0) {
                    opts.month = 11;
                    opts.year--;
                }
                initCalender(opts.year, opts.month);
            });
            
            // 载入下一个月
            $('.nextClass').click(function() {
                opts.month++;
                if(opts.month > 11) {
                    opts.month = 0;
                    opts.year++;
                }
                initCalender(opts.year, opts.month);
            });
            
            cData = [];
            sData = [];
            var showSelectInfo = function(totalData) {
                
                var removeRepeat = function(index,array) { // 根据指定下标删除数组 供过滤时调用
                    if(index >= 0 && index < array.length) {
                        for(var i = index; i < array.length; i++) {
                            array[i] = array[i+1];
                        }
                        array.length = array.length - 1;
                    }
                    return array;
                }
                    
                var filterArray = function(arr) { // 过滤数组中重复数据并返回新数组
                    for(var i=0; i< arr.length; i++) {
                        for(var j = i + 1; j < arr.length; j++) {
                            if(arr[i] == arr[j]) {
                                arr = removeRepeat(j,arr); 
                                i = -1;
                                break;
                            }
                        }
                    }
                    return arr;  
                } 
                
                var bubbling = function(arr) { // 排序
                    var flag = false;
                    var temp;
                    for(var i = 0; i < arr.length - 1; i++) {
                        for(var j = 0; j < arr.length-1-i; j++) {
                            if(arr[j] > arr[j+1]) {
                                temp = arr[j];
                                arr[j] = arr[j+1];
                                arr[j+1] = temp;
                                flag = true;
                            }
                        }
                        if(flag) {
                            flag = false;
                        }else {
                            break;
                        }
                    }
                }
                
                totalData = filterArray(totalData);
                
                bubbling(totalData);
                
                // 右侧显示数值
                switch(opts.pattern) {
                    case 1:
                        $('.startClass > span.dateTitle').html('开班日期');
                        $('.endClass > span.dateTitle').html('结班日期');
                        break;
                    case 2:
                        $('.startClass > span.dateTitle').html('上课日期');
                        $('.endClass > span.dateTitle').html('结课日期');
                        break;
                }
                if(totalData.length < 1) {
                    $('.startClass > span.dateCon').html(''); // 开课日期
                    $('.endClass > span.dateCon').html(''); // 结课日期
                }else {
                    $('.startClass > span.dateCon').html(totalData[0]); // 开课日期
                    $('.endClass > span.dateCon').html(totalData[totalData.length-1]); // 结课日期
                }
                
                $('.totalClass > p > span').html(totalData.length); // 总上课天数
                
                // 剩余上课天数
                var count = 0;
                var fullToday;
                if(date.getMonth() < 10 && date.getDate() < 10) {
                    fullToday = date.getFullYear() + '-' + '0' + (date.getMonth() + 1) + '-' + '0' + date.getDate();
                }else if(date.getMonth() < 10 && date.getDate() > 10) {
                    fullToday = date.getFullYear() + '-' + '0' + (date.getMonth() + 1) + '-' + date.getDate();
                }else if(date.getMonth() > 10 && date.getDate() < 10) {
                    fullToday = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + '0' + date.getDate();
                }else if(date.getMonth() > 10 && date.getDate() > 10) {
                    fullToday = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                }

                for(var i = 0; i < totalData.length; i++) {
                    if(totalData[i] >= fullToday) {
                        count++;
                    }
                }
                $('.onlyClass > p > span').html(count);

            }
            
            var addTotalData = function(e, totalData) { // 载入totalData
                if(e.text() < 10) {
                    totalData.push($('.year').text()+'-'+$('.month').text()+'-'+'0'+e.text());
                }else {
                    totalData.push($('.year').text()+'-'+$('.month').text()+'-'+e.text());
                }
            }
            
            var removeTotalData = function(e, totalData) { // 删除totalData
                if(e.text() < 10) {
                    totalData.splice($.inArray($('.year').text()+'-'+$('.month').text()+'-'+'0'+e.text(), totalData),1);
                }else {
                    totalData.splice($.inArray($('.year').text()+'-'+$('.month').text()+'-'+e.text(), totalData),1);
                }
            }
            
            var generateCalendar = function(y, m) {
                
                // 当前所在日期
                $('.year').html(y);
                if(m+1 < 10) {
                    $('.month').html('0'+parseInt(m+1));
                }else {
                    $('.month').html(parseInt(m+1));
                }

                var data = [];
                // 用上月号数补齐当月1号前空余号数
                for(var i = firstDayWeek(y, m) - 2; i >= 0; i--) {
                    data.push('<span class="notMonthly">' + (preMonthDays(y, m)-i) + '</span>');
                }
                
                // if($('.month').text() < 10) { // 拼装参数
                //     var holiday = $('.year').text()+'0'+$('.month').text();
                // }else {
                //     var holiday = $('.year').text()+$('.month').text();
                // }
                // $.ajax({ // 获取节假日数据
                //     type: "GET",
                //     url: "http://apis.baidu.com/xiaogg/holiday/holiday",
                //     data: {d: holiday, apikey: '22ccbd220dba0561bbe2177d84d501cf'},
                //     headers : {'apikey':''},
                //     dataType: "json",
                //     success: function(response) {
                //         var res = response[holiday];
                //         for(var k = 0; k <= res.length; k++) {
                //             for(var i = 1; i <= 31; i++) {
                //                 if(i == res[k].slice(2)) {
                //                     // if(td.eq(i).text() == i) {
                //                     //     //td.eq(i).addClass('holiday')
                //                     //     alert(td.eq(i).text())
                //                     // }
                //                 }
                //             }
                //         }
                //     }
                // });


                // 获得当月号数
                for(var i = 1; i <= isLeapYear(y, m); i++) {
                    data.push(i);
                }
                

                // 用下月号数补齐当月最后空余号数
                var lackNum = td.length - data.length;
                for(var i = 1; i <= lackNum; i++) {
                    data.push('<span class="notMonthly">' + i + '</span>');
                }
                
                
                // 载入日历
                for(var i = 0; i < data.length; i++) {
                    td.eq(i).html(data[i]);
                    if(data[i] < 10) {
                        td.eq(i).attr({name:$('.year').text() + '-' + $('.month').text() + '-' + '0' + data[i]});
                    }else {
                        td.eq(i).attr({name:$('.year').text() + '-' + $('.month').text() + '-' + data[i]});
                    }
                    
                    for(var k = 0; k < cData.length; k++) {
                        if(td.eq(i).attr('name') == cData[k]) {
                            td.eq(i).addClass('selectDate');
                        }
                    }
                    for(var j = 0; j < sData.length; j++) {
                        if(td.eq(i).attr('name') == sData[j]) {
                            td.eq(i).addClass('selectStuDate');
                        }
                    }
                }
                
                // 周末特别标识
                for(var i = firstDayWeek(y, m) - 1; i <= isLeapYear(y, m) + firstDayWeek(y, m) - 2; i++) {
                    if(new Date(y, m, parseInt(td.eq(i).text())).getDay() == 0 || new Date(y, m, parseInt(td.eq(i).text())).getDay() == 6) {
                        td.eq(i).addClass('holiday');
                    }
                }
                
            }
            
            
            
            switch(opts.pattern) {
                
                case 1: // 开课日历
                
                    // 初始化日历
                    var initCalender = function(y, m) {
                        
                        showSelectInfo(cData);

                        // 复位checkbox
                        $('.selectWeekend').removeAttr('checked');
                        $('.selectAll').removeAttr('checked');

                        td.removeClass('selectDate');
                        
                        generateCalendar(y, m);
                        
                    }

                    cData = [];
                    // 用户参数 data 与 历史cData 并集
                    var mergeArray = function(arr1, arr2) { 
                        for (var i = 0, j = 0, ci, r = {}, c = []; ci = arr1[i++] || arr2[j++]; ) {
                            if (r[ci]) continue;
                            r[ci] = 1;
                            c.push(ci);
                        }
                        return c;
                    }
                    cData = mergeArray(opts.classData, cData);

                    // 全选周末
                    $('.selectWeekend').click(function() {
                        var y = opts.year;
                        var m = opts.month;
                        if($(this).is(':checked')) {
                            for(var i = firstDayWeek(y, m) - 1; i <= isLeapYear(y, m) + firstDayWeek(y, m) - 2; i++) {
                                if(new Date(y, m, parseInt(td.eq(i).text())).getDay() == 0 || new Date(y, m, parseInt(td.eq(i).text())).getDay() == 6) {
                                    td.eq(i).addClass('selectDate');                     
                                    addTotalData(td.eq(i), cData);
                                }
                            }
                        }else {
                            for(var i = firstDayWeek(y, m) - 1; i <= isLeapYear(y, m) + firstDayWeek(y, m) - 2; i++) {
                                if(new Date(y, m, parseInt(td.eq(i).text())).getDay() == 0 || new Date(y, m, parseInt(td.eq(i).text())).getDay() == 6) {
                                    td.eq(i).removeClass('selectDate');
                                    removeTotalData(td.eq(i), cData);
                                }
                            }
                        }
                        
                    });
                    
                    // 全选当月
                    $('.selectAll').click(function() {
                        if($(this).is(':checked')) {
                            td.removeClass('selectDate');
                            for(var i = firstDayWeek(opts.year, opts.month) - 1; i <= isLeapYear(opts.year, opts.month) + firstDayWeek(opts.year, opts.month) - 2; i++) {
                                td.eq(i).addClass('selectDate');
                                addTotalData(td.eq(i), cData);
                            }
                            $('.selectWeekend').prop("checked",'true');
                        }else {
                            for(var i = firstDayWeek(opts.year, opts.month) - 1; i <= isLeapYear(opts.year, opts.month) + firstDayWeek(opts.year, opts.month) - 2; i++) {
                                td.eq(i).removeClass('selectDate');
                                removeTotalData(td.eq(i), cData);
                            }
                            $('.selectWeekend').removeAttr("checked");
                        }
                    });
                    
                    
                    // 点选号数
                    td.click(function() {
                        if($(this).children().hasClass('notMonthly')) {
                            
                            // 这里处理如果点击了上一个月的号数的逻辑

                        }else {
                            if($(this).hasClass('selectDate')) {
                                removeTotalData($(this), cData);
                                $(this).removeClass('selectDate');
                            }else {
                                $(this).addClass('selectDate'); 
                                addTotalData($(this), cData);
                            }
                        }
                    })
                    break;
                    
                case 2: // 学生日历
                
                    // 初始化日历
                    var initCalender = function(y, m) {
                        
                        showSelectInfo(sData);

                        // 复位checkbox
                        $('.selectWeekend').removeAttr('checked');
                        $('.selectAll').removeAttr('checked');

                        td.removeClass('selectDate');
                        td.removeClass('selectStuDate');
                        
                        generateCalendar(y, m);
  
                    }

                    // 用户参数 stuData 与 历史sData 并集
                    var mergeArray = function(arr1, arr2) { 
                        for (var i = 0, j = 0, ci, r = {}, c = []; ci = arr1[i++] || arr2[j++]; ) {
                            if (r[ci]) continue;
                            r[ci] = 1;
                            c.push(ci);
                        }
                        return c;
                    }
                    cData = opts.classData;
                    sData = mergeArray(opts.stuData, sData);

                    // 全选周末
                    $('.selectWeekend').click(function() {
                        var y = opts.year;
                        var m = opts.month;
                        if($(this).is(':checked')) {
                            for(var i = firstDayWeek(y, m) - 1; i <= isLeapYear(y, m) + firstDayWeek(y, m) - 2; i++) {
                                if((new Date(y, m, parseInt(td.eq(i).text())).getDay() == 0 || new Date(y, m, parseInt(td.eq(i).text())).getDay() == 6) && td.eq(i).hasClass('selectDate')) {
                                    td.eq(i).addClass('selectStuDate');  
                                    addTotalData(td.eq(i), sData);
                                }
                            }
                        }else {
                            for(var i = firstDayWeek(y, m) - 1; i <= isLeapYear(y, m) + firstDayWeek(y, m) - 2; i++) {
                                if(new Date(y, m, parseInt(td.eq(i).text())).getDay() == 0 || new Date(y, m, parseInt(td.eq(i).text())).getDay() == 6) {
                                    if(td.eq(i).hasClass('selectDate')) {
                                        td.eq(i).removeClass('selectStuDate');                
                                        removeTotalData(td.eq(i), sData);
                                    }
                                }
                            }
                        }
                        
                    });
                    
                    // 全选当月
                    $('.selectAll').click(function() {
                        if($(this).is(':checked')) {
                            td.removeClass('selectStuDate');
                            for(var i = firstDayWeek(opts.year, opts.month) - 1; i <= isLeapYear(opts.year, opts.month) + firstDayWeek(opts.year, opts.month) - 2; i++) {
                                if(td.eq(i).hasClass('selectDate')) {
                                    td.eq(i).addClass('selectStuDate');                
                                    addTotalData(td.eq(i), sData);
                                }
                            }
                            $('.selectWeekend').prop("checked",'true');
                        }else {
                            for(var i = firstDayWeek(opts.year, opts.month) - 1; i <= isLeapYear(opts.year, opts.month) + firstDayWeek(opts.year, opts.month) - 2; i++) {
                                if(td.eq(i).hasClass('selectDate')) {
                                    td.eq(i).removeClass('selectStuDate');                
                                    removeTotalData(td.eq(i), sData);
                                }
                            }
                            $('.selectWeekend').removeAttr("checked");
                        }
                    });
                    
                    // 点选号数
                    td.click(function() {
                        if($(this).children().hasClass('notMonthly')) {
                            
                            // 这里处理如果点击了上一个月的号数的逻辑

                        }else {
                            if($(this).hasClass('selectDate')) {
                                if($(this).hasClass('selectStuDate')) {
                                    removeTotalData($(this), sData);
                                    $(this).removeClass('selectStuDate');
                                }
                                else {
                                    $(this).addClass('selectStuDate'); 
                                    addTotalData($(this), sData);
                                }
                            }
                        }
                    })
                    break;
            }
             
            
            
            
            // 执行初始化
            initCalender(opts.year, opts.month);


            // 回调函数
            opts.callback(function() { 

                switch(opts.pattern) {
                    case 1: 
                        showSelectInfo(cData); // 处理cData及展示数据
                        if(cData.length > 0) { // 返回数据
                            return cData;
                        }
                        break;
                    case 2: 
                        showSelectInfo(sData);
                        if(sData.length > 0) { // 返回数据
                            return sData;
                        }
                        break;
                }
                
            });
            
            

        }
        
    });
    
})(jQuery);