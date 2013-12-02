suite("d3.layer", function() {
	"use strict";

	suite("constructor", function() {
		test("returns a reference to the selection", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.equal(inst, base);
		});
		test("extends the selection with a `draw` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.equal(typeof inst.draw, "function");
		});
		test("extends the selection with an `on` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.equal(typeof inst.on, "function");
		});
		test("extends the selection with an `off` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.equal(typeof inst.off, "function");
		});
	});

	suite('#draw', function() {
		setup(function() {
			var dataBind = this.dataBind = sinon.spy(function(data) {
				var updating = this.data(data, function(d) { return d; });
				// Cache `exit` method so it can be invoked from its stub
				// without provoking infinite recursion.
				var originalExit = updating.exit;

				sinon.spy(updating, "enter");
				sinon.spy(updating, "transition");
				// Stub the `exit` method so that we can spy on the generated
				// selections `transition` method.
				sinon.stub(updating, "exit", function() {
					var exiting = originalExit.apply(this, arguments);
					sinon.spy(exiting, "transition");
					return exiting;
				});

				return updating;
			});
			var insert = this.insert = sinon.spy(function() {
				var entering = this.insert("g");
				sinon.spy(entering, "transition");
				return entering;
			});
			var base = this.base = d3.select("#test");

			this.layer = base.layer({
				dataBind: dataBind,
				insert: insert
			});
		});

		test("invokes the provided `dataBind` method exactly once", function() {
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw([]);
			assert.equal(this.dataBind.callCount, 1);
		});
		test("invokes the provided `dataBind` method in the context of the layer's selection", function() {
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw([]);
			assert(this.dataBind.calledOn(this.base));
		});
		test("invokes the provided `dataBind` method with the specified data", function() {
			var data = [];
			assert.equal(this.dataBind.callCount, 0);
			this.layer.draw(data);
			assert.equal(this.dataBind.args[0][0], data);
		});
		test("invokes the provided `insert` method exactly once", function() {
			assert.equal(this.insert.callCount, 0);
			this.layer.draw([]);
			assert.equal(this.insert.callCount, 1);
		});
		test("invokes the provided `insert` method in the context of the layer's bound 'enter' selection", function() {
			this.layer.draw([]);
			assert(this.insert.calledOn(this.dataBind.returnValues[0].enter.returnValues[0]));
		});
		
		suite("event triggering", function() {
			test("invokes event handlers with the correct selection", function() {
				var layer = this.base.append("g").layer({
					insert: function() {
						return this.append("g");
					},
					dataBind: function(data) {
						return this.selectAll("g").data(data, function(d) { return d; });
					}
				});
				// Wrap each assertion in a spy so we can ensure that each actually
				// runs.
				var updateSpy = sinon.spy(function() {
					assert.deepEqual(this.data(), [3, 4], "update handler");
				});
				var enterSpy = sinon.spy(function() {
					// Build the expected sparse array to pass lint and avoid
					// failures due to browser implementation differences
					var expected = [];
					expected[2] = 5;
					expected[3] = 6;
					assert.deepEqual(this.data(), expected, "enter handler");
				});
				var mergeSpy = sinon.spy(function() {
					assert.deepEqual(this.data(), [3, 4, 5, 6], "merge handler");
				});
				var exitSpy = sinon.spy(function() {
					assert.deepEqual(this.data(), [1, 2], "exit handler");
				});
				layer.draw([1, 2, 3, 4]);

				// Bind the spies
				layer.on("update", updateSpy);
				layer.on("enter", enterSpy);
				layer.on("merge", mergeSpy);
				layer.on("exit", exitSpy);

				layer.draw([3, 4, 5, 6]);

				assert.equal(updateSpy.callCount, 1);
				assert.equal(enterSpy.callCount, 1);
				assert.equal(mergeSpy.callCount, 1);
				assert.equal(exitSpy.callCount, 1);

				layer.remove();
			});

			suite("Layer#off", function() {
				setup(function() {
					this.onEnter1 = sinon.spy();
					this.onEnter2 = sinon.spy();
					this.onUpdate = sinon.spy();
					this.layer = this.base.append("g").layer({
						insert: this.insert,
						dataBind: this.dataBind
					});
					this.layer.on("enter", this.onEnter1);
					this.layer.on("enter", this.onEnter2);
					this.layer.on("update", this.onUpdate);
				});
				teardown(function() {
					this.layer.remove();
				});
				test("unbinds only the specified handler", function() {
					this.layer.off("enter", this.onEnter1);
					this.layer.draw([]);

					assert.equal(this.onEnter1.callCount, 0);
					assert.equal(this.onEnter2.callCount, 1);
					assert.equal(this.onUpdate.callCount, 1);
				});
				test("unbinds only the handlers for the specified lifecycle selection", function() {
					this.layer.off("enter");
					this.layer.draw([]);

					assert.equal(this.onEnter1.callCount, 0);
					assert.equal(this.onEnter2.callCount, 0);
					assert.equal(this.onUpdate.callCount, 1);
				});
			});

			test("does not make transition selections if related handlers are not bound", function() {
				var layer = this.base.append("g").layer({
					insert: this.insert,
					dataBind: this.dataBind
				});
				var spies = {
					update: sinon.spy(),
					enter: sinon.spy(),
					merge: sinon.spy(),
					exit: sinon.spy()
				};
				layer.on("update", spies.update);
				layer.on("enter", spies.enter);
				layer.on("merge", spies.merge);
				layer.on("exit", spies.exit);

				layer.draw([]);

				assert.equal(spies.update.callCount, 1);
				assert.equal(spies.update.thisValues[0].transition.callCount,
					0);
				assert.equal(spies.enter.callCount, 1);
				assert.equal(spies.enter.thisValues[0].transition.callCount,
					0);
				assert.equal(spies.merge.callCount, 1);
				assert.equal(spies.merge.thisValues[0].transition.callCount,
					0);
				assert.equal(spies.exit.callCount, 1);
				assert.equal(spies.exit.thisValues[0].transition.callCount,
					0);
			});

			suite("bound in constructor", function() {
				setup(function() {
					this.spies = {
						"enter": sinon.spy(),
						"update": sinon.spy(),
						"merge": sinon.spy(),
						"exit": sinon.spy(),
						"enter:transition": sinon.spy(),
						"update:transition": sinon.spy(),
						"merge:transition": sinon.spy(),
						"exit:transition": sinon.spy()
					};
					this.layer = this.base.layer({
						dataBind: this.dataBind,
						insert: this.insert,
						events: this.spies
					});
				});
				test("invokes all event handlers exactly once", function() {
					this.layer.draw([]);

					assert.equal(this.spies.enter.callCount, 1);
					assert.equal(this.spies.update.callCount, 1);
					assert.equal(this.spies.merge.callCount, 1);
					assert.equal(this.spies.exit.callCount, 1);
					assert.equal(this.spies["enter:transition"].callCount, 1);
					assert.equal(this.spies["update:transition"].callCount, 1);
					assert.equal(this.spies["merge:transition"].callCount, 1);
					assert.equal(this.spies["exit:transition"].callCount, 1);
				});
				test("invokes all event handlers in the context of the corresponding 'lifecycle selection'", function() {
					var entering, updating, exiting;
					this.layer.draw([]);

					// Alias lifecycle selections
					entering = this.insert.returnValues[0];
					updating = this.dataBind.returnValues[0];
					exiting = updating.exit.returnValues[0];

					assert(this.spies.enter.calledOn(entering));
					assert(this.spies.update.calledOn(updating));
					assert(this.spies.merge.calledOn(updating));
					assert(this.spies.exit.calledOn(exiting));
					assert(this.spies["enter:transition"].calledOn(entering.transition.returnValues[0]));
					assert(this.spies["update:transition"].calledOn(updating.transition.returnValues[0]));
					assert(this.spies["merge:transition"].calledOn(updating.transition.returnValues[1]));
					assert(this.spies["exit:transition"].calledOn(exiting.transition.returnValues[0]));
				});

			});

			suite("bound with `on`", function() {
				setup(function() {
					this.onEnter1 = sinon.spy();
					this.onUpdate1 = sinon.spy();
					this.onMerge1 = sinon.spy();
					this.onExit1 = sinon.spy();
					this.onEnterTrans1 = sinon.spy();
					this.onUpdateTrans1 = sinon.spy();
					this.onMergeTrans1 = sinon.spy();
					this.onExitTrans1 = sinon.spy();
					this.onUpdate2 = sinon.spy();
					this.onMerge2 = sinon.spy();
					this.onExit2 = sinon.spy();
					this.onExit3 = sinon.spy();
					this.onEnterTrans2 = sinon.spy();
					this.onEnterTrans3 = sinon.spy();
					this.onUpdateTrans2 = sinon.spy();
					this.onMergeTrans2 = sinon.spy();
					this.onMergeTrans3 = sinon.spy();

				});
				test("invokes all event handlers exactly once", function() {
					this.layer.on("enter", this.onEnter1);
					this.layer.on("update", this.onUpdate1);
					this.layer.on("update", this.onUpdate2);
					this.layer.on("merge", this.onMerge1);
					this.layer.on("merge", this.onMerge2);
					this.layer.on("exit", this.onExit1);
					this.layer.on("exit", this.onExit2);
					this.layer.on("exit", this.onExit3);
					this.layer.on("enter:transition", this.onEnterTrans1);
					this.layer.on("enter:transition", this.onEnterTrans2);
					this.layer.on("enter:transition", this.onEnterTrans3);
					this.layer.on("update:transition", this.onUpdateTrans1);
					this.layer.on("update:transition", this.onUpdateTrans2);
					this.layer.on("merge:transition", this.onMergeTrans1);
					this.layer.on("merge:transition", this.onMergeTrans2);
					this.layer.on("merge:transition", this.onMergeTrans3);
					this.layer.on("exit:transition", this.onExitTrans1);

					this.layer.draw([]);

					assert.equal(this.onEnter1.callCount, 1);
					assert.equal(this.onUpdate1.callCount, 1);
					assert.equal(this.onUpdate2.callCount, 1);
					assert.equal(this.onMerge1.callCount, 1);
					assert.equal(this.onMerge2.callCount, 1);
					assert.equal(this.onExit1.callCount, 1);
					assert.equal(this.onExit2.callCount, 1);
					assert.equal(this.onExit3.callCount, 1);
					assert.equal(this.onEnterTrans1.callCount, 1);
					assert.equal(this.onEnterTrans2.callCount, 1);
					assert.equal(this.onEnterTrans3.callCount, 1);
					assert.equal(this.onUpdateTrans1.callCount, 1);
					assert.equal(this.onUpdateTrans2.callCount, 1);
					assert.equal(this.onMergeTrans1.callCount, 1);
					assert.equal(this.onMergeTrans2.callCount, 1);
					assert.equal(this.onMergeTrans3.callCount, 1);
					assert.equal(this.onExitTrans1.callCount, 1);
				});
				test("invokes event handlers in the order they were bound", function() {
					this.layer.on("exit", this.onExit1);
					this.layer.on("exit", this.onExit2);
					this.layer.on("exit", this.onExit3);

					this.layer.draw([]);

					assert(this.onExit1.calledBefore(this.onExit2));
					assert(this.onExit2.calledBefore(this.onExit3));
				});
				test("invokes all event handlers in the context of the corresponding 'lifecycle selection'", function() {
					var entering, updating, exiting;
					this.layer.on("enter", this.onEnter1);
					this.layer.on("update", this.onUpdate1);
					this.layer.on("merge", this.onMerge1);
					this.layer.on("exit", this.onExit1);
					this.layer.on("enter:transition", this.onEnterTrans1);
					this.layer.on("update:transition", this.onUpdateTrans1);
					this.layer.on("merge:transition", this.onMergeTrans1);
					this.layer.on("exit:transition", this.onExitTrans1);

					this.layer.draw([]);

					// Alias lifecycle selections
					entering = this.insert.returnValues[0];
					updating = this.dataBind.returnValues[0];
					exiting = updating.exit.returnValues[0];

					assert(this.onEnter1.calledOn(entering));
					assert(this.onUpdate1.calledOn(updating));
					assert(this.onMerge1.calledOn(updating));
					assert(this.onExit1.calledOn(exiting));
					assert(this.onEnterTrans1.calledOn(entering.transition.returnValues[0]));
					assert(this.onUpdateTrans1.calledOn(updating.transition.returnValues[0]));
					assert(this.onMergeTrans1.calledOn(updating.transition.returnValues[1]));
					assert(this.onExitTrans1.calledOn(exiting.transition.returnValues[0]));
				});

				suite("`chart' context specified in the `options` argument", function() {
					setup(function() {
						var chartVal = this.chartVal = {};
						this.handler = sinon.spy();
					});

					test("`enter`", function() {
						this.layer.on("enter", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`enter:transition`", function() {
						this.layer.on("enter:transition", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`update`", function() {
						this.layer.on("update", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`update:transition`", function() {
						this.layer.on("update:transition", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`merge`", function() {
						this.layer.on("merge", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`merge:transition`", function() {
						this.layer.on("merge:transition", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`exit`", function() {
						this.layer.on("exit", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});

					test("`exit:transition`", function() {
						this.layer.on("exit:transition", this.handler, {
							chart: this.chartVal
						});
						this.layer.draw([]);

						assert.equal(this.handler.thisValues[0].chart(),
							this.chartVal);
					});
				});

			});
		});
	});
	suite("events", function () {
		setup(function () {
			var base = this.base = d3.select("#test");
			this.layer = new base.layer({});
		});
		suite("#on", function () {
			test("returns the layer instance (chains)", function() {
				assert.equal(this.layer.on("e1"), this.layer);
			});
		});
		suite("#off", function () {
			test("returns the layer instance (chains)", function() {
				assert.equal(this.layer.off("e1"), this.layer);
			});
		});
	});
});
