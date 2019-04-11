/*
 * 项目中的LOADING区域是在页面页面内容展示之前，给用户一个等待加载的时间，主要是处理图片(音视频)的加载
 */
var loadingRender = (function () {
    //->ARY中记录了我们当前项目需要的图片
    var ary = ["icon.png", "zf_concatAddress.png", "zf_concatInfo.png", "zf_concatPhone.png", "zf_course.png", "zf_course1.png", "zf_course2.png", "zf_course3.png", "zf_course4.png", "zf_course5.png", "zf_course6.png", "zf_cube1.png", "zf_cube2.png", "zf_cube3.png", "zf_cube4.png", "zf_cube5.png", "zf_cube6.png", "zf_cubeBg.jpg", "zf_cubeTip.png", "zf_emploment.png", "zf_messageArrow1.png", "zf_messageArrow2.png", "zf_messageChat.png", "zf_messageKeyboard.png", "zf_messageLogo.png", "zf_messageStudent.png", "zf_outline.png", "zf_phoneBg.jpg", "zf_phoneDetail.png", "zf_phoneListen.png", "zf_phoneLogo.png", "zf_return.png", "zf_style1.jpg", "zf_style2.jpg", "zf_style3.jpg", "zf_styleTip1.png", "zf_styleTip2.png",  "zf_teacherTip.png"];

    var curNum = 0,
        total = ary.length;

    var $loading = $('.loading'),
        $progress = $loading.children('.progress'),
        $progressSpan = $progress.children('span');

    return {
        init: function () {
            //->JQ中的EACH和原生中的forEach参数是相反的
            $.each(ary, function (index, item) {
                var oImg = new Image;
                oImg.src = 'img/' + item;
                oImg.onload = function () {
                    oImg = null;
                    var n = (++curNum) / total;
                    $progressSpan.css('width', n * 100 + '%');
                    //->当所有的图片都加载完成后,我们让LOADING层消失(设置一个1S的延迟,防止网速过快,LOADING层看不见或者层闪烁问题)
                    if (curNum === total) {
                        window.setTimeout(function () {
                            phoneRender.init();//->LOADING结束,PHONE开始
                            $loading.css('opacity', 0).on('webkitTransitionEnd', function () {
                                $(this).remove();
                            });
                        }, 1500);
                    }
                }
            });
        }
    }
})();

/*--PHONE--*/
var phoneRender = (function () {
    var $phone = $('.phone'),
        $time = $phone.find('.time'),
        $listen = $phone.find('.listen'),
        $listenTouch = $listen.find('.touch'),
        $detail = $phone.find('.detail'),
        $detailTouch = $detail.find('span');

    var phoneBell = $('#phoneBell')[0],
        phoneSay = $('#phoneSay')[0];//->把JQ对象转换为原生JS对象,因为AUDIO中的很多属性和方法都是原生的,我们需要使用原生对象调取

    //->LISTEN区域绑定点击事件
    function listenTouchFn() {
        $listen.remove();
        $detail.css('transform', 'translateY(0)');//->换成原生JS的写法：$detail[0].style.webkitTransform='translateY(0)'

        phoneBell.pause();
        $(phoneBell).remove();

        phoneSay.play();
        phoneSay.oncanplay = bindTime;//->canplay:当前音频可以播放了的事件
    }

    //->计时
    function bindTime() {
        $time.css('display', 'block');
        var duration = phoneSay.duration;

        var timer = window.setInterval(function () {
            var curTime = phoneSay.currentTime,
                minute = Math.floor(curTime / 60),
                second = Math.floor(curTime - minute * 60);
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(minute + ':' + second);

            //->结束
            if (curTime >= duration) {
                //->关闭PHONE,展开MESSAGE
                closePhone();
                window.clearInterval(timer);
            }
        }, 1000);
    }

    //->关闭PHONE,展开MESSAGE
    function closePhone() {
        phoneSay.pause();
        $(phoneSay).remove();

        $phone.css('transform', 'translateY(' + document.documentElement.clientHeight + 'px)').on('webkitTransitionEnd', function () {
            //->PHONE消失
            $(this).remove();

            //->MESSAGE展示
            messageRender.init();
        });
    }

    return {
        init: function () {
            $phone.css('display', 'block');

            //->BELL音频播放
            phoneBell.play();

            //->LISTEN区域绑定点击事件:移动端不使用CLICK事件,因为CLICK事件有300MS延迟(点击到触发有300MS的间隔)，我们使用ZP中提供的专用方法TAP(JQ中没有)
            $listenTouch.tap(listenTouchFn);

            //->DETAIL TOUCH点击事件
            $detailTouch.tap(closePhone);
        }
    }
})();

/*--MESSAGE--*/
var messageRender = (function () {
    var $message = $('.message'),
        $messageItem = $message.find('.list'),
        $messageList = $messageItem.find('li'),
        $messageKeyBoard = $message.find('.keyBoard'),
        $messageText = $messageKeyBoard.find('.text'),
        $messageSubmit = $messageKeyBoard.find('.submit'),
        messageMusic = $('#messageMusic')[0];

    var step = -1,
        autoTimer = null,
        isTrigger = false,
        historyH = 0;

    //->消息列表的运动
    function autoMessage() {
        tempFn();
        autoTimer = window.setInterval(tempFn, 1500);
    }

    function tempFn() {
        //->$messageList[step]:JS对象
        //->$messageList.get(step):JS对象
        //->$messageList.eq(step):JQ对象
        var $cur = $messageList.eq(++step);
        $cur.css({
            opacity: 1,
            transform: 'translateY(0)'
        });

        //->move three
        if (step === 2) {
            $cur.on('webkitTransitionEnd', function () {
                /*我们当前的样式属性两个:opacity、transform发生了改变,所以webkitTransitionEnd事件触发两次，会把某一些逻辑触发两次，所以我们需要加次数的判断：记录触发标识即可*/
                if (isTrigger) return;
                isTrigger = true;

                //->显示键盘:完成后执行文字打印机
                $messageKeyBoard
                    .css('transform', 'translateY(0)')
                    .on('webkitTransitionEnd', textPrint);
            });
            window.clearInterval(autoTimer);
            return;
        }

        //->move four
        if (step >= 3) {
            historyH += -$cur.height();
            $messageItem.css('transform', 'translateY(' + historyH + 'px)');
        }

        //->move end
        if (step === $messageList.length - 1) {
            messageMusic.pause();
            $(messageMusic).remove();
            window.clearInterval(autoTimer);

            //->展示魔方区域了(延迟)
            window.setTimeout(function () {
                $message.remove();
                cubeRender.init();
            }, 1500);
        }
    }


    //->文字打印机
    function textPrint() {
        var text = ' 您好,我是刘小树,面试前端工程师',
            n = -1,
            textTimer = null;
        textTimer = window.setInterval(function () {
            $messageText.html($messageText.html() + text[++n]);
            if (n >= text.length - 1) {
                window.clearInterval(textTimer);
                $messageText.html(text);

                //->开启提交按钮的操作
                $messageSubmit
                    .css('display', 'block')
                    .tap(bindSubmit);
            }
        }, 100);
    }

    //->按钮的点击事件
    function bindSubmit() {
        $messageText.html('');
        $messageKeyBoard
            .off('webkitTransitionEnd', textPrint)
            .css('transform', 'translateY(3.7rem)');
        autoMessage();
    }

    return {
        init: function () {
            $message.css('display', 'block');

            //->音乐
            messageMusic.play();

            //->消息列表的运动
            autoMessage(true);
        }
    }
})();

/*--CUBE--*/
/*如果在移动端实现滑动的操作,我们需要阻止IMG和DOCUMENT的默认行为：IMG默认行为是滑动的时候会拖拽图片产生的虚拟图,不是操作当前的元素；DOCUMENT的默认行为是移动端浏览器的所有滑动大部分都是浏览器页卡的切换,我们需要阻止这件事情*/
$(document).add($('img')).on('touchmove', function (e) {
    e.preventDefault();
});
var cubeRender = (function () {
    var $cube = $('.cube'),
        $cubeBox = $cube.find('.cubeBox'),
        $cubeList = $cubeBox.find('li');

    function startFn(e) {
        var point = e.changedTouches[0];
        $(this).attr({
            strX: point.pageX,
            strY: point.pageY,
            changeX: 0,
            changeY: 0,
            isMove: false
        });//->使用JQ或者ZP存储的自定义属性值都是字符串,即使你写的不是,它也会当做字符串去存储,以后通过ATTR方法获取的结果是字符串
    }

    function moveFn(e) {
        var point = e.changedTouches[0];
        var changeX = point.pageX - parseFloat($(this).attr('strX')),
            changeY = point.pageY - parseFloat($(this).attr('strY'));
        $(this).attr({
            changeX: changeX,
            changeY: changeY,
            isMove: (Math.abs(changeX) > 10 || Math.abs(changeY) > 10)
        });
    }

    function endFn(e) {
        var isMove = $(this).attr('isMove');
        if (isMove === 'false') return;

        var changeX = parseFloat($(this).attr('changeX')),
            changeY = parseFloat($(this).attr('changeY'));
        var rotateX = parseFloat($(this).attr('rotateX')),
            rotateY = parseFloat($(this).attr('rotateY'));
        rotateY = rotateY + changeX / 3;
        rotateX = rotateX - changeY / 3;
        $(this).css('transform', 'scale(0.6) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)').attr({
            rotateX: rotateX,
            rotateY: rotateY,//->随时更新自定义属性,保证下一次滑动是基于上一次的角度基础上继续旋转的
            strX: null,
            strY: null,
            changeX: null,
            changeY: null,
            isMove: null//->最好在每一次结束后,把所有自定义的属性都初始化一下,下一次操作所有的属性值从新开始
        });
    }

    return {
        init: function () {
            $cube.css('display', 'block');

            //->存储当前的旋转角度,下一次基于这个角度再次旋转
            $cubeBox.attr({
                rotateX: 35,
                rotateY: 45
            }).on('touchstart', startFn)
                .on('touchmove', moveFn)
                .on('touchend', endFn);

            //->给每一个页面绑定点击事件,点击的时候进入指定的详情页
            $cubeList.tap(function () {
                $cube.css('display', 'none');
                swiperRender.init($(this).index());
            });
        }
    }
})();

/*--SWIPER--*/
var swiperRender = (function () {
    var $swiperContainer = $('.swiper-container'),
        $return = $swiperContainer.find('.return');

    var swipeExample = null,
        $course = $('.course');

    function moveFn(example) {
        //->example:回调函数中传递的参数值,代表当前SWIPER的实例
        var slideAry = example.slides,//->获取所有的滑动块
            index = example.activeIndex;//->获取当前活动块的索引

        /*--基于makisu插件实现3D折叠效果--*/
        if (index === 0) {
            $course.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            });
            $course.makisu('open');
        } else {
            $course.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0
            });
            $course.makisu('close');
        }

        /*--
         滑动到具体区域,让子元素实现动画
         ->在CSS中给每一个区域子元素的动画都写在 #page? 下，例如：第二个页面所有的动画都写在 #page2 下
         开始给所有需要运动的元素透明度设置为0 .page?
         当动画结束的时候让透明度变为1 @keyframes

         ->在每一次JS切换完成后，我们给当前的这个活动块加一个ID #page?，例如：索引为1的时候,我们给当前的互动块加入的ID是 #page2
         --*/
        $.each(slideAry, function (n, item) {
            item.id = index === n ? 'page' + (index + 1) : null;
        });
    }

    return {
        init: function (index) {
            index = index || 0;
            $swiperContainer.css('display', 'block');

            //->实现六个页面之间的切换
            swipeExample = new Swiper('.swiper-container', {
                effect: 'coverflow',
                onInit: moveFn,//->当SWIPER初始化完成:实现了切换功能,也定位到具体的某一个页面了,这样就是初始化成功
                onSlideChangeEnd: moveFn//->当每一个SLIDE切换结束的时候
            });
            swipeExample.slideTo(index, 0);//->直接滚动到具体的某一个切换卡区域,第一个参数是索引,第二个参数是运动时间,写零是立即切换到这个区域

            //->返回按钮的操作
            $return.tap(function () {
                $swiperContainer.css('display', 'none');
                $('.cube').css('display', 'block');
            });
        }
    }
})();

loadingRender.init();
$(document).ready(function(e) {

    var unslider04 = $('#b04').unslider({

            dots: true

        }),

        data04 = unslider04.data('unslider');



    $('.unslider-arrow04').click(function() {

        var fn = this.className.split(' ')[1];

        data04[fn]();

    });

});





