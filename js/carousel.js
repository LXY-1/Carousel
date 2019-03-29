 /**
  * @description:轮播构建函数 ：里面进行一些必要参数的初始化、参数配置以及相关的轮播需要的功能模块,相关模块划分一个个函数，方便根据函数名来查找对应的功能逻辑代码，方便维护
  * @param {type} option:{loop,direction,arrow,pagination,autoPlay,speed,initialSlide}
  * @return: 
  */
 const carousleSlide = (function () {
     
    return function carousle(option) {

         let optionDefault = {
             loop: true,
             direction: 'left',
             arrow: true, //是否使用左右箭头，默认是true
             pagination: true, // 是否使用分页器，默认是true
             autoPlay: true,
             speed: 300,
             initialSlide: false
         }
         option = Object.assign(optionDefault, option);
         console.log(option);

         // 初始化轮播容器的宽度
         let carouselWrap = document.getElementById('carousel-wrap');
         let carouselItem = document.getElementsByClassName('carousel-item');
         let containerWidth = document.getElementById('carousel-container').offsetWidth;

         // 轮播移动动画需要的相关变量
         let leftSize = 0;
         let count = 1;
         let indexVal = 0; //所以根据count计算
         let isEnd = false;
         let isFullPic =
             true; //变量：判断是否一张图片已经完整切换完成了:这里是为了维护：定时切换、左箭头按钮、右箭头按钮直接调用轮播move动画（内部由两个定时器维护)的时候产生的定时器胡乱，就是定时器重叠了。


         if (option.loop) {
             // 开启loop模式，所以需要再追加一个同第一个item重复的div结构 
             let cloneNode = carouselItem[0].cloneNode(true);
             carouselWrap.appendChild(cloneNode);

         }
         // 轮播的项目个数（包括开启loop模式的时候多添加的一个）
         let len = carouselItem.length;

         // 获取实际分页节点个数:不管是开不开启loop分页实际分页节点的个数就是正真有效的轮播图张数
         function getPaginationNum() {
             return option.loop ? (len - 1) : len;
         }

         // 判断是否开启分页器，是的话追加分页器dom
         if (option.pagination) {
             let num = getPaginationNum();
             console.log(num);
             let paginationWrap = document.getElementById('pagination-wrap');
             let htmlString = '';
             for (let i = 0; i < num; i++) {
                 htmlString += '<span class="pagination-item"></span>';

             }
             paginationWrap.innerHTML = htmlString;
         }

         // 设置每一个轮播item的大小，取决于轮播container层
         for (let i = 0; i < len; i++) {
             carouselItem[i].style.width = containerWidth + 'px';
         }
         carouselWrap.style.width = containerWidth * len + 'px';



         // 判断传入的initialSlide是否是有效值
         function isTrueInitialSlide() {
             if (getPaginationNum() - 1 < option.initialSlide || -1 >= option.initialSlide) {
                 console.warn('设置的初始化索引范围不正确,使用默认索引');
                 return false;
             } else {
                 return true;
             }
         }

         // 显示初始化轮播播放图片以及设置对应初始化的分页器索引:如果不传initialSlide的话采用默认的,如果设置了采用设置的
         function initCarouselItem() {
             if (option.initialSlide && isTrueInitialSlide()) {
                 carouselWrap.style.left = -containerWidth * option.initialSlide + 'px';
                 leftSize = -containerWidth * option.initialSlide;
                 count = option.initialSlide + 1;
                 indexVal = option.initialSlide;
             } else {
                 // 默认的只需要设置当direction是right的时候采用最后一张图片
                 if (option.direction === 'right') {
                     carouselWrap.style.left = -containerWidth * (len - 1) + 'px';
                     leftSize = -containerWidth * (len - 1);
                     count = len;
                     indexVal = option.loop ? len - 2 : len - 1;
                 }
             }
         }
         initCarouselItem();



         /**
          * @description:轮播图座移动的：具体移动逻辑控制模块：接收direction参数：可以切换方向进行移动， 
          * @param {type}：direction 控制方向
          * @return: 
          */
         function move(direction) {
             let s2, s3; //保存计时器的变量，方便在需要的时候(左右切换的时候)及时销毁相关的计时器。使用s2['0']来判断计时器是否已经被消除
             console.log(direction);

             if (direction === 'left') {
                 // 清除上一个定时器的影响
                 clearInterval(s2);
                 clearInterval(s3);
                 if (!isEnd) {

                     /**
                      * @description: 轮播移动动画效果计时器：控制每隔多少时间：移动多少距离。判断完整移动完一张图片的标指，以及控制loop模式还有非loop模式的实现（非loop模式需要快速切换会第一张所以使用了第三个计时器）
                      * @param {type} 
                      * @return: 
                      */
                     s2 = setInterval(() => {
                         console.log('left');
                         // 第一个判断是用于判断是否完整滚动好一张图片，是的话清除计时器s2，以及赋值完整的left（-containerWidth * count + 'px';），以便消除计算出现的误差
                         if (leftSize <= -containerWidth * count) {


                             carouselWrap.style.left = -containerWidth * count + 'px';
                             isFullPic = true;
                             count++;
                             clearInterval(s2);
                             return;
                         }
                         //  第二个判断是用于判断图片到达最后一张的情况，以便进行特殊处理：loop模式处理或者是重新快速的滚动回到第一张图片
                         if (count === len) {
                             if (option.loop) {
                                 //开启无限滚动模式
                                 leftSize = 0; //之后重新开始计时滚动滚动
                                 count = 1;
                                 carouselWrap.style.left = '0px';
                                 console.log(carouselWrap.style.left);
                                 // 重新回到第一张明，且完整滚动好一张图片
                                 isFullPic = true;
                                 console.log(count);

                             } else {
                                 // 最外层定时器过时间后快速滚到第一张，下面是设置bol变量
                                 isEnd = true;
                                 isFullPic = true;
                                 clearInterval(s2);
                                 return;

                             }
                         }
                         // 还没有切换到完整的图片
                         isFullPic = false;
                         leftSize -= containerWidth / 10;
                         console.log(leftSize)
                         carouselWrap.style.left = leftSize + 'px';
                     }, 60);
                 } else {
                     // !不开启loop且已经滚动到最后一张,此时快速滚动到第一张
                     s3 = setInterval(() => {
                         if (leftSize > -5) {
                             leftSize = 0;
                             carouselWrap.style.left = leftSize + 'px';
                             clearInterval(s3);
                             isEnd = false;
                             count = 1;
                             isFullPic = true;
                             return;
                         }
                         isFullPic = false;
                         leftSize += containerWidth / 10;
                         carouselWrap.style.left = leftSize + 'px';
                     }, 10);
                 }
             } else {
                 // 清除上一个定时器的影响
                 clearInterval(s2);
                 clearInterval(s3);

                 if (!isEnd) {
                     /**
                      * @description: 轮播移动动画效果计时器：控制每隔多少时间：移动多少距离。判断完整移动完一张图片的标指，以及控制loop模式还有非loop模式的实现（非loop模式需要快速切换会第一张所以使用了第三个计时器）右边的范围是：-4500 到 0 ：第6张图片到第一张图片: count 为3的时候：left是-1800 ，，-900 isPublic 共享
                      * @param {type} 
                      * @return: 
                      */
                     s2 = setInterval(() => {
                         console.log('right');

                         // 第一个判断是用于判断是否完整滚动好一张图片，是的话清除计时器s2，以及赋值完整的left（-containerWidth * count + 'px';），以便消除计算出现的误差
                         //  右边切换的loop模式暂时不考虑，也就是到达第一张之后就无法再进行右切换，等待定时器切换或者向左边切换。 第二个判断是用于判断图片到达第一一张的情况，以便进行特殊处理：loop模式处理或者是重新快速的滚动回到第一张图片
                         if (count === 1) {

                             if (option.loop) {
                                 //开启无限滚动模式
                                 leftSize = -containerWidth * (len - 1); //之后重新开始计时滚动滚动
                                 count = len;
                                 carouselWrap.style.left = -containerWidth * (len - 1) + 'px';
                                 console.log(carouselWrap.style.left);
                                 // 重新回到第一张明，且完整滚动好一张图片
                                 isFullPic = true;
                                 console.log(count);

                             } else {

                                 // 最外层定时器过时间后快速滚到第一张，下面是设置bol变量
                                 isEnd = true;
                                 isFullPic = true;
                                 clearInterval(s2);
                                 return;

                             }
                             return;
                         }

                         if (leftSize >= -containerWidth * (count - 2)) {
                             carouselWrap.style.left = -containerWidth * (count - 2) + 'px';
                             isFullPic = true;
                             count--;
                             clearInterval(s2);
                             return;
                         }

                         // 还没有切换到完整的图片
                         isFullPic = false;
                         leftSize += containerWidth / 10;
                         // console.log(leftSize)
                         carouselWrap.style.left = leftSize + 'px';
                     }, 60);
                 } else {
                     // !不开启loop且已经滚动到最后一张,此时快速滚动到第一张
                     s3 = setInterval(() => {
                         if (leftSize < -containerWidth * (len - 1) + 5) {
                             leftSize = -containerWidth * (len - 1);
                             carouselWrap.style.left = leftSize + 'px';
                             clearInterval(s3);
                             isEnd = false;
                             count = len;
                             isFullPic = true;
                             return;
                         }
                         isFullPic = false;
                         leftSize -= containerWidth / 10;
                         carouselWrap.style.left = leftSize + 'px';
                     }, 10);
                 }



             }


         } // move函数结束：实现轮播动画的左右移动逻辑功能


         // 定时轮播
         if (option.autoPlay) {
             let timeNum = option.autoPlay === true ? 4000 : option.autoPlay;
             let s1 = setInterval(() => {
                 if (isFullPic) {
                     // 一张图片已经滚动好了可以继续切换
                     move(option.direction);
                     if (!isEnd) { // 非loop模式的时候滚动回去，不执行切换
                         let ind = getInd();
                         console.log(ind)
                         paginationActive(ind);
                     }

                     isFullPic = false;
                 }
             }, timeNum)
         }


         // 点击右边箭头调用
         function moveRight() {
             if (isFullPic) {
                 // 一张图片已经滚动好了可以继续切换
                 move('left');
                 let ind = getIndRight();
                 console.log(ind);
                 paginationActive(ind);
                 isFullPic = false;
             }

         }

         // 点击左边箭头调用
         function moveLeft() {
             if (isFullPic) {
                 // 一张图片已经滚动好了可以继续切换
                 move('right');
                 let ind = getIndLeft();
                 console.log(ind);

                 paginationActive(ind);
                 isFullPic = false;
             }
         }

         // 点击分页播放按钮的时候切换移动图片
         function paginationMove() {
             console.log(this.index);
             let EleInd = this.index;
             if (indexVal != EleInd) {
                 // 当点击的分页按钮的索引比当前的索引大的时候，此时相当于调用（点击的索引 - 当前的索引次数的）:move('left')
                 let minuteVal = EleInd - indexVal;
                 let directionVal = minuteVal > 0 ? 'left' : 'right';
                 let numVal = Math.abs(minuteVal);
                 for (let k = 0; k < numVal; k++) {
                     move(directionVal);
                 }
                 indexVal = EleInd;
                 paginationActive(indexVal);
             }
         }



         /*   箭头切换
          * 01点击做左边切换按钮,需要处理一个问题就是：鼠标点击切换轮播图的防抖动处理：防止快速多次的点击导致轮播图的疯狂切换
          **所以需要在轮播图图片完整切换好之前禁止鼠标点击
          ** 02 每次鼠标点击切换之后最外层也就是s1定时器需要重新计时，不能再累加
          */
         if (option.arrow) {
             document.getElementById('right-arrow').onclick = moveRight;

             document.getElementById('left-arrow').onclick = moveLeft;
         }

         // 轮播分页器
         if (option.pagination) {
             // 初始化轮播分页器的样式:判断option.initialSlide属性，来设置初始化是轮播item索引是使用默认的还是用户自定义的
             let paginations = document.getElementById('pagination-wrap').getElementsByClassName('pagination-item');
             paginations[indexVal].className += ' active';
             // 播放分页器点击效果
             for (let i = 0; i < paginations.length; i++) {
                 // 为了获取点击分页按钮对应的索引值
                 paginations[i].index = i;
                 paginations[i].onclick = paginationMove;
             }
         }
         // 轮播分页器样式切换
         function paginationActive(ind) {
             let paginations = document.getElementById('pagination-wrap').getElementsByClassName('pagination-item');

             //判断元素是否有active class
             function hasClass(elements, cName) {
                 return !!elements.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
             }
             // 删除当前元素的activeClass:先判断是否有对应的className
             function remove(elements, cName) {
                 if (hasClass(elements, cName)) {
                     elements.className = elements.className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"),
                         " "); // replace方法是替换
                 }
             }

             //添加className
             function addClass(elements, cName) {
                 elements.className = elements.className + ' ' + cName;
             }

             // 遍历分页器元素删除当前的有active的class
             for (let i = 0; i < paginations.length; i++) {
                 remove(paginations[i], 'active');

             }

             // 给当前切换的分页器按钮加上active
             addClass(paginations[ind], 'active');
         }

         // 判断下一次轮播分页器的对应索引值
         function getInd() {
             // 获取真实分页节点数目
             let num = getPaginationNum();
             // 多出一张：比如4张图片的，现在是五张，且这里count是1-5：所以对应的分页节点索引入戏:
             if (option.direction === 'left') {
                 //   count:1-5 分页节点是：2,3,4 :这里len 与 len-1都是临界状态
                 indexVal++;
                 if (indexVal === num) {
                     indexVal = 0;
                     return indexVal;
                 }
                 console.log(indexVal);
                 return indexVal;

             } else {
                 indexVal--;
                 if (indexVal === -1) {
                     indexVal = num - 1;
                     return indexVal;
                 }
                 return indexVal;
             }
         }

         /**
          * @description:点击右边播放按钮的时候，使用上面获取分页节点index出错，下面是专门针对右边按钮点击切换的
          * @param {type} 
          * @return: 
          */
         function getIndRight() {
             // 获取实际的分页节点个数
             let num = getPaginationNum();
             indexVal++
             if (indexVal === num) {
                 indexVal = 0;
                 return indexVal;
             }
             return indexVal;

         }
         /**
          * @description:点击左边播放按钮的时候，使用上面getInd获取分页节点index出错，下面是专门针对左边按钮点击切换的
          * @param {type} 
          * @return: 
          */
         function getIndLeft() {
             // 获取实际的分页节点个数
             let num = getPaginationNum();
             indexVal--
             if (indexVal === -1) {
                 indexVal = getPaginationNum() - 1;
                 return indexVal;
             }
             return indexVal;

         }


     }
 })()