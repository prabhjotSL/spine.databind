Spine      = @Spine

class ElementBound
	priority: 3
	bind: (controller,model,key,target,change,execute) ->
		return if typeof @event is "undefined"
		target.bind(@event+".spine-databind", binder = (event) =>
			if typeof @get is "undefined"
				@execute(execute)
			else
				@change(key,target,change)
		)
		controller.bind("destroy-bindings", unbinder = (record) =>
			target.unbind(@event+".spine-databind", binder)
			controller.unbind("destroy-bindings", unbinder)
		)

	change: (key,target,callback) ->
		callback(target,@get(key,target))

	# This might seem silly but it's here for 
	# testing purposes (need to make sure it gets called)
	# and I can't test the execute on controller
	execute: (callback) ->
		callback()

	# get: (key,target) ->
	# set: (key,target,value) ->

class Update extends ElementBound
	keys: [ "text", "value", "html" ]
	event: "change"

	get: (key,target) ->
		e = $(target[0])
		switch e[0].tagName
			when "INPUT", "SELECT", "TEXTAREA"
				return e.val()
			else
				return e.text()

	set: (key,target,value) ->
		e = $(target[0])
		switch e[0].tagName
			when "INPUT", "TEXTAREA"
				if e.val() isnt value
					e.val(value)
					e.trigger("change") 
			when "SELECT"
				# Deselect
				isSelected = e.find(":not(option[value='#{value}']):selected")
				shouldBeSelected = e.find("option[value='#{value}']:not(:selected)")

				if isSelected.length > 0 or shouldBeSelected.length > 0
					isSelected.each((key,element) -> $(element).removeAttr("selected"))
					# Select
					shouldBeSelected.attr("selected","selected")
					# Changed
					e.trigger("change") 
			else
				if typeof value is "object" and value and value.constructor is Array
					formatted = value.join(",")
				else if typeof value is "object" and value
					formatted = value.toString()
				else
					formatted = value

				if key is "html"
					e.html(formatted)
				else
					if e.text() isnt formatted
						e.text(formatted)
						e.trigger("change")

class Options extends ElementBound
	keys: [ "options" ]

	set: (key,target,value) ->
		array = value
		options = target.children('option')

		if not array
			result = target.find("option").map((index,item) -> return { text: $(item).text(), value: $(item).val() })
		else if array instanceof Array
			result = ({ text: item, value: item} for item in array)
		else
		    result = Object.keys(array)
		                   .map((r) => { text: array[r], value: r })
		                   .sort((a,b) => 
		                   		if (b.value == "")
		                   			return 1
		                   		else if (a.value == "")
		                   			return -1
		                   		else
		                   			return a.text.localeCompare(b.text)
		                   	)

		count = 0
		count = count = count + 1 for own property in result
		changed = false

		for item,index in result
			option = if options.length > index then $(options[index]) else null
			selected = ""

			if option is null
				target.append "<option value='#{item.value}' #{selected}>#{item.text}</option>"
				changed = true
			else
				option.text(item.text) if option.text() isnt item.text
				option.val(item.value) if option.val?() isnt item.value

		if options.length > count
			for index in [count..options.length]
				$(options[index]).remove()
				changed = true

		return true if changed
		return false

class SelectedOptions extends ElementBound
	keys: [ "selectedOptions" ]
	event: "change"

	get: (key,target) ->
		items = []
		target.find("option").filter(":selected").each(() -> items.push($(@).val()))
		if items.length is 1
			return items[0]
		else
			return items

	set: (key,target,value) ->
		value = [] if not value?
		value = [value] if not Spine.isArray(value)
		target.find("option").filter(":selected").each(() ->
			val = $(@).val()
			return if value.indexOf(val) >= 0
			$(@).removeAttr("selected")
		)
		for v in value
			target.find("option[value='"+v+"']").attr("selected","selected")

class Click extends ElementBound
	keys: [ "click" ]
	event: "click"

class Enable extends ElementBound
	keys: [ "enable" ]

	set: (key,target,value) ->
		if value
			target.removeAttr("disabled")
		else
			target.attr("disabled","disabled")

class Visible extends ElementBound
	keys: [ "visible" ]

	set: (key,target,value) ->
		if value
			target.show()
		else
			target.hide()

class Attribute extends ElementBound
	keys: [ "attr" ]

	set: (key,target,value,property) ->
		if target.attr(property) isnt value
			target.attr(property,value)
			return true

class Checked extends ElementBound
	keys: [ "checked" ]
	event: "change"

	get: (key,target) ->
		if target.attr("type") is "radio"
			if target.length > 1
				current = $($.grep(target, (item) -> $(item).is(":checked"))).val()
				current = true if current == "true"
				current = false if current == "false"
				return current
			else
				if target.is(":checked")
					return target.val()
		else
			return target.is(":checked")

	set: (key,target,value) ->
		changed = false

		if target.attr("type") is "radio"
			check = (e) ->
				if value is e.val()
					if not e.is(":checked")
						e.attr("checked", "checked")
						changed = true
				else
					if e.is(":checked")
						e.removeAttr("checked")
						changed = true

			if target.length > 1
				check($(element)) for element in target
			else
				check(target)
		else
			if value 
				if not target.is(":checked")
					target.attr("checked", "checked")
					changed = true
			else
				if target.is(":checked")
					target.removeAttr("checked")
					changed = true
		
		return changed

class HashTimer extends Spine.Module
	time: null

	start: (begin,forItem,end) ->
		@begin = begin
		@forItem = forItem
		@end = end

		@time = new Date()
		@items = []
		setTimeout(@process, 100)

	finish: ->
		@time = null
		@begin = null
		@forItem = null
		@end = null

	defer: (target,value) ->
		@items.push({target,value})
		@time = new Date()

	process: =>
		if (new Date-@time) < 500
			setTimeout(@process, 100)
			return

		hash = @begin()
		for item in @items
			hash = @forItem(hash, item.target, item.value)
		@end(hash)

		@finish()

class Hash 
	keys: [ "hash" ]
	priority: 2
	last: null
	# start: null

	event: new HashTimer()

	@clean: ->
		return if window.location.hash[0] is "#" then window.location.hash.substr(1) else window.location.hash

	@parse: ->
		string = Hash.clean()
		hash = {}
		for item in string.split("&")
			continue if item is ""
			parts = item.split("=")
			key = decodeURIComponent(parts[0]).replace(/\+/g," ")
			value = decodeURIComponent(parts[1]).replace(/\+/g," ")
			continue if not value

			if hash[key]
				hash[key] = [hash[key]]
				hash[key].push(value)
			else
				hash[key] = value

		hash

	bind: (controller,model,key,target,change,execute) ->
		if not @hashbind
			@hashbind = (() ->
				bindings = []
				models = []

				$(window).bind("hashchange.spine-databind", binder = =>
					if Hash.last? and Hash.last is Hash.clean()
						Hash.last = null
						return 

					m.trigger("hashparse") for m in models

					hash = Hash.parse()
					binding(hash) for binding in bindings
					
					m.trigger("hashcomplete") for m in models
				)

				(controller,model,key,target,change,execute) ->
					found = false
					for m in models
						found = true if m.constructor is model.constructor

					models.push(model) if not found

						# controller.bind("destroy-bindings", unbinder = (record) =>
						# 	$(window).unbind("hashchange.spine-databind")
						# 	controller.unbind("destroy-bindings", unbinder)
						# )

					bindings.push((hash) => @change(controller,key,target,change,execute,hash))
			)()

		@hashbind(controller,model,key,target,change,execute)

		hash = Hash.parse()
		@change(controller,key,target,change,execute,hash,true)

	set: (key,target,value) ->
		if @event.time?
			@event.defer(target,value)
			return

		begin = ->
			hash = Hash.parse()
			hash

		forItem = (hash,target,value) ->
			if value
				hash[target] = value
			else
				delete hash[target]
			hash

		end = (hash) ->
			string = $.param(hash).replace(/%5B%5D/g,"") # Replacing [] with blank, this could be controversial
			if string isnt Hash.clean()
				Hash.last = string
				window.location.hash = string

		@event.start(begin,forItem,end)
		@event.defer(target,value)

	change: (controller,key,target,change,execute,hash) ->
		value = hash[target]
		return if not value? or value is ""
		value = "" if not value?
		change(target, value)
		Hash.start = null

class Cookie 
	keys: [ "cookie" ]
	priority: 1

	@get: (sKey) ->
		regex = new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*")
		return unescape(document.cookie.replace(regex, "$1")) if regex.test(document.cookie)

	@set: (sKey, sValue, vEnd, sPath, sDomain, bSecure) ->
		return if not sKey or /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)
		sExpires = ""
		if vEnd?
			switch vEnd.constructor
				when Number
					sExpires = if vEnd is Infinity then "; expires=Tue, 19 Jan 2038 03:14:07 GMT" else "; max-age=" + vEnd
				when String
					sExpires = "; expires=" + vEnd
				when Date
					sExpires = "; expires=" + vEnd.toGMTString()

		document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (if sDomain then "; domain=" + sDomain else "") + (if sPath then "; path=" + sPath else "") + (if bSecure then "; secure" else "")

	bind: (controller,model,key,target,change,execute) ->
		@change(controller,key,target,change,execute,true)

	get: (key,target) ->
		Cookie.get(target)

	set: (key,target,value) ->
		current = Cookie.get(target)
		if value? and value isnt "undefined" and current isnt value
			Cookie.set(target,value)
			return true

	change: (controller,key,target,change,execute,initial) ->
		value = @get(key,target)
		change(target, value)

class Controller extends Spine.Module
	@include Spine.Log

	changed: []

	constructor: (args) ->
		super

		isJSON = (str) ->
			return false if str.length is 0
			str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
			str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
			str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '')
			return (/^[\],:{}\s]*$/).test(str)
	
		@json         = args.instance.property if typeof args.instance.property is "object"
		if isJSON(args.instance.property)
			@json  	  = JSON.parse(args.instance.property)
		else
			@property = args.instance.property
		@binders      = args.instance.binders
		@model        = args.model
		@controller   = args.controller
		@options      = args.options

		for binder in @binders
			binder.instance.bind(@controller,@model,binder.key,binder.target,@change(binder.instance),@execute)

			if @options.watch and binder.constructor.name isnt "Hash" # we don't want every property to the url
				if @json?
					@bind("update[#{@json[property]}]", @update) for own property of @json
				else
					@bind("update[#{@property}]", @update)
			else
				@bind("change", @update)
				@bind("save", => 
					change.trigger("changed") for change in @changed when typeof change isnt "string"
					@changed = []
				)

		@update(@model)

	disable: (callback) =>
		if not @disabled
			@disabled = true
			try
				do callback
			catch e
				throw e
			finally
				@disabled = false
		else
			do callback

	get: (property = @property, callback) ->
		if typeof @model[property] is "function"
			result = @model[property](callback)
		else
			result = @model[property]
		result

	set: (value) ->
		if typeof @model[@property] is "function"
			if @model[@property].length is 1
				# Functions can optionally set values
				@model[@property](value)
			
			# Otherwise they are read-only
			return;

		# @disable =>
		if !@options or @options.save
			@model.updateAttribute(@property,value)
		else
			@model[@property] = value

	bind: (event,callback) ->
		@model.constructor.bind(event, binder = (record) => callback(record))
		@controller.bind("destroy-bindings", unbinder = (record) =>
			@model.constructor.unbind(event,binder)
			@controller.unbind("destroy-bindings", unbinder)
		)

	eql: (first,second) ->
		if Spine.isArray(first)
			return false if not Spine.isArray(second)
			return false if first.length isnt second.length
			for value,index in first
				return false if value isnt second[index]
			return true

		return false if first isnt second
		return true

	update: (record) =>
		return if @disabled

		current = {}

		set = (binder,property,value) =>
			current[property] = @get(property) if typeof current[property] is "undefined"
			$.log("DataBind #{binder.instance.constructor.name} updating '#{property}' to '#{current[property]}'") if window.DebugLevel >= 5
			binder.instance.set(binder.key,binder.target,current[property],value) 

		for binder in @binders
			if binder.instance.set?
				if @json?
					set(binder,@json[property],property) for own property of @json
				else
					set(binder,@property)

	change: (binder) => (target,value) => 
		return if typeof value is "undefined"
		
		# If the hash is blanked out and a cookie value exists
		# just ignore the change
		if value? and value.length is 0 and binder.constructor.name is "Hash"
			cookie = (b for b in @binders when b.instance.constructor.name is "Cookie")[0]
			if cookie? and cookie.instance?
				value = cookie.instance.get(cookie.key, cookie.target)

		current = @get()
		if not @eql(current,value)

			$.log("DataBind #{binder.constructor.name} changing '#{if typeof target is 'object' then target.selector else target}' to '#{value}'") if window.DebugLevel >= 5

			changed = @set(value)
			@changed.push(target) if changed

	execute: (target) =>
		@get()

DataBind =
	binders: [ 
		new Update()
		new Options()
		new SelectedOptions()
		new Click()
		new Enable()
		new Visible()
		new Attribute()
		new Checked()
		new Hash()
		new Cookie()
	]

	refreshBindings: (model) ->
		model = this.model if not model
		return if not model

		controller = this
		controller.destroyBindings()

		splitter = /(\w+)(\\[.*])? (.*)/

		options = 
			save: if model.watchEnabled then false else true
			watch: if model.watchEnabled then true else false

		$.extend(options, controller.bindingOptions)

		findBinder = (key) ->
			for binder in controller.binders
				if binder.keys.indexOf(key) >= 0
					return binder
			
			return null

		addElement = (instances,info,property) ->
			binder = findBinder(info.name)
			if binder is null then return

			findByProperty = instances.filter((e) -> e.property is property)
			if findByProperty.length is 0
				instance =
					property: property
					binders: []
				instances.push(instance)
			else
				instance = findByProperty[0]

			prepared = 
				key: info.name
				target: if info.element.length > 0 then info.element else info.target
				instance: binder

			index = 0
			for key,index in instance.binders
				break if instance.binders[index].instance.priority > binder.priority

			instance.binders.splice(index,0,prepared)
			

		parse = (key) ->
			match = key.match(splitter)
			if match isnt null
				name = match[1]
				parameters = match[2]
				target = $.trim(match[3])
			else
				name = key
				target = ""

			if target is ""
				selector = controller.el
			else
				selector = controller.el.find(target)

			return {
				name: name
				parameters: parameters
				element: selector
				target: target
			}

		trim = (s) ->
			s.replace(/^\s+|\s+$/g,"")

		bindingElements = (instances) ->
			(property) ->
				instances.filter (instance) ->
					instance.property is property
				.map (result) ->
					for binder in result.binders
						continue if typeof binder.target is "string"
						return binder.target[0]

		instances = []

		for key of @bindings
			if @bindings.hasOwnProperty(key)
				property = @bindings[key]
				info = parse(key)
				addElement(instances,info,property)
		
		@el.find("*[data-bind]").each () ->
			e = $(this)
			databind = e.data("bind").split(",")
			attributes = databind.map (item) ->
				fullString = trim(item)
				match = fullString.match(/(\w+):(.*)/)
				name = match[1]
				value = trim(match[2])

				return {
					name: name
					value: value,
					element: e
				}
			
			for info in attributes
				binder = findBinder(info.name)
				addElement(instances,info,info.value)

		initialize = (instance) ->
			new Controller(controller: controller, model: model, instance: instance, options: options)

		for instance in instances
			if window.DebugLevel >= 5
				switch instance.binders.length
					when 1
						@log("DataBind", instance.property, instance.binders[0])
					when 2
						@log("DataBind", instance.property, instance.binders[0].instance, instance.binders[1].instance)
					when 3
						@log("DataBind", instance.property, instance.binders[0].instance, instance.binders[1].instance, instance.binders[2].instance)

			initialize(instance)

		@bindingElements = bindingElements(instances)

		@

	destroyBindings: ->
		@trigger("destroy-bindings")

DataBind.activators = [ "refreshBindings" ] if Spine.Activator

Spine.Controller.DataBind = {}
Spine.Controller.DataBind.ElementBound = ElementBound

@Spine.DataBind = DataBind