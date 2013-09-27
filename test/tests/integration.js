suite("integration", function() {

	setup(function() {
		d3.chart("test", {});
		this.myChart = d3.select("#test").chart("test");
	});

	test("Layer#chart returns a reference to the parent chart", function() {
		var layer = this.myChart.layer("layer1", this.myChart.base.append("g"), {});

		assert.equal(layer.chart(), this.myChart);
	});

	suite("Chart#draw", function() {
		setup(function() {
			// Create spies
			this.events = {
				"enter": sinon.spy(),
				"enter:transition": sinon.spy(),
				"update": sinon.spy(),
				"update:transition": sinon.spy(),
				"exit": sinon.spy(),
				"exit:transition": sinon.spy()
			};
			this.dataBind = sinon.spy(function() {
				return this.data([]);
			});
			this.insert = sinon.spy(function() {
				return this.append('g');
			});

			this.layer = this.myChart.layer("layer1", this.myChart.base.append("g"), {
				dataBind: this.dataBind,
				insert: this.insert,
				events: this.events
			});
			sinon.spy(this.layer, "draw");

			this.myChart.draw();
		});

		test("`dataBind` selection's `.chart` method returns a reference to the parent chart", function() {
			assert.equal(this.dataBind.thisValues[0].chart(), this.myChart);
		});

		test("`insert` selection's `.chart` method returns a reference to the parent chart", function() {
			assert.equal(this.insert.thisValues[0].chart(), this.myChart);
		});

		suite("Lifecycle selections' `.chart` method returns a reference to the parent chart", function() {
			test("`enter`", function() {
				assert.equal(this.events.enter.thisValues[0].chart(),
					this.myChart);
			});
			test("`enter:transition`", function() {
				assert.equal(this.events["enter:transition"].thisValues[0].chart(),
					this.myChart);
			});
			test("`update`", function() {
				assert.equal(this.events.update.thisValues[0].chart(),
					this.myChart);
			});
			test("`update:transition`", function() {
				assert.equal(this.events["update:transition"].thisValues[0].chart(),
					this.myChart);
			});
			test("`exit`", function() {
				assert.equal(this.events.exit.thisValues[0].chart(),
					this.myChart);
			});
			test("`exit:transition`", function() {
				assert.equal(this.events["exit:transition"].thisValues[0].chart(),
					this.myChart);
			});
		});

		suite("Layer attaching and detaching", function() {

			setup(function() {
				this.myChart.layer("testLayer", this.myChart.base.append("g"), {});
				this.layer = this.myChart.unlayer("testLayer");
			});

			suite("Disjoins child from parent", function() {
				test("`unlayer` detaches layer from chart", function() {
					assert.equal(typeof this.myChart.layer("testLayer"), "undefined");
				});

				test("detached layer does not have reference to parent chart", function() {
					assert.equal(typeof this.layer.chart(), "undefined");
				});
			});

			suite("Reattaches child to parent", function() {
				setup(function() {
					this.reattachedLayer = this.myChart.layer("anotherLayer", this.layer);
				});

				test("`layer` reattaches a detached layer to a chart", function() {
					assert.equal(this.reattachedLayer, this.myChart.layer("anotherLayer"));
				});

				test("reattached layer has a reference to parent chart", function() {
					assert.equal(this.reattachedLayer.chart(), this.myChart);
				});

				test("attempting to reattach anything other than a layer fails", function() {
					assert.throws(function() {
							this.myChart.layer("notalayer", {});
						},
						Error,
						"[d3.chart] When reattaching a layer, the second argument must be a d3.chart layer");
					assert.equal(typeof this.myChart.layer("notalayer"), "undefined");
				});
			});
		});
	});
});
