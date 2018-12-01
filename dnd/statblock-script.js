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

$(document).ready(function() {	
	$.getJSON("https://api-beta.open5e.com/monsters/?format=json&fields=slug,name&limit=1000", function(jsonArr) {
		$.each(jsonArr.results, function(index, value) {
			$("#monster-select").append("<option value='" + value.slug + "'>" + value.name + "</option>");
		})
	})
	.fail(function() {
		$("#monster-select-form").html("Unable to load monster presets.")
	})
	
	// Load saved data
	RetrieveAllData();
		
	// Show or hide parts of the editor accordingly
	ShowHideTypeOther();
	ShowHideOtherArmor();
	ShowHideDamageOther();
	ShowHideLanguageOther();
	ShowHideHoverBox();
	ShowHideBlindBox();
	ShowHideLegendaryCreature();
	ShowHideSeparatorInput();
	
	// Set the ability score bonuses
	for(var stat in stats)
		ChangeBonus(stats[stat].name.toLowerCase());
	
	// Set the CR proficiency bonus
	SetBonuses();
	
	// // Hide ability sections via code, for convenience
	$("#abilities-input-section, #actions-input-section, #reactions-input-section, #legendaries-input-section").hide();
	
	// Set the default legendary description
	LegendaryDescriptionDefault();
	
	// Populate the stat block
	UpdateStatblock(0);
	SetForms();
	ChangeCRForm();
	ChangeColumnRadioButtons();
});





// Print version

function TryPrint()
{
	window.print();
}





// Data serialization to make the data persist

function SaveAllData()
{
	for(var index in allSavedBooleanVariables)
		SaveData(allSavedBooleanVariables[index]);
	
	for(var index in allSavedNumberVariables)
		SaveData(allSavedNumberVariables[index]);
	
	for(var index in allSavedTextVariables)
		SaveData(allSavedTextVariables[index]);
	
	for(var index in allSavedArrayVariables)
		SaveData(allSavedArrayVariables[index]);
}

function SaveData(key)
{
	var data = window[key];
	if(data != undefined)
		localStorage.setItem(key, Serialize(data));
}

function RetrieveAllData()
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





// Functions for updating the main stat block

function UpdateFormAndBlock(moveSeparationPoint)
{
	GetAllVariables();
	UpdateStatblock(moveSeparationPoint);
}

function UpdateStatblock(moveSeparationPoint)
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
	SaveAllData();
	
	// One column or two columns
	var statBlock = $("#stat-block");
	if(doubleColumns)
		statBlock.addClass('wide');
	else
		statBlock.removeClass('wide');

	// Name and type
	$("#monster-name").html(name);
	if(tag == "")
		$("#monster-type").html(StringCapitalize(size) + " " + type + ", " + alignment);
	else
		$("#monster-type").html(StringCapitalize(size) + " " + type + " (" + tag + "), " + alignment);

	// Armor Class
	$("#armor-class").html(GetArmorData());

	// Hit Points
	$("#hit-points").html(GetHP());

	// Speed
	var speedsDisplayArr = [ speed + " ft."];
	if(burrowSpeed > 0)
		speedsDisplayArr.push("burrow " + burrowSpeed + "ft.");
	if(climbSpeed > 0)
		speedsDisplayArr.push("climb " + climbSpeed + "ft.");
	if(flySpeed > 0)
		speedsDisplayArr.push("fly " + flySpeed + "ft." + (hover ? " (hover)" : ""));
	if(swimSpeed > 0)
		speedsDisplayArr.push("swim " + swimSpeed + "ft.");
	$("#speed").html(speedsDisplayArr.join(", "));

	// Stats
	$("#strpts").html(strPoints + " (" + BonusFormat(strBonus) + ")");
	$("#dexpts").html(dexPoints + " (" + BonusFormat(dexBonus) + ")");
	$("#conpts").html(conPoints + " (" + BonusFormat(conBonus) + ")");
	$("#intpts").html(intPoints + " (" + BonusFormat(intBonus) + ")");
	$("#wispts").html(wisPoints + " (" + BonusFormat(wisBonus) + ")");
	$("#chapts").html(chaPoints + " (" + BonusFormat(chaBonus) + ")");

	// Properties
	var propertiesDisplayArr = [];

	// Saving Throws
	var sthrowsDisplayArr = [];
	for(var index in sthrows)
		sthrowsDisplayArr.push(StringCapitalize(sthrows[index].name) + " +" + (GetStatBonus(sthrows[index].name) + crs[cr].prof));
	if(sthrowsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Saving Throws", "arr" : sthrowsDisplayArr } );

	// Skills
	var skillsDisplayArr = [];
	for(var index in skills)
	{
		var skillData = skills[index];
		if(skillData.hasOwnProperty("note"))
			skillsDisplayArr.push(StringCapitalize(skillData.name) + " +" + (GetStatBonus(skillData.stat) + crs[cr].prof * 2));
		else
			skillsDisplayArr.push(StringCapitalize(skillData.name) + " +" + (GetStatBonus(skillData.stat) + crs[cr].prof));
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

	vulnerableDisplayString = ConcatUnlessEmpty(vulnerableDisplayArr.join(", "), vulnerableDisplayArrSpecial.join("; "), "; ").toLowerCase();
	resistantDisplayString = ConcatUnlessEmpty(resistantDisplayArr.join(", "), resistantDisplayArrSpecial.join("; "), "; ").toLowerCase();
	immuneDisplayString = ConcatUnlessEmpty(immuneDisplayArr.join(", "), immuneDisplayArrSpecial.join("; "), "; ").toLowerCase();

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
		sensesDisplayArr.push("blindsight " + blindsight + "ft." + (blind ? " (blind beyond this radius)" : ""));
	if(darkvision > 0)
		sensesDisplayArr.push("darkvision " + darkvision + "ft.");
	if(tremorsense > 0)
		sensesDisplayArr.push("tremorsense " + tremorsense + "ft.");
	if(truesight > 0)
		sensesDisplayArr.push("truesight " + truesight + "ft.");

	// Passive Perception
	var ppData = FindInList(skills, "Perception"), pp = 10 + wisBonus;
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
	propertiesDisplayList.push(MakePropertyHTML(propertiesDisplayArr[0], true));
	for(var index = 1; index < propertiesDisplayArr.length; index++)
		propertiesDisplayList.push(MakePropertyHTML(propertiesDisplayArr[index]));
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
	
	ShowHideSeparatorInput();
}





// Get all variables from the form

function GetAllVariables()
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
	SetBonuses();
	
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
	ChangeCRForm();
	
	// Legendaries
	isLegendary = $("#is-legendary-input").prop("checked");
	if(isLegendary)
		legendariesDescription = $("#legendaries-descsection-input").val().trim();
	
	// One or two columns ?
	doubleColumns = $("#2col-input").prop("checked");
}





// Get all variables from a preset

function GetPreset()
{
	var name = $("#monster-select").val(), creature;
	if(name == "")
		return;
	if(name == "default")
	{
		SetPreset(defaultPreset);
		return;
	}
	$.getJSON("https://api-beta.open5e.com/monsters/" + name, function(jsonArr) {
		SetPreset(jsonArr);
	})
	.fail(function() {
		console.log("Failed");
		return;
	})
}

function SetPreset(creature)
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
	SetBonuses();
	
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
				natArmorBonusCheck = armorAcData - GetAC("none");
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
		armorName = (armorAcData == GetAC("none")) ? "none" : "other";
	
	if(armorName == "other")
	{
		if(armorDescData)
			otherArmorDesc = armorAcData + " (" + armorDescData + ")";
		else
			otherArmorDesc = armorAcData + " (unknown armor type)";
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
	if(creature.strength_save) AddSthrow("str");
	if(creature.dexterity_save) AddSthrow("dex");
	if(creature.constitution_save) AddSthrow("con");
	if(creature.intelligence_save) AddSthrow("int");
	if(creature.wisdom_save) AddSthrow("wis");
	if(creature.charisma_save) AddSthrow("cha");
	
	// Skills
	skills = [];
	for(var index in allSkills)
	{
		var currentSkill = allSkills[index], skillCheck = StringReplaceAll(currentSkill.name.toLowerCase(), " ", "_");
		if(creature.hasOwnProperty(skillCheck) && creature[skillCheck] != null)
		{
			var expectedExpertise = GetStatBonus(currentSkill.stat) + crs[cr].prof * 2,
				skillVal = creature[skillCheck];
			AddSkill(allSkills[index].name, (skillVal >= expectedExpertise ? " (ex)" : null));
		}
	}
	
	// Conditions
	conditions = [];
	var conditionsPresetArr = FixPresetArray(creature.condition_immunities);
	for(var index in conditionsPresetArr)
		AddCondition(conditionsPresetArr[index]);
	
	// Damage Types
	damagetypes = [];
	specialdamage = [];
	AddPresetDamage(creature.damage_vulnerabilities, "v");
	AddPresetDamage(creature.damage_resistances, "r");
	AddPresetDamage(creature.damage_immunities, "i");
	
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
			AddLanguage(languageName);
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
		var senseString = sensesPresetArr[index].trim().toLowerCase(), senseName = senseString.split(" ")[0], senseDist = GetNumbersOnly(senseString);
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
	LegendaryDescriptionDefault();
	
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
			AddAbilityPreset("abilities", abilitiesPresetArr[index]);
	}
		
	if(Array.isArray(actionsPresetArr))
	{
		for(var index in actionsPresetArr)
			AddAbilityPreset("actions", actionsPresetArr[index]);
	}
		
	if(Array.isArray(reactionsPresetArr))
	{
		for(var index in reactionsPresetArr)
			AddAbilityPreset("reactions", reactionsPresetArr[index]);
	}
		
	if(isLegendary && Array.isArray(legendariesPresetArr))
	{
		for(var index in legendariesPresetArr)
			AddAbilityPreset("legendaries", legendariesPresetArr[index]);
	}
	
	SetForms();
	UpdateStatblock();
}





// Set the form according to the preset

function SetForms()
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
	ShowHideTypeOther();
	
	$("#tag-input").val(tag);
	$("#alignment-input").val(alignment);
	
	// Armor Class
	$("#armor-input").val(armorName);
	$("#shield-input").prop("checked", (shieldBonus > 0 ? true : false));
	$("#natarmor-input").val(natArmorBonus);
	$("#otherarmor-input").val(otherArmorDesc);
	ShowHideOtherArmor();
	
	// Hit Dice
	$("#hitdice-input").val(hitDice);
	
	// Speeds
	$("#speed-input").val(speed);
	$("#burrow-speed-input").val(burrowSpeed);
	$("#climb-speed-input").val(climbSpeed);
	$("#fly-speed-input").val(flySpeed);
	$("#hover-input").prop("checked", hover);
	ShowHideHoverBox();
	$("#swim-speed-input").val(swimSpeed);
	
	// Stats
	SetStatForm("str", strPoints, strBonus);
	SetStatForm("dex", dexPoints, dexBonus);
	SetStatForm("con", conPoints, conBonus);
	SetStatForm("int", intPoints, intBonus);
	SetStatForm("wis", wisPoints, wisBonus);
	SetStatForm("cha", chaPoints, chaBonus);
	SetBonuses();
	
	// Senses
	$("#blindsight-input").val(blindsight);
	$("#blindness-input").prop("checked", blind);
	ShowHideBlindBox();
	$("#darkvision-input").val(darkvision);
	$("#tremorsense-input").val(tremorsense);
	$("#truesight-input").val(truesight);
	
	// Properties
	MakeDisplayList("sthrows", true);
	MakeDisplayList("skills", true);
	MakeDisplayList("conditions", true);
	MakeDisplayList("damagetypes", true, false);
	MakeDisplayList("specialdamage", true, false);
	MakeDisplayList("languages", false);
	
	// Telepathy
	$("#telepathy-input").val(telepathy);
	
	// Abilities
	MakeDisplayList("abilities", false);
	MakeDisplayList("actions", false);
	MakeDisplayList("reactions", false);
	MakeDisplayList("legendaries",false);
	
	// Is Legendary?	
	$("#is-legendary-input").prop("checked", isLegendary);
	ShowHideLegendaryCreature();
	
	// Challenge Rating
	crs[cr].prof = crs[cr].prof;
	$("#cr-input").val(cr);
	ChangeCRForm();
}





// Show/Hide form options to make it less overwhelming

function ShowHideHtmlElement(element, show)
{
	show ? $(element).show() : $(element).hide();
}

function ShowHideTypeOther()
{
	ShowHideHtmlElement("#other-type-input", $("#type-input").val() == "*");
}

function ShowHideOtherArmor()
{
	$("#natarmor-prompt, #otherarmor-prompt").hide();
	if($("#armor-input").val() == "natural armor")
		$("#natarmor-prompt").show();
	else if($("#armor-input").val() == "other")
		$("#otherarmor-prompt").show();
}

function ShowHideDamageSection()
{
	ShowHideHtmlElement($("#damage-input-section"), damagetypes.length > 0 || specialdamage.length > 0);
}

function ShowHideDamageOther()
{
	ShowHideHtmlElement("#other-damage-input", $("#damagetypes-input").val() == "*");
}

function ShowHideLanguageOther()
{
	ShowHideHtmlElement("#other-language-input", $("#languages-input").val() == "*");
}

function ShowHideHoverBox()
{
	ShowHideHtmlElement("#hover-box-note", $("#fly-speed-input").val() > 0);
}

function ShowHideBlindBox()
{
	ShowHideHtmlElement("#blind-box-note", $("#blindsight-input").val() > 0);
}

function ShowHideSeparatorInput()
{
	ShowHideHtmlElement("#left-separator-button", doubleColumns);
	ShowHideHtmlElement("#right-separator-button", doubleColumns);
}

function ShowHideLegendaryCreature()
{
	$("#is-legendary-input:checked").val() ?
		$("#add-legendary-button, #legendary-actions-form").show() :
		$("#add-legendary-button, #legendary-actions-form").hide();
}





// Other form functions

function InputCR()
{
	cr = $("#cr-input").val();
	ChangeCRForm();
}

function ChangeCRForm()
{
	$("#prof-bonus").html("(Proficiency Bonus: +" + crs[cr].prof + ")");
}

function ChangeColumnRadioButtons()
{
	$("#1col-input").prop("checked", !doubleColumns);
	$("#2col-input").prop("checked", doubleColumns);
}





// Add items to lists

function AddSthrowInput()
{
	// Insert, complying with standard stat order
	AddSthrow($("#sthrows-input").val());
	
	// Display
	MakeDisplayList("sthrows", true);
}

function AddSthrow(sthrowName)
{
	if(!sthrowName) return;
	var sthrowData = FindInList(stats, sthrowName), inserted = false;
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
}

function AddSkillInput(note)
{
	// Insert Alphabetically
	AddSkill($("#skills-input").val(), note);
	
	// Display
	MakeDisplayList("skills", true);
}

function AddSkill(skillName, note)
{
	var skillData = FindInList(allSkills, skillName)
		skill = { "name" : skillData.name, "stat" : skillData.stat }
	if(note)
		skill["note"] = note;
	InsertAlphabetical(skills, skill);
}

function AddDamageTypeInput(type)
{
	// Insert normal damage alphabetically, then special damage alphabetically
	AddDamageType($("#damagetypes-input").val(), type);
	
	// Display
	MakeDisplayList("damagetypes", true, false);
	MakeDisplayList("specialdamage", true, false);
	ShowHideDamageSection();
}

function AddDamageType(damageName, type)
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
		InsertAlphabetical(specialdamage, { "name" : damageName, "note" : note, "type" : type } );
	else
		InsertAlphabetical(damagetypes, { "name" : damageName, "note" : note, "type" : type } );
}

function AddPresetDamage(string, type)
{
	if(string.length == 0) return;
	var arr = string.split(";");
	if(arr[0].toLowerCase().includes("magic"))
		AddDamageType(arr[0].trim(), type);
	else
	{
		var normalArr = arr[0].split(",");
		for(var index in normalArr)
			AddDamageType(normalArr[index].trim(), type);
		for(var index = 1; index < arr.length; index++)
			AddDamageType(arr[index].trim(), type);
	}
}

function AddConditionInput()
{
	AddCondition($("#conditions-input").val());
	MakeDisplayList("conditions", true);
}

function AddCondition(conditionName)
{
	InsertAlphabetical(conditions, { "name" : conditionName });
}

function AddLanguageInput()
{
	AddLanguage($("#languages-input").val());
	MakeDisplayList("languages", false);
}

function AddLanguage(languageName)
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
	InsertAlphabetical(languages, { "name" : languageName });
}





// Add abilities, actions, reactions, and legendary actions

function AddAbilityInput(arrName)
{
	AddAbility(arrName, $("#abilities-name-input").val().trim(), $("#abilities-desc-input").val().trim(), true);
	MakeDisplayList(arrName, false);
}

function AddAbility(arrName, abilityName, abilityDesc)
{
	if(abilityName.length == 0)
		return;
	var arr = window[arrName];
	InsertAlphabetical(arr, { "name" : abilityName.trim(), "desc" : FormatString(abilityDesc.trim(), true) }, true);
}

function AddAbilityPreset(arrName, ability)
{
	var abilityName = ability.name, abilityDesc = ability.desc;
	
	// In case of spellcasting
	if(abilityName.toLowerCase().includes("spellcasting"))
	{
		var firstLineBreak = abilityDesc.indexOf("\n");
		spellcastingDesc = abilityDesc.substr(0, firstLineBreak);
		spellcastingSpells = abilityDesc.substr(firstLineBreak);
		
		spellcastingSpells = StringReplaceAll(spellcastingSpells, "\n", "_\n>");
		spellcastingSpells = StringReplaceAll(spellcastingSpells, ":", ":_");
		spellcastingSpells = StringReplaceAll(spellcastingSpells, "(", "_(");
		spellcastingSpells = StringReplaceAll(spellcastingSpells, ")", ")_");
		spellcastingSpells = spellcastingSpells.substr(1);
		
		abilityDesc = spellcastingDesc + "<br><br>" + spellcastingSpells;
	}
	
	AddAbility(arrName, abilityName, abilityDesc);
}

function LegendaryDescriptionDefault()
{
	var monsterName = name.toLowerCase();
	legendariesDescription = "The " + monsterName + " can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The " + monsterName + " regains spent legendary actions at the start of its turn."
	$("#legendaries-descsection-input").val(legendariesDescription);
}





// Math computations

function ChangeBonus(stat)
{
	var newBonus = BonusFormat(PointsToBonus($("#" + stat + "-input").val()));
	$("#" + stat + "bonus").html(newBonus);
}

function PointsToBonus(points)
{
	return Math.floor(points / 2) - 5;
}

function SetBonuses()
{
	strBonus = PointsToBonus(strPoints);
	dexBonus = PointsToBonus(dexPoints);
	conBonus = PointsToBonus(conPoints);
	intBonus = PointsToBonus(intPoints);
	wisBonus = PointsToBonus(wisPoints);
	chaBonus = PointsToBonus(chaPoints);
}

function SetStatForm(statName, statPoints, statBonus)
{
	$("#" + statName + "-input").val(statPoints);
	$("#" + statName + "bonus").html(BonusFormat(statBonus)); 
}

function GetStatBonus(name)
{
	return window[name.toLowerCase() + "Bonus"]
}

function GetAC(armorNameCheck)
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
}





// String operations

function BonusFormat(newBonus)
{
	if(newBonus >= 0)
		newBonus = "+" + newBonus;
	return newBonus;
}

function GetArmorData()
{
	if(armorName == "other")
		return FormatString(otherArmorDesc, false);
	if(armorName == "mage armor")
	{
		var mageAC = GetAC(armorName);
		return mageAC + " (" + (mageAC + 3) + " with <i>mage armor</i>)";
	}
	if(armorName == "none")
		return GetAC(armorName);
	return GetArmorString(armorName, GetAC(armorName));
}

function GetArmorString(name, ac)
{
	if(shieldBonus > 0)
		return ac + " (" + name + ", shield)";
	return ac + " (" + name + ")"
}

function GetHP()
{
	var hitDieSize = sizes[size].hitDie,
		avgHP = Math.floor(hitDice * ((hitDieSize + 1) / 2)) + (hitDice * conBonus);
	if (conBonus > 0)
		return avgHP + " (" + hitDice + "d" + hitDieSize + " + " + (hitDice * conBonus) + ")";
	if (conBonus == 0)
		return avgHP + " (" + hitDice + "d" + hitDieSize + ")";
	return Math.max(avgHP, 1) + " (" + hitDice + "d" + hitDieSize + " - " + -(hitDice * conBonus) + ")";
}

function FormatString(string, isBlock) // Add italics, indents, and newlines
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
			string = StringSplice(string, index, 1, endItalics ? "</i>" : "<i>");
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
				string = StringSplice(string, index, 1, insertion);
				index += insertion.length - 1;
				newLine = true;
			}
			// Add Indents
			else if(newLine)
			{
				if(character == ">")
					string = StringSplice(string, index, 1, "<div class='reverse-indent'>");
				else
					string = StringSplice(string, index, 0, "<div class='indent'>");
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
}





// HTML strings

function MakePropertyHTML(property, firstLine)
{
	if(property.arr.length == 0) return "";
	var htmlClass = firstLine ? "property-line first" : "property-line",
		arr = Array.isArray(property.arr) ? property.arr.join(", ") : property.arr;
	return "<div class=\"" + htmlClass + "\"> <h4>" + property.name + "</h4> <p>" + arr + "</p></div><!-- property line -->"
}

function MakeTraitHTML(name, description)
{
	return "<div class=\"property-block\"><h4>" + name + ".</h4><p> " + description + "</p></div> <!-- property block -->";
}

function MakeTraitHTMLLegendary(name, description)
{
	return "<div class=\"property-block legendary\"><h4>" + name + ".</h4><p> " + description + "</p></div> <!-- property block -->";
}





// General string operations

function ConcatUnlessEmpty(item1, item2, joinString = ", ")
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
}

function StringSplice(string, index, remove, insert = "")
{
	return string.slice(0, index) + insert + string.slice(index + remove);
}

function StringReplaceAll(string, find, replacement)
{
	return string.split(find).join(replacement);
}

function StringCapitalize(string)
{
	return string[0].toUpperCase() + string.substr(1);
}

function GetNumbersOnly(string)
{
	return parseInt(string.replace(/\D/g,''));
}





// Array and list functions

function AddToTraitList(traitsArr, addItems, isLegendary = false)
{	
	var traitsDisplayList = [];
	if(addItems != undefined)
	{
		if(Array.isArray(addItems))
		{
			for(var index in addItems)
				traitsHTML.push("*" + FormatString(addItems[index]));
		}
		else
			traitsHTML.push("*" + FormatString(addItems));
	}
	
	if(isLegendary)
	{
		for(var index in traitsArr)
			traitsHTML.push(MakeTraitHTMLLegendary(traitsArr[index].name, traitsArr[index].desc));
	}
	else
	{
		for(var index in traitsArr)
			traitsHTML.push(MakeTraitHTML(traitsArr[index].name, traitsArr[index].desc));
	}
}

function MakeDisplayList(arrName, capitalize, showHideInputSection = true)
{
	var arr = window[arrName], displayArr = [], content = "";
	for(var index in arr)
	{	
		var element = arr[index],
			elementName = capitalize ? StringCapitalize(element.name) : element.name;
			note = element.hasOwnProperty("note") ? element.note : "";
		
		if(element.hasOwnProperty("desc"))
			content = "<b>" + elementName + note + ":</b> " + element.desc;
		else
			content = "<b>" + elementName + note + "</b>";
		
		displayArr.push("<li><span class='removable-list-item' onclick=\"RemoveItemFromDisplayList('" + arrName + "'" + ", " + index + ", " + capitalize + ")\">" + content + "</span></li>");
	}
	$("#" + arrName + "-input-list").html(displayArr.join(""));
	if(showHideInputSection)
		ShowHideHtmlElement($("#" + arrName + "-input-section"), displayArr.length > 0);
}

function RemoveItemFromDisplayList(arrName, index, capitalize)
{
	var arr = window[arrName];
	arr.splice(index, 1);
	if(arrName == "damagetypes" || arrName == "specialdamage")
	{
		ShowHideDamageSection()
		MakeDisplayList(arrName, capitalize, false);
	}
	MakeDisplayList(arrName, capitalize);
}

function InsertAlphabetical(arr, element, checkMultiattack = false)
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
}

function FindInList(arr, name)
{
	var lowercaseName = name.toLowerCase();
	for(var index in arr)
	{
		if(arr[index].name.toLowerCase() == lowercaseName)
			return arr[index];
	}
	return -1;
}

function FixPresetArray(string)
{
	var arr = string.split(","), returnArr = [];
	for(var index in arr)
	{
		var name = arr[index].trim();
		if(name.length > 0)
			returnArr.push(name);
	}
	return returnArr;
}





// Misc

function GetSpeed(speedList, speedType)
{
	return speedList.hasOwnProperty(speedType) ? parseInt(speedList[speedType]) : 0;
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
		"5": {"xp": "1.800", "prof" : 3 },
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
	
	defaultPreset = 
	{
		"slug": "",
		"name": "Monster",
		"size": "Medium",
		"type": "humanoid",
		"subtype": "any race",
		"group": null,
		"alignment": "any alignment",
		"armor_class": 10,
		"armor_desc": null,
		"hit_points": 22,
		"hit_dice": "5d8",
		"speed": {
			"walk": 30
		},
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