/**
 * 使用示例：
 * var toast = new Toast();
 * toast.show("错误"); //默认显示3秒后消失
 * toast.show("错误", 5000);  //显示5秒后消失
 * toast.show();  //显示默认的提示信息
 */

function Toast() {

	this.oHeight = ($(window).height())/2+"px";

	this.msg = null;
	this.livetime = null;
	this.timer = null;
	this.isMoving = true;
	this._css = {
		display: "block",
		//position: "absolute", /* 固定位置 */
		position: "fixed",
		top: this.oHeight,
		left: 0,
		right: 0,
		bottom: 0,
		margin: "0 auto",
		width:"300px",
		height: "40px",
		zIndex:"2004",
		border: "1px solid #666",   
        backgroundColor: "#333333",
		padding: "10px 10px 10px 10px",
		textAlign: "center",
		color: "#EEEEEE",
		borderRadius: "5px",
		opacity: 0, /* 透明度，取值0.1~0.9 */
//		-webkit-transition: "opacity 0.5s ease-out;"
//		-moz-transition: "opacity 0.5s ease-out;" 
//		-ms-transition: "opacity 0.5s ease-out;" 
//		-o-transition: "opacity 0.5s ease-out;"
		transition: "opacity 0.5s ease-out" /* 透明度的过渡效果，0.5秒，以慢速结束 */
	};
	
	this.ele = document.createElement("div");
	
	//懒加载
	this.show = function(msg,time){
//		for(var attr in this._css){
//			this.ele.style[attr] = this._css[attr];			
//		}
		this.msg = msg || "默认提示";
		this.livetime = time || 3000;
		this.init();
		this.show = function(msg,time){
			//取消之前正在执行的动作
			clearTimeout(this.timer);
			this.isMoving = false;
			
			this.ele.innerHTML = msg || "默认提示";
			this.livetime = time || 3000;
			this.ele.style.display = "block";
			this.ele.style.opacity = 1;
			var that = this;
			
			this.timer = setTimeout(function(){
				that.isMoving = true;
				that.hide();
			},this.livetime);
		}
	}
	
	this.hide = function(){
		this.ele.style.opacity = 0;
		var that = this;
		setTimeout(function(){
			if(that.isMoving) {
				that.ele.style.display = "none";
			}
		},500);
	}
	
	this.init = function(){
		for(var attr in this._css){
			this.ele.style[attr] = this._css[attr];			
		}
		this.ele.id = "toast";
		this.ele.innerHTML = this.msg;
		document.body.appendChild(this.ele);
		var that = this;
		setTimeout(function(){
			that.ele.style.opacity = 1;
			that.timer = setTimeout(function(){
				that.isMoving = true;
				that.hide();
			},that.livetime);
		}, 100);
	}
}