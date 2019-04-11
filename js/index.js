/**
 * 关于audio的一些常用属性
 *      duration: 播放的总时间
 *      currentTime: 当前已经播放的时间
 *      ended: 是否已经播放完成
 *      paused: 当前是否为暂停状态
 *      volume: 控制音量(0~1)
 * 方法:
 *      pause()暂停
 *      play()播放
 *      
 *  事件：
 *      canplay: 可以正常播放(但是播放过程中可能出现卡顿)
 *      canplaythrough: 资源加载完毕,可以顺畅的播放
 *      ended: 播放完成
 *      loadedmetadata: 资源的基础信息已经加载完成
 *      loadeddata: 整个资源都加载完成
 *      pause: 触发了暂停
 *      play: 触发了播放
 *      playing: 正在播放
 */
// click在移动端中属于单击事件，就是在300ms内检测点击几次，所以在移动端使用click会有300ms的延迟

// LOADING  都封装成高级单利模式
let loadingRender = (function() {
    
    let $loadingBox = $('.loadingBox'),
    $current = $loadingBox.find('.current');

    let imgData = ["img/11111.jpg","img/1111111111111111111111111.jpg","img/arrowl.png","img/arrowr.png","img/dhl.png","img/icon.png","img/nuli.jpg","img/nuli1.jpg","img/wjh.jpg","img/yn.jpg","img/z .jpg","img/zf_concatAddress.png","img/zf_concatInfo.png","img/zf_concatPhone.png","img/zf_course.png","img/zf_course1.png","img/zf_course2.png","img/zf_course3.png","img/zf_course4.png","img/zf_course5.png","img/zf_course6.png","img/zf_cube1.png","img/zf_cube2.png","img/zf_cube3.png","img/zf_cube4.png","img/zf_cube5.png","img/zf_cube6.png","img/zf_cubeBg.jpg","img/zf_cubeTip.png","img/zf_emploment.png","img/zf_messageArrow1.png","img/zf_messageArrow2.png","img/zf_messageChat.png","img/zf_messageKeyboard.png","img/zf_messageLogo.png","img/zf_messageStudent.png","img/zf_outline.png","img/zf_phoneBg.jpg","img/zf_phoneDetail.png","img/zf_phoneListen.png","img/zf_phoneLogo.png","img/zf_return.png","img/zf_style1.jpg","img/zf_style2.jpg","img/zf_style3.jpg","img/zf_styleTip1.png","img/zf_styleTip2.png"];

    // 加载图片
    let n = 0,
            len = imgData.length;
    let run = function run(callback) {
        imgData.forEach((item)=>{
            let imgObj = new Image();
            imgObj.onload = ()=>{
                imgObj = null;
                $current.css('width', ++n/len * 100 + '%');
                if (n === len) {
                    clearTimeout(delayTime);
                    callback && callback();
                }
            }
            imgObj.src = item;
        })
    }

    // Max-DELAY: 设置最长等待时间(假设等待10S了,如果已经加载90%,我们可以正常访问内容,若不足这个比例，则直接提示当前用户状态不佳,请稍后重试)
    let delayTime = null;
    let maxDelay = function maxDelay(callback) {
        delayTime = setTimeout(()=>{
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('非常遗憾，当前你的网络状况不佳，请稍后再试！');
            // 此时我们不应该继续加载图片,而是关掉页面或者跳转到其他页面
            window.location.href = 'http://www.baidu.com';
        }, 10000);
    }

    // Done
    let done = function done(){
        // 停留一秒在移除元素, 进入下一个环节
        let timer = setTimeout(function(){
            $loadingBox.remove();

            // 进入phoneRender
            phoneRender.init();
        }, 1500);
    }

    return {
        init: ()=>{
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

// PHONE
let phoneRender = (function() {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('.time'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        // 音频元素转为dom元素,好用dom操作
        answerBell = $("#answerBell")[0],
        introduction = $('#introduction')[0];
    
    let answerMarkTouch = function answerMarkTouch() {
        // 移除answer
        $answer.remove();
        // 先暂停在移除，否则浏览器还会继续播放
        answerBell.pause();
        $(answerBell).remove();

        // 让hang显示
        $hang.css('display', 'block');
        $hang.css('transform', 'translateY(0rem)');
        $time.css('display', 'block');
        introduction.play();
        introduction.volume = 0.1;
        //autoTime();
    }

    // 计算播放时间
    let autoTimer = null;
    let autoTime = function autoTime() {
        // 这里我们让audio播放,首先回去加载资源,部分资源加载完成才会播放,才会计算出总时间duration的信息,
        // 所以我们可以我们可以把获取信息放到canplay事件中
        let duration = 0;
        /* introduction.oncanplay = function() {
            duration = introduction.duration;// 23
        } */
        autoTimer = setInterval(function(){
            // 在这里获取duration也可以，因为定时器时异步操作，资源加载完成才会执行定时器
            let duration = introduction.duration;
            let val = introduction.currentTime;
            if (val >= duration) {
                clearInterval(autoTimer);
                console.log('关闭phone');
                closePhone();
                return;
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60);
                minute = minute < 10 ? '0' + minute : minute;
                second = second < 10 ? '0' + second : second;
                $time.html(`${minute}:${second}`);
        }, 1000);
    }

    // 关闭phone
    let closePhone = function closePhone() {
        // 停止定时器，音乐暂停，移除， 移除phonebox
        //clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        // 进入messageRender
        messageRender.init();
    }

    return {
        init: function(){
            $phoneBox.css('display', 'block');
            // 播放铃声
            answerBell.play();
            answerBell.volume = 0.1;
            //console.dir(answerBell);//在控制台中显示指定JavaScript对象的属性
            // 点击事件
            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        }
    }
})();

// MESSAGE
let messageRender = (function() {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        demoMusic = $('#demoMusic')[0];
    
    let step = -1,
        total = $messageList.length + 1,
        interval = 1500,
        autoTimer = null;
    
    let showMessage = function() {
        ++step;
        if (step === 2) {
            // 出来两条了，第三条手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }

        let $cur = $messageList.eq(step);
        $cur.addClass('active');

        if (step >= 3) {
            // 展示的条数已经是四条或四条以上,此时我们让wrapper向上移动最新一条的高度
            let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH);
        }

        if (step >= total-1) {
            console.log("step: " + step);
            console.log("total: " + (total-1));
            clearInterval(autoTimer);
            closeMessage();
            return;
        }
    }

    let handleSend = function handleSend() {
        $keyBoard.css({transform: 'translateY(0)'}).one('webkitTransitionEnd', function() {
            let str = '好的，马上介绍！',
                n = -1,
                textTimer = null;
            textTimer = setInterval(function() {
                $textInp.html($textInp.html() + str[++n]);
                if (n >= str.length - 1) {
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 100);
        });
    }

    let handleSubmit = function handleSubmit() {
        // 将新添加的li放到第二个li的后面
        $(`<li class="self"><i class="arrow"></i><img src="./img/zf_messageStudent.png" alt="" class="pic">${$textInp.html()}</li>`)
        .insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li');// 增加li后，重新获取list

        $textInp.html('');
        $submit.css('display', 'block');
        $keyBoard.css('transform', 'translateY(3.7rem)');

        // 继续执行showMessage
        autoTimer = setInterval(showMessage, interval);
    };

    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(()=>{
            demoMusic.pause();
            $(demoMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);

            // 进入cube
            cubeRender.init();
        }, interval);
    }
    
    return {
        init: function() {
            $messageBox.css('display', 'block');
            demoMusic.play();
            demoMusic.volume = 0.1;
            showMessage();
            autoTimer = setInterval(showMessage, interval);
            // tap会执行两次找到zepto源码，把touchend改为touchEnd即可
            $submit.tap(handleSubmit);
        }
    }
})();

// CUBE
let cubeRender = (function() {
    let $cubeBox = $('.cubeBox'),
        $cube = $cubeBox.find('.cube'),
        $cubeList = $cube.find('li');

    let start = function start(event) {
        // 记录手指初始位置
        let point = event.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    }
    let move = function move(event) {
        // 记录x、y轴偏移，用最新手指位置-初始手指位置
        let point = event.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    }
    let end = function end(event) {
        // 获取change和rotale值
        let {changeX, changeY, rotateX, rotateY} = this,
            isMove = false;
        // 判断是否滑动，如偏移值小于10px,则认为没有滑动
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        // 发生移动再处理
        if (isMove) {
            // 左右滑=>change-X=>rotate-Y(正比change越大,rotate越大)
            // 上下滑=>change-Y=>rotate-X(反比change越小,rotate越小)
            // 为了让每一次的选择角度小一点，我们可以把移动距离的1/3作为旋转角度
            rotateX = rotateX - changeY / 3;
            rotateY = rotateY + changeX / 3;
            // 赋值为魔方
            $(this).css('transform', `scale(.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
        // 清空无用属性
        ['strX', 'strY', 'changeX', 'changeY'].forEach((item)=>{
            this[item] = null;
        });
        isMove = null;
    }

    return {
        init: function() {
            $cubeBox.css('display', 'block');
            // 手指操作CUBE,让CUBE跟着旋转
            let cube = $cube[0];
            cube.rotateX = -35;
            cube.rotateY = 35;//记录出事旋转角度,存储到自定义属性上
            $cube.on('touchstart', start)
                 .on('touchmove', move)
                 .on('touchend', end);
            // 点击每一个面，隐藏魔方，跳转到对应详情页
            $cubeList.tap(function() {
                $cubeBox.css('display', 'none');
                $index = $(this).index();
                detailRender.init($index);
            });
        }
    }
})();

// DEATAIL
let detailRender = (function() {
    let $detailBox = $('.detailBox'),
        swiper = null,
        $dl = $('.page1>dl');
    
        let swiperInit = function swiperInit() {
            swiper = new Swiper('.swiper-container', {
                effect : 'coverflow',
                onInit: move,
                onTransitionEnd: move,// 切换动画完成执行的回调函数, 参数时当前初始化的实例
            });
            // 实例的私有属性
            // activeIndex 当前活动板块的索引
            // slide 获取所有的slide(数组)
            // 实力的公有方法
            // slideTo 切换到指定索引的slide
        }
        let move = function move(swiper) {
            //swiper:当前创建的实例
            //判断当前页是否时第一页，若是则让3D展开，如不是则让3D关闭
            let activeIn = swiper.activeIndex,
                slideAry = swiper.slides;
            if (activeIn === 0) {
                // 实现折叠效果
                $dl.makisu({
                    selector: 'dd',
                    overlap: 0.6,
                    speed: 0.8
                });
                $dl.makisu('open');
            } else {
                $dl.makisu({
                    selector: 'dd',
                    //overlap: 0.6,快速关闭不需要折叠了
                    speed: 0
                });
                $dl.makisu('close');
            }
            // 滑动到哪个页面，把当前页面设置为对应ID即可，其余页面移除ID即可
            $.each(slideAry, function(index, item) {
                if (activeIn === index) {
                    item.id = `page${index + 1}`;
                    return;
                }
                item.id = null;
            })
        }

    return {
        init: function(index = 0) {
            $detailBox.css('display', 'block');
            if (! swiper) {//防止重复初始化
                swiperInit();
            }
            // 直接运动到指定板块，第二个参数是切换的速度，0是立即切换没有切换动画效果
            swiper.slideTo(index, 0);
        }
    }
})();

// 在真实项目中，如果页面中右滑动的需求，我们一定要把DOCUMENT本身滑动的默认行为阻止掉(不阻止，在浏览器中预览，会触发下拉率先你的事件或左右滑动切换页卡等功能)
/* $(document).on('touchstart touchmove touchend', (event)=>{
    event.preventDefault();
}); */

