describe("Spine.DataBind", function() {
	var PersonCollection, PersonController, SecondController, Watch = false;

	beforeEach(function() {
		PersonCollection = Spine.Model.sub();
		PersonCollection.configure("Person", 
			"firstName", 
			"lastName", 
			"phoneNumbers", 
			"phoneNumbersSelected",
			"birthDate",
			"company",
			"companies",
			"person",
			"title",
			"homepage",
			"rawHtml"
		);

		PersonCollection.include({
			formattedBirthDate: function(value) {
				if (value !== null && typeof(value) !== "undefined") {
					// We are setting
					if (value.indexOf("-") > 0) {
						// Assuming it's yyyy-MM-dd
						var parts = value.split("-");
						var date = new Date(parts[0],parts[1]-1,parts[2])
						this.birthDate = date.toLocaleDateString()
					} else {
						this.birthDate = value;
					}
				} else {
					if (this.birthDate == null || this.birthDate.length == 0)
						return;

					date = new Date(this.birthDate)
					return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
				}
			}
		});

		PersonController = Spine.Controller.sub();
		PersonController.include(Spine.DataBind);

		SecondController = Spine.Controller.sub();
		SecondController.include(Spine.DataBind);
	});

	describe("Update", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind span", function() {
				var firstNameSpan = $('#firstNameSpan');
				var firstNameSpanText = firstNameSpan.text();

				expect(firstNameSpanText).toBe("Nathan");
			});

			it("should change span when model is updated", function() {
				Person.firstName = "Eric";
				if (!Watch) Person.save();
				var firstNameSpan = $('#firstNameSpan');
				var firstNameSpanText = firstNameSpan.text();

				expect(firstNameSpanText).toBe("Eric");
			});

			it("should bind div", function() {
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();

				expect(firstNameDivText).toBe("Nathan");
			});

			it("should change div when model is updated", function() {
				Person.firstName = "Eric";
				if (!Watch) Person.save();
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();

				expect(firstNameDivText).toBe("Eric");
			});

			it("should bind on input", function() {
				var firstNameInput = $('#firstName');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change input when model is updated", function() {
				Person.firstName = "Eric";
				if (!Watch) Person.save();
				var firstNameInput = $('#firstName');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Eric");
			});

			it("should change model when changed on input", function() {
				var firstNameInput = $('#firstName');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should bind on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on textarea", function() {
				var firstNameInput = $('#firstNameTextArea');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");	
			});

			it("should change textarea when model is updated", function() {
				Person.firstName = "Eric";
				if (!Watch) Person.save();
				var firstNameInput = $('#firstNameTextArea');
				var firstNameInputText = firstNameInput.val();

				expect(firstNameInputText).toBe("Eric");
			});

			it("should bind on select", function() {
				var firstNameInput = $('#firstNameSelect');
				var firstNameInputText = firstNameInput.find("option:selected").val();

				expect(firstNameInputText).toBe("Nathan");
			});

			it("should change model when changed on select", function() {
				expect(Person.firstName).toBe("Nathan");

				var firstNameInput = $('#firstNameSelect');
				firstNameInput.find("option[value='Eric']").attr("selected", "selected");
				firstNameInput.trigger("change");

				expect(Person.firstName).toBe("Eric");
			});

			it("should change select when model is updated", function() {
				Person.firstName = "Eric";
				if (!Watch) Person.save();				

				var firstNameInput = $('#firstNameSelect');
				var firstNameInputAttr = firstNameInput.find("option[value='Eric']").attr("selected");

				expect(firstNameInputAttr).toBe("selected");
			});

			// Disabled since we no longer set the prototype
			xit("ui should reflect model prototype", function() {
				// First you must set the value in the ui
				var firstNameInput = $('#firstName');
				firstNameInput.val('Nathan');
				firstNameInput.trigger('change');

				// Then pull out the value from the colletion
				var person = PersonCollection.first();
				person.firstName = "Eric";
				if (!Watch) person.save();

				var firstNameInputText = firstNameInput.val();
				expect(firstNameInputText).toBe("Eric");
			});

			it("should unbind without destroying other bindings", function() {
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();
				if (Watch) {
					Person.bind("update[firstName]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[firstName]"].length).toBe(6);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["update[firstName]"].length).toBe(1);
				} else {
					Person.bind("change", function() { console.log("update"); });
					expect(Person.constructor._callbacks["change"].length).toBe(8);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["change"].length).toBe(1);
				}
			});

			it("should rebind without destroying other bindings", function() {
				var firstNameDiv = $('#firstNameDiv');
				var firstNameDivText = firstNameDiv.text();
				if (Watch) {
					Person.bind("update[firstName]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[firstName]"].length).toBe(6);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["update[firstName]"].length).toBe(6);
				} else {
					Person.bind("change", function() { console.log("update"); });
					expect(Person.constructor._callbacks["change"].length).toBe(8);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["change"].length).toBe(8);
				}
			});

			it("should only destroy current controller bindings", function() {
				var current;
				if (Watch) {
					current = Person.constructor._callbacks["update[firstName]"].length;
				} else {
					current = Person.constructor._callbacks["change"].length;
				}

				anotherController = SecondController.init({ el: 'body', model:Person });

				if (Watch) {
					expect(Person.constructor._callbacks["update[firstName]"].length).toBe(current+5);
				} else {
					expect(Person.constructor._callbacks["change"].length).toBe(current+7);
				}
			});

			it("should bind element to change", function() {
				binder = Controller.binders[0];
				spyOn(binder, "change");

				var firstNameInput = $('#firstName');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(binder.change).toHaveBeenCalled();
			});

			it("should unbind element when destroyed", function() {
				binder = Controller.binders[0];
				spyOn(binder, "change");

				Controller.destroyBindings();

				var firstNameInput = $('#firstName');
				firstNameInput.val("Eric");
				firstNameInput.trigger("change");

				expect(binder.change).not.toHaveBeenCalled();
			});

			it("should set unescaped html with the html binder", function() {
				Person.rawHtml = "<p>Paragraph</p>";
				if (!Watch) Person.save();

				var rawHtml = $('#rawHtml');
				expect(rawHtml.html()).toBe("<p>Paragraph</p>");
			});

			it("should bind to select", function() {
				var companySelect = $('#companySelect');
				var selected = companySelect.find(":selected");
				expect(selected.val()).toBe("Spruce Media");
			});

			it("should bind to select and change on model update", function() {
				var companySelect = $('#companySelect');
				
				Person.company = "America Online";
				if (!Watch) Person.save();

				var selected = companySelect.find(":selected");
				expect(selected.val()).toBe("America Online");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan'/>",
					"<div id='firstNameDiv'/>",
					"<input type='text' id='firstName'/>",
					"<input type='textarea' id='firstNameTextArea'/>",
					"<select id='firstNameSelect'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>",
					"<select id='companySelect'><option value='Other'/><option value='Spruce Media'/><option value='America Online'/></select>",
					"<div id='rawHtml'/>"
				].join(""));

				PersonController.include({
					bindings: {
						"text #firstNameSpan":"firstName",
						"text #firstNameDiv":"firstName",
						"value #firstName":"firstName",
						"value #firstNameTextArea":"firstName",
						"value #firstNameSelect":"firstName",
						"value #companySelect":"company",
						"html #rawHtml":"rawHtml"
					}
				});

				SecondController.include({
					bindings: {
						"text #firstNameSpan":"firstName",
						"text #firstNameDiv":"firstName",
						"value #firstName":"firstName",
						"value #firstNameTextArea":"firstName",
						"value #firstNameSelect":"firstName",
						"value #companySelect":"company",
						"html #rawHtml":"rawHtml"
					}
				});

				Watch = false;
				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer", company: "Spruce Media" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan'/>",
					"<div id='firstNameDiv'/>",
					"<input type='text' id='firstName'/>",
					"<input type='textarea' id='firstNameTextArea'/>",
					"<select id='firstNameSelect'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>",
					"<select id='companySelect'><option value='Other'/><option value='Spruce Media'/><option value='America Online'/></select>",
					"<div id='rawHtml'/>"
				].join(""));

				PersonController.include({
					bindings: {
						"text #firstNameSpan":"firstName",
						"text #firstNameDiv":"firstName",
						"value #firstName":"firstName",
						"value #firstNameTextArea":"firstName",
						"value #firstNameSelect":"firstName",
						"value #companySelect":"company",
						"html #rawHtml":"rawHtml"
					}
				});

				SecondController.include({
					bindings: {
						"text #firstNameSpan":"firstName",
						"text #firstNameDiv":"firstName",
						"value #firstName":"firstName",
						"value #firstNameTextArea":"firstName",
						"value #firstNameSelect":"firstName"
					}
				});

				Watch = true;
				PersonCollection.include(Spine.Watch);
				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer", company: "Spruce Media" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan' data-bind='text: firstName'/>",
					"<div id='firstNameDiv' data-bind='text: firstName'/>",
					"<input type='text' id='firstName' data-bind='value: firstName'/>",
					"<input type='textarea' id='firstNameTextArea' data-bind='value: firstName'/>",
					"<select id='firstNameSelect' data-bind='value: firstName'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>",
					"<select id='companySelect' data-bind='value: company'><option value='Other'/><option value='Spruce Media'/><option value='America Online'/></select>",
					"<div id='rawHtml' data-bind='html: rawHtml'/>"
				].join(""));

				Watch = false;
				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer", company: "Spruce Media" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with data-bind and watch", function() {
			beforeEach(function() {
				setFixtures([
					"<span id='firstNameSpan' data-bind='text: firstName'/>",
					"<div id='firstNameDiv' data-bind='text: firstName'/>",
					"<input type='text' id='firstName' data-bind='value: firstName'/>",
					"<input type='textarea' id='firstNameTextArea' data-bind='value: firstName'/>",
					"<select id='firstNameSelect' data-bind='value: firstName'><option value='Other'/><option value='Nathan'/><option value='Eric'/></select>",
					"<select id='companySelect' data-bind='value: company'><option value='Other'/><option value='Spruce Media'/><option value='America Online'/></select>",
					"<div id='rawHtml' data-bind='html: rawHtml'/>"
				].join(""));

				Watch = true;
				PersonCollection.include(Spine.Watch);
				Person = PersonCollection.create({ firstName: "Nathan", lastName: "Palmer", company: "Spruce Media" });
				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Options", function() {
		var Person, Controller;

		var Tests = function() {
			it("should create options", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>'
				].join("");
				expect(phoneNumberSelect.html()).toBe(phoneNumberHtml);
			});

			it("should update options when model is changed", function() {
				// Spine.Watch cannot current detect changes to an array
				//Person.phoneNumbers.push("555-199-0030");
				Person.phoneNumbersSelected = [];
				if (!Watch) Person.save();
				Person.phoneNumbers = [ "555-555-1010", "555-101-9999", "555-199-0030" ];
				if (!Watch) Person.save();
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>',
					'<option value="555-199-0030">555-199-0030</option>'
				].join("");
				expect(phoneNumberSelect.html()).toBe(phoneNumberHtml);
			});

			it("should bind selectedOptions", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				phoneNumberSelect.find("option[value='555-101-9999']").attr("selected", "selected");
				phoneNumberSelect.trigger("change");
				//expect(Person.phoneNumbersSelected.length).toBe(1);
				expect(Person.phoneNumbersSelected).toBe(Person.phoneNumbers[1]);
			});

			it("should update selectedOptions when model is changed", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumber1 = function() { return phoneNumberSelect.find("option[value='555-555-1010']").attr("selected"); };
				var phoneNumber2 = function() { return phoneNumberSelect.find("option[value='555-101-9999']").attr("selected"); };

				expect(phoneNumber1()).toBe("selected");
				expect(phoneNumber2()).toBe(undefined);

				Person.phoneNumbersSelected = [ "555-101-9999" ];
				if (!Watch) Person.save();
				
				expect(phoneNumber1()).toBe(undefined);
				expect(phoneNumber2()).toBe("selected");
			});

			it("should bind hashes", function() {
				var companySelect = $('#company');
				var companyHtml = [
					'<option value="" selected="selected">Select...</option>',
					'<option value="1">Apple</option>',
					'<option value="0">Google</option>'
				].join("");

				elements = companySelect.find("option")
				expect($(elements[0]).attr("selected")).toBe("selected")
				expect($(elements[1]).attr("selected")).toBe(undefined)
				expect($(elements[2]).attr("selected")).toBe(undefined)

				// expect(companySelect.html()).toBe(companyHtml);
			});

			it("should bind hashes and selectedOptions", function() {
				var companySelect = $('#company');
				companySelect.find('option[value="0"]').attr("selected", "selected");
				companySelect.trigger("change");
				expect(Person.company).toBe("0");
			});

			it("should unbind without destroying other bindings", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>'
				].join("");

				if (Watch) {
					Person.bind("update[phoneNumbers]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[phoneNumbers]"].length).toBe(2);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["update[phoneNumbers]"].length).toBe(1);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(5);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["change"].length).toBe(1);
				}
			});

			it("should rebind without destroying other bindings", function() {
				var phoneNumberSelect = $('#phoneNumbers');
				var phoneNumberHtml = [
					'<option value="555-555-1010">555-555-1010</option>',
					'<option value="555-101-9999">555-101-9999</option>'
				].join("");

				if (Watch) {
					Person.bind("update[phoneNumbers]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[phoneNumbers]"].length).toBe(2);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["update[phoneNumbers]"].length).toBe(2);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(5);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["change"].length).toBe(5);
				}
			});

			it("should bind element to change", function() {
				binder = Controller.binders[2];
				spyOn(binder, "change");

				var phoneNumberSelect = $('#phoneNumbers');
				phoneNumberSelect.find("option[value='555-101-9999']").attr("selected", "selected");
				phoneNumberSelect.trigger("change");

				expect(binder.change).toHaveBeenCalled();
			});

			it("should unbind element when destroyed", function() {
				binder = Controller.binders[1];
				spyOn(binder, "change");

				Controller.destroyBindings();

				var phoneNumberSelect = $('#phoneNumbers');
				phoneNumberSelect.find("option[value='555-101-9999']").attr("selected", "selected");
				phoneNumberSelect.trigger("change");

				expect(binder.change).not.toHaveBeenCalled();
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers'/>",
					"<select id='company'/>"
				].join(""));
				
				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: [],
					company: "",
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});

				PersonController.include({
					bindings: {
						"options #phoneNumbers":"phoneNumbers",
						"selectedOptions #phoneNumbers":"phoneNumbersSelected",
						"options #company":"companies",
						"selectedOptions #company":"company"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers'/>",
					"<select id='company'/>"
				].join(""));

				PersonCollection.include(Spine.Watch);
				Watch = true;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: [],
					company: "",
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});

				PersonController.include({
					bindings: {
						"options #phoneNumbers":"phoneNumbers",
						"selectedOptions #phoneNumbers":"phoneNumbersSelected",
						"options #company":"companies",
						"selectedOptions #company":"company"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with empty options and/or selectedOptions bindings", function() {
			var Person, Controller;
			beforeEach(function() {
				setFixtures([
					"<select id='company'/>"
				].join(""));

				Watch = false;
				PersonController.include({
					bindings: {
						"options #company":"companies",
						"selectedOptions #company":"company"
					}
				});
			});

			it("should handle a bound undefined options", function() {
				Person = PersonCollection.create({
					firstName: "Nathan",
					lastName: "Palmer",
					phoneNumbers: [],
					phoneNumbersSelected: [],
					company: '',
					companies: undefined
				});
				Controller = PersonController.init({
					el: 'body',
					model: Person,
					init: function() {
						this.refreshBindings(this.model);
					}
				});
			});

			it("should handle a bound undefined selectedOptions", function() {
				Person = PersonCollection.create({
					firstName: "Nathan",
					lastName: "Palmer",
					phoneNumbers: [],
					phoneNumbersSelected: [],
					company: undefined,
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});
				Controller = PersonController.init({
					el: 'body',
					model: Person,
					init: function() {
						this.refreshBindings(this.model);
					}
				});
			});
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<select id='phoneNumbers' data-bind='options: phoneNumbers, selectedOptions: phoneNumbersSelected'/>",
					"<select id='company' data-bind='options: companies, selectedOptions: company'/>"
				].join(""));

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					phoneNumbersSelected: [],
					company: "",
					companies: { "": "Select...", 0: "Google", 1: "Apple" }
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Click", function() {
		var Person, Controller;

		var Tests = function() {
			it("should reset name", function() {
				expect(Person.firstName).toBe("Nathan");

				$('#reset').click();

				expect(Person.firstName).toBe("Reset");
			});

			it("should bind element to click", function() {
				binder = Controller.binders[3];
				spyOn(binder, "execute");

				$('#reset').click();

				expect(binder.execute).toHaveBeenCalled();
			});

			it("should unbind element when destroyed", function() {
				binder = Controller.binders[2];
				spyOn(binder, "change");

				Controller.destroyBindings();

				$('#reset').click();

				expect(binder.change).not.toHaveBeenCalled();
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				PersonCollection.include({
					resetName: function() {
						this.firstName = "Reset";
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset'/>");

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer"
				});

				PersonController.include({
					bindings: {
						"click input":"resetName"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				PersonCollection.include({
					resetName: function() {
						this.firstName = "Reset";
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset' data-bind='click: resetName'/>");

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Enable", function() {
		var Person, Controller;

		var Tests = function() {
			it("should start out disabled", function() {
				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe('disabled');
			});

			it("should enable when phone numbers present", function() {
				Person.phoneNumbers.push("555-555-9090");
				if (!Watch) Person.save();

				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe(undefined);
			});

			it("should unbind without destroying other bindings", function() {
				Person.bind("change", function() { console.log("update"); });
				expect(Person.constructor._callbacks["change"].length).toBe(2);
				Controller.destroyBindings();
				expect(Person.constructor._callbacks["change"].length).toBe(1);
			});

			it("should rebind without destroying other bindings", function() {
				Person.bind("change", function() { console.log("update"); });
				expect(Person.constructor._callbacks["change"].length).toBe(2);
				Controller.refreshBindings(Person);
				expect(Person.constructor._callbacks["change"].length).toBe(2);
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset'/>");

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"enable input":"phoneNumberCount"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});
				PersonCollection.include(Spine.Watch);

				setFixtures("<input id='reset' type='button' value='reset'/>");

				Watch = true;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"enable input":"phoneNumbers"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			// These tests are skipped for now because Spine.Watch hasn't
			// implemented any functionality that will subscribe to events
			// of dependent fields (in this case the phoneNumbers field)
			// when called by a function.
			//Tests();

			it("should start out enabled", function() {
				var reset = $('#reset');
				expect(reset.attr('disabled')).toBe(undefined);
			});

			it("should changed to disabled", function() {
				var reset = $('#reset');
				Person.phoneNumbers = null;
				expect(reset.attr('disabled')).toBe('disabled');
			});
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset' data-bind='enable: phoneNumberCount'/>");

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});	
	});

	describe("Visible", function() {
		var Person, Controller;

		var Tests = function() {
			it("should start out hidden", function() {
				var reset = $('#reset');
				expect(reset.css('display')).toBe('none');
			});

			it("should display when phone numbers present", function() {
				Person.phoneNumbers.push("555-555-9090");
				if (!Watch) Person.save();

				var reset = $('#reset');
				expect(reset.css('display')).toNotBe('none');
			});	

			it("should unbind without destroying other bindings", function() {
				if (Watch) {
					Person.bind("update[phoneNumberCount]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[phoneNumberCount]"].length).toBe(2);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["update[phoneNumberCount]"].length).toBe(1);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(2);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["change"].length).toBe(1);
				}
			});

			it("should rebind without destroying other bindings", function() {
				if (Watch) {
					Person.bind("update[phoneNumberCount]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[phoneNumberCount]"].length).toBe(2);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["update[phoneNumberCount]"].length).toBe(2);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(2);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["change"].length).toBe(2);
				}
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset'/>");

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"visible input":"phoneNumberCount"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});
				PersonCollection.include(Spine.Watch);

				setFixtures("<input id='reset' type='button' value='reset'/>");

				Watch = true;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"visible input":"phoneNumbers"
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			// These tests are skipped for now because Spine.Watch hasn't
			// implemented any functionality that will subscribe to events
			// of dependent fields (in this case the phoneNumbers field)
			// when called by a function.
			//Tests();

			it("should start out visible", function() {
				var reset = $('#reset');
				expect(reset.css('display')).toNotBe('none');
			});

			it("should changed to invisible", function() {
				var reset = $('#reset');
				Person.phoneNumbers = null;
				expect(reset.css('display')).toBe('none');
			});
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				PersonCollection.include({
					phoneNumberCount: function() {
						return this.phoneNumbers.length;
					},
					reset: function() {
						this.phoneNumbers = [];
						this.save();
					}
				});

				setFixtures("<input id='reset' type='button' value='reset' data-bind='visible: phoneNumberCount'/>");

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});	
	});

	describe("Attr", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind to href", function() {
				var a = $('#homepage');
				expect(a.attr('href')).toBe('http://www.example.com');
			});

			it("should unbind without destroying other bindings", function() {
				if (Watch) {
					Person.bind("update[homepage]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[homepage]"].length).toBe(2);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["update[homepage]"].length).toBe(1);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(2);
					Controller.destroyBindings();
					expect(Person.constructor._callbacks["change"].length).toBe(1);
				}
			});

			it("should rebind without destroying other bindings", function() {
				if (Watch) {
					Person.bind("update[homepage]", function() { console.log("update"); });
					expect(Person.constructor._callbacks["update[homepage]"].length).toBe(2);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["update[homepage]"].length).toBe(2);
				} else {
					Person.bind("change", function() { console.log("change"); });
					expect(Person.constructor._callbacks["change"].length).toBe(2);
					Controller.refreshBindings(Person);
					expect(Person.constructor._callbacks["change"].length).toBe(2);
				}
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures("<a id='homepage'/>");

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					homepage: "http://www.example.com",
					phoneNumbers: []
				});

				PersonController.include({
					bindings: {
						"attr #homepage":'{ "href": "homepage" }'
					}
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();			
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures("<a id='homepage' data-bind='attr: { \"href\": \"homepage\" }'/>");

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					homepage: "http://www.example.com",
					phoneNumbers: []
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	xdescribe("Submit", function() {
		var Person;

		beforeEach(function() {
			PersonCollection.include({
				currentNumber: "",

				addNumber: function() {
					this.phoneNumbers.push(this.currentNumber);	
				}
			});

			setFixtures([
				"<form data-bind='submit: addNumber'>",
					"<input type='text' data-bind='value: currentNumber, valueUpdate: \"afterkeydown\"'/>",
					"<input type='submit' id='submit'/>",
				"</form>"
			].join(""));

			Person = PersonCollection.create({ 
				firstName: "Nathan", 
				lastName: "Palmer",
				phoneNumbers: []
			});
		});

		it("should capture submit event", function() {
			Person.currentNumber = "555-555-9090";
			Person.save();

			$('#submit').click();

			expect(Person.phoneNumbers.length).toBe(1);
			expect(Person.phoneNumbers[0]).toBe("555-555-9090");
		});
	});

	describe("Checked", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind to person", function() {
				var person = $('#person');
				expect(person.attr('checked')).toBe('checked');
			});

			it("should change element when model is updated", function() {
				Person.person = false;
				if (!Watch) Person.save();

				var person = $('#person');
				expect(person.attr('checked')).toBe(undefined);
			});

			it("should change model element is checked", function() {
				var person = $('#person');
				person.attr("checked",false);
				person.trigger("change");

				expect(Person.person).toBe(false);
			});

			it("should bind element to change", function() {
				binder = Controller.binders[7];
				spyOn(binder, "change");

				var person = $('#person');
				person.attr("checked",false);
				person.trigger("change");

				expect(binder.change).toHaveBeenCalled();
			});

			it("should unbind element when destroyed", function() {
				binder = Controller.binders[7];
				spyOn(binder, "change");

				Controller.destroyBindings();

				var person = $('#person');
				person.attr("checked",false);
				person.trigger("change");

				expect(binder.change).not.toHaveBeenCalled();
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='checkbox' id='person'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				PersonController.include({
					bindings: {
						"checked input[type=checkbox]": "person"
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					person: true
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='checkbox' id='person'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				PersonController.include({
					bindings: {
						"checked input[type=checkbox]": "person"
					}
				});
				PersonCollection.include(Spine.Watch);

				Watch = true;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					person: true
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='checkbox' data-bind='checked: person' id='person'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					person: true
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Radio", function() {
		var Person, Controller;

		var Tests = function() {
			it("should bind to mr", function() {
				var mr = $('#mr');
				var mrs = $('#mrs');
				expect(mr.attr('checked')).toBe('checked');
				expect(mrs.attr('checked')).toBe(undefined);
			});

			it("should change radio when changed on model", function() {
				Person.title = "Mrs";
				if (!Watch) Person.save();

				var mr = $('#mr');
				var mrs = $('#mrs');
				expect(mr.attr('checked')).toBe(undefined);
				expect(mrs.attr('checked')).toBe('checked');
			});

			it("should change model when changed on radio", function() {
				var mr = $('#mr');
				var mrs = $('#mrs');

				mrs.attr("checked","checked")
				mr.removeAttr("checked")
				$("input[type=radio]").trigger("change")
	
				expect(Person.title).toBe("Mrs");
			});
		};

		describe("with data-bind", function() {
			beforeEach(function() {
				setFixtures([
					"<form data-bind='submit: addNumber'>",
						"<input type='radio' data-bind='checked: title' value='Mr' id='mr'/>",
						"<input type='radio' data-bind='checked: title' value='Mrs' id='mrs'/>",
						"<input type='submit' id='submit'/>",
					"</form>"
				].join(""));

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with bindings", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='radio' name='title' value='Mr' id='mr'/>",
						"<input type='radio' name='title' value='Mrs' id='mrs'/>",
					"</form>"
				].join(""));

				PersonController.include({
					bindings: {
						"checked input[type=radio]": "title"
					}
				});

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				setFixtures([
					"<form>",
						"<input type='radio' name='title' value='Mr' id='mr'/>",
						"<input type='radio' name='title' value='Mrs' id='mrs'/>",
					"</form>"
				].join(""));

				PersonController.include({
					bindings: {
						"checked input[type=radio]": "title"
					}
				});

				Watch = true;
				PersonCollection.include(Spine.Watch);

				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Hash", function() {
		var Person, Controller, Hash;

		var Tests = function() {
			it("should set hash when model changes", function() {
				Person.firstName = "Eric";
				Person.lastName = ""
				Person.phoneNumbers = undefined;
				Person.birthDate = undefined;
				if (!Watch) Person.save();

				waitsFor(function() {
					return Hash.event.time === null
				}, 10000);
				
				runs(function() {
					expect(window.location.hash).toBe("#firstName=Eric");
				});
			});

			it("should set model when hash changes", function() {
				var parsed = false;
				Person.bind("hashcomplete", function() { parsed = true; });

				window.location.hash = "#firstName=Eric";
				$(window).trigger("hashchange");

				waitsFor(function() {
					return parsed === true;
				}, 5000);

				runs(function() {
					expect(Person.firstName).toBe("Eric");
				});
			});

			it("does not need to have the same target name as property", function() {
				var parsed = false;
				Person.bind("hashcomplete", function() { parsed = true; });

				window.location.hash = "#last=Bender";
				$(window).trigger("hashchange");

				waitsFor(function() {
					return parsed === true;
				}, 5000);

				runs(function() { 
					expect(Person.lastName).toBe("Bender");
				});
			});

			it("should bind multiple values to an array", function() {
				var parsed = false;
				Person.bind("hashcomplete", function() { parsed = true; });

				window.location.hash = "#numbers=801-442-4773&numbers=800-939-2033";
				$(window).trigger("hashchange");

				waitsFor(function() {
					return parsed === true;
				}, 5000);

				runs(function() {
					expect(Person.phoneNumbers.length).toBe(2)
					expect(Person.phoneNumbers).toContain("801-442-4773")
					expect(Person.phoneNumbers).toContain("800-939-2033")
				});
			});

			it("should bind multiple values to multiple keys of the hash", function() {
				// We may want to change this if ever want support for rails/php
				Person.firstName = "";
				Person.lastName = ""
				Person.birthDate = undefined;
				Person.phoneNumbers = [ "801-442-4773", "800-939-2033" ];
				if (!Watch) Person.save();

				waitsFor(function() {
					return Hash.event.time === null
				}, 10000);

				runs(function() {
					expect(window.location.hash).toBe("#numbers=801-442-4773&numbers=800-939-2033");
				});
			});

			it("should only bind to hashchange once", function() {
				expect($(window).data("events")["hashchange"].length).toEqual(1);
			});

			// So technically this gets called for every property
			// on the model. But it's ok since it only parses once per
			// the previous test.
			it("should only trigger change once", function() {
				binder = Controller.binders[8];
				spyOn(binder, "change").andCallThrough();

				Person.firstName = "Eric";
				if (!Watch) Person.save();

				expect(binder.change.calls.length).toEqual(0);
			});

			it("should display the formatted date", function() {
				Person.firstName = "";
				Person.lastName = ""
				Person.phoneNumbers = [];
				Person.birthDate = "08/01/2012";
				if (!Watch) Person.save();

				waitsFor(function() {
					return Hash.event.time === null
				}, 10000);

				runs(function() {
					expect(window.location.hash).toBe("#birth=2012-8-1");
				});
			});

			it("should accept a change from a function", function() {
				var parsed = false;
				Person.bind("hashcomplete", function() { parsed = true; });

				window.location.hash = "#birth=2012-4-1";
				$(window).trigger("hashchange");

				waitsFor(function() {
					return parsed === true;
				}, 5000);

				runs(function() {
					expect(Person.birthDate).toBe("04/01/2012")
				});
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				window.location.hash = "";

				PersonController.include({
					bindings: {
						"hash firstName": "firstName",
						"hash last"     : "lastName",
					 	"hash numbers"  : "phoneNumbers",
					 	"hash birth"    : "formattedBirthDate"
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr",
					birthDate: ""
				});

				Controller = PersonController.init({ el: 'body', model:Person });
				Hash = Controller.binders[8];
			});

			Tests();	
		});

		describe("with bindings and watch", function() {
			beforeEach(function() {
				window.location.hash = "";

				PersonController.include({
					bindings: {
						"hash firstName": "firstName",
						"hash last"     : "lastName",
						"hash numbers"  : "phoneNumbers",
						"hash birth"    : "formattedBirthDate"
					}
				});
				
				Watch = true;
				PersonCollection.include(Spine.Watch);
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					phoneNumbers: [ "555-555-1010", "555-101-9999" ],
					title: "Mr"
				});

				Person.bind("update[birthDate]", function() {
					// You must trigger any dependencies manually
					this.trigger("update[formattedBirthDate]");
				});

				Controller = PersonController.init({ el: 'body', model:Person });
				Hash = Controller.binders[8];
			});

			Tests();	
		});
	});

	describe("Cookie", function() {
		var Person, Controller;

		var Tests = function() {
			it("should set the property from a cookie", function() {
				expect(Person.firstName).toBe("Eric");
			});

			it("should set the cookie when model gets updated", function() {
				Person.firstName = "Bender";
				if (!Watch) Person.save();

				expect(document.cookie).toBe("firstName=Bender");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
				document.cookie = "firstName=Eric"

				PersonController.include({
					bindings: {
						"cookie firstName": "firstName",
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Cookie & Hash", function() {
		var Person, Controller;

		var Tests = function() {
			it("should read cookie first then override with hash", function() {
				expect(Person.firstName).toBe("Bender");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				document.cookie = "firstName=Eric;"
				document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
				window.location.hash = "#firstName=Bender&lastName=Rogers"

				PersonController.include({
					bindings: {
						"cookie firstName": "firstName",
						"hash firstName": "firstName",
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	describe("Hash & Cookie", function() {
		var Person, Controller;

		var Tests = function() {
			it("should always read cookie first then override with hash", function() {
				expect(Person.lastName).toBe("Rogers");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
				document.cookie = "lastName=Boris;"
				window.location.hash = "#firstName=Bender&lastName=Rogers"

				PersonController.include({
					bindings: {
						"hash lastName": "lastName",
						"cookie lastName": "lastName",
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});

	xdescribe("Cookie priority", function() {
		var Person, Controller;

		var Tests = function() {
			it("when hash changes to blank the model updates", function() {
				expect(Person.lastName).toBe("Boris");
			});
		};

		describe("with bindings", function() {
			beforeEach(function() {
				document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
				document.cookie = "lastName=Boris;"
				window.location.hash = "#firstName=Bender&lastName=Rogers"

				PersonController.include({
					bindings: {
						"hash lastName": "lastName",
						"cookie lastName": "lastName",
					}
				});

				Watch = false;
				Person = PersonCollection.create({ 
					firstName: "Nathan", 
					lastName: "Palmer",
					title: "Mr"
				});

				Controller = PersonController.init({ el: 'body', model:Person });
			});

			Tests();
		});
	});
});