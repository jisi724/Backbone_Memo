//user key and app key of LeanCloud: https://us.leancloud.cn/app.html?appid=un0i2AaJDSwlxH7oaoxeNFxe-MdYXbMMI#/key
var AVOS_AppId = '9F6Uz6T7Km6Dr3wVn6Ft5v8o-gzGzoHsz';
var AVOS_AppKey = 'HkgsjRyUCYNeq3ctC2xrAqGN';

//https://us.leancloud.cn/docs/rest_api.html  Has to learn more from RESTful API
$(document).ajaxSend(function (e, jqXHR, options){
	var now = new Date();
	var millions = now.getTime();
	var hash = CryptoJS.MD5(millions + AVOS_AppKey);
	jqXHR.setRequestHeader('X-LC-Id',AVOS_AppId);
	jqXHR.setRequestHeader('X-LC-Sign',hash + ',' + millions);
});



//basic model that provide toJSON and server connection
var BaseModel = Backbone.Model.extend({

	idAttribute: 'objectId',
	objectClass:'',             //other model only need to define the objectClass to query corresponding Class in LC
	urlRoot: function(){
		return 'https://leancloud.cn/1.1/classes/' + this.objectClass
	},

	//rewrite toJSON so that it only save changed part
	toJSON: function(options) {
		if(options && options.onlyChanged){
			return this.changedAttributes();
		}
		else{
			return _.clone(this.attributes);
		}
	}

});

// Basic Collection, connect to server and split the 'result' chars
var BaseCollection = Backbone.Collection.extend({
	url: function(){
		return 'https://leancloud.cn/1.1/classes/' + this.model.prototype.objectClass
	},
	//since there is 'result' in returned JSON, use parse to split and return the rest
	parse: function (resp,options) {
		if(resp && resp.results){
			return resp.results;
		}
		return resp;
	}
});

//commonly used base, copy and paste
var BaseCollectionView = Backbone.View.extend({

	subView: null,
	_initialize: function(){
		this.listenTo(this.collection,'reset',this.render);
		this.listenTo(this.collection,'add',this.addOne);
		this._views = [];
	},

	createSubView: function(model){
		var viewClass = this.subView || Backbone.View;
		var v = new viewClass({model:model});
		this._views.push(v);
		return v;
	},

	addOne: function(model){
		this.$el.append(this.createSubView(model).render().$el);
	},

	render: function () {
		var _this = this;
		_.each(this._views,function (subview) {
			subview.remove().off();
		});

		this._views = [];
		if(!this.collection)
			return this;

		this.collection.each(function(model){
			_this.addOne(model);
		});
	}
});

//basic view that provide commonly used hide and show functions
var BasePage = Backbone.View.extend({
	hide: function(){
		this.$el.hide();
	},

	show: function(){
		this.$el.show();
	}
});