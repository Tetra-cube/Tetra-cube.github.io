var name = "Monster", size = "medium", type = "humanoid", tag = "", alignment = "any alignment",
	hitDice = 5, armorName = "none", shieldBonus = 0, natArmorBonus = 3, otherArmorDesc = " (armor)",
	speed = 30, burrowSpeed = 0, climbSpeed = 0, flySpeed = 0, hover = false, swimSpeed = 0,
	strPoints = 10, dexPoints = 10, conPoints = 10, intPoints = 10, wisPoints = 10, chaPoints = 10,
	strBonus = 0, dexBonus = 0, conBonus = 0, intBonus = 0, wisBonus = 0, chaBonus = 0,
	blindsight = 0, blind = false, darkvision = 0, tremorsense = 0,	truesight = 0,
	telepathy = 0,
	cr = "1",
	isLegendary = false, legendariesDescription = "",
	properties = [], abilities = [], actions = [], reactions = [], legendaries = [],
	sthrows = [], skills = [], damagetypes = [], specialdamage = [], conditions = [], languages = [],
	traitsHTML = [], doubleColumns = false, separationPoint = 1,
	monsterNamesArr = [];



// Document ready function
$(function()
{
	$.getJSON("https://api-beta.open5e.com/monsters/?format=json&fields=slug,name&limit=1000", function(jsonArr) {
		$.each(jsonArr.results, function(index, value) {
			$("#monster-select").append("<option value='" + value.slug + "'>" + value.name + "</option>");
		})
	})
	.fail(function() {
		$("#monster-select-form").html("Unable to load monster presets.")
	})
	
	// Load saved data
	SaveLoadFunctions.RetrieveAllData();
	
	// Set the ability score bonuses
	//for(var stat in stats)
		//ChangeBonus(stats[stat].name.toLowerCase());
	
	// Set the default legendary description
	GetVariablesFunctions.LegendaryDescriptionDefault();
	
	// Populate the stat block
	UpdateBlockFromVariables(0);
	FormFunctions.SetForms();
});

// Print function
TryPrint = function()
{
	window.print();
}

// Functions for updating the main stat block
UpdateBlockFromVariables = function(moveSeparationPoint)
{
	GetVariablesFunctions.GetAllVariables();
	UpdateStatblock(moveSeparationPoint);
}

UpdateStatblock = function(moveSeparationPoint)
{
	// Set Separation Point
	var separationMax = abilities.length + actions.length + reactions.length - 1;
	if(isLegendary)
	{
		separationMax += legendaries.length;
		if(legendaries.length == 0)
			separationMax += 1;
	}
	
	if(moveSeparationPoint == undefined)
		separationPoint = Math.floor(separationMax / 2);
	else
	{
		separationPoint += moveSeparationPoint;
		if (separationPoint < 0)
			separationPoint = 0;
		if(separationPoint > separationMax)
			separationPoint = separationMax;
	}
	
	// Save Before Continuing
	SaveLoadFunctions.SaveAllData();
	
	// One column or two columns
	var statBlock = $("#stat-block");
	if(doubleColumns)
		statBlock.addClass('wide');
	else
		statBlock.removeClass('wide');

	// Name and type
	$("#monster-name").html(name);
	if(tag == "")
		$("#monster-type").html(StringFunctions.StringCapitalize(size) + " " + type + ", " + alignment);
	else
		$("#monster-type").html(StringFunctions.StringCapitalize(size) + " " + type + " (" + tag + "), " + alignment);

	// Armor Class
	$("#armor-class").html(StringFunctions.GetArmorData());

	// Hit Points
	$("#hit-points").html(StringFunctions.GetHP());

	// Speed
	var speedsDisplayArr = [ speed + " ft."];
	if(burrowSpeed > 0)
		speedsDisplayArr.push("burrow " + burrowSpeed + " ft.");
	if(climbSpeed > 0)
		speedsDisplayArr.push("climb " + climbSpeed + " ft.");
	if(flySpeed > 0)
		speedsDisplayArr.push("fly " + flySpeed + " ft." + (hover ? " (hover)" : ""));
	if(swimSpeed > 0)
		speedsDisplayArr.push("swim " + swimSpeed + " ft.");
	$("#speed").html(speedsDisplayArr.join(", "));

	// Stats
	$("#strpts").html(strPoints + " (" + StringFunctions.BonusFormat(strBonus) + ")");
	$("#dexpts").html(dexPoints + " (" + StringFunctions.BonusFormat(dexBonus) + ")");
	$("#conpts").html(conPoints + " (" + StringFunctions.BonusFormat(conBonus) + ")");
	$("#intpts").html(intPoints + " (" + StringFunctions.BonusFormat(intBonus) + ")");
	$("#wispts").html(wisPoints + " (" + StringFunctions.BonusFormat(wisBonus) + ")");
	$("#chapts").html(chaPoints + " (" + StringFunctions.BonusFormat(chaBonus) + ")");

	// Properties
	var propertiesDisplayArr = [];

	// Saving Throws
	var sthrowsDisplayArr = [];
	for(var index in sthrows)
		sthrowsDisplayArr.push(StringFunctions.StringCapitalize(sthrows[index].name) + " +" + (GetVariablesFunctions.GetStatBonus(sthrows[index].name) + crs[cr].prof));
	if(sthrowsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Saving Throws", "arr" : sthrowsDisplayArr } );

	// Skills
	var skillsDisplayArr = [];
	for(var index in skills)
	{
		var skillData = skills[index];
		if(skillData.hasOwnProperty("note"))
			skillsDisplayArr.push(StringFunctions.StringCapitalize(skillData.name) + " +" + (GetVariablesFunctions.GetStatBonus(skillData.stat) + crs[cr].prof * 2));
		else
			skillsDisplayArr.push(StringFunctions.StringCapitalize(skillData.name) + " +" + (GetVariablesFunctions.GetStatBonus(skillData.stat) + crs[cr].prof));
	}
	if(skillsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Skills", "arr" : skillsDisplayArr } );

	// Damage Types (It's not pretty but it does its job)
	var vulnerableDisplayArr = [], resistantDisplayArr = [], immuneDisplayArr = [],
		vulnerableDisplayArrSpecial = [], resistantDisplayArrSpecial = [], immuneDisplayArrSpecial = [],
		vulnerableDisplayString = "", resistantDisplayString = "", immuneDisplayString = "";
	for(var index in damagetypes)
	{
		if(damagetypes[index].type == 'v')
			vulnerableDisplayArr.push(damagetypes[index].name);
		else if(damagetypes[index].type == 'r')
			resistantDisplayArr.push(damagetypes[index].name);
		else
			immuneDisplayArr.push(damagetypes[index].name);
	}
	for(var index in specialdamage)
	{
		if(specialdamage[index].type == 'v')
			vulnerableDisplayArrSpecial.push(specialdamage[index].name);
		else if(specialdamage[index].type == 'r')
			resistantDisplayArrSpecial.push(specialdamage[index].name);
		else
			immuneDisplayArrSpecial.push(specialdamage[index].name);
	}

	vulnerableDisplayString = StringFunctions.ConcatUnlessEmpty(vulnerableDisplayArr.join(", "), vulnerableDisplayArrSpecial.join("; "), "; ").toLowerCase();
	resistantDisplayString = StringFunctions.ConcatUnlessEmpty(resistantDisplayArr.join(", "), resistantDisplayArrSpecial.join("; "), "; ").toLowerCase();
	immuneDisplayString = StringFunctions.ConcatUnlessEmpty(immuneDisplayArr.join(", "), immuneDisplayArrSpecial.join("; "), "; ").toLowerCase();

	if(vulnerableDisplayString.length > 0)
		propertiesDisplayArr.push( { "name" : "Damage Vulnerabilities", "arr" : vulnerableDisplayString } );
	if(resistantDisplayString.length > 0)
		propertiesDisplayArr.push( { "name" : "Damage Resistances", "arr" : resistantDisplayString } );
	if(immuneDisplayString.length > 0)
		propertiesDisplayArr.push( { "name" : "Damage Immunities", "arr" : immuneDisplayString } );

	// Condition Immunities
	var conditionsDisplayArr = [];
	for(var index in conditions)
		conditionsDisplayArr.push(conditions[index].name.toLowerCase());
	if(conditionsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Condition Immunities", "arr" : conditionsDisplayArr } );

	// Senses
	var sensesDisplayArr = [];
	if(blindsight > 0)
		sensesDisplayArr.push("blindsight " + blindsight + " ft." + (blind ? " (blind beyond this radius)" : ""));
	if(darkvision > 0)
		sensesDisplayArr.push("darkvision " + darkvision + " ft.");
	if(tremorsense > 0)
		sensesDisplayArr.push("tremorsense " + tremorsense + " ft.");
	if(truesight > 0)
		sensesDisplayArr.push("truesight " + truesight + " ft.");

	// Passive Perception
	var ppData = ArrayFunctions.FindInList(skills, "Perception"), pp = 10 + wisBonus;
	if(ppData != null)
	{
		pp += crs[cr].prof;
		if(ppData.hasOwnProperty("note"))
			pp += crs[cr].prof;
	}
	sensesDisplayArr.push("passive Perception " + pp);
	propertiesDisplayArr.push( { "name" : "Senses", "arr" : sensesDisplayArr } );
	
	// Languages
	var languageDisplayArr = [];
	for(var index in languages)
		languageDisplayArr.push(languages[index].name);
	if(telepathy > 0)
		languageDisplayArr.push("telepathy " + telepathy + " ft.");
	if(languageDisplayArr.length == 0 && telepathy == 0)
		languageDisplayArr.push("&mdash;");
	propertiesDisplayArr.push( { "name" : "Languages", "arr" : languageDisplayArr } );
	
	// Display All Properties (except CR)
	var propertiesDisplayList = [];
	propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[0], true));
	for(var index = 1; index < propertiesDisplayArr.length; index++)
		propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[index]));
	$("#properties-list").html(propertiesDisplayList.join(""));
	
	// Challenge Rating
	$("#challengeRating").html(cr + " (" + crs[cr].xp + " XP)");
	
	// Abilities
	traitsHTML = [];
	
	if(abilities.length > 0)
		AddToTraitList(abilities);
	if(actions.length > 0)
		AddToTraitList(actions, "<h3>Actions</h3>");
	if(reactions.length > 0)
		AddToTraitList(reactions, "<h3>Reactions</h3>");
	if(isLegendary)
	{
		if(legendariesDescription == "")
			AddToTraitList(legendaries, "<h3>Legendary Actions</h3>", true);
		else
			AddToTraitList(legendaries, [ "<h3>Legendary Actions</h3><br>", legendariesDescription ], true);
	}
	
	// Add traits, taking into account the width of the block (one column or two columns)
	var leftTraitsArr = [], rightTraitsArr = [], separationCounter = 0;
	for(var index in traitsHTML)
	{
		var trait = traitsHTML[index], raiseCounter = true;
		if(trait[0] == "*")
		{
			raiseCounter = false;
			trait = trait.substr(1);
		}
		
		if(separationCounter < separationPoint)
			leftTraitsArr.push(trait);
		else
			rightTraitsArr.push(trait);
		
		if(raiseCounter)
			separationCounter++;
	}
	$("#traits-list-left").html(leftTraitsArr.join(""));
	$("#traits-list-right").html(rightTraitsArr.join(""));
	
	FormFunctions.ShowHideSeparatorInput();



	// Nested function for abilities
	
	function AddToTraitList(traitsArr, addItems, isLegendary = false)
	{
		var traitsDisplayList = [];
		if(addItems != undefined)
		{
			if(Array.isArray(addItems))
			{
				for(var index in addItems)
					traitsHTML.push("*" + StringFunctions.FormatString(addItems[index]));
			}
			else
				traitsHTML.push("*" + StringFunctions.FormatString(addItems));
		}
		
		if(isLegendary)
		{
			for(var index in traitsArr)
				traitsHTML.push(StringFunctions.MakeTraitHTMLLegendary(traitsArr[index].name, traitsArr[index].desc));
		}
		else
		{
			for(var index in traitsArr)
				traitsHTML.push(StringFunctions.MakeTraitHTML(traitsArr[index].name, traitsArr[index].desc));
		}
	}
}

// Functions for saving/loading
SaveLoadFunctions =
{
	SaveAllData: function()
	{
		for(var index in allSavedBooleanVariables)
			SaveData(allSavedBooleanVariables[index]);
		
		for(var index in allSavedNumberVariables)
			SaveData(allSavedNumberVariables[index]);
		
		for(var index in allSavedTextVariables)
			SaveData(allSavedTextVariables[index]);
		
		for(var index in allSavedArrayVariables)
			SaveData(allSavedArrayVariables[index]);

		function SaveData(key)
		{
			var data = window[key];
			if(data != undefined)
				localStorage.setItem(key, Serialize(data));
		}
	},

	RetrieveAllData: function()
	{
		for(var index in allSavedBooleanVariables)
		{
			var key = allSavedBooleanVariables[index], data = RetrieveData(key);
			if(data != undefined)
				window[key] = (data == "true");
		}
		
		for(var index in allSavedNumberVariables)
		{
			var key = allSavedNumberVariables[index], data = RetrieveData(key);
			if(data != undefined)
				window[key] = parseInt(data);
		}
		
		for(var index in allSavedTextVariables)
		{
			var key = allSavedTextVariables[index], data = RetrieveData(key);
			if(data != undefined)
				window[key] = data;
		}
		
		for(var index in allSavedArrayVariables)
		{
			var key = allSavedArrayVariables[index], data = RetrieveData(key);
			if(data != undefined && Array.isArray(data))
				window[key] = data;
		}

		function RetrieveData(key)
		{
			var data = localStorage.getItem(key);
			if(data != undefined)
			{
				var deserializedData = Deserialize(data);
				if(deserializedData != undefined)
					return deserializedData;
			}
		}
	}
}

// Functions for form-setting
FormFunctions =
{
	
	// Set the forms
	SetForms: function()
	{
		// Name and type
		$("#name-input").val(name);
		$("#size-input").val(size);
		
		if(types.includes(type))
			$("#type-input").val(type);
		else
		{
			$("#type-input").val("*");
			$("#other-type-input").val(type);
		}
		this.ShowHideTypeOther();
		
		$("#tag-input").val(tag);
		$("#alignment-input").val(alignment);
		
		// Armor Class
		$("#armor-input").val(armorName);
		$("#shield-input").prop("checked", (shieldBonus > 0 ? true : false));
		$("#natarmor-input").val(natArmorBonus);
		$("#otherarmor-input").val(otherArmorDesc);
		this.ShowHideOtherArmor();
		
		// Hit Dice
		$("#hitdice-input").val(hitDice);
		
		// Speeds
		$("#speed-input").val(speed);
		$("#burrow-speed-input").val(burrowSpeed);
		$("#climb-speed-input").val(climbSpeed);
		$("#fly-speed-input").val(flySpeed);
		$("#hover-input").prop("checked", hover);
		this.ShowHideHoverBox();
		$("#swim-speed-input").val(swimSpeed);
		
		// Stats
		this.SetStatForm("str", strPoints, strBonus);
		this.SetStatForm("dex", dexPoints, dexBonus);
		this.SetStatForm("con", conPoints, conBonus);
		this.SetStatForm("int", intPoints, intBonus);
		this.SetStatForm("wis", wisPoints, wisBonus);
		this.SetStatForm("cha", chaPoints, chaBonus);
		GetVariablesFunctions.SetBonuses();
		
		// Senses
		$("#blindsight-input").val(blindsight);
		$("#blindness-input").prop("checked", blind);
		this.ShowHideBlindBox();
		$("#darkvision-input").val(darkvision);
		$("#tremorsense-input").val(tremorsense);
		$("#truesight-input").val(truesight);
		
		// Properties
		this.MakeDisplayList("sthrows", true);
		this.MakeDisplayList("skills", true);
		this.MakeDisplayList("conditions", true);
		this.MakeDisplayList("damage", true);
		this.ShowHideDamageOther();
		this.MakeDisplayList("languages", false);
		this.ShowHideLanguageOther();
		$("#telepathy-input").val(telepathy);
		
		// Abilities
		this.MakeDisplayList("abilities", false, true);
		this.MakeDisplayList("actions", false, true);
		this.MakeDisplayList("reactions", false, true);
		this.MakeDisplayList("legendaries",false, true);
		
		// Is Legendary?	
		$("#is-legendary-input").prop("checked", isLegendary);
		this.ShowHideLegendaryCreature();
		
		// Challenge Rating
		crs[cr].prof = crs[cr].prof;
		$("#cr-input").val(cr);
		this.ChangeCRForm();
		
		// Column Radio Buttons
		this.ChangeColumnRadioButtons();
	},

	// Show/Hide form options to make it less overwhelming - only call these from SetForms or HTML elements

	ShowHideHtmlElement: function(element, show)
	{
		show ? $(element).show() : $(element).hide();
	},

	ShowHideTypeOther: function()
	{
		this.ShowHideHtmlElement("#other-type-input", $("#type-input").val() == "*");
	},

	ShowHideOtherArmor: function()
	{
		$("#natarmor-prompt, #otherarmor-prompt").hide();
		if($("#armor-input").val() == "natural armor")
			$("#natarmor-prompt").show();
		else if($("#armor-input").val() == "other")
			$("#otherarmor-prompt").show();
	},

	ShowHideDamageOther: function()
	{
		this.ShowHideHtmlElement("#other-damage-input", $("#damagetypes-input").val() == "*");
	},

	ShowHideLanguageOther: function()
	{
		this.ShowHideHtmlElement("#other-language-input", $("#languages-input").val() == "*");
	},

	ShowHideHoverBox: function()
	{
		this.ShowHideHtmlElement("#hover-box-note", $("#fly-speed-input").val() > 0);
	},

	ShowHideBlindBox: function()
	{
		this.ShowHideHtmlElement("#blind-box-note", $("#blindsight-input").val() > 0);
	},

	ShowHideSeparatorInput: function()
	{
		this.ShowHideHtmlElement("#left-separator-button", doubleColumns);
		this.ShowHideHtmlElement("#right-separator-button", doubleColumns);
	},

	ShowHideLegendaryCreature: function()
	{
		$("#is-legendary-input:checked").val() ?
			$("#add-legendary-button, #legendary-actions-form").show() :
			$("#add-legendary-button, #legendary-actions-form").hide();
	},

	ChangeBonus: function(stat)
	{
		var newBonus = StringFunctions.BonusFormat(MathFunctions.PointsToBonus($("#" + stat + "-input").val()));
		$("#" + stat + "bonus").html(newBonus);
	},

	ChangeCRForm: function()
	{
		$("#prof-bonus").html("(Proficiency Bonus: +" + crs[cr].prof + ")");
	},

	ChangeColumnRadioButtons: function()
	{
		$("#1col-input").prop("checked", !doubleColumns);
		$("#2col-input").prop("checked", doubleColumns);
	},
	
	LegendaryDescriptionDefaultSet: function()
	{
		$("#legendaries-descsection-input").val(legendariesDescription);
	},

	SetStatForm: function(statName, statPoints, statBonus)
	{
		$("#" + statName + "-input").val(statPoints);
		$("#" + statName + "bonus").html(StringFunctions.BonusFormat(statBonus)); 
	},
	
	MakeDisplayList: function(arrName, capitalize, isBlock = false)
	{
		var arr = (arrName == "damage" ? damagetypes.concat(specialdamage) : window[arrName]),
			displayArr = [], content = "", arrElement = "#" + arrName + "-input-list";
			console.log(arr);
		for(var index in arr)
		{	
			var element = arr[index],
				elementName = capitalize ? StringFunctions.StringCapitalize(element.name) : element.name;
				note = element.hasOwnProperty("note") ? element.note : "";
			
			if(element.hasOwnProperty("desc"))
				content = "<b>" + elementName + note + ":</b> " + element.desc;
			else
				content = "<b>" + elementName + note + "</b>";
			
			var functionArgs = GetFunctionArgs(), imageHTML = "<img class='statblockImage' src='dndimages/x-icon.png' alt='Remove' title='Remove' onclick='FormFunctions.RemoveDisplayListItem(\"" + functionArgs + ")'>";
			if(isBlock)
				imageHTML += " <img class='statblockImage' src='dndimages/edit-icon.png' alt='Edit' title='Edit' onclick='FormFunctions.EditDisplayListItem(\"" + functionArgs + ")'>";
			displayArr.push("<li> " + imageHTML + " " + content + "</li>");
		}
		$(arrElement).html(displayArr.join(""));
		
		if(arr.length == 0)
			$(arrElement).parent().hide();
		else
			$(arrElement).parent().show();
		
		function GetFunctionArgs()
		{
			return arrName + "\", " + index + ", " + capitalize + ", " + isBlock;
		}
	},

	RemoveDisplayListItem: function(arrName, index, capitalize, isBlock)
	{
		var arr;
		if(arrName == "damage")
		{
			if(damagetypes.length - index > 0)
				arr = damagetypes;
			else
			{
				index -= damagetypes.length;
				arr = specialdamage;
			}
		}
		else
			arr = window[arrName];
		arr.splice(index, 1);
		this.MakeDisplayList(arrName, capitalize, isBlock);
	},

	EditDisplayListItem: function(arrName, index, capitalize)
	{
		var item = window[arrName][index];
		$("#abilities-name-input").val(item.name);
		$("#abilities-desc-input").val(item.desc);
	},
}

// Input functions to be called only through HTML
InputFunctions =
{
	// Get all variables from a preset
	GetPreset: function()
	{
		var name = $("#monster-select").val(), creature;
		if(name == "")
			return;
		if(name == "default")
		{
			GetVariablesFunctions.SetPreset(defaultPreset);
			FormFunctions.SetForms();
			UpdateStatblock();
			return;
		}
		$.getJSON("https://api-beta.open5e.com/monsters/" + name, function(jsonArr) {
			GetVariablesFunctions.SetPreset(jsonArr);
			FormFunctions.SetForms();
			UpdateStatblock();
			
		})
		.fail(function() {
			console.log("Failed");
			return;
		})
	},

	// Add items to lists - only call these through HTML elements

	AddSthrowInput: function()
	{
		// Insert, complying with standard stat order
		GetVariablesFunctions.AddSthrow($("#sthrows-input").val());
		
		// Display
		FormFunctions.MakeDisplayList("sthrows", true);
	},

	AddSkillInput: function(note)
	{
		// Insert Alphabetically
		GetVariablesFunctions.AddSkill($("#skills-input").val(), note);
		
		// Display
		FormFunctions.MakeDisplayList("skills", true);
	},

	AddDamageTypeInput: function(type)
	{
		// Insert normal damage alphabetically, then special damage alphabetically
		GetVariablesFunctions.AddDamageType($("#damagetypes-input").val(), type);
		
		// Display
		FormFunctions.MakeDisplayList("damage", true);
	},

	AddConditionInput: function()
	{
		GetVariablesFunctions.AddCondition($("#conditions-input").val());
		FormFunctions.MakeDisplayList("conditions", true);
	},

	AddLanguageInput: function()
	{
		GetVariablesFunctions.AddLanguage($("#languages-input").val());
		FormFunctions.MakeDisplayList("languages", false);
	},

	AddAbilityInput: function(arrName)
	{
		GetVariablesFunctions.AddAbility(arrName, $("#abilities-name-input").val().trim(), $("#abilities-desc-input").val().trim(), true);
		FormFunctions.MakeDisplayList(arrName, false, true);
	},

	InputCR: function()
	{
		cr = $("#cr-input").val();
		FormFunctions.ChangeCRForm();
	},
	
	LegendaryDescriptionDefaultInput: function()
	{
		GetVariablesFunctions.LegendaryDescriptionDefault();
		FormFunctions.LegendaryDescriptionDefaultSet();
	}
}

// Functions to get/set variables
GetVariablesFunctions = 
{
	
	// Get all Variables from forms
	GetAllVariables: function()
	{
		// Name and Type
		name = $("#name-input").val().trim();
		size = $("#size-input").val().toLowerCase();
		type = $("#type-input").val();
		if(type == "*")
			type = $("#other-type-input").val();
		tag = $("#tag-input").val().trim();
		alignment = $("#alignment-input").val().trim();
		
		// Armor Class
		armorName = $("#armor-input").val();
		shieldBonus = $("#shield-input:checked").val() ? 2 : 0;
		natArmorBonus = parseInt($("#natarmor-input").val());
		otherArmorDesc = $("#otherarmor-input").val();
		
		// Hit Points
		hitDice = $("#hitdice-input").val();
		
		// Speeds
		speed = $("#speed-input").val();
		burrowSpeed = $("#burrow-speed-input").val();
		climbSpeed = $("#climb-speed-input").val();
		flySpeed = $("#fly-speed-input").val();
		hover = $("#hover-input").prop("checked");
		swimSpeed = $("#swim-speed-input").val();
		
		// Stats	
		strPoints = $("#str-input").val();
		dexPoints = $("#dex-input").val();
		conPoints = $("#con-input").val();
		intPoints = $("#int-input").val();
		wisPoints = $("#wis-input").val();
		chaPoints = $("#cha-input").val();
		GetVariablesFunctions.SetBonuses();
		
		// Senses
		blindsight = $("#blindsight-input").val();
		blind = $("#blindness-input").prop("checked");
		darkvision = $("#darkvision-input").val();
		tremorsense = $("#tremorsense-input").val();
		truesight = $("#truesight-input").val();
		
		// Telepathy
		telepathy = parseInt($("#telepathy-input").val());
		
		// Challenge Rating
		cr = $("#cr-input").val();
		
		// Legendaries
		isLegendary = $("#is-legendary-input").prop("checked");
		if(isLegendary)
			legendariesDescription = $("#legendaries-descsection-input").val().trim();
		
		// One or two columns ?
		doubleColumns = $("#2col-input").prop("checked");
	},
	
	// Get all variables from preset
	SetPreset: function(creature)
	{
		// Name and type
		name = creature.name.trim();
		size = creature.size.trim().toLowerCase();
		type = creature.type.trim();
		tag = creature.subtype.trim();
		alignment = creature.alignment.trim();
		
		// Stats
		strPoints = creature.strength;
		dexPoints = creature.dexterity;
		conPoints = creature.constitution;
		intPoints = creature.intelligence;
		wisPoints = creature.wisdom;
		chaPoints = creature.charisma;
		this.SetBonuses();
		
		// CR
		cr = creature.challenge_rating;
		
		// Armor Class
		var armorAcData = creature.armor_class, armorDescData;
		if(creature.armor_desc)
			armorDescData = creature.armor_desc.split(",");

		// What type of armor do we have? If it doesn't match anything, use "other"
		if(armorDescData) 
		{
			// Do we have a shield?
			if(armorDescData.length > 1 && armorDescData[1].trim() == "shield")
				shieldBonus = 2;
			else
				shieldBonus = 0;
			
			if(armorDescData[0].trim() == "shield")
			{
				shieldBonus = 2;
				armorName = "none";
			}
			
			// Now figure out the type of armor
			else if(armors.hasOwnProperty(armorDescData[0].trim()))
			{
				armorName = armorDescData[0].trim();
				if(armorName == "natural armor")
				{
					var natArmorBonusCheck = armorAcData - MathFunctions.GetAC("none");
					if(natArmorBonusCheck > 0)
						natArmorBonus = natArmorBonusCheck;
					else
						armorName = "other";
				}
			}
			else
				armorName = "other";
		}
		else
			armorName = (armorAcData == MathFunctions.GetAC("none")) ? "none" : "other";
		
		if(armorName == "other")
		{
			if(armorDescData)
				otherArmorDesc = armorAcData + " (" + armorDescData + ")";
			else
				otherArmorDesc = armorAcData + " (unknown armor type)";
			
				// Set the nat armor bonus for convenience
				var natArmorBonusCheck = armorAcData - MathFunctions.GetAC("none");
				if(natArmorBonusCheck > 0)
					natArmorBonus = natArmorBonusCheck;
		}
		
		// Hit Dice
		hitDice = parseInt(creature.hit_dice.split("d")[0]);
		
		// Speeds
		speed = GetSpeed(creature.speed, "walk");
		burrowSpeed = GetSpeed(creature.speed, "burrow");
		climbSpeed = GetSpeed(creature.speed, "climb");
		flySpeed = GetSpeed(creature.speed, "fly");
		swimSpeed = GetSpeed(creature.speed, "swim");
		hover = creature.speed.hasOwnProperty("hover");
		
		// Saving Throws
		sthrows = [];
		if(creature.strength_save)
			this.AddSthrow("str");
		if(creature.dexterity_save)
			this.AddSthrow("dex");
		if(creature.constitution_save)
			this.AddSthrow("con");
		if(creature.intelligence_save)
			this.AddSthrow("int");
		if(creature.wisdom_save)
			this.AddSthrow("wis");
		if(creature.charisma_save)
			this.AddSthrow("cha");
		
		// Skills
		skills = [];
		for(var index in allSkills)
		{
			var currentSkill = allSkills[index], skillCheck = StringFunctions.StringReplaceAll(currentSkill.name.toLowerCase(), " ", "_");
			if(creature.hasOwnProperty(skillCheck) && creature[skillCheck] != null)
			{
				var expectedExpertise = GetVariablesFunctions.GetStatBonus(currentSkill.stat) + crs[cr].prof * 2,
					skillVal = creature[skillCheck];
				this.AddSkill(allSkills[index].name, (skillVal >= expectedExpertise ? " (ex)" : null));
			}
		}
		
		// Conditions
		conditions = [];
		var conditionsPresetArr = ArrayFunctions.FixPresetArray(creature.condition_immunities);
		for(var index in conditionsPresetArr)
			this.AddCondition(conditionsPresetArr[index]);
		
		// Damage Types
		damagetypes = [];
		specialdamage = [];
		this.AddPresetDamage(creature.damage_vulnerabilities, "v");
		this.AddPresetDamage(creature.damage_resistances, "r");
		this.AddPresetDamage(creature.damage_immunities, "i");
		
		// Languages
		languages = [];
		telepathy = 0;
		var languagesPresetArr = creature.languages.split(",");
		for(var index in languagesPresetArr)
		{
			var languageName = languagesPresetArr[index].trim();
			if(languageName.toLowerCase().includes("telepathy"))
				telepathy = parseInt(languageName.replace(/\D/g,''));
			else
				this.AddLanguage(languageName);
		}
		
		// Senses
		blindsight = 0;
		blind = false;
		darkvision = 0;
		tremorsense = 0;
		truesight = 0;
		var sensesPresetArr = creature.senses.split(",");
		for(var index in sensesPresetArr)
		{
			var senseString = sensesPresetArr[index].trim().toLowerCase(), senseName = senseString.split(" ")[0], senseDist = StringFunctions.GetNumbersOnly(senseString);
			switch(senseName)
			{
				case "blindsight":
					blindsight = senseDist;
					blind = senseName.toLowerCase().includes("blind beyond");
					break;
				case "darkvision":
					darkvision = senseDist;
					break;
				case "tremorsense":
					tremorsense = senseDist;
					break;
				case "truesight":
					truesight = senseDist;
					break;
			}
		}
		
		// Legendary?
		isLegendary = Array.isArray(creature.legendary_actions);
		this.LegendaryDescriptionDefault();
		
		// Abilities
		abilities = [];
		actions = [];
		reactions = [];
		legendaries = [];
		var abilitiesPresetArr = creature.special_abilities, actionsPresetArr = creature.actions,
			reactionsPresetArr = creature.reactions, legendariesPresetArr = creature.legendary_actions;
			
		if(Array.isArray(abilitiesPresetArr))
		{
			for(var index in abilitiesPresetArr)
				this.AddAbilityPreset("abilities", abilitiesPresetArr[index]);
		}
			
		if(Array.isArray(actionsPresetArr))
		{
			for(var index in actionsPresetArr)
				this.AddAbilityPreset("actions", actionsPresetArr[index]);
		}
			
		if(Array.isArray(reactionsPresetArr))
		{
			for(var index in reactionsPresetArr)
				this.AddAbilityPreset("reactions", reactionsPresetArr[index]);
		}
			
		if(isLegendary && Array.isArray(legendariesPresetArr))
		{
			for(var index in legendariesPresetArr)
				this.AddAbilityPreset("legendaries", legendariesPresetArr[index]);
		}

		function GetSpeed(speedList, speedType)
		{
			return speedList.hasOwnProperty(speedType) ? parseInt(speedList[speedType]) : 0;
		}
	},

	AddSthrow: function(sthrowName)
	{
		if(!sthrowName) return;
		var sthrowData = ArrayFunctions.FindInList(stats, sthrowName), inserted = false;
		if(sthrowData == null) return;
		
		// Non-alphabetical ordering
		for(var index in sthrows)
		{
			if(sthrows[index].name == sthrowName) return;
			if(sthrows[index].order > sthrowData.order)
			{
				sthrows.splice(index, 0, sthrowData)
				inserted = true;
				break;
			}
		}
		if(!inserted)
			sthrows.push(sthrowData);
	},

	AddSkill: function(skillName, note)
	{
		var skillData = ArrayFunctions.FindInList(allSkills, skillName);
		if(skillData == null) return;
		
		var skill = { "name" : skillData.name, "stat" : skillData.stat };
		if(note)
			skill["note"] = note;
		ArrayFunctions.InsertAlphabetical(skills, skill);
	},

	AddDamageType: function(damageName, type)
	{
		var special = false, note;
		if(!allNormalDamageTypes.includes(damageName.toLowerCase()))
		{
			special = true;
			if(damageName == "*")
			{
				damageName = $("#other-damage-input").val().trim();
				if(damageName.length == 0)
					return;
			}
		}
		if(type == 'v')
			note = " (Vulnerable)";
		else if(type == 'i')
			note = " (Immune)";
		else
			note = " (Resistant)";
		if(special)
			ArrayFunctions.InsertAlphabetical(specialdamage, { "name" : damageName, "note" : note, "type" : type } );
		else
			ArrayFunctions.InsertAlphabetical(damagetypes, { "name" : damageName, "note" : note, "type" : type } );
	},

	AddPresetDamage: function(string, type)
	{
		if(string.length == 0) return;
		var arr = string.split(";");
		if(arr[0].toLowerCase().includes("magic"))
			this.AddDamageType(arr[0].trim(), type);
		else
		{
			var normalArr = arr[0].split(",");
			for(var index in normalArr)
				this.AddDamageType(normalArr[index].trim(), type);
			for(var index = 1; index < arr.length; index++)
				this.AddDamageType(arr[index].trim(), type);
		}
	},

	AddCondition: function(conditionName)
	{
		ArrayFunctions.InsertAlphabetical(conditions, { "name" : conditionName });
	},

	AddLanguage: function(languageName)
	{
		if(languageName == "")
			return;
		if(languageName == "*")
		{
			languageName = $("#other-language-input").val().trim();
			if(languageName.length == 0)
				return;
		}
		if(languages.length > 0)
		{
			if(languageName.toLowerCase() == "all" || languages[0].name.toLowerCase() == "all")
				languages = [];
		}
		ArrayFunctions.InsertAlphabetical(languages, { "name" : languageName });
	},


	// Add abilities, actions, reactions, and legendary actions

	AddAbility: function(arrName, abilityName, abilityDesc)
	{
		if(abilityName.length == 0)
			return;
		var arr = window[arrName];
		ArrayFunctions.InsertAlphabetical(arr, { "name" : abilityName.trim(), "desc" : StringFunctions.FormatString(abilityDesc.trim(), true) }, true);
	},

	AddAbilityPreset: function(arrName, ability)
	{
		var abilityName = ability.name.trim(), abilityDesc = ability.desc.trim();
		
		// In case of spellcasting
		if(arrName == "abilities" && abilityName.toLowerCase().includes("spellcasting"))
		{
			var firstLineBreak = abilityDesc.indexOf("\n");
			spellcastingDesc = abilityDesc.substr(0, firstLineBreak).trim();
			spellcastingSpells = abilityDesc.substr(firstLineBreak).trim();
			
			spellsArr = spellcastingSpells.split("\n");
			for(var index in spellsArr)
			{
				var string = spellsArr[index], splitString = string.split(":");
				if(splitString.length < 2)
					continue;
				var newString = splitString[1];
				newString = StringFunctions.StringReplaceAll(newString, "(", "_(");
				newString = StringFunctions.StringReplaceAll(newString, ")", ")_");
				
				spellsArr[index] = splitString[0] + ":_" + newString + "_";
			}
			
			spellcastingSpells = spellsArr.join("\n>");
			
			abilityDesc = spellcastingDesc + "<br><br>" + spellcastingSpells;
		}
		
		// In case of attacks
		if(arrName == "actions" && abilityDesc.toLowerCase().includes("attack"))
		{
			// Italicize the correct parts of attack-type actions
			var lowercaseDesc = abilityDesc.toLowerCase();
			for(var index in attackTypes)
			{
				var attackType = attackTypes[index];
				if(lowercaseDesc.includes(attackType))
				{
					var indexOfStart = lowercaseDesc.indexOf(attackType), indexOfHit = lowercaseDesc.indexOf("hit:");
					if(indexOfStart != 0)
						break;
					abilityDesc = "_" + abilityDesc.slice(0, attackType.length) + "_" + abilityDesc.slice(attackType.length, indexOfHit) + "_" + abilityDesc.slice(indexOfHit, indexOfHit + 4) + "_" + abilityDesc.slice(indexOfHit + 4);
					break;
				}
			}
		}
		
		this.AddAbility(arrName, abilityName, abilityDesc);
	},

	LegendaryDescriptionDefault: function()
	{
		var monsterName = name.toLowerCase();
		legendariesDescription = "The " + monsterName + " can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The " + monsterName + " regains spent legendary actions at the start of its turn.";
	},

	SetBonuses: function()
	{
		strBonus = MathFunctions.PointsToBonus(strPoints);
		dexBonus = MathFunctions.PointsToBonus(dexPoints);
		conBonus = MathFunctions.PointsToBonus(conPoints);
		intBonus = MathFunctions.PointsToBonus(intPoints);
		wisBonus = MathFunctions.PointsToBonus(wisPoints);
		chaBonus = MathFunctions.PointsToBonus(chaPoints);
	},
	
	GetStatBonus: function(name)
	{
		return window[name.toLowerCase() + "Bonus"]
	},
}

// Functions that return a string
StringFunctions =
{

	BonusFormat: function(newBonus)
	{
		if(newBonus >= 0)
			newBonus = "+" + newBonus;
		return newBonus;
	},
	
	GetArmorData: function()
	{
		if(armorName == "other")
			return this.FormatString(otherArmorDesc, false);
		if(armorName == "mage armor")
		{
			var mageAC = MathFunctions.GetAC(armorName);
			return mageAC + " (" + (mageAC + 3) + " with <i>mage armor</i>)";
		}
		if(armorName == "none")
			return MathFunctions.GetAC(armorName);
		return this.GetArmorString(armorName, MathFunctions.GetAC(armorName));
	},
	
	GetArmorString: function(name, ac)
	{
		if(shieldBonus > 0)
			return ac + " (" + name + ", shield)";
		return ac + " (" + name + ")"
	},
	
	GetHP: function()
	{
		var hitDieSize = sizes[size].hitDie,
			avgHP = Math.floor(hitDice * ((hitDieSize + 1) / 2)) + (hitDice * conBonus);
		if (conBonus > 0)
			return avgHP + " (" + hitDice + "d" + hitDieSize + " + " + (hitDice * conBonus) + ")";
		if (conBonus == 0)
			return avgHP + " (" + hitDice + "d" + hitDieSize + ")";
		return Math.max(avgHP, 1) + " (" + hitDice + "d" + hitDieSize + " - " + -(hitDice * conBonus) + ")";
	},
	
	// Add italics, indents, and newlines
	FormatString: function(string, isBlock)
	{
		var index = 0, endItalics = false, endIndent = false, newLine = (string[0] == ">");
		while(index < string.length)
		{
			var character = string[index];
			// Skip tags
			if(character == "<")
				index = string.indexOf(">", index);
			// Italicize
			else if(character == "_")
			{
				string = this.StringSplice(string, index, 1, endItalics ? "</i>" : "<i>");
				endItalics = !endItalics;
				index = string.indexOf(">", index);
				newLine = false;
			}
			else if(isBlock)
			{
				// Add Newlines
				if(character == "\n" || character == "\r" || character == "\r\n")
				{
					var insertion = ""
					if(endItalics)
					{
						insertion += "</i>";
						endItalics = false;
					}
					if(endIndent)
					{
						insertion += "</div>";
						endIndent = false;
					}
					string = this.StringSplice(string, index, 1, insertion);
					index += insertion.length - 1;
					newLine = true;
				}
				// Add Indents
				else if(newLine)
				{
					if(character == ">")
						string = this.StringSplice(string, index, 1, "<div class='reverse-indent'>");
					else
						string = this.StringSplice(string, index, 0, "<div class='indent'>");
					index = string.indexOf(">", index);
					endIndent = true;
					newLine = false;
				}
			}
			else
				newLine = false;
			index++;
		}
		if(endItalics)
			string += "</i>";
		if(endIndent)
			string += "</div>";
		
		return string;
	},
	
	// HTML strings

	MakePropertyHTML: function(property, firstLine)
	{
		if(property.arr.length == 0) return "";
		var htmlClass = firstLine ? "property-line first" : "property-line",
			arr = Array.isArray(property.arr) ? property.arr.join(", ") : property.arr;
		return "<div class=\"" + htmlClass + "\"> <h4>" + property.name + "</h4> <p>" + arr + "</p></div><!-- property line -->"
	},

	MakeTraitHTML: function(name, description)
	{
		return "<div class=\"property-block\"><h4>" + name + ".</h4><p> " + description + "</p></div> <!-- property block -->";
	},

	MakeTraitHTMLLegendary: function(name, description)
	{
		return "<div class=\"property-block legendary\"><h4>" + name + ".</h4><p> " + description + "</p></div> <!-- property block -->";
	},

	// General string operations

	ConcatUnlessEmpty(item1, item2, joinString = ", ")
	{
		if(item1.length > 0)
		{
			if(item2.length > 0)
				return item1 + joinString + item2;
			return item1;
		}
		if(item2.length > 0)
			return item2;
		return "";
	},

	StringSplice: function(string, index, remove, insert = "")
	{
		return string.slice(0, index) + insert + string.slice(index + remove);
	},

	StringReplaceAll: function(string, find, replacement)
	{
		return string.split(find).join(replacement);
	},

	StringCapitalize: function(string)
	{
		return string[0].toUpperCase() + string.substr(1);
	},

	GetNumbersOnly: function(string)
	{
		return parseInt(string.replace(/\D/g,''));
	},
}

// Math functions
MathFunctions =
{
	PointsToBonus: function(points)
	{
		return Math.floor(points / 2) - 5;
	},

	GetAC: function(armorNameCheck)
	{
		var armor = armors[armorNameCheck];
		if(armor)
		{
			if(armor.type == "light")
				return armor.ac + dexBonus + shieldBonus;
			if(armor.type == "medium")
				return armor.ac + Math.min(dexBonus, 2) + shieldBonus;
			if(armor.type == "heavy")
				return armor.ac + shieldBonus;
			if(armorNameCheck == "natural armor")
				return 10 + dexBonus + natArmorBonus + shieldBonus;
			if(armorNameCheck == "other")
				return "other";
		}
		return 10 + dexBonus + shieldBonus;
	},
}

// Array functions
ArrayFunctions =
{
	InsertAlphabetical: function(arr, element, checkMultiattack = false)
	{
		var lowercaseElement = element.name.toLowerCase();
		if(checkMultiattack && arr.length > 0 && lowercaseElement == "multiattack")
		{
			if(arr[0].name.toLowerCase() == "multiattack")
				arr.splice(0, 1, element)
			else
				arr.splice(0, 0, element)
			return;
		}
		for(var index in arr)
		{
			var lowercaseIndex = arr[index].name.toLowerCase();
			if(checkMultiattack && lowercaseIndex == "multiattack")
				continue;
			if(lowercaseIndex > lowercaseElement)
			{
				arr.splice(index, 0, element)
				return;
			}
			if(lowercaseIndex == lowercaseElement)
			{
				arr.splice(index, 1, element)
				return;
			}
		}
		arr.push(element);
	},

	FindInList: function(arr, name)
	{
		var lowercaseName = name.toLowerCase();
		for(var index in arr)
		{
			if(arr[index].name.toLowerCase() == lowercaseName)
				return arr[index];
		}
		return null;
	},

	FixPresetArray: function(string)
	{
		var arr = string.split(","), returnArr = [];
		for(var index in arr)
		{
			var name = arr[index].trim();
			if(name.length > 0)
				returnArr.push(name);
		}
		return returnArr;
	},
}



const stats = [
		{ "name": "str", "order": 0 },
		{ "name": "dex", "order": 1 }, 
		{ "name": "con", "order": 2 },
		{ "name": "int", "order": 3 },
		{ "name": "wis", "order": 4 },
		{ "name": "cha", "order": 5 },
	],
	
	allProperties = [ "Saving Throws", "Skills", "Damage Vulnerabilities", "Damage Resistances", "Damage Immunities", "Condition Immunities" ],

	allSkills = [
		{ "name" : "acrobatics" , "stat" : "dex" },
		{ "name" : "animal handling", "stat" : "wis" },
		{ 'name' : "arcana", "stat" : "int" },
		{ 'name' : "athletics", "stat" : "str" },
		{ 'name' : "deception", "stat" : "cha" },
		{ 'name' : "history", "stat" : "int" },
		{ 'name' : "insight", "stat" : "wis" },
		{ 'name' : "intimidation", "stat" : "cha" },
		{ 'name' : "investigation", "stat" : "int" },
		{ 'name' : "medicine", "stat" : "wis" },
		{ 'name' : "nature", "stat" : "int" },
		{ 'name' : "perception", "stat" : "wis" },
		{ 'name' : "performance", "stat" : "cha" },
		{ 'name' : "persuasion", "stat" : "cha" },
		{ 'name' : "religion", "stat" : "int" },
		{ 'name' : "sleight of Hand", "stat" : "dex" },
		{ 'name' : "stealth", "stat" : "dex" },
		{ 'name' : "survival", "stat" : "wis" },
	],
	
	allNormalDamageTypes = [ "acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder" ],
	
	allConditions = [ "blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious" ],
	
	commonLanguages = [],
	
	sizes = 
	{
		"tiny":	{ "hitDie": 4 },
		"small": { "hitDie": 6 },
		"medium": { "hitDie": 8 },
		"large": { "hitDie": 10 },
		"huge": { "hitDie": 12 },
		"gargantuan": { "hitDie": 20 },
	},
	
	types = ["aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"]

	crs =
	{
		"0": {"xp": "10", "prof" : 2 },
		"1/8": {"xp": "25", "prof" : 2 },
		"1/4": {"xp": "50", "prof" : 2 },
		"1/2": {"xp": "100", "prof" : 2 },
		"1": {"xp": "200", "prof" : 2 },
		"2": {"xp": "450", "prof" : 2 },
		"3": {"xp": "700", "prof" : 2 },
		"4": {"xp": "1,100", "prof" : 2 },
		"5": {"xp": "1,800", "prof" : 3 },
		"6": {"xp": "2,300", "prof" : 3 },
		"7": {"xp": "2,900", "prof" : 3 },
		"8": {"xp": "3,900", "prof" : 3 },
		"9": {"xp": "5,000", "prof" : 4 },
		"10": {"xp": "5,900", "prof" : 4 },
		"11": {"xp": "7,200", "prof" : 4 },
		"12": {"xp": "8,400", "prof" : 4 },
		"13": {"xp": "10,000", "prof" : 5 },
		"14": {"xp": "11,500", "prof" : 5 },
		"15": {"xp": "13,000", "prof" : 5 },
		"16": {"xp": "15,000", "prof" : 5 },
		"17": {"xp": "18,000", "prof" : 6 },
		"18": {"xp": "20,000", "prof" : 6 },
		"19": {"xp": "22,000", "prof" : 6 },
		"20": {"xp": "25,000", "prof" : 6 },
		"21": {"xp": "33,000", "prof" : 7 },
		"22": {"xp": "41,000", "prof" : 7 },
		"23": {"xp": "50,000", "prof" : 7 },
		"24": {"xp": "62,000", "prof" : 7 },
		"25": {"xp": "75,000", "prof" : 8 },
		"26": {"xp": "90,000", "prof" : 8 },
		"27": {"xp": "105,000", "prof" : 8 },
		"28": {"xp": "120,000", "prof" : 8 },
		"29": {"xp": "135,000", "prof" : 9 },
		"30": {"xp": "155,000", "prof" : 9 },
	},

	armors = 
	{
		"none":	{ "type": "special" },
		"natural armor": { "type": "special" },
		"mage armor": { "type": "special" },
		"padded armor": { "type": "light", "ac": 11 },
		"leather armor": { "type": "light",	"ac": 11 },
		"studded leather": { "type": "light", "ac": 12 },
		"hide armor": { "type": "medium", "ac": 12 },
		"chain shirt": { "type": "medium", "ac": 13 },
		"scale mail": { "type": "medium", "ac": 14 },
		"breastplate": { "type": "medium", "ac": 14 },
		"half plate": { "type": "medium", "ac": 15 },
		"ring mail": { "type": "heavy", "ac": 14 },
		"chain mail": { "type": "heavy", "ac": 16 },
		"splint": { "type": "heavy", "ac": 17 },
		"plate": { "type": "heavy", "ac": 18 },
		"other": { "type": "special" },
	},
	
	allSavedTextVariables = [ "name", "size", "type", "tag", "alignment", "armorName", "otherArmorDesc", "cr", "legendariesDescription" ],
	allSavedNumberVariables = [ "hitDice", "shieldBonus", "natArmorBonus", "speed", "burrowSpeed", "climbSpeed", "flySpeed", "swimSpeed", "strPoints", "dexPoints", "conPoints", "intPoints", "wisPoints", "chaPoints", "blindsight", "darkvision", "tremorsense", "truesight", "telepathy", "separationPoint" ],
	allSavedBooleanVariables = [ "hover", "blind", "isLegendary", "doubleColumns" ],
	allSavedArrayVariables = [ "sthrows", "skills", "conditions", "damagetypes", "specialdamage", "languages", "abilities", "actions", "reactions", "legendaries" ],
	
	attackTypes = [ "melee or ranged weapon attack:", "melee or ranged spell attack:", "melee weapon attack:", "melee spell attack:", "ranged weapon attack:", "ranged spell attack:" ],
	
	defaultPreset = 
	{
		"slug": "",
		"name": "Monster",
		"size": "Medium",
		"type": "humanoid",
		"subtype": "",
		"group": null,
		"alignment": "any alignment",
		"armor_class": 10,
		"armor_desc": null,
		"hit_points": 22,
		"hit_dice": "5d8",
		"speed": { "walk": 30 },
		"strength": 10,
		"dexterity": 10,
		"constitution": 10,
		"intelligence": 10,
		"wisdom": 10,
		"charisma": 10,
		"strength_save": null,
		"dexterity_save": null,
		"constitution_save": null,
		"intelligence_save": null,
		"wisdom_save": null,
		"charisma_save": null,
		"perception": null,
		"damage_vulnerabilities": "",
		"damage_resistances": "",
		"damage_immunities": "",
		"condition_immunities": "",
		"senses": "passive Perception 10",
		"languages": "",
		"challenge_rating": "1",
		"actions": "",
		"reactions": "",
		"legendary_actions": "",
		"special_abilities": "",
		"document_slug": "systems-reference-document"
	}