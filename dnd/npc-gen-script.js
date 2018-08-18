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
}

function RandomizeNameNPC(allRandom)
{
	if(!allRandom)
		GetBooks();
	character._name = GetName(character.Race._name, character);
	document.getElementById('name').innerHTML = character._name;
}

function RandomizeTraitsNPC(allRandom)
{
	if(!allRandom)
		GetBooks();
	subraceVariants = [];
	
	character.Traits = {};
	character.Traits.Appearance = RandomFromArray(npcAppearances);
	character.Traits['High Ability'] = RandomFromArray(npcHighAbilities);
	character.Traits['Low Ability'] = RandomFromArray(npcLowAbilities);
	character.Traits.Talent = RandomFromArray(npcTalents);
	character.Traits.Mannerism = RandomFromArray(npcMannerisms);
	character.Traits["Interaction Trait"] = RandomFromArray(npcInteractionTraits);
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
	
	character.Traits["Flaw or Secret"] = RandomFromArray(npcFlawsAndSecrets);
	
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
		GetBooks();
	subraceVariants = [];
	character.Race = GetPropertiesStart(races, 'racemenu');
	SubraceVariantCheck();
	document.getElementById('race').innerHTML = character.Race._name;
	document.getElementById('raceheader').innerHTML = character.Race._name;
	document.getElementById('racesection').innerHTML = MakeHTMLString(character.Race);

	// Weird special case
	if(character.Race._name == 'Warforged')
	{
		character.Gender = 'Genderless Construct';
		document.getElementById('gender').innerHTML = character.Gender;
	}
	else if(character.Gender == 'Genderless Construct')
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
}