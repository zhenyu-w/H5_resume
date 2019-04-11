let messageRender = (function(){
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        demoMusic = $('#demoMusic')[0];
    
    let step = -1,
        total = $messageList.length + 1,// 自己加了一条所以总数+1
        autoTimer = null,
        interval = 1500,
        historyH = 0;

    let showMessage = function showMessage() {
        ++step;
        
        if (step === 2) {
            // 当出来两条后，就停止定时器，让键盘出来，手动发送(2S后键盘显示，如果想要键盘立刻显示，可以写在下面，让step=1的时候就紧跟着显示出来)
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');

        // 展示的条数已经是四条或以上了,此时我们让wrapper向上移动(移动的距离为新展示的LI的高度)
        if (step >= 3) {
            /* let curH = $cur[0].offsetHeight,
                wrapT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wrapT - curH); */
            let curH = $cur[0].offsetHeight;
            historyH -= curH;
            $wrapper.css('transform', `translateY(${historyH}px)`);
        }

        // LI展示完了,清除定时器,清楚message页面
        if (step === total-1) {
            clearInterval(autoTimer);
            closeMessage();
        }
    }

    let handleSend = function handleSend() {
        $keyBoard.css('transform', 'translateY(0rem)').one('webkitTransitionEnd', function(){
            // 开启文字打印机效果,transitionend=>监听动画结束的事件(并且这里使用on绑定事件，那么css有几个样式改变，事件就会触发几次，注意！！！)
            // 或者使用one方法绑定事件，这样就只会触发一次
            let str = '好的，马上介绍！',
                n = -1,
                textTimer = null;
            textTimer = setInterval(function() {
                let orginHTML = $textInp.html();
                $textInp.html(orginHTML + str[++n]);
                if (n >= (str.length - 1)) {
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                    $submit.tap(handleSubmit);
                }
            }, 100);

        });
        
    }

    let handleSubmit = function handleSubmit() {
        console.log('点击发送');
        // 将新添加的li放到第二个li的后面
        $(`<li class="self"><i class="arrow"></i><img src="./img/zf_messageStudent.png" alt="" class="pic">${$textInp.html()}</li>`)
        .insertAfter($messageList.eq(1)).addClass('active');

        // 重新获取$messageList,让$messageList和页面中的LI正对应，方便以后根据索引展示对应LI
        $messageList = null;
        $messageList = $wrapper.find('li');

        // 文字、send按钮消失、键盘滑倒底下
        $textInp.html('');
        $submit.css('display', 'none');
        // 上面如果用了on而不是one，那么这里执行动画的时候，上面transitionend也会触发
        $keyBoard.css('transform', 'translateY(3.7rem)');

        // 继续展示下面的li,重新开启定时器
        autoTimer = setInterval(showMessage, interval);
    }

    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(function() {
            demoMusic.pause();
            $(demoMusic).remove();
            $messageBox.remove();
            // 清除自己
            clearTimeout(delayTimer);

            // 进入下一个板块
            //cubeRender.init();
        }, interval);
    }

    return {
        init: function(){
            $messageBox.css('display', 'block');
            showMessage();
            autoTimer = setInterval(showMessage, interval);
            
            demoMusic.play();
            demoMusic.volume = 0.3;
        }
    }
})();