function OnStart()
{
	// Show or hide parts of the editor accordingly
	ShowHideNatArmor();	
	ShowHideDamageOther();
	ShowHideLanguageOther();
	ShowHideHoverBox();
	ShowHideBlindBox();
	ShowHideLegendaryCreature();
	ShowHideSeparatorInput();
	
	// Set the ability score bonuses
	for(stat in stats)
		ChangeBonus(stats[stat].name.toLowerCase());
	
	// Set the CR proficiency bonus
	ChangeProf();
	
	// // Hide ability sections via code, for convenience
	HideHtmlElement(document.getElementById("abilities-input-section"));
	HideHtmlElement(document.getElementById("actions-input-section"));
	HideHtmlElement(document.getElementById("reactions-input-section"));
	HideHtmlElement(document.getElementById("legendaries-input-section"));
	
	// Set the default legendary description
	LegendaryDescriptionDefault();

	// Populate the stat block
	UpdateAll(0);
}


// Editor functions

function ShowHtmlElement(element)
{
	element.style = "";
}

function HideHtmlElement(element)
{
	element.style = "display: none;";
}

function ShowHideHtmlElement(element, show)
{
	show ? ShowHtmlElement(element) : HideHtmlElement(element);
}

function ShowHideNatArmor()
{
	ShowHideHtmlElement(document.getElementById("natarmor-prompt"), document.getElementById("armor-input").value == "natural armor");
}

function ShowHideDamageOther()
{
	ShowHideHtmlElement(document.getElementById("other-damage-input"), document.getElementById("damagetypes-input").value == "*o");
}

function ShowHideLanguageOther()
{
	ShowHideHtmlElement(document.getElementById("other-language-input"), document.getElementById("languages-input").value == "*");
}

function ShowHideHoverBox()
{
	ShowHideHtmlElement(document.getElementById("hover-box-note"), document.getElementById("fly-speed-input").value > 0);
}

function ShowHideBlindBox()
{
	ShowHideHtmlElement(document.getElementById("blind-box-note"), document.getElementById("blindsight-input").value > 0);
}

function ShowHideSeparatorInput()
{
	var showHide = doubleColumns;
	ShowHideHtmlElement(document.getElementById("left-separator-button"), showHide);
	ShowHideHtmlElement(document.getElementById("right-separator-button"), showHide);
}

function ShowHideLegendaryCreature()
{
	var newStyle = document.getElementById("is-legendary-input").checked ? "" : "display: none;";
	document.getElementById("add-legendary-button").style = newStyle;
	document.getElementById("legendary-actions-form").style = newStyle;
}


// Editor computations

function ChangeBonus(stat)
{
	var newBonus = BonusFormat(PointsToBonus(document.getElementById(stat + "-input").value));
	document.getElementById(stat + "bonus").innerHTML = newBonus;
}

function PointsToBonus(points)
{
	return Math.floor(points / 2) - 5;
}

function ChangeProf()
{
	document.getElementById("prof-bonus").innerHTML = "(Proficiency Bonus: +" + crs[document.getElementById("cr-input").value].prof + ")";
}

function BonusFormat(newBonus)
{
	if(newBonus >= 0)
		newBonus = "+" + newBonus;
	return newBonus;
}


// Add items to lists

function AddSthrow()
{
	// Insert, complying with standard stat order
	var sthrowName = document.getElementById("sthrows-input").value, inserted = false, sthrowData = FindInList(stats, sthrowName);
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
	
	// Display
	MakeDisplayList("sthrows");
}

function AddSkill(note)
{
	var skillName = document.getElementById("skills-input").value, skillData = FindInList(allSkills, skillName)
		skill = { "name" : skillData.name, "stat" : skillData.stat }
	if(note != undefined)
		skill["note"] = " (ex)";
	InsertAlphabetical(skills, skill);
	MakeDisplayList("skills");
}

function AddDamageType(type)
{
	var damageName = document.getElementById("damagetypes-input").value, special = false, note;
	if(damageName[0] == '*')
	{
		special = true;
		if(damageName[1] == 'o')
		{
			damageName = document.getElementById("other-damage-input").value.trim();
			if(damageName.length == 0)
				return;
		}
		else
			damageName = damageName.substr(1);
	}
	if(type == 'v')
		note = " (Vulnerable)";
	else if(type == 'r')
		note = " (Resistant)";
	else
		note = " (Immune)";
	if(special)
	{
		InsertAlphabetical(specialdamage, { "name" : damageName, "note" : note, "type" : type } );
		MakeDisplayList("specialdamage");
	}
	else
	{
		InsertAlphabetical(damagetypes, { "name" : damageName, "note" : note, "type" : type } );
		MakeDisplayList("damagetypes");
	}
}

function AddCondition()
{
	var conditionName = document.getElementById("conditions-input").value;
	InsertAlphabetical(conditions, { "name" : conditionName });
	MakeDisplayList("conditions");
}

function AddLanguage()
{
	var languageName = document.getElementById("languages-input").value;
	if(languageName == "*")
	{
		languageName = document.getElementById("other-language-input").value.trim();
		if(languageName.length == 0)
			return;
	}
	if(languages.length > 0)
	{
		if(languageName.toLowerCase() == "all" || languages[0].name.toLowerCase() == "all")
			languages = [];
	}
	InsertAlphabetical(languages, { "name" : languageName });
	MakeDisplayList("languages");
}


// Add abilities, actions, reactions, and legendary actions

function AddAbility(arrName)
{
	var arr = window[arrName], abilityName = document.getElementById("abilities-name-input").value.trim(),
	abilityDesc = FormatString(document.getElementById("abilities-desc-input").value.trim());
	if(abilityName.length == 0)
		return;
	InsertAlphabetical(arr, { "name" : abilityName, "desc" : abilityDesc });
	MakeDisplayList(arrName);
}

function LegendaryDescriptionDefault()
{
	var monsterName = document.getElementById("name-input").value.toLowerCase();
	document.getElementById("legendaries-descsection-input").value = "The " + monsterName + " can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The " + monsterName + " regains spent legendary actions at the start of its turn.";
}


// Array and list functions

function FindInList(arr, name)
{
	for(var index in arr)
	{
		if(arr[index].name == name)
			return arr[index];
	}
}

function InsertAlphabetical(arr, element)
{
	for(var index in arr)
	{
		if(arr[index].name > element.name)
		{
			arr.splice(index, 0, element)
			return;
		}
		if(arr[index].name == element.name)
		{
			arr.splice(index, 1, element)
			return;
		}
	}
	arr.push(element);
}

function MakeDisplayList(arrName)
{
	var arr = window[arrName], displayArr = [], content = "";
	for(index in arr){
		
		var element = arr[index],
			note = element.hasOwnProperty("note") ? element.note : "";
		
		if(element.hasOwnProperty("desc"))
			content = "<b>" + element.name + note + ":</b> " + element.desc;
		else
			content = "<b>" + element.name + note + "</b>";
		
		displayArr.push("<li><span class='removable-list-item' onclick=\"RemoveItemFromDisplayList('" + arrName + "'" + ", " + index + ")\">" + content + "</span></li>");
	}
	document.getElementById(arrName + "-input-list").innerHTML = displayArr.join("");
	ShowHideHtmlElement(document.getElementById(arrName + "-input-section"), displayArr.length > 0);
}

function RemoveItemFromDisplayList(arrName, index)
{
	var arr = window[arrName];
	arr.splice(index, 1);
	MakeDisplayList(arrName);
}


// Computations for making the stat block

function GetArmorClass(armorName, dexBonus, shieldBonus, natArmorBonus)
{
	var armor = armors[armorName];
	if(armor.type == "light")
		return GetArmorString(armorName, armor.ac + dexBonus, shieldBonus);
	if(armor.type == "medium")
		return GetArmorString(armorName, armor.ac + Math.min(dexBonus, 2), shieldBonus);
	if(armor.type == "heavy")
		return GetArmorString(armorName, armor.ac, shieldBonus);
	if(armorName == "natural armor")
		return GetArmorString(armorName, 10 + dexBonus + natArmorBonus, shieldBonus);
	if(armorName == "mage armor")
	{
		if(shieldBonus > 0)
			return (10 + dexBonus + shieldBonus) + " (shield, " + (13 + dexBonus + shieldBonus) + " with mage armor)";
		return (10 + dexBonus) + " (" + (13 + dexBonus) + " with mage armor)";
	};
	if(shieldBonus > 0)
		return 10 + dexBonus + shieldBonus + " (shield)";
	return 10 + dexBonus;
}

function GetArmorString(name, ac, shieldBonus)
{
	if(shieldBonus > 0)
		return (ac + shieldBonus) + " (" + name + ", shield)";
	return ac + " (" + name + ")"
}

function GetHP(hitDice, size, conBonus)
{
	var hitDieSize = sizes[size].hitDie,
		avgHP = Math.floor(hitDice * ((hitDieSize + 1) / 2)) + (hitDice * conBonus);
	if (conBonus > 0)
		return avgHP + " (" + hitDice + "d" + hitDieSize + " + " + (hitDice * conBonus) + ")";
	if (conBonus == 0)
		return avgHP + " (" + hitDice + "d" + hitDieSize + ")";
	return Math.max(avgHP, 1) + " (" + hitDice + "d" + hitDieSize + " - " + -(hitDice * conBonus) + ")";
}


// For translating editor lists into stat block lists

function AddToTraitList(traitsArr, addItems, isLegendary = false)
{	
	var traitsDisplayList = [];
	if(addItems != undefined)
	{
		if(Array.isArray(addItems))
		{
			for(index in addItems)
				traitsHTML.push("*" + addItems[index]);
		}
		else
			traitsHTML.push("*" + addItems);
	}
	
	if(isLegendary)
	{
		for(index in traitsArr)
			traitsHTML.push(MakeTraitHTMLLegendary(traitsArr[index].name, traitsArr[index].desc));
	}
	else
	{
		for(index in traitsArr)
			traitsHTML.push(MakeTraitHTML(traitsArr[index].name, traitsArr[index].desc));
	}
}

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


// Generating HTML strings

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

function FormatString(string)
{
	var index = 0, endItalics = false, endIndent = false, newLine = true;;
	while(index < string.length)
	{
		var character = string[index];
		// Italicize
		if(character == "*")
		{
			string = StringSplice(string, index, 1, endItalics ? "</i>" : "<i>");
			endItalics = !endItalics;
			index = string.indexOf(">", index);
			newLine = false;
		}
		// Add Newlines
		else if(character == "\n" || character == "\r" || character == "\r\n")
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
			insertion += "<br>";
			string = StringSplice(string, index, 1, insertion);
			index = string.indexOf(">", index);
			newLine = true;
		}
		// Add Indents
		else if(character == ">" && newLine)
		{
			string = StringSplice(string, index, 1, "<div class='indent'>");
			endIndent = true;
			index = string.indexOf(">", index);
			newLine = false;
		}
		else
			newLine = false;
		index++;
	}
	if(endItalics)
		string += "</i>";
	if(endIndent)
		string += "</span>";
	
	return string;
}

function StringSplice(string, index, remove, insert)
{
	return string.slice(0, index) + insert + string.slice(index + remove);
}




function UpdateAll(moveSeparator)
{
	GetAllVariables();
	UpdateStatblock(moveSeparator);
}

function GetAllVariables()
{
	// Name and Type
	name = document.getElementById("name-input").value.trim();
	size = document.getElementById("size-input").value;
	type = document.getElementById("type-input").value;
	tag = document.getElementById("tag-input").value.trim();
	alignment = document.getElementById("alignment-input").value.trim();
	
	// Armor Class
	armorName = document.getElementById("armor-input").value;
	shieldBonus = document.getElementById("shield-input").checked ? 2 : 0;
	natArmorBonus = parseInt(document.getElementById("natarmor-input").value);
	
	// Hit Points
	hitDice = document.getElementById("hitdice-input").value;
	
	// Speeds
	speed = document.getElementById("speed-input").value;
	burrowSpeed = document.getElementById("burrow-speed-input").value;
	climbSpeed = document.getElementById("climb-speed-input").value;
	flySpeed = document.getElementById("fly-speed-input").value;
	hover = document.getElementById("hover-input").checked;
	swimSpeed = document.getElementById("swim-speed-input").value;
	
	// Stats	
	strPoints = document.getElementById("str-input").value;
	dexPoints = document.getElementById("dex-input").value;
	conPoints = document.getElementById("con-input").value;
	intPoints = document.getElementById("int-input").value;
	wisPoints = document.getElementById("wis-input").value;
	chaPoints = document.getElementById("cha-input").value;
	strBonus = PointsToBonus(strPoints);
	dexBonus = PointsToBonus(dexPoints);
	conBonus = PointsToBonus(conPoints);
	intBonus = PointsToBonus(intPoints);
	wisBonus = PointsToBonus(wisPoints);
	chaBonus = PointsToBonus(chaPoints);
		
	// Senses
	blindsight = document.getElementById("blindsight-input").value;
	blind = document.getElementById("blindness-input").checked;
	darkvision = document.getElementById("darkvision-input").value;
	tremorsense = document.getElementById("tremorsense-input").value;
	truesight = document.getElementById("truesight-input").value;
	
	// Telepathy
	telepathy = parseInt(document.getElementById("telepathy-input").value);
	
	// Challenge Rating
	cr = document.getElementById("cr-input").value;
	profBonus = crs[cr].prof;
	
	// Legendaries
	isLegendary = document.getElementById("is-legendary-input").checked;
	if(isLegendary)
		legendariesDescription = document.getElementById("legendaries-descsection-input").value.trim();
	
	// One or two columns ?
	doubleColumns = document.getElementById("2col-input").checked;
}

function UpdateStatblock(moveSeparator = 0)
{
	// One column or two columns
	var statBlock = document.getElementById("stat-block");
	if(doubleColumns)
	{
		statBlock.style = "width:800px;";
		document.getElementById("stat-block").classList.add('wide');
	}
	else
	{
		statBlock.style = "width:400px;";
		document.getElementById("stat-block").classList.remove('wide');
	}
	
	// Name and type
	document.getElementById("monster-name").innerHTML = name;
	if(tag == "")
		document.getElementById("monster-type").innerHTML = size + " " + type + ", " + alignment;
	else
		document.getElementById("monster-type").innerHTML = size + " " + type + " (" + tag + "), " + alignment;
	
	// Armor Class
	document.getElementById("armor-class").innerHTML = GetArmorClass(armorName, dexBonus, shieldBonus, natArmorBonus);
	
	// Hit Points
	document.getElementById("hit-points").innerHTML = GetHP(hitDice, size, conBonus);
	
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
	document.getElementById("speed").innerHTML = speedsDisplayArr.join(", ");
	
	// Stats
	document.getElementById("strpts").innerHTML = strPoints + " (" + BonusFormat(strBonus) + ")";
	document.getElementById("dexpts").innerHTML = dexPoints + " (" + BonusFormat(dexBonus) + ")";
	document.getElementById("conpts").innerHTML = conPoints + " (" + BonusFormat(conBonus) + ")";
	document.getElementById("intpts").innerHTML = intPoints + " (" + BonusFormat(intBonus) + ")";
	document.getElementById("wispts").innerHTML = wisPoints + " (" + BonusFormat(wisBonus) + ")";
	document.getElementById("chapts").innerHTML = chaPoints + " (" + BonusFormat(chaBonus) + ")";
	
	// Properties
	var propertiesDisplayArr = [];
	
	// Saving Throws
	var sthrowsDisplayArr = [];
	for(index in sthrows)
		sthrowsDisplayArr.push(sthrows[index].name + " +" + profBonus);
	if(sthrowsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Saving Throws", "arr" : sthrowsDisplayArr } );
		
	// Skills
	var skillsDisplayArr = [];
	for(index in skills)
	{
		if(skills[index].hasOwnProperty("note"))
			skillsDisplayArr.push(skills[index].name + " +" + (profBonus * 2));
		else
			skillsDisplayArr.push(skills[index].name + " +" + profBonus);
	}
	if(skillsDisplayArr.length > 0)
		propertiesDisplayArr.push( { "name" : "Skills", "arr" : skillsDisplayArr } );
	
	// Damage Types (It's not pretty but it does its job)
	var vulnerableDisplayArr = [], resistantDisplayArr = [], immuneDisplayArr = [],
		vulnerableDisplayArrSpecial = [], resistantDisplayArrSpecial = [], immuneDisplayArrSpecial = [],
		vulnerableDisplayString = "", resistantDisplayString = "", immuneDisplayString = "";
	for(index in damagetypes)
	{
		if(damagetypes[index].type == 'v')
			vulnerableDisplayArr.push(damagetypes[index].name);
		else if(damagetypes[index].type == 'r')
			resistantDisplayArr.push(damagetypes[index].name);
		else
			immuneDisplayArr.push(damagetypes[index].name);
	}
	for(index in specialdamage)
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
	for(index in conditions)
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
		pp += profBonus;
		if(ppData.hasOwnProperty("note"))
			pp += profBonus;
	}
	sensesDisplayArr.push("passive Perception " + pp);
	propertiesDisplayArr.push( { "name" : "Senses", "arr" : sensesDisplayArr } );
	
	// Languages
	var languageDisplayArr = [];
	for(index in languages)
		languageDisplayArr.push(languages[index].name.toLowerCase());
	if(telepathy > 0)
		languageDisplayArr.push("telepathy " + telepathy + " ft.");
	if(languageDisplayArr.length == 0)
		languageDisplayArr.push("&mdash;");
	propertiesDisplayArr.push( { "name" : "Languages", "arr" : languageDisplayArr } );
	
	// Display All Properties (except CR)
	var propertiesDisplayList = [];
	propertiesDisplayList.push(MakePropertyHTML(propertiesDisplayArr[0], true));
	for(var index = 1; index < propertiesDisplayArr.length; index++)
		propertiesDisplayList.push(MakePropertyHTML(propertiesDisplayArr[index]));
	document.getElementById("properties-list").innerHTML = propertiesDisplayList.join("");
	
	// Challenge Rating
	document.getElementById("challengeRating").innerHTML = cr + " (" + crs[cr].xp + " XP)";
	
	// Abilities
	separationPoint += moveSeparator;
	
	var separationMax = abilities.length + actions.length + reactions.length - 1;
	if(isLegendary)
	{
		separationMax += legendaries.length;
		if(legendaries.length == 0)
			separationMax += 1;
	}
	if(doubleColumns)
	{
		if (separationPoint < 0)
			separationPoint = 0;
		if(separationPoint > separationMax)
			separationPoint = separationMax;
	}
	else
		separationPoint = separationMax;

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
	
	var leftTraitsArr = [], rightTraitsArr = [], separationCounter = 0;
	for(index in traitsHTML)
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
	document.getElementById("traits-list-left").innerHTML = leftTraitsArr.join("");
	document.getElementById("traits-list-right").innerHTML = rightTraitsArr.join("");
	
	ShowHideSeparatorInput();
}

var name, size, type, tag, alignment,
	armorName, shieldBonus, natArmorBonus,
	hitDice,
	speed, burrowSpeed, climbSpeed, flySpeed, hover, swimSpeed,
	strPoints, dexPoints, conPoints, intPoints, wisPoints, chaPoints, strBonus, dexBonus, conBonus, intBonus, wisBonus, chaBonus,
	blindsight, blind, darkvision, tremorsense,	truesight,
	telepathy,
	cr, profBonus,
	isLegendary, legendariesDescription,
	properties = [], abilities = [], actions = [], reactions = [], legendaries = [],
	sthrows = [], skills = [], damagetypes = [], specialdamage = [], conditions = [], languages = [],
	traitsHTML = [], doubleColumns, separationPoint = 1;

const stats = [
		{ "name": "Str", "order": 0 },
		{ "name": "Dex", "order": 1 }, 
		{ "name": "Con", "order": 2 },
		{ "name": "Int", "order": 3 },
		{ "name": "Wis", "order": 4 },
		{ "name": "Cha", "order": 5 },
	],
	
	allProperties = [ "Saving Throws", "Skills", "Damage Vulnerabilities", "Damage Resistances", "Damage Immunities", "Condition Immunities" ],

	allSkills = [
		{ "name" : "Acrobatics" , "stat" : "Dex" },
		{ "name" : "Animal Handling", "stat" : "Wis" },
		{ 'name' : "Arcana", "stat" : "Int" },
		{ 'name' : "Athletics", "stat" : "Str" },
		{ 'name' : "Deception", "stat" : "Cha" },
		{ 'name' : "History", "stat" : "Int" },
		{ 'name' : "Insight", "stat" : "Wis" },
		{ 'name' : "Intimidation", "stat" : "Cha" },
		{ 'name' : "Investigation", "stat" : "Int" },
		{ 'name' : "Medicine", "stat" : "Wis" },
		{ 'name' : "Nature", "stat" : "Int" },
		{ 'name' : "Perception", "stat" : "Wis" },
		{ 'name' : "Performance", "stat" : "Cha" },
		{ 'name' : "Persuasion", "stat" : "Cha" },
		{ 'name' : "Religion", "stat" : "Int" },
		{ 'name' : "Sleight of Hand", "stat" : "Dex" },
		{ 'name' : "Stealth", "stat" : "Dex" },
		{ 'name' : "Survival", "stat" : "Wis" },
	],
	
	alldamagetypes = [ "acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder", "nonmagical weapons", "non-silvered weapons", "non-adamantine weapons" ],
	
	allConditions = [ "blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious" ],
	
	commonLanguages = [],
	
	sizes = 
	{
		"Tiny":
		{
			"hitDie": 4
		},
		"Small":
		{
			"hitDie": 6
		},
		"Medium":
		{
			"hitDie": 8
		},
		"Large":
		{
			"hitDie": 10
		},
		"Huge":
		{
			"hitDie": 12
		},
		"Gargantuan":
		{
			"hitDie": 20
		},
	},

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
		"none":
		{
			"type": "special"
		},
		"natural armor":
		{
			"type": "special"
		},
		"mage armor":
		{
			"type": "special"
		},
		"padded armor":
		{
			"type": "light",
			"ac": 11
		},
		"leather armor":
		{
			"type": "light",
			"ac": 11
		},
		"studded leather":
		{
			"type": "light",
			"ac": 12
		},
		"hide armor":
		{
			"type": "medium",
			"ac": 12
		},
		"chain shirt":
		{
			"type": "medium",
			"ac": 13
		},
		"scale mail":
		{
			"type": "medium",
			"ac": 14
		},
		"breastplate":
		{
			"type": "medium",
			"ac": 14
		},
		"half plate":
		{
			"type": "medium",
			"ac": 15
		},
		"ring mail":
		{
			"type": "heavy",
			"ac": 14
		},
		"chain mail":
		{
			"type": "heavy",
			"ac": 16
		},
		"splint":
		{
			"type": "heavy",
			"ac": 17
		},
		"plate":
		{
			"type": "heavy",
			"ac": 18
		},
	};