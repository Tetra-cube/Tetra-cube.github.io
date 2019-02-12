var character = {}, books = [], mcEthnicity = "", ethnicityOption = "";

// Populate the dropdowns with material from the selected books
var Dropdowns =
{
	Update: function()
	{
		Books.Get();
		$("#racemenu").html(this.GetDropdownOptions(races));
		$("#classmenu").html(this.GetDropdownOptions(classes));
		$("#backgroundmenu").html(this.GetDropdownOptions(backgrounds));
	},
	
	GetDropdownOptions: function(list)
	{
		var optionsArray = [ "<option value=\"Random\">Random</option>" ];
		for(var propertyName in list)
		{
			var item = list[propertyName];
			if(typeof item == "object" && item.hasOwnProperty("_special"))
			{
				if(!Books.CheckSpecial(item._special))
					continue;
			}
			optionsArray.push("<option value=\"" + propertyName + "\">" + propertyName + "</option>");
		}
		return optionsArray.join("");
	},
}

// Get or check what books we have
var Books =
{
	// Get the books we have from the checkboxes
	Get: function()
	{
		books = [ "Real", "PHB" ];
		for(var bookNum = 0; bookNum < availableBooks.length; bookNum++)
		{
			var book = availableBooks[bookNum];
			if($("#" + book + "box").prop("checked"))
				books.push(book);
		}
	},

	// Check an entire _special string
	CheckSpecial: function(specialString)
	{
		var splitSpecial = specialString.split(" ");
		for(var specialIndex = 0; specialIndex < splitSpecial.length; specialIndex++)
		{
			if(splitSpecial[specialIndex].slice(0, 5) == "book-")
				return this.CheckString(splitSpecial[specialIndex].slice(5));
		}
		return false;
	},

	// Check a string of only books
	CheckString: function(bookString)
	{
		for(var index = 0; index < books.length; index++)
		{
			if(bookString.includes(books[index]))
				return true;
		}
		return false;
	}
}

// For when the user clicks one of the Generate buttons, or when the page loads
var Generate =
{
	All: function()
	{
		Books.Get();
		
		this.Race();
		this.Gender();
		this.Name();
		this.Class();
		this.Background();
		this.NPCTraits();
		this.Life();
		
		CardType.Set();
	},

	Race: function()
	{
		// Determine human ethnicity
		if($("#standard-radio").prop("checked"))
			ethnicityOption = "standard";
		else if($("#real-radio").prop("checked"))
			ethnicityOption = "real";
		else
			ethnicityOption = Random.Array([ "standard", "real" ]);
		
		character.Race = Content.GetRandom(races, $("#racemenu").val());
		
		$("#race").html(character.Race.name);
		$("#raceheader").html(character.Race.name);
		$("#racesection").html(HTMLStrings.Get(character.Race));
		
		if(character.Race.name == "Warforged")
			$("#gender").html("Genderless");
		else
			$("#gender").html(character.Gender);
	},

	Gender: function()
	{
		var genderVal = $("#gendermenu").val();
		character.Gender = (genderVal == "Random" ? Random.Array(genders) : genderVal);
		
		if(character.Race.name == "Warforged")
			$("#gender").html("Genderless");
		else
			$("#gender").html(character.Gender);
	},

	Name: function()
	{
		character.Name = Names.Get(character.Race.name, character.Gender);
		$("#name").html(character.Name);
	},

	Class: function()
	{
		character.Class = Content.GetRandom(classes, $("#classmenu").val());
		
		$("#class").html(character.Class.name);
		$("#classheader").html(character.Class.name);
		$("#classsection").html(HTMLStrings.Get(character.Class));
	},

	Background: function()
	{
		character.Background = Content.GetRandom(backgrounds, $("#backgroundmenu").val());
		
		$("#background").html(character.Background.name);
		$("#backgroundheader").html(character.Background.name);
		$("#backgroundsection").html(HTMLStrings.Get(character.Background));
	},

	NPCTraits: function()
	{
		character.NPCTraits = { "name" : "NPCTraits", "content" : Content.Get(NPCTraits.Get()) };
		$("#npctraitssection").html(HTMLStrings.Get(character.NPCTraits));
	},

	Life: function()
	{
		character.Life = { "name" : "Life", "content" : Content.Get(Life.Get()) };
		$("#lifesection").html(HTMLStrings.Get(character.Life));
	},

	// Functions for when a specific button is pressed
	
	RaceInput: function()
	{
		Books.Get();
		this.Race();
		this.Name();	// Randomizes both name and life
		CardType.Set();
	},

	GenderInput: function()
	{
		this.Gender();
	},

	NameInput: function()
	{
		Books.Get();
		this.Name();
		this.Life();
		CardType.Set();
	},

	ClassInput: function()
	{
		Books.Get();
		this.Class();
		this.Life();
		CardType.Set();
	},

	BackgroundInput: function()
	{
		Books.Get();
		this.Background();
		this.Life();
		CardType.Set();
	},
	
	NPCTraitsInput: function()
	{
		Books.Get();
		this.NPCTraits();
		CardType.Set();
	},

	LifeInput: function()
	{
		Books.Get();
		this.Life();
		CardType.Set();
	}
}

// Gets content from dnd-data and puts it into a format more readable to the generator (also filters out things that should be inaccessible)
var Content =
{
	// Set all properties in an object
	Get: function(item)
	{
		if(item == null) return null;
		if(typeof item == "object")
		{
			if(Array.isArray(item))
				return this.Get(Random.Array(item));
			else
			{
				if(item.hasOwnProperty("_special"))
				{
					var specialItem = this.Special(item);
					if(jQuery.isEmptyObject(specialItem))
						return null;
					return specialItem;
				}
				var properties = [];
				for(var propertyName in item)
				{
					var content = this.Get(item[propertyName]);
					if(content != null)
						properties.push( { "name" : propertyName, "content" : content } );
				}
				return properties;
			}
		}
		return item;
	},
	
	// Get a random property from an initial object
	GetRandom: function(item, dropdownVal = "Random")
	{
		if(dropdownVal != "Random")
			return { "name" : dropdownVal, "content" : this.Special(item[dropdownVal]) };
		var propsArr = [], randomProp;
		for(var propName in item)
		{
			if(item[propName].hasOwnProperty("_special") && Books.CheckSpecial(item[propName]._special))
				propsArr.push(propName);
		}
		randomProp = Random.Array(propsArr);
		return { "name" : randomProp, "content" : this.Special(item[randomProp]) };
	},
	
	
	// For dealing with special cases (indicated by the _special keyword)
	
	Special : function(item)
	{
		// Clone the item, remove special from the clone, and apply every special in order
		var newItem = Object.assign({}, item), cases = item._special.split(" ");
		delete newItem._special;
		for(var caseIndex = 0; caseIndex < cases.length; caseIndex++)
			newItem = this.ApplySpecial(cases[caseIndex], newItem);
		if(jQuery.isEmptyObject(newItem))
			return null;
		return this.Get(newItem);
	},
	
	ApplySpecial: function(special, specialItem)	// Apply one special case to an object and return the resulting object
	{
		if(specialItem == null || typeof specialItem != "object") return specialItem;
		var splitSpecial = special.split("-");
		
		switch(splitSpecial[0])
		{
			case "book" :		// Remove this item if we don't have the necessary book
				return Books.CheckString(splitSpecial[1]) ? specialItem : null;
			
			case "booksort" :	// Take a bunch of arrays and make a composite array, discarding data from books we don't have. Then pick randomly from it.
				return this.BookSort(specialItem);
				
			case "characteristics" :	// Output height, weight, appearance, etc
				return this.GetCharacteristics(specialItem);
		
			case "gendersort" :			// Get property according to gender
				if(character.Gender == "Male")
					return specialItem.Male;
				if(character.Gender == "Female")
					return specialItem.Female;
			return Random.Array([specialItem.Male, specialItem.Female]);
			
			case "halfethnicity" :		// Get human ethnicity for half-humans
				mcEthnicity = (Random.Num(5) > 0 ? RandomEthnicity.Get() : "Unknown");
				return mcEthnicity;
			
			case "humanethnicity" :		// Get human ethnicity for full-humans
				mcEthnicity = RandomEthnicity.Get();
				return mcEthnicity;
				
			case "subracesort" :		// For certain races, we need to know the subrace to determine the physical characteristics. This is less hacky than the code it replaced.
				var SubracePropName = (splitSpecial.length > 1 ? (splitSpecial[1].split("_").join(" ")) : "Subrace"),
					subracesAndVariants = specialItem["Subraces and Variants"], newSubVar = {}, subraceString;
				
				for(var propertyName in subracesAndVariants)
				{
					if(propertyName == SubracePropName)
					{
						if(Array.isArray(subracesAndVariants[propertyName]))
							subraceString = Random.Array(subracesAndVariants[SubracePropName]);
						else
							subraceString = this.BookSort(subracesAndVariants[SubracePropName]);
						newSubVar[propertyName] = subraceString;
					}
					else
						newSubVar[propertyName] = subracesAndVariants[propertyName];
				}				
				specialItem["Subraces and Variants"] = newSubVar;
				specialItem["Physical Characteristics"] = specialItem["Physical Characteristics"][subraceString];
				
				return specialItem;
			
			case "tieflingappearance" :		// Tieflings have weird appearances
				if(Random.Num(3) == 0)
					return null;
				return Random.ArrayMultiple(specialItem._array, Random.DiceRoll("1d4") + 1);
				
			case "tieflingvarianttype" :	// Tieflings also have weird variants
				if(!books.includes("SCAG"))
					return null;
				return Random.Array(specialItem._array);
		
			case "monstrousorigin" :		// Monster origins
				return Random.Array(monstrousOrigins);
			
			case "backgroundtraits" :		// For the SCAG backgrounds where the writers were lazy and used personalities from the PHB 
				var backgroundCopy = backgrounds[splitSpecial[1].split("_").join(" ")];
				specialItem["Trait"] = backgroundCopy.Trait;
				specialItem["Ideal"] = backgroundCopy.Ideal;
				specialItem["Bond"] = backgroundCopy.Bond;
				specialItem["Flaw"] = backgroundCopy.Flaw;
				return specialItem;
		}
		return specialItem;
	},
	
	// Remove every array that's non-applicable because we don't have the book, then merge the remaining arrays and pick randomly from them
	BookSort: function(specialItem)
	{
		if(specialItem.hasOwnProperty("_special"))
			delete specialItem._special;
		var contentArr = [];
		for(var bookName in specialItem)
		{
			if(Books.CheckString(bookName))
				contentArr = contentArr.concat(specialItem[bookName]);
		}
		return Random.Array(contentArr);
	},
	
	// Compute age, height, weight, and other physical characteristics
	GetCharacteristics: function(item)
	{
		var chaObj = {}, age = Random.Num(item.maxage - item.minage) + item.minage;
		age += (age == "1" ? " year" : " years");			// Extremely rare edge case but it can happen
		chaObj.Age = age;
		
		var heightmod = Random.DiceRoll(item.heightmod), intHeight = item.baseheight + heightmod;
		chaObj.Height = Math.floor(intHeight / 12) + "'" + (intHeight % 12) + "\"";
		chaObj.Weight = item.baseweight + heightmod * Random.DiceRoll(item.weightmod) + " lbs.";

		var otherObj = item._other;
		if(otherObj == undefined)
			return chaObj;
		for(var otherName in otherObj)
			chaObj[otherName] = otherObj[otherName];
		return chaObj;
	}
}

// Functions for random number/content selecting
var Random =
{
	// Generate random number
	Num: function(max)
	{
		return Math.floor(Math.random() * max);
	},
	
	// Pick a random element from an array
	Array: function(arr)
	{
		return arr[this.Num(arr.length)];
	},
	
	// Pick multiple random elements from an array
	ArrayMultiple: function(arr, num)
	{
		var returnArray = [];
		while(returnArray.length < num)
		{
			var item = this.Array(arr);
			if(!returnArray.includes(item))
				returnArray.push(item);
		}
		return returnArray.join(", ");
	},

	// Roll dice based on a string (eg. '2d6')
	DiceRoll: function(roll)
	{
		numbers = roll.split("d");
		if(numbers.length == 1)
			return numbers[0];
		var total = 0;
		for(var die = 0; die < numbers[0]; die++)
			total += this.Num(numbers[1]) + 1;
		return total;
	},
}

// Functions for making content objects into HTML strings to be displayed
var HTMLStrings = 
{
	Get: function(item)
	{
		var itemContent = item.content, stringBuffer = [];
		for(var index = 0; index < itemContent.length; index++)
			stringBuffer.push(this.GetNext(itemContent[index]));
		return stringBuffer.join("");
	},
	
	GetNext: function(item)
	{
		var itemContent = item.content;
		if(typeof itemContent != "object")
			return "<li><b>" + item.name + "</b>: " + itemContent + "</li>";
		
		var stringBuffer = [];
		for(var index = 0; index < itemContent.length; index++)
			stringBuffer.push(this.GetNext(itemContent[index]));
		return "<li><b> " + item.name + "</b>:<ul>" + stringBuffer.join("") + "</ul></li>";
	},
	
	Life: function(item)
	{
		if(typeof item == "object")
		{
			var itemContent = item.content, stringBuffer = [];
			for(var propertyName in itemContent)
				stringBuffer.push(this.Life(itemContent[propertyName]));
			return stringBuffer.join("");
		}
		return item;
	},
}

// Functions relating to the character's name
var Names = 
{
	Get: function(raceName, gender)
	{
		switch(raceName)
		{
			case "Aarakocra" :
			case "Changeling" :
			case "Grung" :
			case "Kenku" :
			case "Lizardfolk" :
			case "Shifter" :
			case "Tortle" :
			case "Warforged" :
				return Random.Array(names[raceName]);
				
			case "Bugbear" :
			case "Centaur" :
			case "Goblin" :
			case "Kobold" :
			case "Minotaur" :
			case "Orc" :
			case "Loxodon" :
			case "Vedalken" :
				return this.GetGendered(names[raceName], gender);
				
			case "Aasimar" :
			case "Genasi" :
				return this.GetHuman(this.GetHumanEthnicity(), gender);
				
			case "Dragonborn" :
				return this.FirstnameLastname(names.Dragonborn, "Clan", gender);
				
			case "Dwarf" :
				return this.FirstnameLastname(names.Dwarf, "Clan", gender);
				
			case "Elf" :
				if(character.age < 80 + Random.Num(40))
					return Random.Array(names.Elf.Child) + " " + Random.Array(names.Elf.Family);
				return this.FirstnameLastname(names.Elf, "Family", gender);
				
			case "Firbolg" :
				return this.GetGendered(names.Elf, gender);
				
			case "Gith" :
				if(this.GetSubrace() == "Githyanki")
					return this.GetGendered(names.Githyanki, gender);
				return this.GetGendered(names.Githzerai, gender);
				
			case "Gnome" :
				if(this.GetSubrace() == "Deep Gnome")
					return this.FirstnameLastname(names["Deep Gnome"], "Clan", gender);
				var firstNames, numNames = 4 + Random.Num(4);
				var gnomeNames = [];
				while(gnomeNames.length < numNames)
				{
					var item;
					if(gender == "Male" || gender == "Female")
						item = Random.Array(names.Gnome[gender]);
					else
						item = Random.Array(names.Gnome[this.RandomGender()]);
					if(!gnomeNames.includes(item))
						gnomeNames.push(item);
				}
				firstNames = gnomeNames.join(" ");
				return firstNames + " \"" + Random.Array(names.Gnome.Nickname) + "\" " + Random.Array(names.Gnome.Clan);
				
			case "Goliath" :
				return Random.Array(names.Goliath.Birth) + " \"" + Random.Array(names.Goliath.Nickname) + "\" " + Random.Array(names.Goliath.Clan);
				
			case "Halfling" :
				return this.FirstnameLastname(names.Halfling, "Family", gender);
				
			case "Half-Elf" :
				var rand = Random.Num(6)
				if(rand < 2)
					return this.HumanFirst(this.GetHumanEthnicity(), gender) + " " + Random.Array(names.Elf.Family);
				if(rand < 4)
					return this.GetGendered(names.Elf, gender) + " " + this.HumanLast(this.GetHumanEthnicity());
				if(rand < 5)
					return this.GetHuman(this.GetHumanEthnicity(), gender);
				return this.FirstnameLastname(names.Elf, "Family", gender);
				
			case "Half-Orc" :
				var rand = Random.Num(4);
				if(rand < 1)
					return this.GetGendered(names.Orc, gender);
				if(rand < 2)
					return this.GetGendered(names.Orc, gender) + " " + this.HumanLast(this.GetHumanEthnicity())
				return this.GetHuman(this.GetHumanEthnicity(), gender);
				
			case "Hobgoblin" :
				return this.FirstnameLastname(names.Hobgoblin, "Clan", gender);
				
			case "Human" :
				return this.GetHuman(mcEthnicity, gender);
				
			case "Kalashtar" :
				var quoriName, rand = Random.Num(2);
				if(rand < 1)
					quoriName = Random.Array(names.Quori.Female);
				else
					quoriName = Random.Array(names.Quori.Male);
				return Random.Array(names.Kalashtar) + " " + quoriName;
				
			case "Simic Hybrid" :
				var raceNames = Random.Array([ names.Human, names.Elf, names.Vedalken ]);
				if(raceNames == names.Human)
					return this.GetHuman(RandomEthnicity.Get(), gender);
				return this.GetGendered(raceNames, gender);
				
			case "Tabaxi" :
				return Random.Array(names.Tabaxi.Name) + " " + Random.Array(names.Tabaxi.Clan);
				
			case "Triton" :
				return this.FirstnameLastname(names.Triton, "Surname", gender);
				
			case "Tiefling" :
				if(Random.Num(5) < 2)
					return this.GetHuman(this.GetHumanEthnicity(), gender);
				var lastName = this.HumanLast(this.GetHumanEthnicity());
				if(gender == "Male" || gender == "Female")
				{
					if(Random.Num(3) == 0)
						return this.GetGendered(names.Infernal, gender) + " " + lastName;
					return Random.Array(names.Virtue) + " " + lastName;
				}
				if(Random.Num(3) > 0)
					return Random.Array(names.Virtue) + " " + lastName;
				return this.GetGendered(names.Infernal, gender) + " " + lastName;
				
			case "Yuan-Ti Pureblood" :
				return Random.Array(names["Yuan-Ti"]);
		}
	},
	
	RandomGender: () => Random.Array(["Male", "Female"]),
	
	GetSubrace: function()
	{
		var race = character.Race.content
		for(var index = 0; index < race.length; index++)
		{
			if(race[index].name == "Subraces and Variants")
			{
				var subrace = race[index].content;
				for(var index2 = 0; index2 < subrace.length; index2++)
				{
					if(subrace[index2].name == "Subrace")
						return subrace[index2].content;
				}
			}
		}
	},
	
	// Return a gendered first name and a last name based on race
	FirstnameLastname: function(names, lastnameType, gender)
	{
		return this.GetGendered(names, gender) + " " + Random.Array(names[lastnameType]);
	},

	// Get the gender or a random generator if the character doesn't have one
	GetGendered: function(names, gender)
	{
		if(gender == "Male" || gender == "Female")
			return Random.Array(names[gender]);
		return Random.Array(names[this.RandomGender()]);
	},

	// Get a human name
	GetHuman: function(ethnicity, gender)
	{
		var lastName = this.HumanLast(ethnicity);
		if(lastName != null)
			return this.HumanFirst(ethnicity, gender) + " " + lastName;
		return this.HumanFirst(ethnicity, gender);
	},

	HumanFirst: function(ethnicity, gender)
	{
		if(ethnicityOption == "standard")
		{
			if(ethnicity == "Tethyrian")
				return this.GetGendered(names.Human.Chondathan, gender);
			return this.GetGendered(names.Human[ethnicity], gender);
		}
		return this.GetGendered(names["Human (Real)"][ethnicity], gender);
	},

	HumanLast: function(ethnicity)
	{
		if(ethnicityOption == "standard")
		{
			if(ethnicity == "Bedine")
				return Random.Array(names.Human.Bedine.Tribe);
			if(ethnicity == "Tethyrian")
				return Random.Array(names.Human.Chondathan.Surname);
			if(ethnicity == "Tuigan" || ethnicity == "Ulutiun")
				return "";
			return Random.Array(names.Human[ethnicity].Surname);
		}
		return null;
	},
	
	// Get character's human heritage - for half-elves, half-orcs, tieflings, aasimar, and genasi
	GetHumanEthnicity: () => (mcEthnicity == "Unknown" ? RandomEthnicity.Get() : mcEthnicity),
}

// Oddball function for returning a random human ethnicity
var RandomEthnicity =
{
	Get: function()
	{
		if(ethnicityOption == "standard")
		{
			if(books.includes("SCAG"))
				return Random.Array(races.Human["Subraces and Variants"].Ethnicity.PHB
					.concat(races.Human["Subraces and Variants"].Ethnicity.SCAG));
			return Random.Array(races.Human["Subraces and Variants"].Ethnicity.PHB);
		}
		return Random.Array(races.Human["Subraces and Variants"].Ethnicity.Real);
	}
}

// Return random traits as given in the NPC section of the DMG
var NPCTraits =
{
	Get: function()
	{
		var newNPCTraits = {};
		newNPCTraits.Appearance = Random.Array(npcAppearances);
		
		var highTraitNum = Random.Num(npcHighAbilities.length);
		var lowTraitNum = Random.Num(npcLowAbilities.length);
		
		// Reroll when the low ability is the same as the high ability
		while(lowTraitNum == highTraitNum)
			lowTraitNum = Random.Num(npcLowAbilities.length);
		
		newNPCTraits["High Ability"] = npcHighAbilities[highTraitNum];
		newNPCTraits["Low Ability"] = npcLowAbilities[lowTraitNum];

		newNPCTraits.Talent = Random.Array(npcTalents);
		newNPCTraits.Mannerism = Random.Array(npcMannerisms);
		newNPCTraits["Interaction Trait"] = Random.Array(npcInteractionTraits);

		var ideal = Random.Array(npcIdeals), bond, bond1 = Random.Num(10)
		if(bond1 < 9)
			bond = npcBonds[bond1];
		else
		{
			bond1 = Random.Num(9);
			var bond2 = Random.Num(9);
			while(bond2 == bond1)
				bond2 = Random.Num(9);
			bond = npcBonds[bond1] + ", " + npcBonds[bond2];
		}
		newNPCTraits.Values = ideal + ", " + bond;
		
		newNPCTraits["Flaw or Secret"] = Random.Array(npcFlawsAndSecrets);
		return newNPCTraits;
	}
}

// Return random life events as given in Xanathar's guide
var Life =
{
	Get: function()
	{
			var newLife = {};
		newLife.Alignment = Random.Array(alignments);
		newLife.Origin = {};
		newLife.Origin.Birthplace = Random.Array(origins.Birthplace);
		var parents = origins.Parents[character.Race.name];
		if(parents != undefined)
			newLife.Origin.Parents = Random.Array(parents);
		
		var raisedBy = this.RaisedBy();
		if(raisedBy != "Mother and father")
			newLife.Origin["Absent Parent(s)"] = this.AbsentParent();

		var lifestyle = this.Lifestyle();
		newLife.Origin["Family Lifestyle"] = lifestyle[0];
		newLife.Origin["Childhood Home"] = this.Home(lifestyle[1]);
		newLife.Origin["Childhood Memories"] = this.Memories();

		newLife.Origin["Siblings"] = this.Siblings(newLife.Origin.Parents);

		newLife["Life Events"] = this.LifeEvents();
		newLife["Trinket"] = Random.Array(trinkets);
		
		return newLife;
	},

	LifeEvents: function()
	{
		var lifeEvents = {};
		var numEvents = 3 + Random.Num(3);
		for(var eventNum = 0; eventNum < numEvents; eventNum++)
		{
			do {
				var newEventType = "", randomEventNum = Random.Num(100);
				if(randomEventNum == 99)
					newEventType = "Weird Stuff";
				else
					newEventType = eventTables["Life Events"][Math.floor(randomEventNum / 5)];
			} while(lifeEvents.hasOwnProperty([newEventType]))
			
			var newEvent = "";
			switch (newEventType)
			{
				case "Marriage" :
					var spouseRace;
					if(Random.Num(3) < 2)
						spouseRace = character.Race.name;
					else
						spouseRace = this.RaceWeighted();
					newEvent = "You fell in love or got married to a(n) " + spouseRace.toLowerCase() + " " + this.Occupation().toLowerCase() + ".";
					break;
				case "Friend" :
					newEvent = "You made a friend of a(n) " + this.RaceWeighted().toLowerCase() + " " + this.ClassWeighted().toLowerCase() + ".";
					break;
				case "Enemy" :
					newEvent = "You made an enemy of a(n) " + this.RaceWeighted().toLowerCase() + " " + this.ClassWeighted().toLowerCase() + ". Roll a d6. An odd number indicates you are to blame for the rift, and an even number indicates you are blameless.";
					break;
				case "Job" :
					newEvent = "You spent time working in a job related to your background. Start the game with an extra 2d6 gp.";
					break;
				case "Someone Important" :
					newEvent = "You met an important " + this.RaceWeighted().toLowerCase() + ", who is " + this.Relationship().toLowerCase() + " towards you.";
					break;
				case "Adventure" :
					var rand = Random.Num(100);
					if(rand == 99)
						newEvent = eventTables.Adventure[10];
					else
						newEvent = eventTables.Adventure[Math.floor(rand/10)];
					break;
				case "Crime" :
						newEvent = Random.Array(eventTables.Crime) + ". " + Random.Array(eventTables.Punishment);
					break;
				default:
					newEvent = Random.Array(eventTables[newEventType]);
					break;
			}
			lifeEvents[newEventType] = newEvent;
		}
		return lifeEvents;
	},

	Siblings: function(parents)	// Determine who our siblings are
	{
		var numSiblings = Random.Num(3);
		if (numSiblings == 0) return null;
		siblings = {};
		for(var sibNum = 0; sibNum < numSiblings; sibNum++)
		{
			var newSib = {};
			if(newSib.Race != "Warforged")
				newSib.Gender = Random.Array(genders);
			newSib.Race = this.SiblingRace(parents);
			newSibName = this.SiblingName(newSib);
			while(newSibName == character.Name.substring(0, newSibName.length))
				newSibName = this.SiblingName(newSib);
			newSib.Alignment = this.Alignment();
			newSib.Occupation = this.Occupation();
			newSib.Status = this.Status();

			newSib.Relationship = this.Relationship();
			
			var birthOrderRoll = Random.DiceRoll("2d6"), birthOrder;
			if(newSib.Race == "Warforged")
			{
				if(birthOrderRoll < 3) birthOrder = "Simultaneous";
				else if(birthOrderRoll < 8) birthOrder = "Older";
				else birthOrder = "Younger";
				newSib["Order of Construction"] = birthOrder;
			}
			else
			{
				if(birthOrderRoll < 3) birthOrder = "Twin, triplet, or quadruplet";
				else if(birthOrderRoll < 8) birthOrder = "Older";
				else birthOrder = "Younger";
				newSib["Birth Order"] = birthOrder;
			}
			siblings[newSibName] = newSib;
		}
		return siblings;
	},

	SiblingRace: function(parents) 	// If mixed-race, determine races of siblings
	{
		switch(character.Race.name)
		{
			case "Half-Elf" :
				if(parents == "One parent was an elf and the other was a half-elf.")
					return Random.Array([ "Elf", "Half-Elf" ]);
				if(parents == "One parent was a human and the other was a half-elf.")
					return Random.Array([ "Human", "Half-Elf" ]);
				return "Half-Elf";
			case "Half-Orc" :
				if(parents == "One parent was an orc and the other was a half-orc.")
					return Random.Array([ "Orc", "Half-Orc" ]);
				if(parents == "One parent was an human and the other was a half-orc.")
					return Random.Array([ "Human", "Half-Orc" ]);
				return "Half-Orc";
			case "Tiefling" :
				if(parents == "Both parents were humans, their infernal heritage dormant until you came along.")
					return Random.Array([ "Human", "Human", "Human", "Tiefling" ]);
				if(parents == "One parent was a tiefling and the other was a human.")
					return Random.Array([ "Human", "Tiefling" ]);
				return "Tiefling";
			case "Genasi" :
				if(parents == "One parent was a genasi and the other was a human.")
					return Random.Array([ "Human", "Genasi" ]);
				if(parents == "Both parents were humans, their elemental heritage dormant until you came along.")
					return Random.Array([ "Human", "Human", "Human", "Genasi" ]);
				return "Genasi";
			case "Aasimar" :
				if(parents == "Both parents were humans, their celestial heritage dormant until you came along.")
					return "Human";
				return Random.Array([ "Human", "Aasimar" ]);
		}
		return character.Race.name;
	},

	// Determine race based on weighted probabilities (ie. more common races are more likely to come up)
	RaceWeighted: function()
	{
		raceWeightList = Object.assign({}, raceWeights);
		totalWeight = 95;
		for(var raceName in races)
		{
			var race = races[raceName];
			if(race._special.includes("PHB") || !Books.CheckSpecial(race._special))
				continue;
			raceWeightList[raceName] = 3;
			totalWeight += 3;
		}
		var rand = Random.Num(totalWeight);
		for(var race in raceWeightList)
		{
			rand -= raceWeightList[race];
			if(rand <= 0)
				return race;
		}
	},

	
	// Random tables
	
	SiblingName: function(sibling)
	{
		var siblingRace = sibling.Race, name;
		if(siblingRace == "Tabaxi")
			return Random.Array(names.Tabaxi.Name);
		else if(siblingRace == "Human" && character.Race.name != "Human")
			name = Names.GetHuman(Names.GetHumanEthnicity(), sibling.Gender);
		else
			name = Names.Get(sibling.Race, sibling.Gender);
		var lastSpace = name.lastIndexOf(" ");
		if(lastSpace < 0)
			return name;
		return name.substring(0, lastSpace);
	},

	Alignment: function()
	{
		var roll = Random.DiceRoll("3d6");
		if(roll < 4) return Random.Array(["Chaotic Evil", "Chaotic Neutral"]);
		if(roll < 6) return "Lawful Evil";
		if(roll < 9) return "Neutral Evil";
		if(roll < 13) return "Neutral";
		if(roll < 16) return "Neutral Good";
		if(roll < 17) return "Lawful Good";
		if(roll < 18) return "Lawful Neutral";
		return Random.Array(["Chaotic Good", "Chaotic Neutral"]);
	},

	Occupation: function()
	{
		var rand = Random.Num(100);
		if(rand < 5) return "Academic";
		if(rand < 10) return "Adventurer (" + this.ClassWeighted() + ")";
		if(rand < 11) return "Aristocrat";
		if(rand < 26) return "Artisan or guild member";
		if(rand < 31) return "Criminal";
		if(rand < 36) return "Entertainer";
		if(rand < 38) return "Exile, hermit, or refugee";
		if(rand < 43) return "Explorer or wanderer";
		if(rand < 55) return "Farmer or herder";
		if(rand < 60) return "Hunter or trapper";
		if(rand < 75) return "Laborer";
		if(rand < 80) return "Merchant";
		if(rand < 85) return "Politician or bureaucrat";
		if(rand < 90) return "Priest";
		if(rand < 95) return "Sailor";
		if(rand < 100) return "Soldier";
	},

	ClassWeighted: function()
	{
		var rand = Random.Num(115);
		if(rand < 7) return "Barbarian";
		if(rand < 14) return "Bard";
		if(rand < 29) return "Cleric";
		if(rand < 36) return "Druid";
		if(rand < 52) return "Fighter";
		if(rand < 58) return "Monk";
		if(rand < 64) return "Paladin";
		if(rand < 70) return "Ranger";
		if(rand < 84) return "Rogue";
		if(rand < 89) return "Sorcerer";
		if(rand < 94) return "Warlock";
		if(rand < 100) return "Wizard";
		if(rand < 105)
		{
			if (books.includes("Unofficial"))
				return "Blood Hunter";
			return this.ClassWeighted();
		}
		if(rand < 110)
		{
			if(books.includes("UA"))
				return "Artificer";
			return this.ClassWeighted();
		}
		if(books.includes("UA"))
			return "Mystic";
		return this.ClassWeighted();
	},

	Status: function()
	{
		var roll = Random.DiceRoll("3d6");
		if(roll < 4) return "Dead (roll on the Cause of Death table)"
		if(roll < 6) return "Missing or unknown"
		if(roll < 9) return "Alive, but doing poorly due to injury, financial trouble, or relationship difficulties"
		if(roll < 13) return "Alive and well"
		if(roll < 16) return "Alive and quite successful"
		if(roll < 18) return "Alive and infamous"
		return "Alive and famous"
	},

	RaisedBy: function()
	{
		var rand = Random.Num(100);
		if(rand < 1) return "Nobody";
		if(rand < 2) return "Institution, such as an asylum";
		if(rand < 3) return "Temple";
		if(rand < 5) return "Orphanage";
		if(rand < 7) return "Guardian";
		if(rand < 15) return "Paternal or maternal aunt, uncle, or both; or extended family such as a tribe or clan";
		if(rand < 25) return "Paternal or maternal grandparent(s)";
		if(rand < 35) return "Adoptive family (same or different race)";
		if(rand < 55) return "Single father or stepfather";
		if(rand < 75) return "Single mother or stepmother";
		return "Mother and father";
	},

	AbsentParent: function()
	{
		var rand = Random.Num(4);
		if(rand < 1) return "Your parent(s) died";
		if(rand < 2) return "Your parent(s) was/were imprisoned, enslaved, or otherwise taken away";
		if(rand < 3) return "Your parent(s) abandoned you";
		return "Your parent(s) disappeared to an unknown fate";
	},

	Lifestyle: function()
	{
		var roll = Random.DiceRoll("3d6");
		if(roll < 4) return [ "Wretched", -40 ];
		if(roll < 6) return [ "Squalid", -20 ];
		if(roll < 9) return [ "Poor", -10 ];
		if(roll < 13) return [ "Modest", 0 ];
		if(roll < 16) return [ "Comfortable", 10 ];
		if(roll < 18) return [ "Wealthy", 20 ];
		return [ "Aristocratic", 40 ];
	},

	Home: function(lifeMod)
	{
		var rand = Random.Num(100) + lifeMod;
		if(rand < 0) return "On the streets";
		if(rand < 20) return "Rundown shack";
		if(rand < 30) return "No permanent residence, you moved around a lot";
		if(rand < 40) return "Encampment of village in the wilderness";
		if(rand < 50) return "Apartment in a rundown neighborhood";
		if(rand < 70) return "Small house";
		if(rand < 90) return "Large house";
		if(rand < 110) return "Mansion";
		return "Palace or Castle";
	},

	Memories: function()
	{
		var roll = Random.DiceRoll("3d6") + Random.Num(5) - 1;
		if(roll < 4) return "I am still haunted by my childhood, when I was treated badly by my peers";
		if(roll < 6) return "I spent most of my childhood alone, with no close friends";
		if(roll < 9) return "Others saw me as being different or strange, and so I had few companions";
		if(roll < 13) return "I had a few close friends and lived an ordinary childhood.";
		if(roll < 16) return "I had several friends, and my childhood was generally a happy one.";
		if(roll < 18) return "I always found it easy to make friends, and I loved being around people.";
		return "Everyone knew who I was, and I had friends everywhere I went.";
	},

	Relationship: function()
	{
		var roll = Random.DiceRoll("3d4");
		if(roll < 5) return "Hostile";
		else if(roll < 11) return "Friendly";
		return "Indifferent";
	},
}

// When the page loads
$(function()
{
	Dropdowns.Update();
	Generate.All();
});