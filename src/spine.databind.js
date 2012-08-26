// Generated by CoffeeScript 1.3.3
(function() {
  var Attribute, Checked, Click, Controller, Cookie, DataBind, ElementBound, Enable, Hash, HashTimer, Options, SelectedOptions, Spine, Update, Visible,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Spine = this.Spine;

  ElementBound = (function() {

    function ElementBound() {}

    ElementBound.prototype.priority = 3;

    ElementBound.prototype.bind = function(controller, model, key, target, change, execute) {
      var binder, unbinder,
        _this = this;
      if (typeof this.event === "undefined") {
        return;
      }
      target.bind(this.event + ".spine-databind", binder = function(event) {
        if (typeof _this.get === "undefined") {
          return _this.execute(execute);
        } else {
          return _this.change(key, target, change);
        }
      });
      return controller.bind("destroy-bindings", unbinder = function(record) {
        target.unbind(_this.event + ".spine-databind", binder);
        return controller.unbind("destroy-bindings", unbinder);
      });
    };

    ElementBound.prototype.change = function(key, target, callback) {
      return callback(target, this.get(key, target));
    };

    ElementBound.prototype.execute = function(callback) {
      return callback();
    };

    return ElementBound;

  })();

  Update = (function(_super) {

    __extends(Update, _super);

    function Update() {
      return Update.__super__.constructor.apply(this, arguments);
    }

    Update.prototype.keys = ["text", "value", "html"];

    Update.prototype.event = "change";

    Update.prototype.get = function(key, target) {
      var e;
      e = $(target[0]);
      switch (e[0].tagName) {
        case "INPUT":
        case "SELECT":
        case "TEXTAREA":
          return e.val();
        default:
          return e.text();
      }
    };

    Update.prototype.set = function(key, target, value) {
      var e, formatted, isSelected, shouldBeSelected;
      e = $(target[0]);
      switch (e[0].tagName) {
        case "INPUT":
        case "TEXTAREA":
          if (e.val() !== value) {
            e.val(value);
            return e.trigger("change");
          }
          break;
        case "SELECT":
          isSelected = e.find(":not(option[value=" + value + "]):selected");
          shouldBeSelected = e.find("option[value=" + value + "]:not(:selected)");
          if (isSelected.length > 0 || shouldBeSelected.length > 0) {
            isSelected.each(function(key, element) {
              return $(element).removeAttr("selected");
            });
            shouldBeSelected.attr("selected", "selected");
            return e.trigger("change");
          }
          break;
        default:
          if (typeof value === "object" && value && value.constructor === Array) {
            formatted = value.join(",");
          } else if (typeof value === "object" && value) {
            formatted = value.toString();
          } else {
            formatted = value;
          }
          if (key === "html") {
            return e.html(formatted);
          } else {
            if (e.text() !== formatted) {
              e.text(formatted);
              return e.trigger("change");
            }
          }
      }
    };

    return Update;

  })(ElementBound);

  Options = (function(_super) {

    __extends(Options, _super);

    function Options() {
      return Options.__super__.constructor.apply(this, arguments);
    }

    Options.prototype.keys = ["options"];

    Options.prototype.set = function(key, target, value) {
      var array, changed, count, index, item, option, options, property, result, selected, _i, _j, _k, _len, _len1, _ref,
        _this = this;
      array = value;
      options = target.children('option');
      if (!array) {
        result = target.find("option").map(function(index, item) {
          return {
            text: $(item).text(),
            value: $(item).val()
          };
        });
      } else if (array instanceof Array) {
        result = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = array.length; _i < _len; _i++) {
            item = array[_i];
            _results.push({
              text: item,
              value: item
            });
          }
          return _results;
        })();
      } else {
        result = Object.keys(array).map(function(r) {
          return {
            text: array[r],
            value: r
          };
        }).sort(function(a, b) {
          if (b.value === "") {
            return 1;
          } else if (a.value === "") {
            return -1;
          } else {
            return a.text.localeCompare(b.text);
          }
        });
      }
      count = 0;
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        property = result[_i];
        count = count = count + 1;
      }
      changed = false;
      for (index = _j = 0, _len1 = result.length; _j < _len1; index = ++_j) {
        item = result[index];
        option = options.length > index ? $(options[index]) : null;
        selected = "";
        if (option === null) {
          target.append("<option value='" + item.value + "' " + selected + ">" + item.text + "</option>");
          changed = true;
        } else {
          if (option.text() !== item.text) {
            option.text(item.text);
          }
          if ((typeof option.val === "function" ? option.val() : void 0) !== item.value) {
            option.val(item.value);
          }
        }
      }
      if (options.length > count) {
        for (index = _k = count, _ref = options.length; count <= _ref ? _k <= _ref : _k >= _ref; index = count <= _ref ? ++_k : --_k) {
          $(options[index]).remove();
          changed = true;
        }
      }
      if (changed) {
        return true;
      }
      return false;
    };

    return Options;

  })(ElementBound);

  SelectedOptions = (function(_super) {

    __extends(SelectedOptions, _super);

    function SelectedOptions() {
      return SelectedOptions.__super__.constructor.apply(this, arguments);
    }

    SelectedOptions.prototype.keys = ["selectedOptions"];

    SelectedOptions.prototype.event = "change";

    SelectedOptions.prototype.get = function(key, target) {
      var items;
      items = [];
      target.find("option").filter(":selected").each(function() {
        return items.push($(this).val());
      });
      if (items.length === 1) {
        return items[0];
      } else {
        return items;
      }
    };

    SelectedOptions.prototype.set = function(key, target, value) {
      var v, _i, _len, _results;
      if (!(value != null)) {
        value = [];
      }
      if (!Spine.isArray(value)) {
        value = [value];
      }
      target.find("option").filter(":selected").each(function() {
        var val;
        val = $(this).val();
        if (value.indexOf(val) >= 0) {
          return;
        }
        return $(this).removeAttr("selected");
      });
      _results = [];
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        v = value[_i];
        _results.push(target.find("option[value='" + v + "']").attr("selected", "selected"));
      }
      return _results;
    };

    return SelectedOptions;

  })(ElementBound);

  Click = (function(_super) {

    __extends(Click, _super);

    function Click() {
      return Click.__super__.constructor.apply(this, arguments);
    }

    Click.prototype.keys = ["click"];

    Click.prototype.event = "click";

    return Click;

  })(ElementBound);

  Enable = (function(_super) {

    __extends(Enable, _super);

    function Enable() {
      return Enable.__super__.constructor.apply(this, arguments);
    }

    Enable.prototype.keys = ["enable"];

    Enable.prototype.set = function(key, target, value) {
      if (value) {
        return target.removeAttr("disabled");
      } else {
        return target.attr("disabled", "disabled");
      }
    };

    return Enable;

  })(ElementBound);

  Visible = (function(_super) {

    __extends(Visible, _super);

    function Visible() {
      return Visible.__super__.constructor.apply(this, arguments);
    }

    Visible.prototype.keys = ["visible"];

    Visible.prototype.set = function(key, target, value) {
      if (value) {
        return target.show();
      } else {
        return target.hide();
      }
    };

    return Visible;

  })(ElementBound);

  Attribute = (function(_super) {

    __extends(Attribute, _super);

    function Attribute() {
      return Attribute.__super__.constructor.apply(this, arguments);
    }

    Attribute.prototype.keys = ["attr"];

    Attribute.prototype.set = function(key, target, value, property) {
      if (target.attr(property) !== value) {
        target.attr(property, value);
        return true;
      }
    };

    return Attribute;

  })(ElementBound);

  Checked = (function(_super) {

    __extends(Checked, _super);

    function Checked() {
      return Checked.__super__.constructor.apply(this, arguments);
    }

    Checked.prototype.keys = ["checked"];

    Checked.prototype.event = "change";

    Checked.prototype.get = function(key, target) {
      var current;
      if (target.attr("type") === "radio") {
        if (target.length > 1) {
          current = $($.grep(target, function(item) {
            return $(item).is(":checked");
          })).val();
          if (current === "true") {
            current = true;
          }
          if (current === "false") {
            current = false;
          }
          return current;
        } else {
          if (target.is(":checked")) {
            return target.val();
          }
        }
      } else {
        return target.is(":checked");
      }
    };

    Checked.prototype.set = function(key, target, value) {
      var changed, check, element, _i, _len;
      changed = false;
      if (target.attr("type") === "radio") {
        check = function(e) {
          if (value === e.val()) {
            if (!e.is(":checked")) {
              e.attr("checked", "checked");
              return changed = true;
            }
          } else {
            if (e.is(":checked")) {
              e.removeAttr("checked");
              return changed = true;
            }
          }
        };
        if (target.length > 1) {
          for (_i = 0, _len = target.length; _i < _len; _i++) {
            element = target[_i];
            check($(element));
          }
        } else {
          check(target);
        }
      } else {
        if (value) {
          if (!target.is(":checked")) {
            target.attr("checked", "checked");
            changed = true;
          }
        } else {
          if (target.is(":checked")) {
            target.removeAttr("checked");
            changed = true;
          }
        }
      }
      return changed;
    };

    return Checked;

  })(ElementBound);

  HashTimer = (function(_super) {

    __extends(HashTimer, _super);

    function HashTimer() {
      this.process = __bind(this.process, this);
      return HashTimer.__super__.constructor.apply(this, arguments);
    }

    HashTimer.prototype.time = null;

    HashTimer.prototype.start = function(begin, forItem, end) {
      this.begin = begin;
      this.forItem = forItem;
      this.end = end;
      this.time = new Date();
      this.items = [];
      return setTimeout(this.process, 100);
    };

    HashTimer.prototype.finish = function() {
      this.time = null;
      this.begin = null;
      this.forItem = null;
      return this.end = null;
    };

    HashTimer.prototype.defer = function(target, value) {
      this.items.push({
        target: target,
        value: value
      });
      return this.time = new Date();
    };

    HashTimer.prototype.process = function() {
      var hash, item, _i, _len, _ref;
      if ((new Date - this.time) < 500) {
        setTimeout(this.process, 100);
        return;
      }
      hash = this.begin();
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        hash = this.forItem(hash, item.target, item.value);
      }
      this.end(hash);
      return this.finish();
    };

    return HashTimer;

  })(Spine.Module);

  Hash = (function() {

    function Hash() {}

    Hash.prototype.keys = ["hash"];

    Hash.prototype.priority = 2;

    Hash.prototype.last = null;

    Hash.prototype.event = new HashTimer();

    Hash.clean = function() {
      if (window.location.hash[0] === "#") {
        return window.location.hash.substr(1);
      } else {
        return window.location.hash;
      }
    };

    Hash.parse = function() {
      var hash, item, key, parts, string, value, _i, _len, _ref;
      string = Hash.clean();
      hash = {};
      _ref = string.split("&");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item === "") {
          continue;
        }
        parts = item.split("=");
        key = decodeURIComponent(parts[0]).replace(/\+/g, " ");
        value = decodeURIComponent(parts[1]).replace(/\+/g, " ");
        if (!value) {
          continue;
        }
        if (hash[key]) {
          hash[key] = [hash[key]];
          hash[key].push(value);
        } else {
          hash[key] = value;
        }
      }
      return hash;
    };

    Hash.prototype.bind = function(controller, model, key, target, change, execute) {
      var hash;
      if (!this.hashbind) {
        this.hashbind = (function() {
          var binder, bindings, models,
            _this = this;
          bindings = [];
          models = [];
          $(window).bind("hashchange.spine-databind", binder = function() {
            var binding, hash, m, _i, _j, _k, _len, _len1, _len2, _results;
            if ((Hash.last != null) && Hash.last === Hash.clean()) {
              Hash.last = null;
              return;
            }
            for (_i = 0, _len = models.length; _i < _len; _i++) {
              m = models[_i];
              m.trigger("hashparse");
            }
            hash = Hash.parse();
            for (_j = 0, _len1 = bindings.length; _j < _len1; _j++) {
              binding = bindings[_j];
              binding(hash);
            }
            _results = [];
            for (_k = 0, _len2 = models.length; _k < _len2; _k++) {
              m = models[_k];
              _results.push(m.trigger("hashcomplete"));
            }
            return _results;
          });
          return function(controller, model, key, target, change, execute) {
            var found, m, _i, _len,
              _this = this;
            found = false;
            for (_i = 0, _len = models.length; _i < _len; _i++) {
              m = models[_i];
              if (m.constructor === model.constructor) {
                found = true;
              }
            }
            if (!found) {
              models.push(model);
            }
            return bindings.push(function(hash) {
              return _this.change(controller, key, target, change, execute, hash);
            });
          };
        })();
      }
      this.hashbind(controller, model, key, target, change, execute);
      hash = Hash.parse();
      return this.change(controller, key, target, change, execute, hash, true);
    };

    Hash.prototype.set = function(key, target, value) {
      var begin, end, forItem;
      if (this.event.time != null) {
        this.event.defer(target, value);
        return;
      }
      begin = function() {
        var hash;
        hash = Hash.parse();
        return hash;
      };
      forItem = function(hash, target, value) {
        if (value) {
          hash[target] = value;
        } else {
          delete hash[target];
        }
        return hash;
      };
      end = function(hash) {
        var string;
        string = $.param(hash).replace(/%5B%5D/g, "");
        if (string !== Hash.clean()) {
          Hash.last = string;
          return window.location.hash = string;
        }
      };
      return this.event.start(begin, forItem, end);
    };

    Hash.prototype.change = function(controller, key, target, change, execute, hash) {
      var value;
      value = hash[target];
      if (!(value != null) || value === "") {
        return;
      }
      if (!(value != null)) {
        value = "";
      }
      change(target, value);
      return Hash.start = null;
    };

    return Hash;

  })();

  Cookie = (function() {

    function Cookie() {}

    Cookie.prototype.keys = ["cookie"];

    Cookie.prototype.priority = 1;

    Cookie.get = function(sKey) {
      var regex;
      regex = new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*");
      if (regex.test(document.cookie)) {
        return unescape(document.cookie.replace(regex, "$1"));
      }
    };

    Cookie.set = function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      var sExpires;
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
        return;
      }
      sExpires = "";
      if (vEnd != null) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toGMTString();
        }
      }
      return document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    };

    Cookie.prototype.bind = function(controller, model, key, target, change, execute) {
      return this.change(controller, key, target, change, execute, true);
    };

    Cookie.prototype.get = function(key, target) {
      return Cookie.get(target);
    };

    Cookie.prototype.set = function(key, target, value) {
      var current;
      current = Cookie.get(target);
      if ((value != null) && value !== "undefined" && current !== value) {
        Cookie.set(target, value);
        return true;
      }
    };

    Cookie.prototype.change = function(controller, key, target, change, execute, initial) {
      var value;
      value = this.get(key, target);
      return change(target, value);
    };

    return Cookie;

  })();

  Controller = (function(_super) {

    __extends(Controller, _super);

    Controller.include(Spine.Log);

    Controller.prototype.changed = [];

    function Controller(args) {
      this.execute = __bind(this.execute, this);

      this.change = __bind(this.change, this);

      this.update = __bind(this.update, this);

      this.disable = __bind(this.disable, this);

      var binder, isJSON, property, _i, _len, _ref, _ref1,
        _this = this;
      Controller.__super__.constructor.apply(this, arguments);
      isJSON = function(str) {
        if (str.length === 0) {
          return false;
        }
        str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
        str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        return /^[\],:{}\s]*$/.test(str);
      };
      if (typeof args.instance.property === "object") {
        this.json = args.instance.property;
      }
      if (isJSON(args.instance.property)) {
        this.json = JSON.parse(args.instance.property);
      } else {
        this.property = args.instance.property;
      }
      this.binders = args.instance.binders;
      this.model = args.model;
      this.controller = args.controller;
      this.options = args.options;
      _ref = this.binders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binder = _ref[_i];
        binder.instance.bind(this.controller, this.model, binder.key, binder.target, this.change(binder.instance), this.execute);
        if (this.options.watch && binder.constructor.name !== "Hash") {
          if (this.json != null) {
            _ref1 = this.json;
            for (property in _ref1) {
              if (!__hasProp.call(_ref1, property)) continue;
              this.bind("update[" + this.json[property] + "]", this.update);
            }
          } else {
            this.bind("update[" + this.property + "]", this.update);
          }
        } else {
          this.bind("change", this.update);
          this.bind("save", function() {
            var change, _j, _len1, _ref2;
            _ref2 = _this.changed;
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              change = _ref2[_j];
              if (typeof change !== "string") {
                change.trigger("changed");
              }
            }
            return _this.changed = [];
          });
        }
      }
      this.update(this.model);
    }

    Controller.prototype.disable = function(callback) {
      if (!this.disabled) {
        this.disabled = true;
        try {
          return callback();
        } catch (e) {
          throw e;
        } finally {
          this.disabled = false;
        }
      } else {
        return callback();
      }
    };

    Controller.prototype.get = function(property, callback) {
      var result;
      if (property == null) {
        property = this.property;
      }
      if (typeof this.model[property] === "function") {
        result = this.model[property](callback);
      } else {
        result = this.model[property];
      }
      return result;
    };

    Controller.prototype.set = function(value) {
      if (typeof this.model[this.property] === "function") {
        return;
      }
      if (!this.options || this.options.save) {
        return this.model.updateAttribute(this.property, value);
      } else {
        return this.model[this.property] = value;
      }
    };

    Controller.prototype.bind = function(event, callback) {
      var binder, unbinder,
        _this = this;
      this.model.constructor.bind(event, binder = function(record) {
        return callback(record);
      });
      return this.controller.bind("destroy-bindings", unbinder = function(record) {
        _this.model.constructor.unbind(event, binder);
        return _this.controller.unbind("destroy-bindings", unbinder);
      });
    };

    Controller.prototype.eql = function(first, second) {
      var index, value, _i, _len;
      if (Spine.isArray(first)) {
        if (!Spine.isArray(second)) {
          return false;
        }
        if (first.length !== second.length) {
          return false;
        }
        for (index = _i = 0, _len = first.length; _i < _len; index = ++_i) {
          value = first[index];
          if (value !== second[index]) {
            return false;
          }
        }
        return true;
      }
      if (first !== second) {
        return false;
      }
      return true;
    };

    Controller.prototype.update = function(record) {
      var binder, current, property, set, _i, _len, _ref, _results,
        _this = this;
      if (this.disabled) {
        return;
      }
      current = {};
      set = function(binder, property, value) {
        if (typeof current[property] === "undefined") {
          current[property] = _this.get(property);
        }
        if (window.DebugLevel >= 5) {
          $.log("DataBind " + binder.instance.constructor.name + " updating '" + property + "' to '" + current[property] + "'");
        }
        return binder.instance.set(binder.key, binder.target, current[property], value);
      };
      _ref = this.binders;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binder = _ref[_i];
        if (binder.instance.set != null) {
          if (this.json != null) {
            _results.push((function() {
              var _ref1, _results1;
              _ref1 = this.json;
              _results1 = [];
              for (property in _ref1) {
                if (!__hasProp.call(_ref1, property)) continue;
                _results1.push(set(binder, this.json[property], property));
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(set(binder, this.property));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Controller.prototype.change = function(binder) {
      var _this = this;
      return function(target, value) {
        var b, changed, cookie, current;
        if (typeof value === "undefined") {
          return;
        }
        if ((value != null) && value.length === 0 && binder.constructor.name === "Hash") {
          cookie = ((function() {
            var _i, _len, _ref, _results;
            _ref = this.binders;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              b = _ref[_i];
              if (b.instance.constructor.name === "Cookie") {
                _results.push(b);
              }
            }
            return _results;
          }).call(_this))[0];
          if ((cookie != null) && (cookie.instance != null)) {
            value = cookie.instance.get(cookie.key, cookie.target);
          }
        }
        current = _this.get();
        if (!_this.eql(current, value)) {
          if (window.DebugLevel >= 5) {
            $.log("DataBind " + binder.constructor.name + " changing '" + (typeof target === 'object' ? target.selector : target) + "' to '" + value + "'");
          }
          changed = _this.set(value);
          if (changed) {
            return _this.changed.push(target);
          }
        }
      };
    };

    Controller.prototype.execute = function(target) {
      return this.get();
    };

    return Controller;

  })(Spine.Module);

  DataBind = {
    binders: [new Update(), new Options(), new SelectedOptions(), new Click(), new Enable(), new Visible(), new Attribute(), new Checked(), new Hash(), new Cookie()],
    refreshBindings: function(model) {
      var addElement, bindingElements, controller, findBinder, info, initialize, instance, instances, key, options, parse, property, splitter, trim, _i, _len;
      if (!model) {
        model = this.model;
      }
      if (!model) {
        return;
      }
      controller = this;
      controller.destroyBindings();
      splitter = /(\w+)(\\[.*])? (.*)/;
      options = {
        save: model.watchEnabled ? false : true,
        watch: model.watchEnabled ? true : false
      };
      $.extend(options, controller.bindingOptions);
      findBinder = function(key) {
        var binder, _i, _len, _ref;
        _ref = controller.binders;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          binder = _ref[_i];
          if (binder.keys.indexOf(key) >= 0) {
            return binder;
          }
        }
        return null;
      };
      addElement = function(instances, info, property) {
        var binder, findByProperty, index, instance, key, prepared, _i, _len, _ref;
        binder = findBinder(info.name);
        if (binder === null) {
          return;
        }
        findByProperty = instances.filter(function(e) {
          return e.property === property;
        });
        if (findByProperty.length === 0) {
          instance = {
            property: property,
            binders: []
          };
          instances.push(instance);
        } else {
          instance = findByProperty[0];
        }
        prepared = {
          key: info.name,
          target: info.element.length > 0 ? info.element : info.target,
          instance: binder
        };
        index = 0;
        _ref = instance.binders;
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          key = _ref[index];
          if (instance.binders[index].instance.priority > binder.priority) {
            break;
          }
        }
        return instance.binders.splice(index, 0, prepared);
      };
      parse = function(key) {
        var match, name, parameters, selector, target;
        match = key.match(splitter);
        if (match !== null) {
          name = match[1];
          parameters = match[2];
          target = match[3];
        } else {
          name = key;
          target = "";
        }
        if (target === "") {
          selector = controller.el;
        } else {
          selector = controller.el.find(target);
        }
        return {
          name: name,
          parameters: parameters,
          element: selector,
          target: target
        };
      };
      trim = function(s) {
        return s.replace(/^\s+|\s+$/g, "");
      };
      bindingElements = function(instances) {
        return function(property) {
          return instances.filter(function(instance) {
            return instance.property === property;
          }).map(function(result) {
            var binder, _i, _len, _ref;
            _ref = result.binders;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              binder = _ref[_i];
              if (typeof binder.target === "string") {
                continue;
              }
              return binder.target[0];
            }
          });
        };
      };
      instances = [];
      for (key in this.bindings) {
        if (this.bindings.hasOwnProperty(key)) {
          property = this.bindings[key];
          info = parse(key);
          addElement(instances, info, property);
        }
      }
      this.el.find("*[data-bind]").each(function() {
        var attributes, binder, databind, e, _i, _len, _results;
        e = $(this);
        databind = e.data("bind").split(",");
        attributes = databind.map(function(item) {
          var fullString, match, name, value;
          fullString = trim(item);
          match = fullString.match(/(\w+):(.*)/);
          name = match[1];
          value = trim(match[2]);
          return {
            name: name,
            value: value,
            element: e
          };
        });
        _results = [];
        for (_i = 0, _len = attributes.length; _i < _len; _i++) {
          info = attributes[_i];
          binder = findBinder(info.name);
          _results.push(addElement(instances, info, info.value));
        }
        return _results;
      });
      initialize = function(instance) {
        return new Controller({
          controller: controller,
          model: model,
          instance: instance,
          options: options
        });
      };
      for (_i = 0, _len = instances.length; _i < _len; _i++) {
        instance = instances[_i];
        if (window.DebugLevel >= 5) {
          switch (instance.binders.length) {
            case 1:
              this.log("DataBind", instance.property, instance.binders[0]);
              break;
            case 2:
              this.log("DataBind", instance.property, instance.binders[0].instance, instance.binders[1].instance);
              break;
            case 3:
              this.log("DataBind", instance.property, instance.binders[0].instance, instance.binders[1].instance, instance.binders[2].instance);
          }
        }
        initialize(instance);
      }
      this.bindingElements = bindingElements(instances);
      return this;
    },
    destroyBindings: function() {
      return this.trigger("destroy-bindings");
    }
  };

  if (Spine.Activator) {
    DataBind.activators = ["refreshBindings"];
  }

  Spine.Controller.DataBind = {};

  Spine.Controller.DataBind.ElementBound = ElementBound;

  this.Spine.DataBind = DataBind;

}).call(this);
