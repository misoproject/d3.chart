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
		test("sets the `transform` method as specified to the constructor", function() {
			var transform = function() {};
			var myChart;
			d3.chart("test", {});

			myChart = d3.select("#test").chart("test", {
				transform: transform
			});

			assert.equal(myChart.transform, transform);
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
			test("immediately invoked with the specified options", function() {
				var options = {};
				d3.select("#test").chart("test", options);

				assert.equal(this.init1.callCount, 1);
				assert.equal(this.init1.args[0].length, 1);
				assert.strictEqual(this.init1.args[0][0], options);
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

	suite("Attachments", function() {
		setup(function() {
			d3.chart("test", {});
			this.myChart = d3.select("#test").chart("test");
			var attachmentChart = this.attachmentChart =
				d3.select("body").chart("test");
			sinon.spy(attachmentChart, "draw");
		});
		suite("#attach", function() {
			test("returns the requested attachment", function() {
				this.myChart.attach("myAttachment", this.attachmentChart);

				assert.equal(
					this.myChart.attach("myAttachment"),
					this.attachmentChart
				);
			});
			test("connects the specified chart", function() {
				var data = [23, 45];
				this.myChart.attach("myAttachment", this.attachmentChart);
				this.myChart.draw(data);

				assert.equal(this.attachmentChart.draw.callCount, 1);
				assert.equal(this.attachmentChart.draw.args[0].length, 1);
				assert.deepEqual(this.attachmentChart.draw.args[0][0], data);
			});
		});

		suite("#demux", function() {
			var data = {
				series1: [1, 2, 3],
				series2: [4, 5, 6]
			};
			setup(function() {
				this.attachmentChart2 = d3.select("body").chart("test");
				sinon.spy(this.attachmentChart2, "draw");
				this.myChart.attach("attachment1", this.attachmentChart);
				this.myChart.attach("attachment2", this.attachmentChart2);
			});
			test("uses provided function to demultiplex data", function() {
				this.myChart.demux = function(attachmentName, data) {
					if (attachmentName === "attachment1") {
						return data.series1;
					}
					return data;
				};
				this.myChart.draw(data);

				assert.deepEqual(
					this.attachmentChart.draw.args,
					[[[1, 2, 3]]],
					"Demuxes data passed to charts with registered function"
				);
				assert.deepEqual(
					this.attachmentChart2.draw.args[0][0].series1,
					data.series1,
					"Unmodified data passes through to attachments directly"
				);
				assert.deepEqual(
					this.attachmentChart2.draw.args[0][0].series2,
					data.series2,
					"Unmodified data passes through to attachments directly"
				);
			});
		});
	});

	suite("#draw", function() {
		setup(function() {
			var layer1, layer2, transform, transformedData, myChart;
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

			this.attachment1 = d3.select("#test").chart("test");
			this.attachment2 = d3.select("#test").chart("test");
			myChart.attach("test1", this.attachment1);
			myChart.attach("test2", this.attachment2);
			sinon.stub(this.attachment1, "draw");
			sinon.stub(this.attachment2, "draw");
		});
		test("invokes the transform method once with the specified data", function() {
			var data = [1, 2, 3];
			assert.equal(this.transform.callCount, 0);

			this.myChart.draw(data);

			assert.equal(this.transform.callCount, 1);
			assert.equal(this.transform.args[0][0], data);
		});

		test("transform cascading", function() {
			var grandpaTransform = sinon.spy(function(d) { return d * 2; });
			var paTransform = sinon.spy(function(d) { return d * 3; });
			var instanceTransform = sinon.spy(function(d) { return d * 5; });

			d3.chart("TestTransformGrandpa", {
				transform: grandpaTransform
			});
			d3.chart("TestTransformGrandpa").extend("TestTransformPa", {
				transform: paTransform
			});

			var chart = d3.select("#test").chart("TestTransformPa");
			chart.transform = instanceTransform;

			chart.draw(7);

			sinon.assert.calledWith(instanceTransform, 7);
			sinon.assert.calledWith(paTransform, 35);
			sinon.assert.calledWith(grandpaTransform, 105);

		});

		test("invokes the `draw` method of each of its layers", function() {
			assert.equal(this.layer1.draw.callCount, 0);
			assert.equal(this.layer2.draw.callCount, 0);

			this.myChart.draw([]);

			assert.equal(this.layer1.draw.callCount, 1);
			assert.equal(this.layer2.draw.callCount, 1);
		});
		test("invokes the `draw` method of each of its layers with the transformed data", function() {
			this.myChart.draw([]);

			assert.equal(this.layer1.draw.args[0][0], this.transformedData);
			assert.equal(this.layer2.draw.args[0][0], this.transformedData);
		});
		test("invokes the `draw` method on each of its attachments", function() {
			assert.equal(this.attachment1.draw.callCount, 0);
			assert.equal(this.attachment2.draw.callCount, 0);

			this.myChart.draw();

			assert.equal(this.attachment1.draw.callCount, 1);
			assert.equal(this.attachment2.draw.callCount, 1);
		});
		test("invokes the `draw` method of each of its attachments with the transformed data", function() {
			this.myChart.draw();

			assert.equal(
				this.attachment1.draw.args[0][0],
				this.transformedData
			);
			assert.equal(
				this.attachment2.draw.args[0][0],
				this.transformedData
			);
		});
		test("invokes the `draw` method of its layers before invoking the `draw` method of its attachments", function() {
			this.myChart.draw();

			assert(this.layer1.draw.calledBefore(this.attachment1.draw));
			assert(this.layer1.draw.calledBefore(this.attachment2.draw));
			assert(this.layer2.draw.calledBefore(this.attachment1.draw));
			assert(this.layer2.draw.calledBefore(this.attachment2.draw));
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
			this.base = d3.select("#test");
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
