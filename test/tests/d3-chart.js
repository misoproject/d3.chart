suite("d3.chart", function() {

	suite("constructor", function() {
		test("Names the new chart as specified", function() {
			var chart = d3.chart("test", {});
			assert.equal(chart, d3.chart("test"));
		});
		test("instantiates the specified chart", function() {
			var attr = /something/;
			var method = function() {};
			var myChart;
			d3.chart("test", { method: method, attr: attr });

			myChart = d3.select("#test").chart("test");

			assert.equal(myChart.attr, attr);
			assert.equal(myChart.method, method);
		});
		test("sets the instance's `base` property as the root d3 selection", function() {
			var selection, myChart;
			d3.chart("test", {});
			selection = d3.select("#test");

			myChart = selection.chart("test");

			assert.equal(myChart.base, selection);
		});

		suite("`initialize` method invocation", function() {
			setup(function() {
				var init1 = this.init1 = sinon.spy();
				var init2 = this.init2 = sinon.spy();
				var init3 = this.init3 = sinon.spy();
				d3.chart("test", {
					initialize: init1
				});
				d3.chart("test").extend("test2", {
					initialize: init2
				});
				d3.chart("test2").extend("test3", {
					initialize: init3
				});
			});
			test("immediately invoked in the context of the instance", function() {
				var instance = d3.select("#test").chart("test");

				assert.equal(instance, this.init1.thisValues[0]);
			});
			test("immediately invoked with the specified arguments", function() {
				d3.select("#test").chart("test", 1, 2, 3);

				assert.deepEqual(this.init1.args[0], [1, 2, 3]);
			});
			test("recursively invokes parent `initialize` methods (from the topmost, down)", function() {
				d3.select("#test").chart("test3");

				assert(this.init1.calledBefore(this.init2));
				assert(this.init2.calledBefore(this.init3));
				assert.equal(this.init3.callCount, 1);
			});
			test("calls each `initialize` method in the prototype chain exactly once", function() {
				d3.chart("test3").extend("test4");
				d3.select("#test").chart("test4");

				assert.equal(this.init1.callCount, 1);
				assert.equal(this.init2.callCount, 1);
				assert.equal(this.init3.callCount, 1);
			});
		});
	});

	suite("extend", function() {
		setup(function() {
			d3.chart("test");
		});
		test("Names the new chart as specified", function() {
			var ExChart = d3.chart("test").extend("test2");
			assert.equal(ExChart, d3.chart("test2"));
		});
		test("Uses the specified chart as the base class", function() {
			var chart;
			d3.chart("test").extend("test2");
			chart = d3.select("#test").chart("test2");

			assert.instanceOf(chart, d3.chart("test"));
		});
	});

	suite("#mixin", function() {
		setup(function() {
			d3.chart("test", {});
			d3.chart("test2", {
				initialize: sinon.spy()
			});
			this.myChart = d3.select("#test").chart("test");
		});
		test("instantiates the specified chart", function() {
			var mixin = this.myChart.mixin(d3.select("body"), "test2", 1, 2, 45);
			assert.instanceOf(mixin, d3.chart("test2"));
		});
		test("instantiates with the correct arguments", function() {
			var mixin = this.myChart.mixin(d3.select("body"), "test2", 1, 2, 45);
			assert.deepEqual(mixin.initialize.args[0], [1, 2, 45]);
		});
		test("correctly sets the `base` attribute of the mixin", function() {
			var mixinBase = d3.select("body");
			var mixin = this.myChart.mixin(mixinBase, "test2");
			assert.equal(mixin.base, mixinBase);
		});
	});

	suite("#draw", function() {
		setup(function() {
			var layer1, layer2, mixin1, mixin2, transform, transformedData,
				myChart;
			this.transformedData = transformedData = {};
			this.transform = transform = sinon.stub().returns(transformedData);
			d3.chart("test", {});
			this.myChart = myChart = d3.select("#test").chart("test");
			myChart.transform = transform;

			this.layer1 = layer1 = myChart.layer("layer1", myChart.base.append("g"), {
				dataBind: function(data) { return this.data(data); },
				insert: function() {}
			});
			sinon.spy(layer1, "draw");
			this.layer2 = layer2 = myChart.layer("layer2", myChart.base.append("g"), {
				dataBind: function(data) { return this.data(data); },
				insert: function() {}
			});
			sinon.spy(layer2, "draw");

			this.mixin1 = mixin1 = myChart.mixin(d3.select("#test"), "test");
			this.mixin2 = mixin2 = myChart.mixin(d3.select("#test"), "test");
			sinon.stub(mixin1, "draw");
			sinon.stub(mixin2, "draw");
		});
		test("invokes the transform method once with the specified data", function() {
			var data = {};
			assert.equal(this.transform.callCount, 0);

			this.myChart.draw(data);

			assert.equal(this.transform.callCount, 1);
			assert.equal(this.transform.args[0][0], data);
		});
		test("invokes the `draw` method of each of its layers", function() {
			assert.equal(this.layer1.draw.callCount, 0);
			assert.equal(this.layer2.draw.callCount, 0);

			this.myChart.draw();

			assert.equal(this.layer1.draw.callCount, 1);
			assert.equal(this.layer2.draw.callCount, 1);
		});
		test("invokes the `draw` method of each of its layers with the transformed data", function() {
			this.myChart.draw({});

			assert.equal(this.layer1.draw.args[0][0], this.transformedData);
			assert.equal(this.layer2.draw.args[0][0], this.transformedData);
		});
		test("invokes the `draw` method on each of its mixins", function() {
			assert.equal(this.mixin1.draw.callCount, 0);
			assert.equal(this.mixin2.draw.callCount, 0);

			this.myChart.draw();

			assert.equal(this.mixin1.draw.callCount, 1);
			assert.equal(this.mixin2.draw.callCount, 1);
		});
		test("invokes the `draw` method of each of its mixins with the transformed data", function() {
			this.myChart.draw();

			assert.equal(this.mixin1.draw.args[0][0], this.transformedData);
			assert.equal(this.mixin2.draw.args[0][0], this.transformedData);
		});
		test("invokes the `draw` method of its layers before invoking the `draw` method of its mixins", function() {
			this.myChart.draw();

			assert(this.layer1.draw.calledBefore(this.mixin1.draw));
			assert(this.layer1.draw.calledBefore(this.mixin2.draw));
			assert(this.layer2.draw.calledBefore(this.mixin1.draw));
			assert(this.layer2.draw.calledBefore(this.mixin2.draw));
		});
	});

	suite("#layer", function() {

		test("creates a layer with the same selection", function() {
			var base = d3.select("#test");
			var layerbase = base.append("g");
			var chart = base.chart("test");
			var layer = chart.layer("testlayer", layerbase, {});
			assert.equal(layer, layerbase);
		});

		test("returns a layer", function() {
			var base = d3.select("#test");
			var chart = base.chart("test");
			var layer = chart.layer("testlayer", base.append("g"), {});
			assert.equal(chart.layer("testlayer"), layer);
		});

		test("extends the selection with a `draw` method", function() {
			var base = d3.select("#test");
			var chart = base.chart("test");
			var layer = chart.layer("testlayer", base.append("g"), {});
			assert.typeOf(layer.draw, "function");
		});

		test("extends the selection with an `on` method", function() {
			var base = d3.select("#test");
			var chart = base.chart("test");
			var layer = chart.layer("testlayer", base.append("g"), {});
			assert.typeOf(layer.on, "function");
		});

		test("extends the selection with an `off` method", function() {
			var base = d3.select("#test");
			var chart = base.chart("test");
			var layer = chart.layer("testlayer", base.append("g"), {});
			assert.typeOf(layer.off, "function");
		});
	});
});
