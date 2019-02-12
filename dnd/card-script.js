const padding = 20, paddingx2 = 40, lineHeight = 25, textWidthMax = 612 - paddingx2, maxLines = 11, lineCheck = maxLines + 1,
	labelFont = "bold 16px Tahoma", descriptionFont = "16px Tahoma",
	subclassesCard = 
	{
		"Barbarian" : "Primal Path",
		"Bard" : "Bard College",
		"Cleric" : "Divine Domain",
		"Druid" : "Druid Circle",
		"Fighter" : "Martial Archetype",
		"Monk" : "Monastic Tradition",
		"Paladin" : "Sacred Oath",
		"Ranger" : "Ranger Archetype",
		"Rogue" : "Roguish Archetype",
		"Sorcerer" : "Sorcerous Origin",
		"Warlock" : "Otherworldly Patron",
		"Wizard" : "Arcane Tradition",
		"Artificer" : "Artificer Specialty",
		"Mystic" : "Mystic Order",
		"Blood Hunter" : "Blood Hunter Order"
	};

// For making the character card
var Card =
{
	Make: function()
	{
		var canvas = $("#canvas")[0], ctx = canvas.getContext("2d");
		
		// Background
		var backgroundImage = new Image(), characterImage,
			raceName = this.RaceForImage(character.Race.name),
			fileName = this.ImageFileName(raceName);
		backgroundImage.src = "./dndimages/cardimages/cardbackgrounds/" + this.FileNameFormat(character.Class.name) + ".jpg";
		$("#sourcelink").attr("href", sources[raceName][fileName]);
			
		// This is shitty code but if it works it works
			
		backgroundImage.onload = function()
		{ 
			ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
			characterImage = new Image();
			characterImage.src = "./dndimages/cardimages/characters/" + raceName + "/" + fileName + ".jpg";
		
			characterImage.onload = function()
			{
				ctx.drawImage(characterImage, padding, padding, canvas.width - paddingx2, canvas.height / 2 - paddingx2);	// 572 x 356
				ctx.lineWidth = 1;
				ctx.rect(padding, padding, canvas.width - paddingx2, canvas.height / 2 - paddingx2);
				ctx.stroke();
			}
			Card.MakeCardText(canvas, ctx);
		}
	},

	// The name of the race to use in the filepath
	RaceForImage: function(raceName)
	{
		var raceName = this.FileNameFormat(raceName);
		switch(raceName)
		{
			case "gnome" :
				return "halfling";
			case "half-elf" :
				return Random.Array( [ "elf", "human" ] );
			case "half-orc" :
				return "orc";
			case "aasimar" :
				return "human";
		}
		return raceName;
	},

	// Change strings to file/folder name format
	FileNameFormat: function(name)
	{
		return name.toLowerCase().split(" ").join("-");
	},

	// Get the name of the file to use for the character image, depending on race
	ImageFileName: function(raceName)
	{
		var classNm = this.FileNameFormat(character.Class.name);
		var gender = character.Gender;
		if(gender == "Nonbinary or Unknown")
			gender = Random.Array(["Male", "Female"]);
		gender = this.FileNameFormat(gender);
		switch(raceName)
		{
			case "dwarf" :
			case "elf" :
			case "halfling" :
			case "human" :
			case "orc" :
			case "tiefling" :
				return classNm + "-" + gender;
			case "aarakocra" :
			case "dragonborn" :
			case "goliath" :
			case "firbolg" :
			case "kenku" :
			case "lizardfolk" :
			case "tabaxi" :
			case "triton" :
			case "goblin" :
			case "kobold" :
				return classNm;
			case "genasi" :
				return this.FileNameFormat(this.FindTraitByName(this.FindTraitByName(character.Race.content, "Subraces and Variants"), "Subrace") + "-" + gender);
			case "bugbear" :
			case "hobgoblin" :
			case "yuan-ti-pureblood" :
			case "tortle" :
			case "warforged" :
				return this.FileNameByType(classNm)
			case "centaur" :
			case "changeling" :
			case "gith" :
			case "kalashtar" :
			case "minotaur" :
			case "shifter" :
				return gender;
			case "grung" :
			case "loxodon" :
			case "simic-hybrid" :
			case "vedalken" :
				return raceName;
		}
	},

	// Divides characters into 5 different types to determine the card image to use
	FileNameByType: function(classNm)
	{
		switch(classNm)
		{
			case "barbarian" :
			case "fighter" :
			case "monk" :
			case "blood-hunter" :
				return "melee";
			case "bard" :
			case "rogue" :
			case "artificer" :
				return "tricky";
			case "cleric" :
			case "paladin" :
				return "holy";
			case "druid" :
			case "ranger" :
				return "wild";
			case "sorcerer" :
			case "warlock" :
			case "wizard" :
			case "mystic" :
				return "mage";
		}
	},

	// Get and print the text on the card
	MakeCardText: function(canvas, ctx)
	{
		ctx.lineWidth = 10;
		ctx.fillStyle = "black";
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		
		// Name
		ctx.textAlign = "center";
		ctx.fillStyle = "black";
		
		var text = this.CharacterName(), fontSize = 40;
		ctx.font = "bold " + fontSize + "px Georgia";
		while(ctx.measureText(text).width > textWidthMax)
		{
			fontSize--;
			ctx.font = "bold " + fontSize + "px Georgia";
		}
		ctx.fillText(text, canvas.width / 2, canvas.height / 2 + padding);

		// Description
		ctx.font = descriptionFont;
		var stringBuffer, yPos = canvas.height / 2 + 50;
		
		// Description line 1
		stringBuffer = [];
		stringBuffer.push(this.RaceName(), this.ClassName(), this.BackgroundName());
		
		// (Ensure the text isn't too big)
		text = stringBuffer.join(" - "), fontSize = 16;
		while(ctx.measureText(text).width > textWidthMax)
		{
			fontSize--;
			ctx.font = fontSize + "px Tahoma";
		}
		
		ctx.fillText(text, canvas.width / 2, yPos);
		yPos += lineHeight;
		ctx.font = descriptionFont;
		
		// Description line 2
		stringBuffer = [];
		var genderText = (character.Race.name == "Warforged" ? "" : character.Gender + " - ")
		stringBuffer.push(this.VariantTraits(), genderText, this.FindTraitByName(this.FindTraitByName(character.Race.content, "Physical Characteristics"), "Age"));
		ctx.fillText(stringBuffer.join(""), canvas.width / 2, yPos);
		yPos += lineHeight;
		
		// The rest of the text
		ctx.textAlign = "left";
		if($("#personality-radio").prop("checked"))
			this.SetPersonalityCard(ctx, yPos);
		else if($("#characteristics-radio").prop("checked"))
			this.SetCharacteristicsCard(ctx, yPos);
	},

	// Show a shorter name on the card if the character is part of a race with long names
	CharacterName: function()
	{
		if(character.Race.name == "Gnome" && this.FindTraitByName(this.FindTraitByName(character.Race.content, "Subraces and Variants"), "Subrace") != "Deep Gnome")
		{
			var nameArr = character.Name.split(" "),
				firstName = nameArr[Random.Num(nameArr.length - 2)];
				return firstName + " " + nameArr[nameArr.length - 2] + " " + nameArr[nameArr.length - 1];
		}
		else if(character.Race.name == "Tabaxi")
		{
			var nicknameIndex = character.Name.indexOf("\"");
			return character.Name.substring(nicknameIndex);
		}
		return character.Name;
	},

	RaceName: function()
	{
		var subvar = this.FindTraitByName(character.Race.content, "Subraces and Variants");
		if(subvar != null)
		{
			var subrace = this.FindTraitByName(subvar, "Subrace");
			if(subrace != null)
			{
				if(character.Race.name == "Tiefling")
				{
					if(subrace == "Asmodeous Tiefling")
						return "Tiefling";
				}
				else if(character.Race.name == "Shifter")
					return subrace + " Shifter";
				return subrace;
			}
		}
		return character.Race.name;
	},

	ClassName: function()
	{
		return character.Class.name + " (" + this.FindTraitByName(character.Class.content, subclassesCard[character.Class.name]) + ")";
	},

	BackgroundName: function()
	{
		var variant = this.FindTraitByName(character.Background.content, "Optional Variant");
		if(variant != null && Random.Num(2) == 1)
			return character.Background.name + " (" + variant + ")";
		return character.Background.name;
	},

	// Add racial traits for certain special races
	VariantTraits: function()
	{
		var variantRaces = [ "Dragonborn", "Half-Elf", "Human", "Tiefling" ]
		if(variantRaces.includes(character.Race.name))
		{
			var subvar = this.FindTraitByName(character.Race.content, "Subraces and Variants");
			switch(character.Race.name)
			{
				case "Dragonborn" :
					return this.FindTraitByName(subvar, "Draconic Ancestry") + " Dragon Ancestry - ";
				case "Half-Elf" :
					if(books.indexOf("SCAG") < 0)
						return "";
					return this.FindTraitByName(subvar, "Elven Ancestry") + " Ancestry - ";
				case "Human" :
					return this.FindTraitByName(subvar, "Ethnicity") + " - ";
				case "Tiefling" :
					if(!books.includes("SCAG"))
						return null;
					var variant = this.FindTraitByName(subvar, "Variant");
					if(variant == null)
						return null;
					return variant + " - ";
					
			}
		}
		return "";
	},
	
	SetPersonalityCard: function(ctx, yPos)
	{
		// Get the data we need
		var traitArr = this.TraitsArray(ctx, this.PersonalityCardData());
		
		// Pick which traits we use
		var usedLines = 0, usedTraitIndices = [], usedTraits = [];
		while(usedTraitIndices.length < traitArr.length)
		{
			var index = Random.Num(traitArr.length);
			if(usedTraitIndices.indexOf(index) < 0)
			{
				var traitLength = traitArr[index].description.length;
				if(usedLines + traitLength > maxLines)
					break;
				else
				{
					usedTraitIndices.push(index);
					usedLines += traitLength;
				}
			}
		}
		usedTraitIndices.sort( function(item1, item2) { return item1 - item2 } );
		for(var index = 0; index < usedTraitIndices.length; index++)
			usedTraits.push(traitArr[usedTraitIndices[index]])
		
		// Bottom-justify it
		yPos += lineHeight * (lineCheck - usedLines);
		
		// Print
		this.PrintDescription(ctx, usedTraits, yPos);
	},

	// Get the data we need for a personality-type card
	PersonalityCardData: function()
	{
		var allTraits = [],
			backgroundArr = character.Background.content,
			raceArr = character.Race.content,
			classPersonalityArr = this.FindTraitByName(character.Class.content, "Personality"),
			npcTraitsArr = character.NPCTraits.content,
			lifeArr = character.Life.content;
		for(var index = 0; index < backgroundArr.length; index++)
		{
			var trait = backgroundArr[index];
			// if(trait.name[0] == "_")
				// continue;
			allTraits.push(trait);
		}
		if(character.Race.name == "Aasimar")
		{
			var content = this.FindTraitByName(raceArr, "Guide Name") + " (" + this.FindTraitByName(raceArr, "Guide Nature") + ")";
			allTraits.push( { "name" : "Guide", "content" : content } );
		}
		else
		{
			for(var index = 0; index < raceArr.length; index++)
			{
				var trait = raceArr[index];
				if(trait.name != "name" && trait.name != "Subraces and Variants" && trait.name != "Racial Traits" && trait.name != "Physical Characteristics")
					allTraits.push(trait);
			}
		}
		for(var index = 0; index < classPersonalityArr.length; index++)
		{
			var trait = classPersonalityArr[index];
			if(trait != null && trait.content != null)
				allTraits.push(trait);
		}
		for(var index = 0; index < npcTraitsArr.length; index++)
		{
			var trait = npcTraitsArr[index];
			allTraits.push(trait);
		}
		allTraits.push( { "name" : "Trinket", "content" : this.FindTraitByName(lifeArr, "Trinket") } );
		return allTraits;
	},
	
	
	SetCharacteristicsCard: function(ctx, yPos)
	{
		this.PrintDescription(ctx, this.TraitsArray(ctx, this.CharacteristicsCardData()), yPos + lineHeight);
	},

	// Get the data we need for a characteristics-type card
	CharacteristicsCardData: function()
	{
		var allTraits = [];
		var physChar = this.FindTraitByName(character.Race.content, "Physical Characteristics");
		for(var index = 0; index < physChar.length; index++)
		{
			var trait = physChar[index];
			if(trait != null)
				allTraits.push(trait);
		}
		return allTraits;
	},
	
	// Return an array of all traits
	TraitsArray: function(ctx, source)
	{
		var traitArr = [];
		for(var index = 0; index < source.length; index++)
		{
			// Get info on the label
			ctx.font = labelFont;
			var labelText = source[index].name + ": ",
				labelWidth = ctx.measureText(labelText).width,
				lineWidth = labelWidth;
			
			// Get info on the description
			ctx.font = descriptionFont;
			var lineArr = this.MultilineStringArray(ctx, source[index].content, labelWidth);
			traitArr.push( { "label" : labelText, "labelwidth" : labelWidth, "description" : lineArr } );
		}
		return traitArr;
	},

	// Return a string split into multiple lines if necessary
	MultilineStringArray: function(ctx, string, labelWidth)
	{
		var descriptionArr = string.split(" "),
			currentLine = "";
		var lineArr = [], lineWidth = labelWidth;
		for(var wordIndex = 0; wordIndex < descriptionArr.length; wordIndex++)
		{
			var word = descriptionArr[wordIndex],
				wordSpace = " " + word,
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
	},

	// Write the description to the card
	PrintDescription: function(ctx, traits, yPos)
	{
		// Write out the text
		for(var index = 0; index < traits.length; index++)
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
	},

	FindTraitByName: function(arr, name)
	{
		for(var index = 0; index < arr.length; index++)
		{
			if(arr[index].name == name)
				return arr[index].content;
		}
		return null;
	},
}

// For when the user clicks one of the four card type radio buttons (or when the page is loaded with one checked already)
var CardType =
{
	// Whenever the user clicks one of the buttons
	Set: function()
	{
		if($("#plaintext-radio").prop("checked"))
		{
			$("#plaintext").show();
			$("#cardcontainer").hide();
			this.PlainText();
		}
		else
		{
			$("#cardcontainer").show();
			$("#plaintext").hide();
			Card.Make();			// Call the make function in card-script.js
		}
	},
	
	// Make plaintext instead of a card and put it in the textarea
	PlainText: function()
	{
		var stringBuffer = [], description = [];
		description.push(
			{ "name" : "Race", "content" : character.Race.name },
			{ "name" : "Class", "content" : character.Class.name },
			{ "name" : "Background", "content" : character.Background.name },
			{ "name" : "Gender", "content" : character.Gender },
			{ "name" : "Description", "content" : character.NPCTraits.content }
		);
		if(character.Race.name == "Warforged")
			description.splice(3, 1);
		
		stringBuffer.push(
			this.PlainTextFirst(character.Name),
			this.PlainTextFirst( { "name" : "", "content" : description } ), "\n\n",
			"Race: ", this.PlainTextFirst(character.Race), "\n\n",
			"Class: ", this.PlainTextFirst(character.Class), "\n\n",
			"Background: ", this.PlainTextFirst(character.Background), "\n\n",
			this.PlainTextFirst(character.Life)
		);
		
		$("#textarea").html(stringBuffer.join(""));
	},

	PlainTextFirst: function(item)
	{
		if(typeof item != "object")
			return item;
		var itemContent = item.content, stringBuffer = [];
		for(var index = 0; index < itemContent.length; index++)
			stringBuffer.push(this.PlainTextNext(itemContent[index], "\n-"));
		return item.name + stringBuffer.join("");
	},
	
	PlainTextNext(item, depthString = "")
	{
		if(typeof item != "object")
			return item;
		
		var itemContent = item.content, stringBuffer = [];
		for(var index = 0; index < itemContent.length; index++)
			stringBuffer.push(this.PlainTextNext(itemContent[index], depthString + "-"));
		return depthString + item.name + ": " + stringBuffer.join("");
	},
}