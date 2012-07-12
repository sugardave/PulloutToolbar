enyo.kind({
	name: "sugardave.PulloutToolbar",
	kind: enyo.Popup,
	floating: true,
	centered: false,
	modal: false,
	edge: "left",
	classes: "pullout-toolbar enyo-unselectable",
	published: {
		autoCollapse: true,
		pulltabPosition: -1 // -1 = left/top, 0 = center (pretty close), 1 = right/bottom
	},
	create: function() {
		this.inherited(arguments);
		this.pulltabPositionChanged();
	},
	initComponents: function() {
		var edges = ["top", "right", "bottom", "left"], edge;
		for (var e in edges) {
			edge = edges[e];
			this.removeClass(edge);
		}
		
		this.removeClass("horizontal");
		this.removeClass("vertical");
		
		this.createClient();
		
		this.addClass(this.edge);
		
		switch(this.edge) {
			case "top":
			case "bottom":
				this.$.clientWrapper.setLayoutKind(enyo.FittableColumnsLayout);
				this.addClass("horizontal");
				this.$.slider.setLayoutKind(enyo.FittableRowsLayout);
				this.$.client.setLayoutKind(enyo.FittableColumnsLayout);
				break;
			case "right":
			case "left":
				this.$.clientWrapper.setLayoutKind(enyo.FittableRowsLayout);
				this.addClass("vertical");
				this.$.slider.setLayoutKind(enyo.FittableColumnsLayout);
				this.$.client.setLayoutKind(enyo.FittableRowsLayout);
				break;
		}
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		// need to let the DOM nodes render before setting the slider values
		setTimeout(enyo.bind(this, "setSlider", 0));
	},
	pulltabPositionChanged: function() {
		var positions = ["left", "top", "center", "right", "bottom"], position;
		var orientation = (this.edge === "left" || this.edge === "right") ? "vertical" : "horizontal";
		for (var p in positions) {
			position = positions[p];
			this.$.pulltab.removeClass(position);
		}
		switch(this.pulltabPosition) {
			case -1:
				position = (orientation === "vertical") ? "top" : "left";
				break;
			case 0:
				position = "center";
				break;
			case 1:
				position = (orientation === "vertical") ? "bottom" : "right";
				break;
		}
		this.$.pulltab.addClass(position);
	},
	createClient: function() {
		var components = [];
		this.createComponent(
			{name: "slider", kind: enyo.Slideable, overMoving: false, onChange: "checkState", classes: "slider"}
		);
		switch(this.edge) {
			case "top":
			case "left":
				components = [
					{name: "clientWrapper", components: [
						{name: "client", fit: true, classes: "onyx-toolbar onyx-toolbar-inline"}
					]},
					{name: "pulltab", kind: enyo.Control, classes: "onyx-toolbar pulltab", ontap: "toggleToolbar", components: [
						{kind: "onyx.Grabber", classes: "grabber"}
					]}
				];
				break;
			case "bottom":
			case "right":
				components = [
					{name: "pulltab", kind: enyo.Control, classes: "onyx-toolbar pulltab", ontap: "toggleToolbar", components: [
						{kind: "onyx.Grabber", classes: "grabber"}
					]},
					{name: "clientWrapper", components: [
						{name: "client", fit: true, classes: "onyx-toolbar onyx-toolbar-inline"}
					]}
				];
				break;
		}
		this.$.slider.createComponents(components, {owner: this});
	},
	hide: function(force) {
		if (this.autoCollapse || force) {
			this.collapse(!force);
		}
	},
	show: function() {
		this.inherited(arguments);
	},
	collapse: function(animate) {
		var min = (this.hasClass("left") || this.hasClass("top")) ? this.$.slider.getMin() : this.$.slider.getMax();
		if (animate) {
			this.$.slider.animateTo(min);
		} else {
			this.$.slider.setValue(min);
		}
	},
	expand: function(animate) {
		this.log();
		var max = (this.hasClass("left") || this.hasClass("top")) ? this.$.slider.getMax() : this.$.slider.getMin();
		if (animate) {
			this.$.slider.animateTo(max);
		} else {
			this.$.slider.setValue(max);
		}
	},
	toggleToolbar: function() {
		this.log();
		(this.hasClass("collapsed")) ? this.expand(true) : this.collapse(true);
	},
	setSlider: function() {
		/*var popup = this;
		var popupNode = popup.hasNode();
		var popupWidth = popupNode.clientWidth;
		var popupHeight = popupNode.clientHeight;*/
		
		var slider = this.$.slider;
		var sliderNode = slider.hasNode();
		var sliderWidth = sliderNode.clientWidth;
		var sliderHeight = sliderNode.clientHeight;
		var axis, unit, min, max, value;
		switch(this.edge) {
			case "top":
				axis = "v";
				unit = "px";
				max = 0;
				min = -sliderHeight;
				break;
			case "right":
				axis = "h";
				unit = "%";
				max = 100;
				//min = 100 - (Math.round(sliderWidth / popupWidth * 100));
				min = 0;
				break;
			case "bottom":
				axis = "v";
				unit = "%";
				max = 100;
				//min = 100 - (Math.round(sliderHeight / popupHeight * 100));
				min = 0;
				break;
			case "left":
				axis = "h";
				unit = "px";
				max = 0;
				min = -sliderWidth;
				break;
		}
		
		slider.setAxis(axis);
		slider.setUnit(unit);
		slider.setMin(min);
		slider.setMax(max);
	},
	checkState: function() {
		this.log();
		switch(this.edge) {
			case "top":
			case "left":
				if (this.$.slider.isAtMax()) {
					this.removeClass("collapsed");
				} else if (this.$.slider.isAtMin()) {
					this.addClass("collapsed");
				}
				break;
			case "bottom":
			case "right":
				if (this.$.slider.isAtMin()) {
					this.removeClass("collapsed");
				} else if (this.$.slider.isAtMax()) {
					this.addClass("collapsed");
				}
				break;
		}
	}
});