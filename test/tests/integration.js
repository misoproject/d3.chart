suite("integration", function() {
	setup(function() {
		d3.chart("test", {});
	});

	test("Layer#chart returns a reference to the parent chart", function() {
		this.myChart = d3.select("#test").chart("test");
		var layer = this.myChart.layer("layer1", this.myChart.base.append("g"), {});

		assert.equal(layer.chart(), this.myChart);
	});

	suite("Chart", function() {
		suite("`draw`", function() {
			setup(function() {
				
				this.myChart = d3.select("#test").chart("test");

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
		});

		suite("`draw` with mixin", function() {
			setup(function() {	
				var self = this;
				this.handler = sinon.spy();
				this.dataBind = sinon.spy(function() {
					return this.data([]);
				});
				this.insert = sinon.spy(function() {
					return this.append("g");
				});

				d3.chart("test", {
					initialize: function() {
						this.layer("layer1", this.base.append("g"), {
							dataBind: self.dataBind,
							insert: self.insert
						});
					}
				});

				d3.chart("testMixed", {
					initialize: function() {
						
						self.mixedChart = this.mixin(this.base.append("g"), "test");

						self.events = {
							"enter": sinon.spy(function() {
								this.chart().handler();
							}),
							"enter:transition": sinon.spy(function() {
								this.chart().handler();
							}),
							"update": sinon.spy(function() {
								this.chart().handler();
							}),
							"update:transition": sinon.spy(function() {
								this.chart().handler();
							}),
							"exit": sinon.spy(function() {
								this.chart().handler();
							}),
							"exit:transition": sinon.spy(function() {
								this.chart().handler();
							})
						};

						for (var event in self.events) {
							self.mixedChart.layer("layer1")
								.on(event, self.events[event], { 
									chart : this 
								});
						}
					},
					handler: self.handler
				});
				
				this.myChart = d3.select("#test").chart("testMixed");
				this.myChart.draw();
			});
			
			test("`dataBind` selection's `.chart` method returns a reference to the mixed chart", function() {
				assert.equal(this.dataBind.thisValues[0].chart(), this.mixedChart);
			});

			test("`insert` selection's `.chart` method returns a reference to the mixed chart", function() {
				assert.equal(this.insert.thisValues[0].chart(), this.mixedChart);
			});
			
			test("`handler` called once for each event", function() {
				assert.equal(this.handler.callCount, 6);
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
		});
	});
});
