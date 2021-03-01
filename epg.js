/*

  author:limeifeng

  date:2021/03/01

*/

/**
 * epg 全局对象
 * @param {Array} params.areaArray 区域对象
 * @param {Number} params.activeAreaIndex  活动的区域对象下标 
 * @param {Number} params.activeFocusIndex 活动的推荐位下标（获得焦点的下标）
 */

function epgPublic(params) {   
  window.epg = {
    areaArray: params.areaArray,    
    activeAreaIndex: params.activeAreaIndex,
    activeFocusIndex: params.activeFocusIndex,

    $: function(params) {    
      return document.getElementById(params);  
    }, 

    // 设置焦点
    setFocus: function () {    
      var activeAreaEvent = (this.areaArray && this.activeFocusIndex !== undefined ) ? this.areaArray[this.activeAreaIndex] : null;  
      activeAreaEvent && this.$(activeAreaEvent.area + this.activeFocusIndex).setAttribute('class', activeAreaEvent.focusClass);
    },

    // 取消焦点
    cancelFocus: function () {      
      this.areaArray && this.activeFocusIndex !== undefined  && this.$(localStorage.getItem('frontFocus')).setAttribute('class',"");    
    }, 

    // 回退回调
    backOff: function () {
      alert('是否回退');
      window.history.back();
    },

    // 确定回调
    determine: function () {
      var activeAreaEvent = this.areaArray[this.activeAreaIndex];
      activeAreaEvent.callBack(epg.activeFocusIndex);
    },

    /**
     * 自定义方法
     * @param {String} direction  按键方向
     * @param {Function} callBack  没有找到相应的自定义推荐位移动配置后，进行回调
     */
    custom: function (params) {
      try {
        var activeAreaEvent = this.areaArray[this.activeAreaIndex];
        var current = activeAreaEvent.focusConfig[params.direction][this.activeFocusIndex];    
        if (current) this.activeAreaIndex =  current['target'], this.activeFocusIndex = current['index'], this.cancelFocus(),this.setFocus();
        else params && params.callBack();
      } catch (error) {
        console.log(error);        
      }
    },

    moveRight: function () {  
      this.custom({direction: 'right', callBack: () => {
        if (this.activeFocusIndex < this.areaArray[this.activeAreaIndex].areaLength -1) this.activeFocusIndex += 1, this.cancelFocus(), this.setFocus();
      }}) 
    },

    moveLeft: function () {
      this.custom({direction: 'left', callBack: () => {
        if (this.activeFocusIndex > 0) this.activeFocusIndex -= 1, this.cancelFocus(), this.setFocus();
      }}) 
    },

    moveTop: function () {    
      this.custom({direction: 'top', callBack: () => {}})  
    },
    
    moveBottom: function () {
      this.custom({direction: 'bottom', callBack: () => {}})    
    }
  }
  // 初始化设置焦点
  epg.setFocus();
}

/**
 * 区域工厂化
 * @param {Number} params.areaLength  区域推荐位长度
 * @param {String} params.area  区域推荐位ID命名:去掉下标（使用时通过活动焦点加上下标）
 * @param {String} params.focusClass  活动的推荐位class
 * @param {Object} params.focusConfig  区域内的推荐位上下左右移动自定义配置
 * @param {Function} params.callBack  区域内的推荐位上点击回调
 */
function area(params) {
  this.areaLength = params.areaLength;
  this.area = params.area;
  this.focusClass = params.focusClass;
  this.callBack = params.callBack;
  if (params.focusConfig) {
    // newFocusConfig.top:{ primary: {target: null, index: null}  {当前下标：{目标区域，目标区域焦点下标}} }
    var newFocusConfig = {top: {}, right: {}, bottom: {}, left: {}};
    for (var key in params.focusConfig) {
      if (Object.hasOwnProperty.call(params.focusConfig, key)) {
        var element = params.focusConfig[key];     
        element = element ? element.split(',') : element;
        element && element.forEach(element => {         
          newFocusConfig[key][element.split('>')[0]] = {target: Number(element.substring(element.indexOf('>') + 1, element.indexOf('.'))), index: Number(element.split('.')[1])}
        });
      }
    }
    this.focusConfig = newFocusConfig;  
  }   
}

/**
 * 键盘监听按下
 * @param {*} params 
 */
window.onkeydown = function(params) {
  localStorage.setItem('frontFocus', epg.areaArray[epg.activeAreaIndex].area+epg.activeFocusIndex);  
  // keyCode : 38 上; keyCode : 39  右; keyCode : 40下;  keyCode : 37  左;  keyCode : 8  回退;  keyCode : 13 确定;  
  switch (params.keyCode) {
    case 38:
      epg.moveTop(); break;
    case 39:
      epg.moveRight(); break;
    case 40:
      epg.moveBottom(); break;
    case 37:
      epg.moveLeft(); break;  
    case 8:
      epg.backOff(); break;
    case 13:
      epg.determine(); break
    default: break;
  }
}
