const padding = 20, paddingx2 = 40, lineHeight = 25, textWidthMax = 612 - paddingx2, maxLines = 10, lineCheck = 11,
	labelFont = 'bold 16px Tahoma', descriptionFont = '16px Tahoma';

function MakeCard()
{
	var canvas = document.getElementById('canvas'), ctx = canvas.getContext("2d");
	
	// Background
	var backgroundImage = new Image(), characterImage = new Image(),
		raceName = GetRaceName(character.Race._name),
		fileName = GetCardFileName(raceName);
	backgroundImage.src = './dndimages/cardimages/cardbackgrounds/' + CardName(character.Class._name) + '.jpg';
	characterImage.src = './dndimages/cardimages/characters/' + raceName + '/' + fileName + '.jpg';
	document.getElementById('sourcelink').href = sources[raceName][fileName];
		
	// This is shitty code but if it works it works
		
	backgroundImage.onload = function()
	{ 
		ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
		MakeCardText(canvas, ctx);
	}
	
	characterImage.onload = function()
	{
		ctx.drawImage(characterImage, padding, padding, canvas.width - paddingx2, canvas.height / 2 - paddingx2);	// 572 x 356
		ctx.lineWidth = 1;
		ctx.rect(padding, padding, canvas.width - paddingx2, canvas.height / 2 - paddingx2);
		ctx.stroke();
	}
}

function GetRaceName(raceName)
{
	var raceName = CardName(raceName);
	switch(raceName)
	{
		case 'gnome' :
			return 'halfling';
		case 'half-elf' :
			return RandomFromArray( [ 'elf', 'human' ] );
		case 'half-orc' :
			return 'orc';
		case 'aasimar' :
			return 'human';
	}
	return raceName;
}

function CardName(name)
{
	return name.toLowerCase().replace(' ','-');
}

function GetCardFileName(raceName)
{
	var classNm = CardName(character.Class._name);
	var gender = character.Gender;
	if(gender == 'Nonbinary or Unknown')
		gender = RandomFromArray(['Male', 'Female']);
	gender = CardName(gender);
	switch(raceName)
	{
		case 'dwarf' :
		case 'elf' :
		case 'halfling' :
		case 'human' :
		case 'orc' :
		case 'tiefling' :
			return classNm + '-' + gender;
		case 'aarakocra' :
		case 'dragonborn' :
		case 'goliath' :
		case 'firbolg' :
		case 'kenku' :
		case 'lizardfolk' :
		case 'tabaxi' :
		case 'triton' :
		case 'goblin' :
		case 'kobold' :
			return classNm;
		case 'genasi' :
			return CardName(character.Race['Subraces and Variants'].Subrace) + '-' + gender;
		case 'bugbear' :
		case 'hobgoblin' :
		case 'yuan-ti-pureblood' :
		case 'tortle' :
		case 'warforged' :
			return FileNameByType(classNm)
		case 'changeling' :
		case 'gith' :
		case 'minotaur' :
		case 'shifter' :
			return gender;
		case 'grung' :
			return raceName;
	}
}

function FileNameByType(classNm)
{
	switch(classNm)
	{
		case 'barbarian' :
		case 'fighter' :
		case 'monk' :
		case 'blood-hunter' :
			return 'melee';
		case 'bard' :
		case 'rogue' :
		case 'artificer' :
			return 'tricky';
		case 'cleric' :
		case 'paladin' :
			return 'holy';
		case 'druid' :
		case 'ranger' :
			return 'wild';
		case 'sorcerer' :
		case 'warlock' :
		case 'wizard' :
		case 'mystic' :
			return 'mage';
	}
}

function MakeCardText(canvas, ctx)
{
	//ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
	
	ctx.lineWidth = 10;
	ctx.fillStyle = "black";
	ctx.strokeRect(0, 0, canvas.width, canvas.height);
	
	// Name
	ctx.textAlign = "center";
	ctx.fillStyle = "black";
	
	var text = GetCharacterNameCard(), fontSize = 40;
	ctx.font = 'bold ' + fontSize + 'px Georgia';
	while(ctx.measureText(text).width > textWidthMax)
	{
		fontSize--;
		ctx.font = 'bold ' + fontSize + 'px Georgia';
	}
	ctx.fillText(text, canvas.width / 2, canvas.height / 2 + padding);

	// Description
	ctx.font = descriptionFont;
	var stringBuffer, yPos = canvas.height / 2 + 50;
	
	// Description line 1
	stringBuffer = [];
	stringBuffer.push(GetRaceNameCard(), ' ', GetClassNameCard());
	ctx.fillText(stringBuffer.join(''), canvas.width / 2, yPos);
	yPos += lineHeight;
	
	// Description line 2
	stringBuffer = [];
	stringBuffer.push(GetVariantTraitsCard(), character.Gender, ' - ', character.Race['Physical Characteristics'].Age);
	ctx.fillText(stringBuffer.join(''), canvas.width / 2, yPos);
	yPos += lineHeight;
	
	// Description line 3
	stringBuffer = [];
	ctx.fillText(GetBackgroundCard(), canvas.width / 2, yPos);
	yPos += lineHeight;
	
	// Other stuff
	ctx.textAlign = "left";
	var radioButtons = document.getElementsByName('showButton');
	if(radioButtons[0].checked)
		SetPersonalityCard(ctx, yPos);
	else if(radioButtons[1].checked)
		SetCharacteristicsCard(ctx, yPos);
}

function SetPersonalityCard(ctx, yPos)
{
	// Get the data we need
	var traitArr = GetTraitsArray(ctx, GetPersonalityCard());
	
	// Pick which traits we use
	var usedLines = 0, usedTraitIndices = [], usedTraits = [], cont = true;
	while(cont && usedTraitIndices.length < traitArr.length)
	{
		var index = RandomNum(traitArr.length);
		if(usedTraitIndices.indexOf(index) < 0)
		{
			var traitLength = traitArr[index].description.length;
			if(usedLines + traitLength > maxLines)
				cont = false;
			else
			{
				usedTraitIndices.push(index);
				usedLines += traitLength;
			}
		}
	}
	usedTraitIndices.sort( function(item1, item2) { return item1 - item2 } );
	for(var index in usedTraitIndices)
		usedTraits.push(traitArr[usedTraitIndices[index]])
	
	// Bottom-justify it
	yPos += lineHeight * (lineCheck - usedLines);
	
	// Print
	PrintDescription(ctx, usedTraits, yPos);
}

function SetCharacteristicsCard(ctx, yPos)
{
	PrintDescription(ctx, GetTraitsArray(ctx, GetCharacteristicsCard()), yPos);
}

function GetTraitsArray(ctx, source)
{
	var traitArr = [];
	for(var traitIndex in source)
	{
		// Get info on the label
		ctx.font = labelFont;
		var labelText = source[traitIndex].name + ': ',
			labelWidth = ctx.measureText(labelText).width,
			lineWidth = labelWidth;
		
		// Get info on the description
		ctx.font = descriptionFont;
		var lineArr = GetMultilineStringArray(ctx, source[traitIndex], labelWidth);
		traitArr.push( { 'label' : labelText, 'labelwidth' : labelWidth, 'description' : lineArr } );
	}
	return traitArr;
}

function GetMultilineStringArray(ctx, string, labelWidth)
{
	var descriptionArr = string.content.split(' '),
		currentLine = '';
	var lineArr = [], lineWidth = labelWidth;
	for(var wordIndex = 0; wordIndex < descriptionArr.length; wordIndex++)
	{
		var word = descriptionArr[wordIndex],
			wordSpace = ' ' + word,
			wordSpaceWidth = ctx.measureText(wordSpace).width;
		if(lineWidth + wordSpaceWidth > textWidthMax)
		{
			lineArr.push(currentLine);
			currentLine = word;
			lineWidth = ctx.measureText(word).width;
		}
		else
		{
			currentLine += wordSpace;
			lineWidth += wordSpaceWidth;
		}
	}
	lineArr.push(currentLine);
	return lineArr;
}

function PrintDescription(ctx, traits, yPos)
{
	// Write out the text
	for(var index in traits)
	{
		var trait = traits[index];
		
		// Make the label
		ctx.font = labelFont;
		ctx.fillText(trait.label, padding, yPos)
		
		// Make the description
		var lineArr = trait.description;
		ctx.font = descriptionFont;
		ctx.fillText(lineArr[0], padding + trait.labelwidth, yPos);
		yPos += lineHeight;
		for(var lineIndex = 1; lineIndex < lineArr.length; lineIndex ++)
		{
			ctx.fillText(lineArr[lineIndex], padding, yPos);
			yPos += lineHeight;
		}
	}
}

function GetCharacterNameCard()
{
	if(character.Race._name == 'Gnome' && character.Race['Subraces and Variants'].Subrace != 'Deep Gnome')
	{
		var nameArr = character._name.split(' '),
			firstName = nameArr[RandomNum(nameArr.length - 2)];
			return firstName + ' ' + nameArr[nameArr.length - 2] + ' ' + nameArr[nameArr.length - 1];
	}
	else if(character.Race._name == 'Tabaxi')
	{
		var nicknameIndex = character._name.indexOf('"');
		return character._name.substring(nicknameIndex);
	}
	return character._name;
}

function GetRaceNameCard()
{
	if(character.Race.hasOwnProperty('Subraces and Variants'))
	{
		if(character.Race['Subraces and Variants'].hasOwnProperty('Subrace'))
		{
			if(character.Race._name == 'Tiefling')
			{
				if(character.Race['Subraces and Variants'].Subrace == 'Asmodeous Tiefling')
					return 'Tiefling';
			}
			else if(character.Race._name == 'Shifter')
			{
				return character.Race['Subraces and Variants'].Subrace + ' Shifter';
			}
			return character.Race['Subraces and Variants'].Subrace;
		}
	}
	return character.Race._name;
}

function GetClassNameCard()
{
	return character.Class._name + ' - ' + character.Class[subclassesCard[character.Class._name]];
}

function GetBackgroundCard()
{
	var background = character.Background;
	if(character.Background.hasOwnProperty('Optional Variant') && RandomNum(2) == 1)
	{
		var variant = character.Background['Optional Variant'], asteriskIndex = variant.indexOf('**');
		if(asteriskIndex >= 0)
			variant = variant.substring(0, asteriskIndex);
		return variant;
	}
	return background._name;
}

function GetVariantTraitsCard()
{
	var variantRaces = [ 'Dragonborn', 'Half-Elf', 'Human', 'Tiefling' ]
	if(variantRaces.indexOf(character.Race._name) >= 0)
	{
		var subvar = character.Race['Subraces and Variants'];
		switch(character.Race._name)
		{
			case 'Dragonborn' :
				return subvar['Draconic Ancestry'] + ' Dragon Ancestry - ';
			case 'Half-Elf' :
				if(books.indexOf('SCAG') < 0)
					return '';
				return subvar['Elven Ancestry'] + ' Ancestry - ';
			case 'Human' :
				return subvar['Ethnicity'] + ' - ';
			case 'Tiefling' :
				if(books.indexOf('SCAG') < 0)
					return '';
				var variant = subvar['Variant'];
				if(variant == '_none')
					return '';
				return variant + ' - ';
				
		}
	}
	return '';
}

function GetPersonalityCard()
{
	var allTraits = [];
	for(var traitName in character.Background.Personality)
		allTraits.push( { 'name' : traitName, 'content' : character.Background.Personality[traitName] } );
	if(character.Race._name == 'Aasimar')
		allTraits.push( { 'name' : 'Guide', 'content' : character.Race['Guide Name'] + ' (' + character.Race['Guide Nature'] + ')' } );
	else
	{
		for(var traitName in character.Race)
		{
			if(traitName != '_name' && traitName != 'Subraces and Variants' && traitName != 'Racial Traits' && traitName != 'Physical Characteristics')
				allTraits.push( { 'name' : traitName, 'content' : character.Race[traitName] } );
		}
	}
	for(var traitName in character.Class.Personality)
	{
		var content = character.Class.Personality[traitName];
		if(content != '_none')
			allTraits.push( { 'name' : traitName, 'content' : content } );
	}
	allTraits.push( { 'name' : 'Trinket', 'content' : character.Life.Trinket } );
	return allTraits;
}

function GetCharacteristicsCard()
{
	var allTraits = [];
	var physChar = character.Race['Physical Characteristics'];
	for(var traitName in physChar)
	{
		var content = physChar[traitName];
		if(content != '_none')
			allTraits.push( { 'name' : traitName, 'content' : content } );
	}
	return allTraits;
}

var subclassesCard = 
{
	'Barbarian' : 'Primal Path',
	'Bard' : 'Bard College',
	'Cleric' : 'Divine Domain',
	'Druid' : 'Druid Circle',
	'Fighter' : 'Martial Archetype',
	'Monk' : 'Monastic Tradition',
	'Paladin' : 'Sacred Oath',
	'Ranger' : 'Ranger Archetype',
	'Rogue' : 'Roguish Archetype',
	'Sorcerer' : 'Sorcerous Origin',
	'Warlock' : 'Otherworldly Patron',
	'Wizard' : 'Arcane Tradition',
	'Artificer' : 'Artificer Specialty',
	'Mystic' : 'Mystic Order',
	'Blood Hunter' : 'Blood Hunter Order'
}