Object.defineProperties(HTMLFormElement.prototype, {
	_submit: {
		value: HTMLFormElement.prototype.submit,
		writable: false,
	    configurable: false,
	    enumerable: false
	},
	submit: {
		value: function(){
			this._submit();
		}
	}
});

Object.defineProperties(XMLHttpRequest.prototype, {
	 withCredentials: {
	 	_value: false,
	 	get: function(){
	 		return this._value;
	 	},
	 	set: function(v){
	 		this._value = v;
	 	}
	 },
	_setRequestHeader: {
		value:XMLHttpRequest.prototype.setRequestHeader,
		writable: false,
	    configurable: false,
	    enumerable: false
	},
	setRequestHeader: {
		value: function(k,v){
			this._setRequestHeader.call(this, k, v);
		}
	},
	_send:{
		value: XMLHttpRequest.prototype.send,
		writable: false,
	    configurable: false,
	    enumerable: false
	},
	send:{
		value: function(){
			this._send.apply(this, arguments);
		}
	}
});

HTMLFormElement.prototype.submit = function(){
	var _continue = true;
	if("onsubmit" in this){
		if("function" == typeof this.onsubmit){
			_continue = (false != this.onsubmit.call(this) );
		}else{
			_continue = true;
		}
	}else{
		_continue = true;
	}
	//var _continue = ("onsubmit" in this && ("function" == typeof this.onsubmit) && !this.onsubmit.call(this) )||true;
	if(_continue){
		var form_loading = window.loading();
		new ajax3({
			url: this.action,
			formData: new FormData(this),
			type:this.method,
			callback: function(res){
				form_loading.destroy();
				delete form_loading;
				if(res && (0 == res.result)){
					if(res.url){
						location.href = res.url;
					}else{
						alert(res.message);
					}
				}else{
					alert(res.error);
				}
			}
		});
	}
	return false;
}

var ajax3 = (function(){
	_ajax3 = function(args){
		this.url = "javascript:alert('url 不能为空');";
		this.type = "GET";
		this.async = true;
		this.responseType = "text";
		//this.formData = new FormData();
		this.callback = null;
		this.timeout = 10000;

		for(var k in args){
			this[k] = args[k];
		}
		this.init().work();
	}

	_ajax3.prototype = {
		constructor:_ajax3,
		init: function(){
			var that = this;
			that.xhr = new XMLHttpRequest();
			return that;
		},
		work: function(){
			var that = this;
			that.xhr.open(that.type, that.url, that.async);
			that.xhr.setRequestHeader("common", JSON.stringify({
				platform:"HTML5",
				author:"Eric_wu",
				time:+new Date()
			}) );
			
			//this.xhr.withCredentials = true;
			that.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			that.xhr.upload.onprogress = function(e) {
				 if (e.lengthComputable) {
      				var percent = (e.loaded / e.total) * 100;
      				that.onprogress&&that.onprogress.call(e, percent);
      			}
			}
			that.xhr.onload = function(e){
				if(200 == that.xhr.status){
					that.callback&&that.callback.call(that, JSON.parse(that.xhr.responseText) );
					that.timer&&clearTimeout(that.timer);
				}
			}
			if(that.timeout){
				that.timer = setTimeout(function(){
					that.xhr.abort();
					that.callback&&that.callback.call(that, {
						errno:-1,
						message: "请求超时"
					});
					clearTimeout(that.timer);
				}, that.timeout);
			}
			
			that.xhr.send(that.formData);
			return that;
		}
	}

	return _ajax3;
})();