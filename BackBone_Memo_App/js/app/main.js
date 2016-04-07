var IssueModel = BaseModel.extend({
	objectClass: 'issue'             // since the class table in LC called BackboneData
});

var IssueCollection = BaseCollection.extend({
	model: IssueModel
});



var IssueItemView = Backbone.View.extend({

	_template: _.template($('#issue-item-view').html()),        //template in underscore.js
	tagName: 'a',
	className: 'list-group-item',
	attribute: {                //attribute for a
		'href': '#'
	},

	initialize: function(){
	this.listenTo(this.model,'destroy',this.remove);
	this.listenTo(this.model,'change', this.render);
	},

	events: {
		'click .sp-close':'doRemove'
	},

	render: function(){
		var json = this.model.toJSON();
		var html=this._template(json);            //use json to replace <%= %> in template script
		//var html = '<h4 class="list-group-item-heading">' + json.title + '<small>' + json.objectId + '</small></h4>';
		//html += '<p class="list-group-item-text">' + json.description + '</p>';
		this.$el.html(html);
		this.$el.attr('href','#issue/'+json.objectId);
		return this;
	},

	doRemove: function(e){
		e.preventDefault();
		this.model.destroy();
	}
});

//view to collection
var IssueCollectionView = BaseCollectionView.extend({

	subView: IssueItemView,

	initialize: function(){
		this._initialize();                   //this.listenTo(this.collection, 'reset', this.render);  in base.js
	}

	//this part was build in base.js
	//render: function(){
	//	this.collection.each(function(model){
	//		console.log(model);
	//	});
	//}
});

// actually it's Backbone.View.extend(){}, but it inherit fictions from BasePage in base.js
var PageIssueList = BasePage.extend({
	el: '#page-issue-list',
	initialize: function(){
		this.issueCollection = new IssueCollection();
		this.issueCollectionView = new IssueCollectionView({
			collection: this.issueCollection,
			el:'#issue-list'});
		this.issueCollection.fetch({reset:true});

	}
});

var PageIssueCreate = BasePage.extend({
	el: '#page-issue-create',

	//pass the router
	initialize: function(options){
		this.router = options.router;           //these two are used to pass the private var: router and collection in this function, so doSave() can use them
		this.collection = options.collection;
	},

	events: {
		'click #btn-save': 'doSave'         //read input data, create a model, save model, and move to main page
	},

	doSave: function(e){
		e.preventDefault();
		//read value of input
		var _title = this.$el.find('#title').val();
		var _des = this.$el.find('#description').val();
		//create model
		var newIssue = new IssueModel({
			title: _title,
			description: _des
		});
		//save model, can't use newIssue.save() since the collection do not know the change here at all, need refresh
		this.collection.create(newIssue, {wait:true});         //same function as .save(), wait means wait until server pass the data back
		//back to the main page
		this.router.navigate('', {trigger: true})

	}
});

var PageIssueEdit = BasePage.extend({
	el: '#page-issue-edit',

	events:{
		'click #btn-save-edit':'doEdit'
	},

	initialize: function(option){
		this.router = option.router
	},

	show: function(issue){
		if(issue){
			this.model = issue;         //others can also access this issue
			this.render();
		}
		this.$el.show();
	},

	render: function(){                 //pass the value of model to the edited input
		var json= this.model.toJSON();
		this.$el.find('#title-edit').val(json.title);
		this.$el.find('#description-edit').val(json.description);
	},

	doEdit: function(e){
		e.preventDefault();
		// get typed in data
		var _title = this.$el.find('#title-edit').val();
		var _description = this.$el.find('#description-edit').val();
		// PUT model
		this.model.set({
			title: _title,
			description: _description
		});
		this.model.save(null,{onlyChanged: true});      //only change changed data
		this.router.navigate('',{trigger:true});
	}
});


// using router to change pages without refresh
var AppRouter = Backbone.Router.extend({

	//create a object for each view
	initialize: function(){
		this.pageIssueList = new PageIssueList();
		this.pageIssueCreate = new PageIssueCreate({
			router: this,       //these two are used to pass the private var: router and collection in this function, so doSave() can use them
			collection: this.pageIssueList.issueCollection
		});
		this.pageIssueEdit = new PageIssueEdit({
			router: this
		});
	},

	//define a function that only hide all pages so we can use issueEdit or create or list to show page easily
	hideAllPages: function(){
		this.pageIssueList.hide();
		this.pageIssueEdit.hide();
		this.pageIssueCreate.hide();
	},

	routes: {
		'issue/new':'issueCreate',
		'issue/:id': 'issueEdit',
		'': 'issueList'                         //default page for ***.html
	},

	issueEdit: function(id){
		this.hideAllPages();                    //this way can only show this page easily
		var issue = this.pageIssueList.issueCollection.find(function (model) {
			return model.id == id;
		});
		this.pageIssueEdit.show(issue);
	},

	issueCreate: function(){
		this.hideAllPages();
		this.pageIssueCreate.show();
	},

	issueList: function() {
		this.hideAllPages();
		this.pageIssueList.show();
	}
})
var router = new AppRouter();
Backbone.history.start();