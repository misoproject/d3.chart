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

			assert(chart instanceof d3.chart("test"));
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
			var mixin = this.myChart.mixin("test2", d3.select("body"), 1, 2, 45);
			assert(mixin instanceof d3.chart("test2"));
		});
		test("instantiates with the correct arguments", function() {
			var mixin = this.myChart.mixin("test2", d3.select("body"), 1, 2, 45);
			assert.deepEqual(mixin.initialize.args[0], [1, 2, 45]);
		});
		test("correctly sets the `base` attribute of the mixin", function() {
			var mixinBase = d3.select("body");
			var mixin = this.myChart.mixin("test2", mixinBase);
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
				insert: function() { return this.append("g"); }
			});
			sinon.spy(layer1, "draw");
			this.layer2 = layer2 = myChart.layer("layer2", myChart.base.append("g"), {
				dataBind: function(data) { return this.data(data); },
				insert: function() { return this.append("g"); }
			});
			sinon.spy(layer2, "draw");

			this.mixin1 = mixin1 = myChart.mixin("test", d3.select("#test"));
			this.mixin2 = mixin2 = myChart.mixin("test", d3.select("#test"));
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

		setup(function() {
			var base = this.base = d3.select("#test");
			var chart = this.chart = base.chart("test");
			var layerbase = this.layerbase = base.append("g").classed("layer1", true);
			this.layer = chart.layer("testlayer", layerbase, {});
		});

		test("creates a layer with the same selection", function() {
			assert.equal(this.layer, this.layerbase);
		});

		test("returns a layer", function() {
			assert.equal(this.chart.layer("testlayer"), this.layer);
		});

		test("extends the selection with a `draw` method", function() {
			assert.equal(typeof this.layer.draw, "function");
		});

		test("extends the selection with an `on` method", function() {
			assert.equal(typeof this.layer.on, "function");
		});

		test("extends the selection with an `off` method", function() {
			assert.equal(typeof this.layer.off, "function");
		});
	});

	suite("events", function() {
		setup(function() {
			var base = this.base = d3.select("#test");
			var chart = this.chart = this.base.chart("test");

			var e1callback = this.e1callback = sinon.spy(function() {
				return this;
			});
			var e1callback2 = this.e1callback2 = sinon.spy(function() {
				return this.ctx;
			});
			var e2callback = this.e2callback = sinon.spy(function() {
				return this.ctx;
			});


			var e1ctx = this.e1ctx = { ctx : "ctx1" };
			var e2ctx = this.e2ctx = { ctx : "ctx2" };

			chart.on("e1", e1callback);
			chart.on("e1", e1callback2, e1ctx);
			chart.on("e2", e2callback, e2ctx);
		});

		suite("#trigger", function() {
			test("executes callbacks", function() {
				this.chart.trigger("e1");
				assert.equal(this.e1callback.callCount, 1);
				assert.equal(this.e1callback2.callCount, 1);
				assert.equal(this.e2callback.callCount, 0);

				this.chart.trigger("e2");

				assert.equal(this.e2callback.callCount, 1);
			});

			test("executes callbacks with correct context", function() {
				this.chart.trigger("e1");
				this.chart.trigger("e2");

				assert.equal(this.e1callback.returnValues[0], this.chart);
				assert.equal(this.e1callback2.returnValues[0], this.e1ctx.ctx);
				assert.equal(this.e2callback.returnValues[0], this.e2ctx.ctx);
			});

			test("passes parameters correctly", function() {
				this.chart.trigger("e1", 1, 2, 3);

				this.e1callback.calledWith(1,2,3);
			});

			test("doesn't fail when there are no callbacks", function() {
				var context = this;
				assert.doesNotThrow(function() {
					context.chart.trigger("non_existing_event", 12);
				}, Error);
			});
			test("returns the chart instance (chains)", function() {
				assert.equal(this.chart.trigger("e1"), this.chart);
			});
		});

		suite("#on", function () {
			test("returns the chart instance (chains)", function() {
				assert.equal(this.chart.on("e1"), this.chart);
			});
		});

		suite("#once", function() {
			test("executes a callback bound only once", function() {
				var e1oncecallback = sinon.spy();

				this.chart.once("e1", e1oncecallback);

				this.chart.trigger("e1");
				this.chart.trigger("e1");

				assert.equal(this.e1callback.callCount, 2);
				assert.equal(this.e1callback2.callCount, 2);
				assert.equal(e1oncecallback.callCount, 1);
			});
			test("returns the chart instance (chains)", function() {
				assert.equal(this.chart.once("e1"), this.chart);
			});
		});

		suite("#off", function() {

			test("removes all events when invoked without arguments", function() {
				this.chart.off();

				this.chart.trigger("e1");
				this.chart.trigger("e2");

				assert.equal(this.e1callback.callCount, 0);
				assert.equal(this.e1callback2.callCount, 0);
				assert.equal(this.e2callback.callCount, 0);
			});

			test("removes all events with the specified name", function() {
				this.chart.off("e1");
				this.chart.off("e2");

				this.chart.trigger("e1");
				this.chart.trigger("e2");

				assert.equal(this.e1callback.callCount, 0);
				assert.equal(this.e1callback2.callCount, 0);
				assert.equal(this.e2callback.callCount, 0);
			});

			test("removes only event with specific callback", function() {
				this.chart.off("e1", this.e1callback2);

				this.chart.trigger("e1");
				this.chart.trigger("e2");

				assert.equal(this.e1callback.callCount, 1);
				assert.equal(this.e1callback2.callCount, 0);
				assert.equal(this.e2callback.callCount, 1);
			});

			test("removes only event with specific context", function() {
				this.chart.off("e1", undefined, this.e1ctx);

				this.chart.trigger("e1");
				this.chart.trigger("e2");

				assert.equal(this.e1callback.callCount, 1);
				assert.equal(this.e1callback2.callCount, 0);
				assert.equal(this.e2callback.callCount, 1);
			});

			test("removes all events with a certain context regardless of names", function() {
				var e1callback3 = sinon.spy(function() {
					return this.ctx;
				});

				this.chart.on("e1", e1callback3, this.e1ctx);

				this.chart.trigger("e1");

				assert.equal(this.e1callback.callCount, 1);
				assert.equal(this.e1callback2.callCount, 1);
				assert.equal(e1callback3.callCount, 1);

				this.chart.off(undefined, undefined, this.e1ctx);

				assert.equal(this.e1callback.callCount, 1);
				assert.equal(this.e1callback2.callCount, 1);
				assert.equal(e1callback3.callCount, 1);
			});
			test("returns the chart instance (chains)", function() {
				assert.equal(this.chart.off("e1"), this.chart);
			});
		});
	});
});
