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
			assert.typeOf(inst.draw, "function");
		});
		test("extends the selection with an `on` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.typeOf(inst.on, "function");
		});
		test("extends the selection with an `off` method", function() {
			var base = d3.select("#test");
			var inst = base.layer({});
			assert.typeOf(inst.off, "function");
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
		test("throws an error when `dataBind` does not return a selection", function() {
			var layer = this.base.layer({
				dataBind: function() {
					return {};
				},
				insert: this.insert
			});
			var draw = function() {
				layer.draw([]);
			};
			assert.throws(draw);
		});

		test("throws an error when `insert` does not return a selection", function() {
			var layer = this.base.layer({
				dataBind: this.dataBind,
				insert: function() { return {}; }
			});
			var draw = function() {
				layer.draw([]);
			};
			assert.throws(draw);
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
			setup(function() {
				this.onEnter1 = sinon.spy();
				this.onUpdate1 = sinon.spy();
				this.onMerge1 = sinon.spy();
				this.onExit1 = sinon.spy();
				this.onEnterTrans1 = sinon.spy();
				this.onUpdateTrans1 = sinon.spy();
				this.onMergeTrans1 = sinon.spy();
				this.onExitTrans1 = sinon.spy();
			});

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
					assert.sameMembers(this.data(), [3, 4]);
				});
				var enterSpy = sinon.spy(function() {
					assert.sameMembers(this.data(), [5, 6]);
				});
				var mergeSpy = sinon.spy(function() {
					assert.sameMembers(this.data(), [3, 4, 5, 6]);
				});
				var exitSpy = sinon.spy(function() {
					assert.sameMembers(this.data(), [1, 2]);
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

			suite("bound in constructor", function() {
				setup(function() {
					this.layer = this.base.layer({
						dataBind: this.dataBind,
						insert: this.insert,
						events: {
							"enter": this.onEnter1,
							"update": this.onUpdate1,
							"merge": this.onMerge1,
							"exit": this.onExit1,
							"enter:transition": this.onEnterTrans1,
							"update:transition": this.onUpdateTrans1,
							"merge:transition": this.onMergeTrans1,
							"exit:transition": this.onExitTrans1
						}
					});
				});
				test("invokes all event handlers exactly once", function() {
					this.layer.draw([]);

					assert.equal(this.onEnter1.callCount, 1);
					assert.equal(this.onUpdate1.callCount, 1);
					assert.equal(this.onMerge1.callCount, 1);
					assert.equal(this.onExit1.callCount, 1);
					assert.equal(this.onEnterTrans1.callCount, 1);
					assert.equal(this.onUpdateTrans1.callCount, 1);
					assert.equal(this.onMergeTrans1.callCount, 1);
					assert.equal(this.onExitTrans1.callCount, 1);
				});
				test("invokes all event handlers in the context of the corresponding 'lifecycle selection'", function() {
					var entering, updating, exiting;
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

			});

			suite("bound with `on`", function() {
				setup(function() {
					
					this.onUpdate2 = sinon.spy();
					this.onMerge2 = sinon.spy();
					this.onExit2 = sinon.spy();
					this.onExit3 = sinon.spy();
					this.onEnterTrans2 = sinon.spy();
					this.onEnterTrans3 = sinon.spy();
					this.onUpdateTrans2 = sinon.spy();
					this.onMergeTrans2 = sinon.spy();
					this.onMergeTrans3 = sinon.spy();

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
				});
				test("invokes all event handlers exactly once", function() {
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
				test("invokes all event handlers in the context of the corresponding 'lifecycle selection'", function() {
					var entering, updating, exiting;
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

			});
		});
	});
});
