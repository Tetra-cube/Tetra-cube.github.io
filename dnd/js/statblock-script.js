var mon = {
		name: "Monster", size: "medium", type: "humanoid", tag: "", alignment: "any alignment",
		hitDice: 5, armorName: "none", shieldBonus: 0, natArmorBonus: 3, otherArmorDesc: " (armor)",
		speed: 30, burrowSpeed: 0, climbSpeed: 0, flySpeed: 0, hover: false, swimSpeed: 0,
		strPoints: 10, dexPoints: 10, conPoints: 10, intPoints: 10, wisPoints: 10, chaPoints: 10,
		blindsight: 0, blind: false, darkvision: 0, tremorsense: 0, truesight: 0,
		telepathy: 0,
		cr: "1",
		isLegendary: false, legendariesDescription: "",
		properties: [], abilities: [], actions: [], reactions: [], legendaries: [],
		sthrows: [], skills: [], damagetypes: [], specialdamage: [], conditions: [], languages: [],
		doubleColumns: false, separationPoint: 1
	};

// Save function
var TrySaveFile = () => { SavedData.SaveToFile(); }

// Upload file function
var LoadFilePrompt = () => { $("#file-upload").click(); }

// Load function
var TryLoadFile = () => { SavedData.RetrieveFromFile(); }

// Print function
var TryPrint = function() {
	let printWindow = window.open("dnd-statblock-print.html");
	printWindow.document.write('<html><head><meta charset="utf-8"/><title>' + mon.name + '</title><link rel="shortcut icon" type="image/x-icon" href="./dndimages/favicon.ico" /><link rel="stylesheet" type="text/css" href="css/statblock-style.css"><link rel="stylesheet" type="text/css" href="css/libre-baskerville.css"><link rel="stylesheet" type="text/css" href="css/noto-sans.css"></head><body><div class="content">');
	printWindow.document.write($("#stat-block-wrapper").html());
	printWindow.document.write('</div></body></html>');
}

// View as image function
var TryImage = function() {
	domtoimage.toBlob(document.getElementById("stat-block"))
    .then(function (blob) {
        window.saveAs(blob, mon.name.toLowerCase() + ".png");
    });
}

// Update the main stat block from form variables
var UpdateBlockFromVariables = function(moveSeparationPoint)
{
	GetVariablesFunctions.GetAllVariables();
	UpdateStatblock(moveSeparationPoint);
}

// Functions for saving/loading data
var SavedData =
{
	// Saving
	
	SaveToLocalStorage: () => localStorage.setItem("SavedData", JSON.stringify(mon)),
	
	SaveToFile: () => saveAs(new Blob( [ JSON.stringify(mon) ], { type: "text/plain;charset=utf-8" }), mon.name.toLowerCase() + ".monster"),
	
	// Retrieving
	
	RetrieveFromLocalStorage: function()
	{
		let savedData = localStorage.getItem("SavedData");
		if(savedData != undefined)
			mon = JSON.parse(savedData);
	},
	
	RetrieveFromFile: function()
	{
		let file = $("#file-upload").prop("files")[0],
			reader = new FileReader();

		reader.onload = function (e)
		{
			mon = JSON.parse(reader.result);
			Populate();
		};
		
		reader.readAsText(file);
	},
}

// Update the main stat block
var UpdateStatblock = function(moveSeparationPoint)
{
	// Set Separation Point
	let separationMax = mon.abilities.length + mon.actions.length + mon.reactions.length - 1;

	if(mon.isLegendary)
		separationMax += (mon.legendaries.length == 0 ? 1 : mon.legendaries.length);
	
	if(mon.separationPoint == undefined)
		mon.separationPoint = Math.floor(separationMax / 2);

	if(moveSeparationPoint != undefined)
		mon.separationPoint = MathFunctions.Clamp(mon.separationPoint + moveSeparationPoint, 0, separationMax);
	
	// Save Before Continuing
	SavedData.SaveToLocalStorage();
	
	// One column or two columns
	let statBlock = $("#stat-block");
	mon.doubleColumns ? statBlock.addClass('wide') : statBlock.removeClass('wide');

	// Name and type
	$("#monster-name").html(mon.name);
	$("#monster-type").html(StringFunctions.StringCapitalize(mon.size) + " " + mon.type +
		(mon.tag == "" ? ", " : " (" + mon.tag + "), ") + mon.alignment);

	// Armor Class
	$("#armor-class").html(StringFunctions.FormatString(StringFunctions.GetArmorData()));

	// Hit Points
	$("#hit-points").html(StringFunctions.GetHP());

	// Speed
	let speedsDisplayArr = [ mon.speed + " ft."];
	if(mon.burrowSpeed > 0) speedsDisplayArr.push("burrow " + mon.burrowSpeed + " ft.");
	if(mon.climbSpeed > 0) speedsDisplayArr.push("climb " + mon.climbSpeed + " ft.");
	if(mon.flySpeed > 0) speedsDisplayArr.push("fly " + mon.flySpeed + " ft." + (mon.hover ? " (hover)" : ""));
	if(mon.swimSpeed > 0) speedsDisplayArr.push("swim " + mon.swimSpeed + " ft.");
	$("#speed").html(speedsDisplayArr.join(", "));

	// Stats
	let setPts = (id, pts) => 
		$(id).html(pts + " (" + StringFunctions.BonusFormat(MathFunctions.PointsToBonus(pts)) + ")");
	setPts("#strpts", mon.strPoints);
	setPts("#dexpts", mon.dexPoints);
	setPts("#conpts", mon.conPoints);
	setPts("#intpts", mon.intPoints);
	setPts("#wispts", mon.wisPoints);
	setPts("#chapts", mon.chaPoints);

	// Properties
	let propertiesDisplayArr = [], sthrowsDisplayArr = [], skillsDisplayArr = [], conditionsDisplayArr = [], sensesDisplayArr = [], languageDisplayArr = [],
		 vulnerableDisplayString = "", resistantDisplayString = "", immuneDisplayString = "";

	// Saving Throws
	for(let index = 0; index < mon.sthrows.length; index++)
		sthrowsDisplayArr.push(StringFunctions.StringCapitalize(mon.sthrows[index].name) + " " +
			StringFunctions.BonusFormat((MathFunctions.PointsToBonus(mon[mon.sthrows[index].name + "Points"]) + crs[mon.cr].prof)));
	
	// Skills
	for(let index = 0; index < mon.skills.length; index++)
	{
		let skillData = mon.skills[index];
		skillsDisplayArr.push(StringFunctions.StringCapitalize(skillData.name) + " " +
			StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon[skillData.stat + "Points"]) + crs[mon.cr].prof * (skillData.hasOwnProperty("note") ? 2 : 1)));
	}

	// Damage Types (It's not pretty but it does its job)
	let vulnerableDisplayArr = [], resistantDisplayArr = [], immuneDisplayArr = [],
		vulnerableDisplayArrSpecial = [], resistantDisplayArrSpecial = [], immuneDisplayArrSpecial = [];
	for(let index = 0; index < mon.damagetypes.length; index++)
	{
		let typeId = mon.damagetypes[index].type;
		(typeId == "v" ? vulnerableDisplayArr : typeId == "i" ? immuneDisplayArr : resistantDisplayArr).push(mon.damagetypes[index].name)
	}
	for(let index = 0; index < mon.specialdamage.length; index++)
	{
		let typeId = mon.specialdamage[index].type,
			arr = typeId == "v" ? vulnerableDisplayArrSpecial : typeId == "i" ? immuneDisplayArrSpecial : resistantDisplayArrSpecial;
		arr.push(mon.specialdamage[index].name)
	}
	vulnerableDisplayString = StringFunctions.ConcatUnlessEmpty(vulnerableDisplayArr.join(", "), vulnerableDisplayArrSpecial.join("; "), "; ").toLowerCase();
	resistantDisplayString = StringFunctions.ConcatUnlessEmpty(resistantDisplayArr.join(", "), resistantDisplayArrSpecial.join("; "), "; ").toLowerCase();
	immuneDisplayString = StringFunctions.ConcatUnlessEmpty(immuneDisplayArr.join(", "), immuneDisplayArrSpecial.join("; "), "; ").toLowerCase();
	
	// Condition Immunities
	for(let index = 0; index < mon.conditions.length; index++)
		conditionsDisplayArr.push(mon.conditions[index].name.toLowerCase());

	// Senses
	if(mon.blindsight > 0) sensesDisplayArr.push("blindsight " + mon.blindsight + " ft." + (mon.blind ? " (blind beyond this radius)" : ""));
	if(mon.darkvision > 0) sensesDisplayArr.push("darkvision " + mon.darkvision + " ft.");
	if(mon.tremorsense > 0) sensesDisplayArr.push("tremorsense " + mon.tremorsense + " ft.");
	if(mon.truesight > 0) sensesDisplayArr.push("truesight " + mon.truesight + " ft.");

	// Passive Perception
	let ppData = ArrayFunctions.FindInList(mon.skills, "Perception"), pp = 10 + MathFunctions.PointsToBonus(mon.wisPoints);
	if(ppData != null)
		pp += crs[mon.cr].prof * (ppData.hasOwnProperty("note") ? 2 : 1);
	sensesDisplayArr.push("passive Perception " + pp);
	
	// Languages
	for(let index = 0; index < mon.languages.length; index++)
		languageDisplayArr.push(mon.languages[index].name);
	if(mon.telepathy > 0)
		languageDisplayArr.push("telepathy " + mon.telepathy + " ft.");
	else if(languageDisplayArr.length == 0)
		languageDisplayArr.push("&mdash;");
	
	// Add all that to the array
	let pushArr = (name, arr) => { if(arr.length > 0) propertiesDisplayArr.push( { "name" : name, "arr" : arr } ) };
	pushArr("Saving Throws", sthrowsDisplayArr);
	pushArr("Skills", skillsDisplayArr);
	pushArr("Damage Vulnerabilities", vulnerableDisplayString);
	pushArr("Damage Resistances", resistantDisplayString);
	pushArr("Damage Immunities", immuneDisplayString);
	pushArr("Condition Immunities", conditionsDisplayArr);
	pushArr("Senses", sensesDisplayArr);
	pushArr("Languages", languageDisplayArr);
	
	// Display All Properties (except CR)
	let propertiesDisplayList = [];
	propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[0], true));
	for(let index = 1; index < propertiesDisplayArr.length; index++)
		propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[index]));
	$("#properties-list").html(propertiesDisplayList.join(""));
	
	// Challenge Rating
	$("#challenge-rating").html(mon.cr + " (" + crs[mon.cr].xp + " XP)");
	
	// Abilities
	let traitsHTML = [];
	
	if(mon.abilities.length > 0) AddToTraitList(traitsHTML, mon.abilities);
	if(mon.actions.length > 0) AddToTraitList(traitsHTML, mon.actions, "<h3>Actions</h3>");
	if(mon.reactions.length > 0) AddToTraitList(traitsHTML, mon.reactions, "<h3>Reactions</h3>");
	if(mon.isLegendary)
		AddToTraitList(traitsHTML, mon.legendaries, mon.legendariesDescription == "" ? "<h3>Legendary Actions</h3>" :
			["<h3>Legendary Actions</h3><div class='property-block'>", mon.legendariesDescription, "</div></br>"], true);
	
	// Add traits, taking into account the width of the block (one column or two columns)
	let leftTraitsArr = [], rightTraitsArr = [], separationCounter = 0;
	for(let index = 0; index < traitsHTML.length; index++)
	{
		let trait = traitsHTML[index], raiseCounter = true;
		if(trait[0] == "*")
		{
			raiseCounter = false;
			trait = trait.substr(1);
		}
		(separationCounter < mon.separationPoint ? leftTraitsArr : rightTraitsArr).push(trait);
		if(raiseCounter)
			separationCounter++;
	}
	$("#traits-list-left").html(leftTraitsArr.join(""));
	$("#traits-list-right").html(rightTraitsArr.join(""));
	
	// Show or hide the separator input depending on how many columns there are
	FormFunctions.ShowHideSeparatorInput();
}

// Function used by UpdateStatblock for abilities
var AddToTraitList = function(traitsHTML, traitsArr, addElements, isLegendary = false)
{
	let traitsDisplayList = [];
	
	// Add specific elements to the beginning of the array, usually a header
	if(addElements != undefined)
	{
		if(Array.isArray(addElements))
		{
			for(let index = 0; index < addElements.length; index++)
				traitsHTML.push("*" + addElements[index]);
		}
		else
			traitsHTML.push("*" + addElements);
	}
	
	// There's a small difference in formatting for legendary actions
	for(let index = 0; index < traitsArr.length; index++)
		traitsHTML.push(StringFunctions[isLegendary ? "MakeTraitHTMLLegendary" : "MakeTraitHTML"](traitsArr[index].name, traitsArr[index].desc));
}

// Functions for form-setting
var FormFunctions =
{
	// Set the forms
	SetForms: function()
	{
		// Name and type
		$("#name-input").val(mon.name);
		$("#size-input").val(mon.size);
		
		if(types.includes(mon.type))
			$("#type-input").val(mon.type);
		else
		{
			$("#type-input").val("*");
			$("#other-type-input").val(mon.type);
		}
		this.ShowHideTypeOther();
		
		// Tag and Alignment
		$("#tag-input").val(mon.tag);
		$("#alignment-input").val(mon.alignment);
		
		// Armor Class
		$("#armor-input").val(mon.armorName);
		$("#shield-input").prop("checked", (mon.shieldBonus > 0 ? true : false));
		$("#natarmor-input").val(mon.natArmorBonus);
		$("#otherarmor-input").val(mon.otherArmorDesc);
		this.ShowHideOtherArmor();
		
		// Hit Dice
		$("#hitdice-input").val(mon.hitDice);
		$("#hp-text-input").val(StringFunctions.GetHP());
		$("#custom-hp-input").prop("checked", mon.customHP);
		this.ShowHideCustomHP();
		
		// Speeds
		$("#speed-input").val(mon.speed);
		$("#burrow-speed-input").val(mon.burrowSpeed);
		$("#climb-speed-input").val(mon.climbSpeed);
		$("#fly-speed-input").val(mon.flySpeed);
		$("#hover-input").prop("checked", mon.hover);
		this.ShowHideHoverBox();
		$("#swim-speed-input").val(mon.swimSpeed);
		
		// Stats
		this.SetStatForm("str", mon.strPoints);
		this.SetStatForm("dex", mon.dexPoints);
		this.SetStatForm("con", mon.conPoints);
		this.SetStatForm("int", mon.intPoints);
		this.SetStatForm("wis", mon.wisPoints);
		this.SetStatForm("cha", mon.chaPoints);
		
		// Senses
		$("#blindsight-input").val(mon.blindsight);
		$("#blindness-input").prop("checked", mon.blind);
		this.ShowHideBlindBox();
		$("#darkvision-input").val(mon.darkvision);
		$("#tremorsense-input").val(mon.tremorsense);
		$("#truesight-input").val(mon.truesight);
		
		// Properties
		this.MakeDisplayList("sthrows", true);
		this.MakeDisplayList("skills", true);
		this.MakeDisplayList("conditions", true);
		this.MakeDisplayList("damage", true);
		this.ShowHideDamageOther();
		this.MakeDisplayList("languages", false);
		this.ShowHideLanguageOther();
		$("#telepathy-input").val(mon.telepathy);
		
		// Abilities
		this.MakeDisplayList("abilities", false, true);
		this.MakeDisplayList("actions", false, true);
		this.MakeDisplayList("reactions", false, true);
		this.MakeDisplayList("legendaries",false, true);
		
		// Is Legendary?	
		$("#is-legendary-input").prop("checked", mon.isLegendary);
		this.ShowHideLegendaryCreature();
		
		// Challenge Rating
		$("#cr-input").val(mon.cr);
		this.ChangeCRForm();
		
		// Column Radio Buttons
		this.ChangeColumnRadioButtons();
	},

	// Show/Hide form options to make it less overwhelming - only call these from SetForms or HTML elements
	ShowHideHtmlElement: function(element, show) { show ? $(element).show() : $(element).hide(); },

	ShowHideTypeOther: function() { this.ShowHideHtmlElement("#other-type-input", $("#type-input").val() == "*"); },

	ShowHideCustomHP: function()
	{
		$("#hitdice-input-prompt, #hp-text-input-prompt").hide();
		if($("#custom-hp-input").prop('checked'))
			$("#hp-text-input-prompt").show();
		else
			$("#hitdice-input-prompt").show();
	},
	ShowHideOtherArmor: function()
	{
		$("#natarmor-prompt, #otherarmor-prompt").hide();
		if($("#armor-input").val() == "natural armor")
			$("#natarmor-prompt").show();
		else if($("#armor-input").val() == "other")
			$("#otherarmor-prompt").show();
	},

	ShowHideDamageOther: function() { this.ShowHideHtmlElement("#other-damage-input", $("#damagetypes-input").val() == "*"); },

	ShowHideLanguageOther: function() { this.ShowHideHtmlElement("#other-language-input", $("#languages-input").val() == "*"); },

	ShowHideHoverBox: function() { this.ShowHideHtmlElement("#hover-box-note", $("#fly-speed-input").val() > 0); },

	ShowHideBlindBox: function() { this.ShowHideHtmlElement("#blind-box-note", $("#blindsight-input").val() > 0); },

	ShowHideSeparatorInput: function()
	{
		this.ShowHideHtmlElement("#left-separator-button", mon.doubleColumns);
		this.ShowHideHtmlElement("#right-separator-button", mon.doubleColumns);
	},

	ShowHideLegendaryCreature: function()
	{
		$("#is-legendary-input:checked").val() ?
			$("#add-legendary-button, #legendary-actions-form").show() :
			$("#add-legendary-button, #legendary-actions-form").hide();
	},

	// Set the ability bonus given ability scores
	ChangeBonus: function(stat) { $("#" + stat + "bonus").html(StringFunctions.BonusFormat(MathFunctions.PointsToBonus($("#" + stat + "-input").val()))); },

	// Set the proficiency bonus based on the monster's CR
	ChangeCRForm: function() { $("#prof-bonus").html("(Proficiency Bonus: +" + crs[mon.cr].prof + ")"); },

	// For setting the column radio buttons based on saved data
	ChangeColumnRadioButtons: function()
	{
		$("#1col-input").prop("checked", !mon.doubleColumns);
		$("#2col-input").prop("checked", mon.doubleColumns);
	},
	
	// For setting the legendary action description
	SetLegendaryDescriptionForm: function() { $("#legendaries-descsection-input").val(mon.legendariesDescription); },
	
	SetCommonAbilitiesDropdown : function()
	{
		$("#common-ability-input").html("");
		for(let index = 0; index < commonAbilities.length; index++)
			$("#common-ability-input").append("<option value='" + index + "'>" + commonAbilities[index].name + "</option>");
	},

	// Set ability scores and bonuses
	SetStatForm: function(statName, statPoints)
	{
		$("#" + statName + "-input").val(statPoints);
		$("#" + statName + "bonus").html(StringFunctions.BonusFormat(MathFunctions.PointsToBonus(statPoints))); 
	},
	
	// Make a list of removable items and add it to the editor
	MakeDisplayList: function(arrName, capitalize, isBlock = false)
	{
		let arr = (arrName == "damage" ? mon.damagetypes.concat(mon.specialdamage) : mon[arrName]),
			displayArr = [], content = "", arrElement = "#" + arrName + "-input-list";
		for(let index = 0; index < arr.length; index++)
		{	
			let element = arr[index],
				elementName = capitalize ? StringFunctions.StringCapitalize(element.name) : element.name,
				note = element.hasOwnProperty("note") ? element.note : "";

			content = "<b>" + StringFunctions.FormatString(elementName + note, false) + (element.hasOwnProperty("desc") ?
				":</b> " + StringFunctions.FormatString(element.desc, isBlock) : "</b>");
			
			let functionArgs = arrName + "\", " + index + ", " + capitalize + ", " + isBlock,
				imageHTML = "<img class='statblock-image' src='dndimages/x-icon.png' alt='Remove' title='Remove' onclick='FormFunctions.RemoveDisplayListItem(\"" + functionArgs + ")'>";
			if(isBlock)
				imageHTML += " <img class='statblock-image' src='dndimages/edit-icon.png' alt='Edit' title='Edit' onclick='FormFunctions.EditDisplayListItem(\"" + functionArgs + ")'>" +
					" <img class='statblock-image' src='dndimages/up-icon.png' alt='Up' title='Up' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + index + ", -1)'>" +
					" <img class='statblock-image' src='dndimages/down-icon.png' alt='Down' title='Down' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + index + ", 1)'>";
			displayArr.push("<li> " + imageHTML + " " + content + "</li>");
		}
		$(arrElement).html(displayArr.join(""));
		
		$(arrElement).parent()[arr.length == 0 ? "hide" : "show"]();
	},

	// Remove an item from a display list and update it
	RemoveDisplayListItem: function(arrName, index, capitalize, isBlock)
	{
		let arr;
		if(arrName == "damage")
		{
			if(mon.damagetypes.length - index > 0)
				arr = mon.damagetypes;
			else
			{
				index -= damagetypes.length;
				arr = specialdamage;
			}
		}
		else
			arr = mon[arrName];
		arr.splice(index, 1);
		this.MakeDisplayList(arrName, capitalize, isBlock);
	},

	// Bring an item into the abilities textbox for editing
	EditDisplayListItem: function(arrName, index, capitalize)
	{
		let item = mon[arrName][index];
		$("#abilities-name-input").val(item.name);
		$("#abilities-desc-input").val(item.desc);
	},

	// Change position
	SwapDisplayListItem: function(arrName, index, swap)
	{
		arr = mon[arrName];
		if(index + swap < 0 || index + swap >= arr.length) return;
		let temp = arr[index + swap];
		arr[index + swap] = arr[index];
		arr[index] = temp;
		this.MakeDisplayList(arrName, false, true);
	},
}

// Input functions to be called only through HTML
var InputFunctions =
{
	// Get all variables from a preset
	GetPreset: function()
	{
		let name = $("#monster-select").val(), creature;
		if(name == "") return;
		if(name == "default")
		{
			GetVariablesFunctions.SetPreset(defaultPreset);
			FormFunctions.SetForms();
			UpdateStatblock();
			return;
		}
		$.getJSON("https://api.open5e.com/monsters/" + name, function(jsonArr) {
			GetVariablesFunctions.SetPreset(jsonArr);
			FormFunctions.SetForms();
			UpdateStatblock();
		})
		.fail(function() {
			console.error("Failed to load preset.");
			return;
		})
	},

	// Adding items to lists
	
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
		// Insert alphabetically
		GetVariablesFunctions.AddCondition($("#conditions-input").val());
		
		// Display
		FormFunctions.MakeDisplayList("conditions", true);
	},

	AddLanguageInput: function()
	{
		// Insert alphabetically
		GetVariablesFunctions.AddLanguage($("#languages-input").val());
		
		// Display
		FormFunctions.MakeDisplayList("languages", false);
	},

	// Change CR based on input dropdown
	InputCR: function()
	{
		mon.cr = $("#cr-input").val();
		FormFunctions.ChangeCRForm();
	},

	AddAbilityInput: function(arrName)
	{
		// Insert at end, or replace ability if it exists already
		GetVariablesFunctions.AddAbility(arrName, $("#abilities-name-input").val().trim(), $("#abilities-desc-input").val().trim(), true);
		
		// Display
		FormFunctions.MakeDisplayList(arrName, false, true);
		
		// Clear forms
		$("#abilities-name-input").val("");
		$("#abilities-desc-input").val("");
	},
	
	// Reset legendary description to default
	LegendaryDescriptionDefaultInput: function()
	{
		GetVariablesFunctions.LegendaryDescriptionDefault();
		FormFunctions.SetLegendaryDescriptionForm();
	},

	AddCommonAbilityInput: function()
	{
		let commonAbility = commonAbilities[$("#common-ability-input").val()];
		if(commonAbility.desc)
		{
			$("#abilities-name-input").val(commonAbility.hasOwnProperty("realname") ? commonAbility.realname : commonAbility.name);
			$("#abilities-desc-input").val(StringFunctions.StringReplaceAll(commonAbility.desc, "[MON]", mon.name.toLowerCase()));
		}
	}
}

// Functions to get/set important variables
var GetVariablesFunctions = 
{
	// Get all Variables from forms
	GetAllVariables: function()
	{
		// Name and Type
		mon.name = $("#name-input").val().trim();
		mon.size = $("#size-input").val().toLowerCase();
		mon.type = $("#type-input").val();
		if(mon.type == "*")
			mon.type = $("#other-type-input").val();
		mon.tag = $("#tag-input").val().trim();
		mon.alignment = $("#alignment-input").val().trim();
		
		// Armor Class
		mon.armorName = $("#armor-input").val();
		mon.shieldBonus = $("#shield-input").prop("checked") ? 2 : 0;
		mon.natArmorBonus = parseInt($("#natarmor-input").val());
		mon.otherArmorDesc = $("#otherarmor-input").val();
		
		// Hit Points
		mon.hitDice = $("#hitdice-input").val();
		mon.hpText = $("#hp-text-input").val();
		mon.customHP = $("#custom-hp-input").prop("checked");
		
		// Speeds
		mon.speed = $("#speed-input").val();
		mon.burrowSpeed = $("#burrow-speed-input").val();
		mon.climbSpeed = $("#climb-speed-input").val();
		mon.flySpeed = $("#fly-speed-input").val();
		mon.hover = $("#hover-input").prop("checked");
		mon.swimSpeed = $("#swim-speed-input").val();
		
		// Stats	
		mon.strPoints = $("#str-input").val();
		mon.dexPoints = $("#dex-input").val();
		mon.conPoints = $("#con-input").val();
		mon.intPoints = $("#int-input").val();
		mon.wisPoints = $("#wis-input").val();
		mon.chaPoints = $("#cha-input").val();
		
		// Senses
		mon.blindsight = $("#blindsight-input").val();
		mon.blind = $("#blindness-input").prop("checked");
		mon.darkvision = $("#darkvision-input").val();
		mon.tremorsense = $("#tremorsense-input").val();
		mon.truesight = $("#truesight-input").val();
		
		// Telepathy
		mon.telepathy = parseInt($("#telepathy-input").val());
		
		// Challenge Rating
		mon.cr = $("#cr-input").val();
		
		// Legendaries
		mon.isLegendary = $("#is-legendary-input").prop("checked");
		if(mon.isLegendary)
			mon.legendariesDescription = $("#legendaries-descsection-input").val().trim();
		
		// One or two columns ?
		mon.doubleColumns = $("#2col-input").prop("checked");
	},
	
	// Get all variables from preset
	SetPreset: function(preset)
	{
		// Name and type
		mon.name = preset.name.trim();
		mon.size = preset.size.trim().toLowerCase();
		mon.type = preset.type.trim();
		mon.tag = preset.subtype.trim();
		mon.alignment = preset.alignment.trim();
		
		// Stats
		mon.strPoints = preset.strength;
		mon.dexPoints = preset.dexterity;
		mon.conPoints = preset.constitution;
		mon.intPoints = preset.intelligence;
		mon.wisPoints = preset.wisdom;
		mon.chaPoints = preset.charisma;
		
		// CR
		mon.cr = preset.challenge_rating;
		
		// Armor Class
		let armorAcData = preset.armor_class, armorDescData = preset.armor_desc ? preset.armor_desc.split(",") : null;

		// What type of armor do we have? If it doesn't match anything, use "other"
		if(armorDescData) 
		{
			// If we have a shield and nothing else
			if(armorDescData.length == 1 && armorDescData[0].trim() == "shield")
			{
				mon.shieldBonus = 2;
				mon.armorName = "none";
			}
			else
			{
				// If we have a shield in addition to something else
				if(armorDescData.length > 1)
				{
					mon.shieldBonus = 2;
					mon.armorName = armorDescData[0];
				}

				// Is it natural armor?
				if(mon.armorName == "natural armor")
				{
					let natArmorBonusCheck = armorAcData - MathFunctions.GetAC("none");
					if(natArmorBonusCheck > 0)
						mon.natArmorBonus = natArmorBonusCheck;
					
					// Weird edge case where the monster has a natural armor bonus of <=0
					else
						mon.armorName = "other";
				}
				
				// Is it another type of armor we know?
				else if(armors.hasOwnProperty(armorDescData[0].trim()))
					mon.armorName = armorDescData[0].trim();
				
				// We have no idea what this armor is
				else
					armorName = "other";	
			}
		}
		else
		{
			mon.shieldBonus = 0;
			mon.armorName = (armorAcData == MathFunctions.GetAC("none")) ? "none" : "other";
		}
		
		// In case it's an unknown armor type
		if(mon.armorName == "other")
		{
			if(armorDescData)
				mon.otherArmorDesc = armorAcData + " (" + armorDescData + ")";
			else
				mon.otherArmorDesc = armorAcData + " (unknown armor type)";
			
			// Set the nat armor bonus for convenience- often the AC is for natural armor, but doesn't have it in the armor description
			let natArmorBonusCheck = armorAcData - MathFunctions.GetAC("none");
			
			if(natArmorBonusCheck > 0)
				mon.natArmorBonus = natArmorBonusCheck;
		}
		
		// Hit Dice
		mon.hitDice = parseInt(preset.hit_dice.split("d")[0]);
		mon.hpText = mon.hitDice.toString();
		mon.customHP = false;
		
		// Speeds
		let GetSpeed = (speedList, speedType) => speedList.hasOwnProperty(speedType) ? parseInt(speedList[speedType]) : 0;
		
		mon.speed = GetSpeed(preset.speed, "walk");
		mon.burrowSpeed = GetSpeed(preset.speed, "burrow");
		mon.climbSpeed = GetSpeed(preset.speed, "climb");
		mon.flySpeed = GetSpeed(preset.speed, "fly");
		mon.swimSpeed = GetSpeed(preset.speed, "swim");
		mon.hover = preset.speed.hasOwnProperty("hover");
		
		// Saving Throws
		mon.sthrows = [];
		if(preset.strength_save)
			this.AddSthrow("str");
		if(preset.dexterity_save)
			this.AddSthrow("dex");
		if(preset.constitution_save)
			this.AddSthrow("con");
		if(preset.intelligence_save)
			this.AddSthrow("int");
		if(preset.wisdom_save)
			this.AddSthrow("wis");
		if(preset.charisma_save)
			this.AddSthrow("cha");
		
		// Skills
		mon.skills = [];
		for(let index = 0; index < allSkills.length; index++)
		{
			let currentSkill = allSkills[index], skillCheck = StringFunctions.StringReplaceAll(currentSkill.name.toLowerCase(), " ", "_");
			if(preset.hasOwnProperty(skillCheck) && preset[skillCheck] != null)
			{
				let expectedExpertise = MathFunctions.PointsToBonus(mon[currentSkill.stat + "Points"]) + Math.ceil(crs[mon.cr].prof * 1.5),
					skillVal = preset[skillCheck];
				this.AddSkill(allSkills[index].name, (skillVal >= expectedExpertise ? " (ex)" : null));
			}
		}
		
		// Conditions
		mon.conditions = [];
		let conditionsPresetArr = ArrayFunctions.FixPresetArray(preset.condition_immunities);
		for(let index = 0; index < conditionsPresetArr.length; index++)
			this.AddCondition(conditionsPresetArr[index]);
		
		// Damage Types
		mon.damagetypes = [];
		mon.specialdamage = [];
		this.AddPresetDamage(preset.damage_vulnerabilities, "v");
		this.AddPresetDamage(preset.damage_resistances, "r");
		this.AddPresetDamage(preset.damage_immunities, "i");
		
		// Languages
		mon.languages = [];
		mon.telepathy = 0;
		let languagesPresetArr = preset.languages.split(",");
		for(let index = 0; index < languagesPresetArr.length; index++)
		{
			let languageName = languagesPresetArr[index].trim();
			languageName.toLowerCase().includes("telepathy") ? 
				mon.telepathy = parseInt(languageName.replace(/\D/g,'')) :
				this.AddLanguage(languageName);
		}
		
		// Senses
		mon.blindsight = 0;
		mon.blind = false;
		mon.darkvision = 0;
		mon.tremorsense = 0;
		mon.truesight = 0;
		let sensesPresetArr = preset.senses.split(",");
		for(let index = 0; index < sensesPresetArr.length; index++)
		{
			let senseString = sensesPresetArr[index].trim().toLowerCase(), senseName = senseString.split(" ")[0], senseDist = StringFunctions.GetNumbersOnly(senseString);
			switch(senseName)
			{
				case "blindsight":
					mon.blindsight = senseDist;
					mon.blind = senseName.toLowerCase().includes("blind beyond");
					break;
				case "darkvision":
					mon.darkvision = senseDist;
					break;
				case "tremorsense":
					mon.tremorsense = senseDist;
					break;
				case "truesight":
					mon.truesight = senseDist;
					break;
			}
		}
		
		// Legendary?
		mon.isLegendary = Array.isArray(preset.legendary_actions);
		this.LegendaryDescriptionDefault();
		FormFunctions.SetLegendaryDescriptionForm();
		
		// Abilities
		mon.abilities = [];
		mon.actions = [];
		mon.reactions = [];
		mon.legendaries = [];
		let abilitiesPresetArr = preset.special_abilities, actionsPresetArr = preset.actions,
			reactionsPresetArr = preset.reactions, legendariesPresetArr = preset.legendary_actions;
		
		let self = this, AbilityPresetLoop = function(arr, name)
		{
			if(Array.isArray(arr))
			{
				for(let index = 0; index < arr.length; index++)
					self.AddAbilityPreset(name, arr[index]);
			}
		}
		
		AbilityPresetLoop(abilitiesPresetArr, "abilities");
		AbilityPresetLoop(actionsPresetArr, "actions");
		AbilityPresetLoop(reactionsPresetArr, "reactions");
		if(mon.isLegendary)
			AbilityPresetLoop(legendariesPresetArr, "legendaries");
		
		mon.separationPoint = undefined; // This will make the separation point be automatically calculated in UpdateStatblock
	},
	
	// Add stuff to arrays
	
	AddSthrow: function(sthrowName)
	{
		if(!sthrowName) return;
		let sthrowData = ArrayFunctions.FindInList(stats, sthrowName), inserted = false;
		if(sthrowData == null) return;
		
		// Non-alphabetical ordering
		for(let index = 0; index < mon.sthrows.length; index++)
		{
			if(mon.sthrows[index].name == sthrowName) return;
			if(mon.sthrows[index].order > sthrowData.order)
			{
				mon.sthrows.splice(index, 0, sthrowData)
				inserted = true;
				break;
			}
		}
		if(!inserted)
			mon.sthrows.push(sthrowData);
	},

	AddSkill: function(skillName, note)
	{
		let skillData = ArrayFunctions.FindInList(allSkills, skillName);
		if(skillData == null) return;
		
		let skill = { "name" : skillData.name, "stat" : skillData.stat };
		if(note)
			skill["note"] = note;
		ArrayFunctions.ArrayInsert(mon.skills, skill, true);
	},

	AddDamageType: function(damageName, type)
	{
		let special = false, note;
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
		note = type == 'v' ? " (Vulnerable)" : type == 'i' ? " (Immune)" : " (Resistant)";
		ArrayFunctions.ArrayInsert(mon[special ? "specialdamage" : "damagetypes"], { "name" : damageName, "note" : note, "type" : type }, true );
	},

	AddPresetDamage: function(string, type)
	{
		if(string.length == 0) return;
		let arr = string.split(";");
		if(arr[0].toLowerCase().includes("magic"))
			this.AddDamageType(arr[0].trim(), type);
		else
		{
			let normalArr = arr[0].split(",");
			for(let index = 0; index < normalArr.length; index++)
				this.AddDamageType(normalArr[index].trim(), type);
			for(let index = 1; index < arr.length; index++)
				this.AddDamageType(arr[index].trim(), type);
		}
	},

	AddCondition: function(conditionName)
	{
		ArrayFunctions.ArrayInsert(mon.conditions, { "name" : conditionName }, true);
	},

	AddLanguage: function(languageName)
	{
		if(languageName == "") return;
		if(languageName == "*")
		{
			languageName = $("#other-language-input").val().trim();
			if(languageName.length == 0) return;
		}
		if(mon.languages.length > 0)
		{
			if(languageName.toLowerCase() == "all" || mon.languages[0].name.toLowerCase() == "all")
				mon.languages = [];
		}
		ArrayFunctions.ArrayInsert(mon.languages, { "name" : languageName }, true);
	},


	// Add abilities, actions, reactions, and legendary actions

	AddAbility: function(arrName, abilityName, abilityDesc)
	{
		if(abilityName.length == 0) return;
		let arr = mon[arrName];
		ArrayFunctions.ArrayInsert(arr, { "name" : abilityName.trim(), "desc" : abilityDesc.trim() }, false);
	},

	AddAbilityPreset: function(arrName, ability)
	{
		let abilityName = ability.name.trim(), abilityDesc = ability.desc.trim();
		
		// In case of spellcasting
		if(arrName == "abilities" && abilityName.toLowerCase().includes("spellcasting") && abilityDesc.includes("\n"))
		{
			abilityDesc = abilityDesc.split("\u2022").join("");	// Remove bullet points
			
			// For hag covens
			let postDesc = "";
			if(abilityName.toLowerCase().includes("shared spellcasting"))
			{
				let lastLineBreak = abilityDesc.lastIndexOf("\n\n");
				postDesc = abilityDesc.substr(lastLineBreak).trim();
				abilityDesc = abilityDesc.substring(0, lastLineBreak);
			}

			let firstLineBreak = abilityDesc.indexOf("\n");
			spellcastingDesc = abilityDesc.substr(0, firstLineBreak).trim();
			spellcastingSpells = abilityDesc.substr(firstLineBreak).trim();
			
			spellsArr = spellcastingSpells.split("\n");
			for(let index = 0; index < spellsArr.length; index++)
			{
				let string = spellsArr[index], splitString = string.split(":");
				if(splitString.length < 2) continue;
				let newString = splitString[1];
				newString = StringFunctions.StringReplaceAll(newString, "(", "_(");
				newString = StringFunctions.StringReplaceAll(newString, ")", ")_");
				
				spellsArr[index] = " " + splitString[0].trim() + ": _" + newString.trim() + "_";
			}
			
			spellcastingSpells = spellsArr.join("\n>");
			
			abilityDesc = spellcastingDesc + "\n\n\n>" + spellcastingSpells;
			
			// For hag covens
			if(postDesc.length > 0)
				abilityDesc += "\n\n" + postDesc;
		}
		
		// In case of attacks
		if(arrName == "actions" && abilityDesc.toLowerCase().includes("attack"))
		{
			// Italicize the correct parts of attack-type actions
			let lowercaseDesc = abilityDesc.toLowerCase();
			for(let index = 0; index < attackTypes.length; index++)
			{
				let attackType = attackTypes[index];
				if(lowercaseDesc.includes(attackType))
				{
					let indexOfStart = lowercaseDesc.indexOf(attackType), indexOfHit = lowercaseDesc.indexOf("hit:");
					if(indexOfStart != 0) break;
					abilityDesc = "_" + abilityDesc.slice(0, attackType.length) + "_" + abilityDesc.slice(attackType.length, indexOfHit) + "_" + abilityDesc.slice(indexOfHit, indexOfHit + 4) + "_" + abilityDesc.slice(indexOfHit + 4);
					break;
				}
			}
		}
		
		this.AddAbility(arrName, abilityName, abilityDesc);
	},

	// Return the default legendary description
	LegendaryDescriptionDefault: function()
	{
		let monsterName = name.toLowerCase();
		mon.legendariesDescription = "The " + mon.name.toLowerCase() + " can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The " + mon.name.toLowerCase() + " regains spent legendary actions at the start of its turn.";
	}
}

// Functions that return a string
var StringFunctions =
{
	// Add a + if the ability bonus is non-negative
	BonusFormat: (stat) => stat >= 0 ? "+" + stat : stat,
	
	// Get the string displayed for the monster's AC
	GetArmorData: function()
	{
		if(mon.armorName == "other")
			return mon.otherArmorDesc;
		if(mon.armorName == "mage armor")
		{
			let mageAC = MathFunctions.GetAC(mon.armorName);
			return mageAC + " (" + (mageAC + 3) + " with _mage armor_)";
		}
		if(mon.armorName == "none")
			return MathFunctions.GetAC(mon.armorName);
		return this.GetArmorString(mon.armorName, MathFunctions.GetAC(mon.armorName));
	},
	
	// Add a shield to the string if the monster has one
	GetArmorString: function(name, ac)
	{
		if(mon.shieldBonus > 0)
			return ac + " (" + name + ", shield)";
		return ac + " (" + name + ")"
	},
	
	// Get the string displayed for the monster's HP
	GetHP: function()
	{
		if(mon.customHP)
			return mon.hpText;
		let conBonus = MathFunctions.PointsToBonus(mon.conPoints);
			hitDieSize = sizes[mon.size].hitDie,
			avgHP = Math.floor(mon.hitDice * ((hitDieSize + 1) / 2)) + (mon.hitDice * conBonus);
		if (conBonus > 0)
			return avgHP + " (" + mon.hitDice + "d" + hitDieSize + " + " + (mon.hitDice * conBonus) + ")";
		if (conBonus == 0)
			return avgHP + " (" + mon.hitDice + "d" + hitDieSize + ")";
		return Math.max(avgHP, 1) + " (" + mon.hitDice + "d" + hitDieSize + " - " + -(mon.hitDice * conBonus) + ")";
	},
	
	// Add italics, indents, and newlines
	FormatString: function(string, isBlock)
	{
		if(typeof string != "string")
			return string;
		
		// Complicated regex stuff to add indents
		if(isBlock)
		{
			let execArr, newlineArr = [], regExp = new RegExp("(\r\n|\r|\n)+", "g");
			while ((execArr = regExp.exec(string)) !== null)
				newlineArr.push(execArr);
			let index = newlineArr.length - 1;
			while (index >= 0)
			{
				let newlineString = newlineArr[index],
					reverseIndent = (string[newlineString.index + newlineString[0].length] == ">");

				string = this.StringSplice(string, newlineString.index, newlineString[0].length + (reverseIndent ? 1 : 0),
					"</div>" + (newlineString[0].length > 1 ? "<br>" : "") + (reverseIndent ? "<div class='reverse-indent'>" : "<div class='indent'>"));

				index--;
			}
		}
		
		// Italics and bold
		string = this.FormatStringHelper(string, "_", "<i>", "</i>")
		string = this.FormatStringHelper(string, "**", "<b>", "</b>")
		return string;
	},
	
	// FormatString helper function
	FormatStringHelper: function(string, target, startTag, endTag)
	{
		while(string.includes(target))
		{
			let startIndex = string.indexOf(target);
			string = this.StringSplice(string, startIndex, target.length, startTag);
			let endIndex = string.indexOf(target, startIndex + target.length);
			if(endIndex < 0)
				return string + endTag;
			string = this.StringSplice(string, endIndex, target.length, endTag);
		}
		return string;
	},
	
	// HTML strings

	MakePropertyHTML: function(property, firstLine)
	{
		if(property.arr.length == 0) return "";
		let htmlClass = firstLine ? "property-line first" : "property-line",
			arr = Array.isArray(property.arr) ? property.arr.join(", ") : property.arr;
		return "<div class=\"" + htmlClass + "\"><div><h4>" + property.name + "</h4> <p>" + this.FormatString(arr, false) + "</p></div></div><!-- property line -->"
	},

	MakeTraitHTML: function(name, description)
	{
		return "<div class=\"property-block\"><div><h4>" + name + ".</h4><p> " + this.FormatString(description, true) + "</p></div></div> <!-- property block -->";
	},

	MakeTraitHTMLLegendary: function(name, description)
	{
		return "<div class=\"property-block reverse-indent legendary\"><div><h4>" + name + ".</h4><p> " + this.FormatString(description, true) + "</p></div></div> <!-- property block -->";
	},

	// General string operations

	ConcatUnlessEmpty(item1, item2, joinString = ", ")
	{
		return item1.length > 0 ?
			item2.length > 0 ? item1 + joinString + item2 :
			item1 : item2.length > 0 ? item2 : "";
	},

	StringSplice: (string, index, remove, insert = "") => string.slice(0, index) + insert + string.slice(index + remove),

	StringReplaceAll: (string, find, replacement) => string.split(find).join(replacement),

	StringCapitalize: (string) => string[0].toUpperCase() + string.substr(1),

	GetNumbersOnly: (string) => parseInt(string.replace(/\D/g,'')),
}

// Math functions
var MathFunctions =
{
	Clamp: (num, min, max) => Math.min(Math.max(num, min), max),
	
	// Compute ability bonuses based on ability scores
	PointsToBonus: (points) => Math.floor(points / 2) - 5,

	// Compute armor class
	GetAC: function(armorNameCheck)
	{
		let armor = armors[armorNameCheck],
			dexBonus = MathFunctions.PointsToBonus(mon.dexPoints);
		if(armor)
		{
			if(armor.type == "light") return armor.ac + dexBonus + mon.shieldBonus;
			if(armor.type == "medium") return armor.ac + Math.min(dexBonus, 2) + mon.shieldBonus;
			if(armor.type == "heavy") return armor.ac + mon.shieldBonus;
			if(armorNameCheck == "natural armor") return 10 + dexBonus + mon.natArmorBonus + mon.shieldBonus;
			if(armorNameCheck == "other") return "other";
		}
		return 10 + dexBonus + mon.shieldBonus;
	},
}

// Array functions
var ArrayFunctions =
{
	ArrayInsert: function(arr, element, alphabetSort)
	{
		let lowercaseElement = element.name.toLowerCase();
		for(let index = 0; index < arr.length; index++)
		{
			let lowercaseIndex = arr[index].name.toLowerCase();
			if(alphabetSort && lowercaseIndex > lowercaseElement)
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
		let lowercaseName = name.toLowerCase();
		for(let index = 0; index < arr.length; index++)
		{
			if(arr[index].name.toLowerCase() == lowercaseName)
				return arr[index];
		}
		return null;
	},

	// Take a string representing an array from a preset and turn it into a normal array
	FixPresetArray: function(string)
	{
		let arr = string.split(","), returnArr = [];
		for(let index = 0; index < arr.length; index++)
		{
			let name = arr[index].trim();
			if(name.length > 0)
				returnArr.push(name);
		}
		return returnArr;
	}
}

// Document ready function
$(function()
{
	// Load the preset monster names
	$.getJSON("https://api.open5e.com/monsters/?format=json&fields=slug,name&limit=1000", function(jsonArr) {
		$.each(jsonArr.results, function(index, value) {
			$("#monster-select").append("<option value='" + value.slug + "'>" + value.name + "</option>");
		})
	})
	.fail(function() {
		$("#monster-select-form").html("Unable to load monster presets.")
	})
	
	// Set the default legendary description in case there isn't one saved
	GetVariablesFunctions.SetPreset(defaultPreset);
	
	// Load saved data
	SavedData.RetrieveFromLocalStorage();
	Populate();
});

function Populate()
{
	FormFunctions.SetLegendaryDescriptionForm();
	FormFunctions.SetCommonAbilitiesDropdown();
	
	// Populate the stat block
	FormFunctions.SetForms();
	UpdateStatblock();
}



const stats = [
		{ "name": "str", "order": 0 },
		{ "name": "dex", "order": 1 }, 
		{ "name": "con", "order": 2 },
		{ "name": "int", "order": 3 },
		{ "name": "wis", "order": 4 },
		{ "name": "cha", "order": 5 },
	],
	
	//allProperties = [ "Saving Throws", "Skills", "Damage Vulnerabilities", "Damage Resistances", "Damage Immunities", "Condition Immunities" ],

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
	
	types = [ "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead" ]

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
	},
	
	commonAbilities =
	[
		{ "name" : "Select Preset", "desc" : null },
		{ "name" : "", "desc" : null },
		
		{ "name" : "--- Actions ---", "desc" : null },
		{ "name" : "Melee Weapon Attack", "desc" : "_Melee Weapon Attack:_ +??? to hit, reach ??? ft. one target. _Hit:_ ??? (???d??? + ???) ??? damage." },
		{ "name" : "Melee Spell Attack", "desc" : "_Melee Spell Attack:_ +??? to hit, reach ??? ft. one target. _Hit:_ ??? (???d??? + ???) ??? damage." },
		{ "name" : "Ranged Weapon Attack", "desc" : "_Ranged Weapon Attack:_ +??? to hit, range ???/??? ft., one target. _Hit:_ ??? (???d??? + ???) ??? damage." },
		{ "name" : "Ranged Spell Attack", "desc" : "_Ranged Spell Attack:_ +??? to hit, range ???/??? ft., one target. _Hit:_ ??? (???d??? + ???) ??? damage." },
		{ "name" : "Melee or Ranged Weapon Attack", "desc" : "_Melee or Ranged Weapon Attack:_ +??? to hit, reach ??? ft. or range ???/??? ft., one target. _Hit:_ ??? (???d??? + ???) ??? damage." },
		
		{ "name" : "", "desc" : null },
		
		{ "name" : "--- Abilities ---", "desc" : null },
		{ "name" : "Aggressive", "desc" : "As a bonus action, the [MON] can move up to its speed toward a hostile creature that it can see." },
		{ "name" : "Ambusher", "desc" : "The [MON] has advantage on attack rolls against any creature it has surprised." },
		{ "name" : "Amorphous", "desc" : "The [MON] can move through a space as narrow as 1 inch wide without squeezing." },
		{ "name" : "Amphibious", "desc" : "The [MON] can breathe air and water." },
		{ "name" : "Angelic Weapons", "desc" : "The [MON]'s weapon attacks are magical. When the [MON] hits with any weapon, the weapon deals an extra ???d??? + ??? radiant damage (included in the attack)." },
		{ "name" : "Animal Telepathy", "realname" : "??? Telepathy", "desc" : "The [MON] can magically command any ??? within ??? feet of it, using a limited telepathy." },
		{ "name" : "Antimagic Susceptibility", "desc" : "The [MON] is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the [MON] must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute." },
		{ "name" : "Beast of Burden", "desc" : "The [MON] is considered to be a ??? animal for the purpose of determining its carrying capacity." },
		{ "name" : "Blood Frenzy", "desc" : "The [MON] has advantage on melee attack rolls against any creature that doesn't have all its hit points." },
		{ "name" : "Brave", "desc" : "The [MON] has advantage on saving throws against being frightened." },
		{ "name" : "Brute", "desc" : "A melee weapon deals one extra die of its damage when the [MON] hits with it (included in the attack)." },
		{ "name" : "Camouflage", "realname" : "??? Camouflage", "desc" : "The [MON] has advantage on Dexterity (Stealth) checks made to hide in ??? terrain." },
		{ "name" : "Charge", "desc" : "If the [MON] moves at least ??? ft. straight toward a target and then hits it with a ??? attack on the same turn, the target takes an extra ??? (???d??? + ???) ??? damage. If the target is a creature, it must succeed on a DC ??? Strength saving throw or be knocked prone." },
		{ "name" : "Confer Resistance", "realname" : "Confer ??? Resistance", "desc" : "The [MON] can grant resistance to ??? damage to anyone riding it." },
		{ "name" : "Corrode/Rust Metal", "realname" : "??? Metal", "desc" : "Any nonmagical weapon made of metal that hits the [MON] corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Non magical ammunition made of metal that hits the [MON] is destroyed after dealing damage." },
		{ "name" : "Cunning Action", "desc" : "On each of its turns, the [MON] can use a bonus action to take the Dash, Disengage, or Hide action." },
		{ "name" : "Damage Absorption", "realname" : "??? Absorption", "desc" : "Whenever the [MON] is subjected to ??? damage, it takes no damage and instead regains a number of hit points equal to the ??? damage dealt." },
		{ "name" : "Damage Transfer", "desc" : "While it is grappling a creature, the [MON] takes only half the damage dealt to it, and the creature grappled by the [MON] takes the other half." },
		{ "name" : "Death Burst", "desc" : "When the [MON] dies, it explodes in a burst of ???. Each creature within ??? ft. of it must make a DC ??? Dexterity saving throw, taking ??? (???d??? + ???) ??? damage on a failed save, or half as much damage on a successful one." },
		{ "name" : "Devil's Sight", "desc" : "Magical darkness doesn't impede the devil's darkvision." },
		{ "name" : "Divine Awareness", "desc" : "The [MON] knows if it hears a lie." },
		{ "name" : "Duergar Resilience", "desc" : "The duergar has advantage on saving throws against poison, spells, and illusions, as well as to resist being charmed or paralyzed." },
		{ "name" : "Earth Glide", "desc" : "The [MON] can burrow through nonmagical, unworked earth and stone. While doing so, the [MON] doesn't disturb the material it moves through." },
		{ "name" : "Echolocation", "desc" : "The [MON] can't use its blindsight while deafened." },
		{ "name" : "Ethereal Jaunt", "desc" : "As a bonus action, the [MON] can magically shift from the Material Plane to the Ethereal Plane, or vice versa." },
		{ "name" : "False Appearance", "desc" : "While the [MON] remains motionless, it is indistinguishable from ???." },
		{ "name" : "Fear Aura", "desc" : "Any creature hostile to the [MON] that starts its turn within ??? feet of the [MON] must make a DC ??? Wisdom saving throw, unless the [MON] is incapacitated. On a failed save, the creature is frightened until the start of its next turn. If a creature's saving throw is successful, the creature is immune to the [MON]'s Fear Aura for the next 24 hours." },
		{ "name" : "Fey Ancestry", "desc" : "The [MON] has advantage on saving throws against being charmed, and magic can't put the [MON] to sleep." },
		{ "name" : "Flyby", "desc" : "The [MON] doesn't provoke opportunity attacks when it flies out of an enemy's reach." },
		{ "name" : "Freedom of Movement", "desc" : "The [MON] ignores difficult terrain, and magical effects can't reduce its speed or cause it to be restrained. It can spend 5 feet of movement to escape from nonmagical restraints or being grappled." },
		{ "name" : "Grappler", "desc" : "The [MON] has advantage on attack rolls against any creature grappled by it." },
		{ "name" : "Heated Body", "desc" : "A creature that touches the [MON] or hits it with a melee attack while within ??? feet of it takes ??? (???d??? + ???) fire damage." },
		{ "name" : "Heated Weapons", "desc" : "Any metal melee weapon the [MON] wields deals an extra ??? (???d??? + ???) fire damage on a hit (included in the attack)." },
		{ "name" : "Hellish Weapons", "desc" : "The [MON]'s weapon attacks are magical and deal an extra ??? (???d??? + ???) poison damage on a hit (included in the attacks)." },
		{ "name" : "Hold Breath", "desc" : "The [MON] can hold its breath for ???." },
		{ "name" : "Illumination", "desc" : "The [MON] sheds bright light in a ???-foot radius and dim light in an additional ??? ft." },
		{ "name" : "Immutable Form", "desc" : "The [MON] is immune to any spell or effect that would alter its form." },
		{ "name" : "Incorporeal", "desc" : "The [MON] can move through other creatures and objects as if they were difficult terrain. It takes ??? (???d??? + ???) force damage if it ends its turn inside an object." },
		{ "name" : "Innate Spellcasting", "desc" : "The [MON]'s innate spellcasting ability is ???. It can innately cast the following spells, requiring no material components:\n\n> At will: _spell, spell, spell_\n> 3/day each: _spell, spell, spell_\n> 1/day each: _spell, spell_" },
		{ "name" : "Innate Spellcasting (Single Spell)", "realname" : "Innate Spellcasting (1/Day)", "desc" : "The [MON] can innately cast ??? (spell save DC ???), requiring no material components. Its innate spellcasting ability is ???." },
		{ "name" : "Inscrutable", "desc" : "The [MON] is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the [MON]'s intentions or sincerity have disadvantage." },
		{ "name" : "Invisibility", "desc" : "The [MON] magically turns invisible until it attacks or casts a spell, or until its concentration ends (as if concentrating on a spell). Any equipment the [MON] wears or carries is invisible with it." },
		{ "name" : "Keen Hearing", "desc" : "The [MON] has advantage on Wisdom (Perception) checks that rely on hearing." },
		{ "name" : "Keen Sight", "desc" : "The [MON] has advantage on Wisdom (Perception) checks that rely on sight." },
		{ "name" : "Keen Smell", "desc" : "The [MON] has advantage on Wisdom (Perception) checks that rely on smell." },
		{ "name" : "Keen Hearing and Sight", "desc" : "The [MON] has advantage on Wisdom (Perception) checks that rely on hearing or sight." },
		{ "name" : "Keen Hearing and Smell", "desc" : "The [MON] has advantage on Wisdom (Perception) checks that rely on hearing or smell." },
		{ "name" : "Labyrinthine Recall", "desc" : "The [MON] can perfectly recall any path it has traveled." },
		{ "name" : "Legendary Resistance", "realname" : "Legendary Resistance (3/day)", "desc" : "If the [MON] fails a saving throw, it can choose to succeed instead." },
		{ "name" : "Limited Amphibiousness", "desc" : "The [MON] can breathe air and water, but it needs to be submerged at least once every 4 hours to avoid suffocating." },
		{ "name" : "Limited Magic Immunity", "desc" : "The [MON] can't be affected or detected by spells of ??? level or lower unless it wishes to be. It has advantage on saving throws against all other spells and magical effects." },
		{ "name" : "Magic Resistance", "desc" : "The [MON] has advantage on saving throws against spells and other magical effects." },
		{ "name" : "Magic Weapons", "desc" : "The [MON]'s weapon attacks are magical." },
		{ "name" : "Martial Advantage", "desc" : "Once per turn, the [MON] can deal an extra ??? (???d??? + ???) damage to a creature it hits with a weapon attack if that creature is within 5 ft. of an ally of the [MON] that isn't incapacitated." },
		{ "name" : "Mimicry", "desc" : "The [MON] can mimic ??? sounds it has heard. A creature that hears the sounds can tell they are imitations with a successful DC ??? Wisdom (Insight) check." },
		{ "name" : "Nimble Escape", "desc" : "The [MON] can take the Disengage or Hide action as a bonus action on each of its turns." },
		{ "name" : "Pack Tactics", "desc" : "The [MON] has advantage on an attack roll against a creature if at least one of the [MON]'s allies is within 5 ft. of the creature and the ally isn't incapacitated." },
		{ "name" : "Rampage", "desc" : "When the [MON] reduces a creature to 0 hit points with a melee attack on its turn, the [MON] can take a bonus action to move up to half its speed and make a ??? attack." },
		{ "name" : "Reactive", "desc" : "The [MON] can take one reaction on every turn in combat." },
		{ "name" : "Reckless", "desc" : "At the start of its turn, the [MON] can gain advantage on all melee weapon attack rolls it makes during that turn, but attack rolls against it have advantage until the start of its next turn." },
		{ "name" : "Regeneration", "desc" : "The [MON] regains ??? hit points at the start of its turn if it has at least 1 hit point." },
		{ "name" : "Regeneration (Troll)", "realname" : "Regeneration", "desc" : "The [MON] regains ??? hit points at the start of its turn. If the [MON] takes acid or fire damage, this trait doesn't function at the start of the [MON]'s next turn. The [MON] dies only if it starts its turn with 0 hit points and doesn't regenerate." },
		{ "name" : "Relentless", "realname" : "Relentless (Recharges after a Short or Long Rest)", "desc" : "If the [MON] takes ??? damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead." },
		{ "name" : "Shadow Stealth", "desc" : "While in dim light or darkness, the [MON] can take the Hide action as a bonus action." },
		{ "name" : "Shapechanger", "desc" : "The [MON] can use its action to polymorph into a ???, or back into its true form. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies." },
		{ "name" : "Shapechanger (Lycanthrope)", "realname" : "Shapechanger", "desc" : "The [MON] can use its action to polymorph into a ???-humanoid hybrid or into a ???, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies." },
		{ "name" : "Siege Monster", "desc" : "The [MON] deals double damage to objects and structures." },
		{ "name" : "Spider Climb", "desc" : "The [MON] can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check." },
		{ "name" : "Spellcasting", "desc" : "The [MON] is a 1st-level spellcaster. Its spellcasting ability is ??? (spell save DC ???, +??? to hit with spell attacks). The [MON] has the following ??? spells prepared:\n\n> Cantrips (at will): _spell, spell, spell, spell_\n> 1st level (4 slots): _spell, spell, spell_\n> 2nd level (3 slots): _spell, spell, spell_\n> 3rd level (2 slots): _spell, spell_" },
		{ "name" : "Standing Leap", "desc" : "The [MON]'s long jump is up to ??? ft. and its high jump is up to ??? ft., with or without a running start." },
		{ "name" : "Sunlight Sensitivity", "desc" : "While in sunlight, the [MON] has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight." },
		{ "name" : "Sure-Footed", "desc" : "The [MON] has advantage on Strength and Dexterity saving throws made against effects that would knock it prone." },
		{ "name" : "Surprise Attack", "desc" : "If the [MON] surprises a creature and hits it with an attack during the first round of combat, the target takes an extra ??? (???d??? + ???) damage from the attack." },
		{ "name" : "Swarm", "desc" : "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a ???. The swarm can't regain hit points or gain temporary hit points." },
		{ "name" : "Teleport", "desc" : "The [MON] magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see." },
		{ "name" : "Tunneler", "desc" : "The [MON] can burrow through solid rock at half its burrow speed and leaves a ???-foot-diameter tunnel in its wake." },
		{ "name" : "Turn Defiance", "desc" : "The [MON] has advantage on saving throws against any effect that turns undead." },
		{ "name" : "Undead Fortitude", "desc" : "If damage reduces the [MON] to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the [MON] drops to 1 hit point instead." },
		{ "name" : "Water Breathing", "desc" : "The [MON] can breathe only underwater." },
		{ "name" : "Web Sense", "desc" : "While in contact with a web, the [MON] knows the exact location of any other creature in contact with the same web." },
		{ "name" : "Web Walker", "desc" : "The [MON] ignores movement restrictions caused by webbing." },
	];