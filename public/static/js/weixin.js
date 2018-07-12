/**
 * 微信连Wi-Fi协议3.1供运营商portal呼起微信浏览器使用
 */
var loadIframe = null;
var noResponse = null;
var callUpTimestamp = 0;

function putNoResponse(ev){
   clearTimeout(noResponse);
}	

function errorJump()
{
 var now = new Date().getTime();
 if((now - callUpTimestamp) > 4*1000){
   return;
 }
 alert('该浏览器不支持自动跳转微信请手动打开微信\n如果已跳转请忽略此提示');
}
		 
myHandler = function(error) {
  errorJump();
};

function createIframe(){
  var iframe = document.createElement("iframe");
   iframe.style.cssText = "display:none;width:0px;height:0px;";
   document.body.appendChild(iframe);
   loadIframe = iframe;
}
//注册回调函数
function jsonpCallback(result){  
  if(result && result.success){
      alert('WeChat will call up : ' + result.success + '  data:' + result.data);			    
      var ua=navigator.userAgent;              
    if (ua.indexOf("iPhone") != -1 ||ua.indexOf("iPod")!=-1||ua.indexOf("iPad") != -1) {   //iPhone             
      document.location = result.data;
    }else{

      if('false'=='true'){
        alert('[强制]该浏览器不支持自动跳转微信请手动打开微信\n如果已跳转请忽略此提示');
        return;
      }

        createIframe();
        callUpTimestamp = new Date().getTime();
        loadIframe.src=result.data;
      noResponse = setTimeout(function(){
        errorJump();
          },3000);
    }			    
  }else if(result && !result.success){
    alert(result.data);
  }
}
function Wechat_GotoRedirect(appId, extend, timestamp, sign, shopId, authUrl, mac, ssid, bssid){

  //将回调函数名称带到服务器端
  var url = "https://wifi.weixin.qq.com/operator/callWechatBrowser.xhtml?appId=" + appId 
                                    + "&extend=" + extend 
                                    + "&timestamp=" + timestamp 
                                    + "&sign=" + sign;	

  //如果sign后面的参数有值，则是新3.1发起的流程
  if(authUrl && shopId){


    url = "https://wifi.weixin.qq.com/operator/callWechat.xhtml?appId=" + appId 
                                    + "&extend=" + extend 
                                    + "&timestamp=" + timestamp 
                                    + "&sign=" + sign
                                    + "&shopId=" + shopId
                                    + "&authUrl=" + encodeURIComponent(authUrl)
                                    + "&mac=" + mac
                                    + "&ssid=" + ssid
                                    + "&bssid=" + bssid;

  }			

  //通过dom操作创建script节点实现异步请求  
  var script = document.createElement('script');  
  script.setAttribute('src', url);  
  document.getElementsByTagName('head')[0].appendChild(script);
}
