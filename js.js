/**
 * Created by Lenovo on 2016/9/13.
 */

//显示和隐藏
function show(ele){
    ele.style.display = "block";
}
function hide(ele){
    ele.style.display = "none";
}

/**
 * 获取元素样式兼容写法
 * @param ele
 * @param attr
 * @returns {*}
 */
function getStyle(ele,attr){
    if(window.getComputedStyle){
        return window.getComputedStyle(ele,null)[attr];
    }
    return ele.currentStyle[attr];
}

//参数变为3个
//参数变为3个
function animate(ele,json,fn){
    //先清定时器
    clearInterval(ele.timer);
    ele.timer = setInterval(function () {
        //开闭原则
        var bool = true;


        //遍历属性和值，分别单独处理json
        //attr == k(键)    target == json[k](值)
        for(var k in json){
            //四部
            var leader;
            //判断如果属性为opacity的时候特殊获取值
            if(k === "opacity"){
                leader = getStyle(ele,k)*100 || 1;
            }else{
                leader = parseInt(getStyle(ele,k)) || 0;
            }

            //1.获取步长
            var step = (json[k] - leader)/10;
            //2.二次加工步长
            step = step>0?Math.ceil(step):Math.floor(step);
            leader = leader + step;
            //3.赋值
            //特殊情况特殊赋值
            if(k === "opacity"){
                ele.style[k] = leader/100;
                //兼容IE678
                ele.style.filter = "alpha(opacity="+leader+")";
                //如果是层级，一次行赋值成功，不需要缓动赋值
                //为什么？需求！
            }else if(k === "zIndex"){
                ele.style.zIndex = json[k];
            }else{
                ele.style[k] = leader + "px";
            }
            //4.清除定时器
            //判断: 目标值和当前值的差大于步长，就不能跳出循环
            //不考虑小数的情况：目标位置和当前位置不相等，就不能清除清除定时器。
            if(json[k] !== leader){
                bool = false;
            }
        }
        //只有所有的属性都到了指定位置，bool值才不会变成false；
        if(bool){
            clearInterval(ele.timer);
            //所有程序执行完毕了，现在可以执行回调函数了
            //只有传递了回调函数，才能执行
            if(fn){
                fn();
            }
        }
    },25);
}



//获取屏幕可视区域的宽高
function client(){
    if(window.innerHeight !== undefined){
        return {
            "width": window.innerWidth,
            "height": window.innerHeight
        }
    }else if(document.compatMode === "CSS1Compat"){
        return {
            "width": document.documentElement.clientWidth,
            "height": document.documentElement.clientHeight
        }
    }else{
        return {
            "width": document.body.clientWidth,
            "height": document.body.clientHeight
        }
    }
}

window.onload = function () {
    //需求：鼠标放到小盒子上，让大盒子里面的图片和我们同步等比例移动。
    //技术点：onmouseenter==onmouseover 第一个不冒泡
    //技术点：onmouseleave==onmouseout  第一个不冒泡
    //步骤：
    //1.鼠标放上去显示盒子，移开隐藏盒子。
    //2.老三步和新五步（黄盒子跟随移动）
    //3.右侧的大图片，等比例移动。

    //0.获取相关元素
    var box = document.getElementsByClassName("box")[0];
    var small = box.firstElementChild || box.firstChild;
    var big = box.children[1];
    var mask = small.children[1];
    var bigImg = big.children[0];

    //1.鼠标放上去显示盒子，移开隐藏盒子。(为小盒子绑定事件)
    small.onmouseenter = function () {
        //封装好方法调用：显示元素
        show(mask);
        show(big);
    }
    small.onmouseleave = function () {
        //封装好方法调用：隐藏元素
        hide(mask);
        hide(big);
    }

    //2.老三步和新五步（黄盒子跟随移动）
    //绑定的事件是onmousemove，而事件源是small(只要在小盒子上移动1像素，黄盒子也要跟随)
    small.onmousemove = function (event) {
        //想移动黄盒子，必须知道鼠标在small中的位置。x作为mask的left值，y作mask的top值。
        //新五步
        event = event || window.event;
        var pagex = event.pageX || scroll().left + event.clientX;
        var pagey = event.pageY || scroll().top + event.clientY;
        //让鼠标在黄盒子最中间，减去黄盒子宽高的一半
        var x = pagex - box.offsetLeft - mask.offsetWidth/2;
        var y = pagey - box.offsetTop - mask.offsetHeight/2;
        //限制换盒子的范围
        //left取值为大于0，小盒子的宽-mask的宽。
        if(x<0){
            x = 0;
        }
        if(x>small.offsetWidth-mask.offsetWidth){
            x = small.offsetWidth-mask.offsetWidth;
        }
        //top同理。
        if(y<0){
            y = 0;
        }
        if(y>small.offsetHeight-mask.offsetHeight){
            y = small.offsetHeight-mask.offsetHeight;
        }
        //移动黄盒子
        console.log(small.offsetHeight);
        mask.style.left = x + "px";
        mask.style.top = y + "px";

        //3.右侧的大图片，等比例移动。
        //如何移动大图片？等比例移动。
        //    大图片/大盒子 = 小图片/mask盒子
        //    大图片走的距离/mask走的距离 = （大图片-大盒子）/（小图片-黄盒子）
//                var bili = (bigImg.offsetWidth-big.offsetWidth)/(small.offsetWidth-mask.offsetWidth);

        //大图片走的距离/mask盒子都的距离 = 大图片/小图片
        var bili = bigImg.offsetWidth/small.offsetWidth;

        var xx = bili*x;
        var yy = bili*y;


        bigImg.style.marginTop = -yy+"px";
        bigImg.style.marginLeft = -xx+"px";
    }

    var arr = [
        {   //  1
            width:400,
            top:70,
            left:50,
            opacity:20,
            zIndex:2
        },
        {  // 2
            width:600,
            top:120,
            left:0,
            opacity:80,
            zIndex:3
        },
        {   // 3
            width:800,
            top:100,
            left:200,
            opacity:100,
            zIndex:4
        },
        {  // 4
            width:600,
            top:120,
            left:600,
            opacity:80,
            zIndex:3
        },
        {   //5
            width:400,
            top:70,
            left:750,
            opacity:20,
            zIndex:2
        }
    ];

    //0.获取元素
    var slide = document.getElementById("slide");
    var liArr = slide.getElementsByTagName("li");
    var arrow = slide.children[1];
    var arrowChildren = arrow.children;
    //设置一个开闭原则变量，点击以后修改这个值。
    var flag = true;

    //1.鼠标放到轮播图上，两侧的按钮显示，移开隐藏。
    slide.onmouseenter = function () {
        //arrow.style.opacity = 1;
        animate(arrow,{"opacity":100});
    }
    slide.onmouseleave = function () {
        //arrow.style.opacity = 1;
        animate(arrow,{"opacity":0});
    }

    move();
    //3.把两侧按钮绑定事件。(调用同一个方法，只有一个参数，true为正向旋转，false为反向旋转)
    arrowChildren[0].onclick = function () {
        if(flag){
            flag = false;
            move(false);
        }
    }
    arrowChildren[1].onclick = function () {
        if(flag){
            flag = false;
            move(true);
        }
    }

    //4.书写函数。
    function move(bool){
        //判断：如果等于undefined,那么就不执行这两个if语句
        if(bool === true || bool === false){
            if(bool){
                arr.unshift(arr.pop());
            }else{
                arr.push(arr.shift());
            }
        }
        //在次为页面上的所有li赋值属性，利用缓动框架
        for(var i=0;i<liArr.length;i++){
            animate(liArr[i],arr[i], function () {
                flag = true;
            });
        }
    }

}