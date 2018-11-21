function UpdateAllDropdownsNPC()
{
	document.getElementById('gendermenu').innerHTML ='<option value="0">Random</option><option value="1">Male</option><option value="2">Female</option><option value="3">Nonbinary or Unknown</option>'
	
	SetDropdownOptions(races, 'racemenu');
}

function RandomizeAllNPC()
{
	GetBooks();
	character = {};
	
	RandomizeGenderNPC(true);
	RandomizeRaceNPC(true);
	RandomizeTraitsNPC(true);
	document.getElementById('textarea').innerHTML = MakePlainTextString(character);
}

function RandomizeNameNPC(allRandom)
{
	if(!allRandom)
	{
		GetBooks();
		document.getElementById('textarea').innerHTML = MakePlainTextString(character);
	}
	character._name = GetName(character.Race._name, character);
	document.getElementById('name').innerHTML = character._name;
	document.getElementById('textarea').innerHTML = MakePlainTextString(character);
}

function RandomizeTraitsNPC(allRandom)
{
	if(!allRandom)
	{
		GetBooks();
		document.getElementById('textarea').innerHTML = MakePlainTextString(character);
	}
	subraceVariants = [];
	
	character.Traits = {};
	character.Traits.Appearance = RandomFromArray(npcAppearances);
	
	var highTraitNum = RandomNum(npcHighAbilities.length);
	var lowTraitNum = RandomNum(npcLowAbilities.length);
	
	// Reroll when the low ability is the same as the high ability
	while(lowTraitNum == highTraitNum)
		lowTraitNum = RandomNum(npcLowAbilities.length);
	
	character.Traits['High Ability'] = npcHighAbilities[highTraitNum];
	character.Traits['Low Ability'] = npcLowAbilities[lowTraitNum];

	character.Traits.Talent = RandomFromArray(npcTalents);
	character.Traits.Mannerism = RandomFromArray(npcMannerisms);
	character.Traits['Interaction Trait'] = RandomFromArray(npcInteractionTraits);
	character.Traits.Ideal = RandomFromArray(npcIdeals);
	
	var bond1 = RandomNum(10)
	if(bond1 < 9)
		character.Traits.Bond = npcBonds[bond1];
	else
	{
		bond1 = RandomNum(9);
		var bond2 = RandomNum(9);
		while(bond2 == bond1)
			bond2 = RandomNum(9);
		character.Traits.Bond = npcBonds[bond1] + ", " + npcBonds[bond2];
	}
	
	character.Traits['Flaw or Secret'] = RandomFromArray(npcFlawsAndSecrets);
	
	document.getElementById('traitssection').innerHTML = MakeHTMLString(character.Traits);
}

function RandomizeRaceNPC(allRandom)
{
	var radioButtons = document.getElementById('ethnicityRadioButtons').children;
	if(radioButtons[0].checked)
		ethnicityOption = 'standard';
	else if(radioButtons[2].checked)
		ethnicityOption = 'real';
	else
		ethnicityOption = RandomFromArray([ 'standard', 'real' ]);
	
	if(!allRandom)
	{
		GetBooks();
		document.getElementById('textarea').innerHTML = MakePlainTextString(character);
	}
	subraceVariants = [];
	character.Race = GetPropertiesStart(races, 'racemenu');
	SubraceVariantCheck();
	document.getElementById('race').innerHTML = character.Race._name;
	document.getElementById('raceheader').innerHTML = character.Race._name;
	document.getElementById('racesection').innerHTML = MakeHTMLString(character.Race);

	// Weird special case
	if(character.Race._name == 'Warforged')
	{
		character.Gender = 'Genderless';
		document.getElementById('gender').innerHTML = character.Gender;
	}
	else if(character.Gender == 'Genderless')
		RandomizeGenderNPC(false);
	
	RandomizeNameNPC(allRandom);
}

function RandomizeGenderNPC(allRandom)
{
	var genderMenu = document.getElementById('gendermenu'), index = parseInt(genderMenu.value) - 1;
	if(index < 0)
		character.Gender = RandomFromArray(genders);
	else
		character.Gender = genderMenu[genderMenu.selectedIndex].text;
	document.getElementById('gender').innerHTML = character.Gender;
	if(!allRandom)
		document.getElementById('textarea').innerHTML = MakePlainTextString(character);
}

function MakePlainTextString(character)
{
	var string = character._name + ', ' + character.Gender + ' ';
	if(character.Race.hasOwnProperty('Subraces and Variants') && character.Race['Subraces and Variants'].hasOwnProperty('Subrace'))
		string += character.Race['Subraces and Variants'].Subrace;
	else
		string += character.Race._name;
	string += '\n\n' + PlainTextSubstring(character.Traits) + '\n' + PlainTextSubstring(character.Race);
	return string;
}

function PlainTextSubstring(property)
{
	var string = "";
	for(var propertyName in property)
	{
		if (typeof property[propertyName] === 'object')
			string += PlainTextSubstring(property[propertyName])
		else
		{
			if(propertyName[0] != '_' && property[propertyName][0] != '_')
				string += propertyName + ": " + property[propertyName] + '\n';
		}
	}
	return string;
}

function ShowBulletPointList()
{
	document.getElementById('bulletpoints').removeAttribute('hidden');
	document.getElementById('plaintext').setAttribute('hidden', 'true');
}

function ShowPlainText()
{
	document.getElementById('plaintext').removeAttribute('hidden');
	document.getElementById('bulletpoints').setAttribute('hidden', 'true');
}