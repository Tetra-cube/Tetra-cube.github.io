var backgrounds, books, cardsources, classes, life, names, npcs, other, races,
    character = {},
    characterType = "either",
    usedBooks = [],
    mcEthnicity = "",
    ethnicityOption = "",
    defaultRaceSectionClass,
    lock = {
        "name": false,
        "traits": false,
        "occupation": false,
        "gender": false,
        "race": false,
        "class": false,
        "background": false,
        "life": false,
        "all": ["name", "traits", "occupation", "gender", "race", "class", "background", "life"]
    };

// Populate the dropdowns with material from the selected books
var Dropdowns = {
    Update: function() {
        BookFunctions.Get();
        $("#racemenu").html(this.GetDropdownOptions(races));
        $("#classmenu").html(this.GetDropdownOptions(classes));
        $("#backgroundmenu").html(this.GetDropdownOptions(backgrounds));
    },

    GetDropdownOptions: function(list) {
        let optionsArray = ["<option value=\"Random\">Random</option>"];
        for (let propertyName in list) {
            let item = list[propertyName];
            if (typeof item != "object" || !item.hasOwnProperty("_special") || BookFunctions.CheckSpecial(item._special))
                optionsArray.push("<option value=\"" + propertyName + "\">" + propertyName + "</option>");
        }
        return optionsArray.join("");
    },
}

// Get or check what books we have
var BookFunctions = {
    // Get the books we have from the checkboxes
    Get: function() {
        usedBooks = ["Real", "PHB"];
        for (let bookNum = 0; bookNum < books.availableBooks.length; bookNum++) {
            let book = books.availableBooks[bookNum];
            if ($("#" + book + "box").prop("checked"))
                usedBooks.push(book);
        }
    },

    // Check an entire _special string
    CheckSpecial: function(specialString) {
        let splitSpecial = specialString.split(" ");
        for (let specialIndex = 0; specialIndex < splitSpecial.length; specialIndex++) {
            if (splitSpecial[specialIndex].slice(0, 5) == "book-")
                return this.CheckString(splitSpecial[specialIndex].slice(5));
        }
        return false;
    },

    // Check a string of only books
    CheckString: function(bookString) {
        for (let index = 0; index < usedBooks.length; index++) {
            if (bookString.includes(usedBooks[index]))
                return true;
        }
        return false;
    }
}

var CharacterType = {
    GetNoCard: function() {
        characterType = $("#pc-radio").prop("checked") ? "pc" : $("#npc-radio").prop("checked") ? "npc" : "either";
        if (characterType == "pc") {
            $(".pc-show, .pc-only-show").show();
            $(".npc-show, .npc-only-show").hide();
            $("#race-section").prop("class", defaultRaceSectionClass);
            $("#name-lock-div").removeClass("col-lg-4");
        } else if (characterType == "npc") {
            $(".npc-show, .npc-only-show").show();
            $(".pc-show, .pc-only-show").hide();
            $("#race-section").prop("class", "col-12");
            $("#name-lock-div").addClass("col-lg-4");
        } else {
            $(".pc-show, .npc-show").show();
            $(".pc-only-show, .npc-only-show").hide();
            $("#race-section").prop("class", defaultRaceSectionClass);
            $("#name-lock-div").addClass("col-lg-4");
        }
    },
    Get: function() {
        this.GetNoCard();
        CardType.Set();
    }
}

// For when the user clicks one of the Generate buttons, or when the page loads
var Generate = {
    All: function() {
        BookFunctions.Get();

        this.Race();
        this.Gender();
        this.Name();
        this.Class();
        this.Background();
        this.Occupation();
        this.NPCTraits();
        this.Life();

        CardType.Set();
    },

    Race: function() {
        if (lock.race) return;
        // Determine human ethnicity
        ethnicityOption = $("#standard-radio").prop("checked") ? "standard" :
            $("#real-radio").prop("checked") ? "real" :
            Random.Array(["standard", "real"]);

        // Determine race weight
        let raceVal = $("#racemenu").val();
        character.Race = Content.GetRandom(races, raceVal == "Random" ?
            $("#weighted-radio").prop("checked") ? RaceWeighted.Get() : "Random" :
            raceVal);

        $("#race, #raceheader").html(character.Race.name);
        $("#racesection").html(HTMLStrings.Get(character.Race));

        $("#gender, #genderheader").html(character.Race.name == "Warforged" ? "Genderless" : character.Gender);
    },

    Gender: function() {
        if (lock.gender) return;
        let genderVal = $("#gendermenu").val();
        character.Gender = (genderVal == "Random" ? Random.Array(other.genders) : genderVal);

        $("#gender, #genderheader").html(character.Race.name == "Warforged" ? "Genderless" : character.Gender);

        this.Name();
    },

    Name: function() {
        if (lock.name) return;
        character.Name = Names.Get(character.Race.name, character.Gender);
        $("#name").html(character.Name);
    },

    Class: function() {
        if (lock.class) return;
        character.Class = Content.GetRandom(classes, $("#classmenu").val());

        $("#class, #classheader").html(character.Class.name);
        $("#classsection").html(HTMLStrings.Get(character.Class));
    },

    Background: function() {
        if (lock.background) return;
        character.Background = Content.GetRandom(backgrounds, $("#backgroundmenu").val());

        $("#background, #backgroundheader").html(character.Background.name);
        $("#backgroundsection").html(HTMLStrings.Get(character.Background));
    },

    Occupation: function() {
        if (lock.occupation) return;
        character.Occupation = Occupation.Get();
        $("#occupation").html(character.Occupation);
    },

    NPCTraits: function() {
        if (lock.traits) return;
        character.NPCTraits = {
            "name": "NPCTraits",
            "content": Content.Get(NPCTraits.Get())
        };
        $("#npc-traits-section").html(HTMLStrings.Get(character.NPCTraits));
    },

    Life: function() {
        if (lock.life) return;
        character.Life = {
            "name": "Life",
            "content": Content.Get(Life.Get())
        };
        $("#lifesection").html(HTMLStrings.Get(character.Life));
    },

    // Functions for when a specific button is pressed

    RaceInput: function() {
        BookFunctions.Get();
        this.Race();
        this.Name();
        this.Life();
        CardType.Set();
    },

    GenderInput: function() {
        this.Gender();
    },

    NameInput: function() {
        BookFunctions.Get();
        this.Name();
        CardType.Set();
    },

    ClassInput: function() {
        BookFunctions.Get();
        this.Class();
        CardType.Set();
    },

    BackgroundInput: function() {
        BookFunctions.Get();
        this.Background();
        CardType.Set();
    },

    NPCTraitsInput: function() {
        BookFunctions.Get();
        this.NPCTraits();
        CardType.Set();
    },

    LifeInput: function() {
        BookFunctions.Get();
        this.Life();
        CardType.Set();
    },
}

// Gets content from dnd-data and puts it into a format more readable to the generator (also filters out things that should be inaccessible)
var Content = {
    // Set all properties in an object
    Get: function(item) {
        if (item == null) return null;
        if (typeof item == "object") {
            if (Array.isArray(item))
                return this.Get(Random.Array(item));
            else {
                if (item.hasOwnProperty("_special")) {
                    let specialItem = this.Special(item);
                    if (jQuery.isEmptyObject(specialItem))
                        return null;
                    return specialItem;
                }
                let properties = [];
                for (let propertyName in item) {
                    let content = this.Get(item[propertyName]);
                    if (content != null)
                        properties.push({
                            "name": propertyName,
                            "content": content
                        });
                }
                return properties;
            }
        }
        return item;
    },

    // Get a random property from an initial object
    GetRandom: function(item, dropdownVal = "Random") {
        if (dropdownVal != "Random")
            return {
                "name": dropdownVal,
                "content": this.Special(item[dropdownVal])
            };
        let propsArr = [],
            randomProp;
        for (let propName in item) {
            if (item[propName].hasOwnProperty("_special") && BookFunctions.CheckSpecial(item[propName]._special))
                propsArr.push(propName);
        }
        randomProp = Random.Array(propsArr);
        return {
            "name": randomProp,
            "content": this.Special(item[randomProp])
        };
    },


    // For dealing with special cases (indicated by the _special keyword)

    Special: function(item) {
        // Clone the item, remove special from the clone, and apply every special in order
        let newItem = Object.assign({}, item),
            cases = item._special.split(" ");
        delete newItem._special;
        for (let caseIndex = 0; caseIndex < cases.length; caseIndex++)
            newItem = this.ApplySpecial(cases[caseIndex], newItem);
        if (jQuery.isEmptyObject(newItem))
            return null;
        return this.Get(newItem);
    },

    ApplySpecial: function(special, specialItem) // Apply one special case to an object and return the resulting object
    {
        if (specialItem == null || typeof specialItem != "object") return specialItem;
        let splitSpecial = special.split("-");

        switch (splitSpecial[0]) {
            case "book": // Remove this item if we don't have the necessary book
                return BookFunctions.CheckString(splitSpecial[1]) ? specialItem : null;

            case "booksort": // Take a bunch of arrays and make a composite array, discarding data from books we don't have. Then pick randomly from it.
                return this.BookSort(specialItem);

            case "characteristics": // Output height, weight, appearance, etc
                return this.GetCharacteristics(specialItem);

            case "gendersort": // Get property according to gender
                return character.Gender == "Male" ? specialItem.Male :
                    character.Gender == "Female" ? specialItem.Female :
                    Random.Array([specialItem.Male, specialItem.Female]);

            case "halfethnicity": // Get human ethnicity for half-humans
                mcEthnicity = (Random.Num(5) > 0 ? RandomEthnicity.Get() : "Unknown");
                return mcEthnicity;

            case "humanethnicity": // Get human ethnicity for full-humans
                mcEthnicity = RandomEthnicity.Get();
                return mcEthnicity;

            case "subracesort": // For certain races, we need to know the subrace to determine the physical characteristics. This is less hacky than the code it replaced.
                let SubracePropName = (splitSpecial.length > 1 ? (splitSpecial[1].split("_").join(" ")) : "Subrace"),
                    subracesAndVariants = specialItem["Subraces and Variants"],
                    newSubVar = {},
                    subraceString;

                for (let propertyName in subracesAndVariants) {
                    if (propertyName == SubracePropName) {
                        subraceString = Array.isArray(subracesAndVariants[propertyName]) ?
                            Random.Array(subracesAndVariants[SubracePropName]) :
                            this.BookSort(subracesAndVariants[SubracePropName]);
                        newSubVar[propertyName] = subraceString;
                    } else
                        newSubVar[propertyName] = subracesAndVariants[propertyName];
                }
                specialItem["Subraces and Variants"] = newSubVar;
                specialItem["Physical Characteristics"] = specialItem["Physical Characteristics"][subraceString];

                return specialItem;

            case "tieflingappearance": // Tieflings have weird appearances
                if (Random.Num(3) == 0)
                    return null;
                return Random.ArrayMultiple(specialItem._array, Random.DiceRoll("1d4") + 1);

            case "tieflingvarianttype": // Tieflings also have weird variants
                if (!usedBooks.includes("SCAG"))
                    return null;
                return Random.Array(specialItem._array);

            case "monstrousorigin": // Monster origins
                return Random.Array(other.monstrousOrigins);

            case "backgroundtraits": // For the SCAG backgrounds where the writers were lazy and used personalities from the PHB 
                let backgroundCopy = backgrounds[splitSpecial[1].split("_").join(" ")];
                specialItem["Trait"] = backgroundCopy.Trait;
                specialItem["Ideal"] = backgroundCopy.Ideal;
                specialItem["Bond"] = backgroundCopy.Bond;
                specialItem["Flaw"] = backgroundCopy.Flaw;
                return specialItem;
        }
        return specialItem;
    },

    // Remove every array that's non-applicable because we don't have the book, then merge the remaining arrays and pick randomly from them
    BookSort: function(specialItem) {
        if (specialItem.hasOwnProperty("_special"))
            delete specialItem._special;
        let contentArr = [];
        for (let bookName in specialItem) {
            if (BookFunctions.CheckString(bookName))
                contentArr = contentArr.concat(specialItem[bookName]);
        }
        return Random.Array(contentArr);
    },

    // Compute age, height, weight, and other physical characteristics
    GetCharacteristics: function(item) {
        let chaObj = {},
            age = Random.Num(item.maxage - item.minage) + item.minage;
        age += (age == "1" ? " year" : " years"); // Extremely rare edge case but it can happen
        chaObj.Age = age;

        let heightmod = Random.DiceRoll(item.heightmod),
            intHeight = item.baseheight + heightmod;
        chaObj.Height = Math.floor(intHeight / 12) + "'" + (intHeight % 12) + "\"";
        chaObj.Weight = item.baseweight + heightmod * Random.DiceRoll(item.weightmod) + " lbs.",
            otherObj = item._other;

        if (otherObj == undefined)
            return chaObj;
        for (let otherName in otherObj)
            chaObj[otherName] = otherObj[otherName];
        return chaObj;
    }
}

// Functions for random number/content selecting
var Random = {
    // Generate random number
    Num: function(max) {
        return Math.floor(Math.random() * max);
    },

    // Pick a random element from an array
    Array: function(arr) {
        return arr[this.Num(arr.length)];
    },

    // Pick multiple random elements from an array
    ArrayMultiple: function(arr, num) {
        let returnArray = [];
        while (returnArray.length < num) {
            let item = this.Array(arr);
            if (!returnArray.includes(item))
                returnArray.push(item);
        }
        return returnArray.join(", ");
    },

    // Roll dice based on a string (eg. '2d6')
    DiceRoll: function(roll) {
        numbers = roll.split("d");
        if (numbers.length == 1)
            return numbers[0];
        let total = 0;
        for (let die = 0; die < numbers[0]; die++)
            total += this.Num(numbers[1]) + 1;
        return total;
    },
}

// Functions for making content objects into HTML strings to be displayed
var HTMLStrings = {
    Get: function(item) {
        let itemContent = item.content,
            stringBuffer = [];
        for (let index = 0; index < itemContent.length; index++)
            stringBuffer.push(this.GetNext(itemContent[index]));
        return stringBuffer.join("");
    },

    GetNext: function(item) {
        let itemContent = item.content;
        if (typeof itemContent != "object")
            return "<li><b>" + item.name + "</b>: " + itemContent + "</li>";

        let stringBuffer = [];
        for (let index = 0; index < itemContent.length; index++)
            stringBuffer.push(this.GetNext(itemContent[index]));
        return "<li><b> " + item.name + "</b>:<ul>" + stringBuffer.join("") + "</ul></li>";
    },

    Life: function(item) {
        if (typeof item == "object") {
            let itemContent = item.content,
                stringBuffer = [];
            for (let propertyName in itemContent)
                stringBuffer.push(this.Life(itemContent[propertyName]));
            return stringBuffer.join("");
        }
        return item;
    },
}

// Functions relating to the character's name
var Names = {
    Get: function(raceName, gender) {
        switch (raceName) {
            case "Aarakocra":
            case "Changeling":
            case "Grung":
            case "Kenku":
            case "Lizardfolk":
            case "Shifter":
            case "Tortle":
            case "Warforged":
                return Random.Array(names[raceName]);

            case "Bugbear":
            case "Centaur":
            case "Goblin":
            case "Kobold":
            case "Minotaur":
            case "Orc":
            case "Loxodon":
            case "Vedalken":
                return this.GetGendered(names[raceName], gender);

            case "Aasimar":
            case "Genasi":
                return this.GetHuman(this.GetHumanEthnicity(), gender);

            case "Dragonborn":
                return this.FirstnameLastname(names.Dragonborn, "Clan", gender);

            case "Dwarf":
                if (this.GetSubrace() == "Duergar")
                    return this.GetGendered(names.Dwarf, gender) + " " + Random.Array(names.Dwarf["Clan (Duergar)"]);
                return this.FirstnameLastname(names.Dwarf, "Clan", gender);

            case "Elf":
                if (this.GetSubrace() == "Drow")
                    return this.FirstnameLastname(names.Drow, "Family", gender);
                if (this.GetSubrace() == "Shadar-kai")
                    return this.GetGendered(names["Shadar-kai"], gender);
                return character.age < 80 + Random.Num(40) ?
                    Random.Array(names.Elf.Child) + " " + Random.Array(names.Elf.Family) :
                    this.FirstnameLastname(names.Elf, "Family", gender);

            case "Firbolg":
                return this.GetGendered(names.Elf, gender);

            case "Gith":
                return this.GetSubrace() == "Githyanki" ?
                    this.GetGendered(names.Githyanki, gender) :
                    this.GetGendered(names.Githzerai, gender);

            case "Gnome":
                if (this.GetSubrace() == "Deep Gnome")
                    return this.FirstnameLastname(names["Deep Gnome"], "Clan", gender);
                let firstNames, numNames = 4 + Random.Num(4);
                let gnomeNames = [];
                while (gnomeNames.length < numNames) {
                    let item;
                    if (gender == "Male" || gender == "Female")
                        item = Random.Array(names.Gnome[gender]);
                    else
                        item = Random.Array(names.Gnome[this.RandomGender()]);
                    if (!gnomeNames.includes(item))
                        gnomeNames.push(item);
                }
                firstNames = gnomeNames.join(" ");
                return firstNames + " \"" + Random.Array(names.Gnome.Nickname) + "\" " + Random.Array(names.Gnome.Clan);

            case "Goliath":
                return Random.Array(names.Goliath.Birth) + " \"" + Random.Array(names.Goliath.Nickname) + "\" " + Random.Array(names.Goliath.Clan);

            case "Halfling":
                return this.FirstnameLastname(names.Halfling, "Family", gender);

            case "Half-Elf":
                let hElfRand = Random.Num(6),
                    elfSubrace = this.GetSubrace(),
                    elfNameArray =
                    elfSubrace == "Drow" ? names.Drow : names.Elf;
                if (hElfRand < 2) return this.HumanFirst(this.GetHumanEthnicity(), gender) + " " + Random.Array(elfNameArray.Family); // Human First, Elf Last
                if (hElfRand < 4) return this.GetGendered(elfNameArray, gender) + this.HumanLast(this.GetHumanEthnicity()); // Elf first, Human Last
                if (hElfRand < 5) return this.GetHuman(this.GetHumanEthnicity(), gender); // Both Human
                return this.FirstnameLastname(elfNameArray, "Family", gender); // Both Elf

            case "Half-Orc":
                let hOrcRand = Random.Num(4);
                return hOrcRand < 1 ? this.GetGendered(names.Orc, gender) :
                    hOrcRand < 2 ? this.GetGendered(names.Orc, gender) + this.HumanLast(this.GetHumanEthnicity()) :
                    this.GetHuman(this.GetHumanEthnicity(), gender);

            case "Hobgoblin":
                return this.FirstnameLastname(names.Hobgoblin, "Clan", gender);

            case "Human":
                return this.GetHuman(mcEthnicity, gender);

            case "Kalashtar":
                let kalaRand = Random.Num(2);
                return Random.Array(names.Kalashtar) + " " + (kalaRand < 1 ? Random.Array(names.Quori.Female) : Random.Array(names.Quori.Male));

            case "Simic Hybrid":
                let raceNames = Random.Array([names.Human, names.Elf, names.Vedalken]);
                return raceNames == names.Human ? this.GetHuman(RandomEthnicity.Get(), gender) : this.GetGendered(raceNames, gender);

            case "Tabaxi":
                return Random.Array(names.Tabaxi.Name) + " " + Random.Array(names.Tabaxi.Clan);

            case "Triton":
                return this.FirstnameLastname(names.Triton, "Surname", gender);

            case "Tiefling":
                if (Random.Num(5) < 2)
                    return this.GetHuman(this.GetHumanEthnicity(), gender);
                let lastName = this.HumanLast(this.GetHumanEthnicity());
                return gender == "Male" || gender == "Female" ?
                    Random.Num(3) == 0 ? this.GetGendered(names.Infernal, gender) + lastName : Random.Array(names.Virtue) + lastName :
                    Random.Num(3) > 0 ? Random.Array(names.Virtue) + lastName : this.GetGendered(names.Infernal, gender) + lastName;

            case "Yuan-Ti Pureblood":
                return Random.Array(names["Yuan-Ti"]);
        }
    },

    RandomGender: () => Random.Array(["Male", "Female"]),

    GetSubrace: function() {
        let race = character.Race.content
        for (let index = 0; index < race.length; index++) {
            if (race[index].name == "Subraces and Variants") {
                let subrace = race[index].content;
                for (let index2 = 0; index2 < subrace.length; index2++) {
                    if (subrace[index2].name == "Subrace")
                        return subrace[index2].content;
                }
            }
        }
    },

    // Return a gendered first name and a last name based on race
    FirstnameLastname: function(names, lastnameType, gender) {
        return this.GetGendered(names, gender) + " " + Random.Array(names[lastnameType]);
    },

    // Get the gender or a random generator if the character doesn't have one
    GetGendered: function(names, gender) {
        return Random.Array(names[(gender == "Male" || gender == "Female" ? gender : this.RandomGender())]);
    },

    // Get a human name
    GetHuman: function(ethnicity, gender) {
        let lastName = this.HumanLast(ethnicity);
        return this.HumanFirst(ethnicity, gender) + (lastName != null ? lastName : "");
    },

    HumanFirst: function(ethnicity, gender) {
        return ethnicityOption == "standard" ?
            this.GetGendered(ethnicity == "Tethyrian" ? names.Human.Chondathan : names.Human[ethnicity], gender) :
            this.GetGendered(names["Human (Real)"][ethnicity], gender);
    },

    HumanLast: function(ethnicity) {
        return ethnicityOption == "standard" ?
            ethnicity == "Bedine" ? " " + Random.Array(names.Human.Bedine.Tribe) :
            ethnicity == "Tethyrian" ? " " + Random.Array(names.Human.Chondathan.Surname) :
            (ethnicity == "Tuigan" || ethnicity == "Ulutiun") ? "" : " " + Random.Array(names.Human[ethnicity].Surname) : "";
    },

    // Get character's human heritage - for half-elves, half-orcs, tieflings, aasimar, and genasi
    GetHumanEthnicity: () => (mcEthnicity == "Unknown" ? RandomEthnicity.Get() : mcEthnicity),
}

// Determine race based on weighted probabilities (ie. more common races are more likely to come up)
var RaceWeighted = {
    Get: function() {
        let raceWeightList = Object.assign({}, other.raceWeights),
            totalWeight = 57;
        for (let raceName in races) {
            let race = races[raceName];
            if (race._special.includes("PHB") || !BookFunctions.CheckSpecial(race._special)) continue;
            raceWeightList[raceName] = 1;
            totalWeight += 1;
        }
        let rand = Random.Num(totalWeight);
        for (let race in raceWeightList) {
            rand -= raceWeightList[race];
            if (rand <= 0)
                return race;
        }
    }
}

// Oddball function for returning a random human ethnicity
var RandomEthnicity = {
    Get: function() {
        return ethnicityOption == "standard" ?
            usedBooks.includes("SCAG") ?
            Random.Array(races.Human["Subraces and Variants"].Ethnicity.PHB.concat(races.Human["Subraces and Variants"].Ethnicity.SCAG)) :
            Random.Array(races.Human["Subraces and Variants"].Ethnicity.PHB) :
            Random.Array(races.Human["Subraces and Variants"].Ethnicity.Real);
    }
}

// Return random traits as given in the NPC section of the DMG
var NPCTraits = {
    Get: function() {
        let newNPCTraits = {
                "Appearance": Random.Array(npcs.appearances)
            },
            highTraitNum = Random.Num(npcs.highAbilities.length),
            lowTraitNum = Random.Num(npcs.lowAbilities.length - 1);

        // Low ability can't be the same as the high ability
        if (lowTraitNum >= highTraitNum)
            lowTraitNum++;

        newNPCTraits["High Ability"] = npcs.highAbilities[highTraitNum];
        newNPCTraits["Low Ability"] = npcs.lowAbilities[lowTraitNum];

        newNPCTraits.Talent = Random.Array(npcs.talents);
        newNPCTraits.Mannerism = Random.Array(npcs.mannerisms);
        newNPCTraits["Interaction Trait"] = Random.Array(npcs.interactionTraits);

        let ideal = Random.Array(npcs.ideals),
            bond, bond1 = Random.Num(10)
        if (bond1 < 9)
            bond = npcs.bonds[bond1];
        else {
            bond1 = Random.Num(9);
            let bond2 = Random.Num(9);
            while (bond2 == bond1)
                bond2 = Random.Num(9);
            bond = npcs.bonds[bond1] + ", " + npcs.bonds[bond2];
        }
        newNPCTraits.Values = ideal + ", " + bond;

        newNPCTraits["Flaw or Secret"] = Random.Array(npcs.flawsAndSecrets);
        return newNPCTraits;
    }
}

var Occupation = {
    Get: function(allowAdventurer) {
        let rand = Random.Num(allowAdventurer ? 100 : 99);
        return rand < 5 ? "Academic" :
            rand < 10 ? "Aristocrat" :
            rand < 25 ? "Artisan or guild member" :
            rand < 30 ? "Criminal" :
            rand < 35 ? "Entertainer" :
            rand < 37 ? "Exile, hermit, or refugee" :
            rand < 42 ? "Explorer or wanderer" :
            rand < 54 ? "Farmer or herder" :
            rand < 59 ? "Hunter or trapper" :
            rand < 74 ? "Laborer" :
            rand < 79 ? "Merchant" :
            rand < 84 ? "Politician or bureaucrat" :
            rand < 89 ? "Priest" :
            rand < 94 ? "Sailor" :
            rand < 99 ? "Soldier" :
            "Adventurer (" + Life.ClassWeighted() + ")";
    },
}

// Return random life events as given in Xanathar's guide
var Life = {
    Get: function() {
        let newLife = {};
        newLife.Alignment = Random.Array(life.alignments);
        newLife.Origin = {};
        if (character.Race.name == "Warforged")
            newLife.Origin.Built = Random.Array(life.origins.Birthplace);
        else
            newLife.Origin.Birthplace = Random.Array(life.origins.Birthplace);
        let parents = life.origins.Parents[character.Race.name];
        if (parents != undefined)
            newLife.Origin.Parents = Random.Array(parents);

        let raisedBy = this.RaisedBy();
        if (raisedBy != "Mother and father")
            newLife.Origin["Absent Parent(s)"] = this.AbsentParent();

        let lifestyle = this.Lifestyle();
        newLife.Origin["Family Lifestyle"] = lifestyle[0];
        newLife.Origin["Childhood Home"] = this.Home(lifestyle[1]);
        newLife.Origin["Childhood Memories"] = this.Memories();

        newLife.Origin["Siblings"] = this.Siblings(newLife.Origin.Parents);

        newLife["Life Events"] = this.LifeEvents();
        newLife["Trinket"] = Random.Array(life.trinkets);

        return newLife;
    },

    LifeEvents: function() {
        let lifeEvents = {};
        let numEvents = 3 + Random.Num(3);
        for (let eventNum = 0; eventNum < numEvents; eventNum++) {
            let newEventType = "";
            do {
                let randomEventNum = Random.Num(100);
                newEventType = randomEventNum == 99 ? "Weird Stuff" :
                    life.eventTables["Life Events"][Math.floor(randomEventNum / 5)];
            } while (lifeEvents.hasOwnProperty([newEventType]))

            let newEvent = "";
            switch (newEventType) {
                case "Marriage":
                    let spouseRace;
                    if (Random.Num(3) < 2)
                        spouseRace = character.Race.name;
                    else
                        spouseRace = RaceWeighted.Get();
                    newEvent = "You fell in love or got married to a(n) " + spouseRace.toLowerCase() + " " + Occupation.Get(true).toLowerCase() + ".";
                    break;
                case "Friend":
                    newEvent = "You made a friend of a(n) " + RaceWeighted.Get().toLowerCase() + " " + this.ClassWeighted().toLowerCase() + ".";
                    break;
                case "Enemy":
                    newEvent = "You made an enemy of a(n) " + RaceWeighted.Get().toLowerCase() + " " + this.ClassWeighted().toLowerCase() + ". Roll a d6. An odd number indicates you are to blame for the rift, and an even number indicates you are blameless.";
                    break;
                case "Job":
                    newEvent = "You spent time working in a job related to your background. Start the game with an extra 2d6 gp.";
                    break;
                case "Someone Important":
                    newEvent = "You met an important " + RaceWeighted.Get().toLowerCase() + ", who is " + this.Relationship().toLowerCase() + " towards you.";
                    break;
                case "Adventure":
                    let rand = Random.Num(100);
                    newEvent = rand == 99 ? life.eventTables.Adventure[10] : life.eventTables.Adventure[Math.floor(rand / 10)];
                    break;
                case "Crime":
                    newEvent = Random.Array(life.eventTables.Crime) + ". " + Random.Array(life.eventTables.Punishment);
                    break;
                default:
                    newEvent = Random.Array(life.eventTables[newEventType]);
                    break;
            }
            lifeEvents[newEventType] = newEvent;
        }
        return lifeEvents;
    },

    Siblings: function(parents) // Determine who our siblings are
    {
        let numSiblings = Random.Num(3);
        if (numSiblings == 0) return null;
        siblings = {};
        for (let sibNum = 0; sibNum < numSiblings; sibNum++) {
            let newSib = {},
                race = this.SiblingRace(parents);
            if (race != "Warforged")
                newSib.Gender = Random.Array(other.genders);
            newSib.Race = race;
            newSibName = this.SiblingName(newSib);
            while (newSibName == character.Name.substring(0, newSibName.length))
                newSibName = this.SiblingName(newSib);
            newSib.Alignment = this.Alignment();
            newSib.Occupation = Occupation.Get(true);
            newSib.Status = this.Status();

            newSib.Relationship = this.Relationship();

            let birthOrderRoll = Random.DiceRoll("2d6"),
                birthOrder;
            if (newSib.Race == "Warforged") {
                birthOrder = birthOrderRoll < 3 ? "Simultaneous" :
                    birthOrderRoll < 8 ? "Older" : "Younger"
                newSib["Order of Construction"] = birthOrder;
            } else {
                birthOrder = birthOrderRoll < 3 ? "Twin, triplet, or quadruplet" :
                    birthOrderRoll < 8 ? "Older" : "Younger"
                newSib["Birth Order"] = birthOrder;
            }
            siblings[newSibName] = newSib;
        }
        return siblings;
    },

    SiblingRace: function(parents) // If mixed-race, determine races of siblings
    {
        switch (character.Race.name) {
            case "Half-Elf":
                return parents == "One parent was an elf and the other was a half-elf." ?
                    Random.Array(["Elf", "Half-Elf"]) :
                    parents == "One parent was a human and the other was a half-elf." ?
                    Random.Array(["Human", "Half-Elf"]) : "Half-Elf";
            case "Half-Orc":
                return parents == "One parent was an orc and the other was a half-orc." ?
                    Random.Array(["Orc", "Half-Orc"]) :
                    parents == "One parent was an human and the other was a half-orc." ?
                    Random.Array(["Human", "Half-Orc"]) : "Half-Orc";
            case "Tiefling":
                return parents == "Both parents were humans, their infernal heritage dormant until you came along." ?
                    Random.Array(["Human", "Human", "Human", "Tiefling"]) :
                    parents == "One parent was a tiefling and the other was a human." ?
                    Random.Array(["Human", "Tiefling"]) : "Tiefling";
            case "Genasi":
                return parents == "One parent was a genasi and the other was a human." ?
                    Random.Array(["Human", "Genasi"]) :
                    parents == "Both parents were humans, their elemental heritage dormant until you came along." ?
                    Random.Array(["Human", "Human", "Human", "Genasi"]) : "Genasi";
            case "Aasimar":
                return parents == "Both parents were humans, their celestial heritage dormant until you came along." ?
                    "Human" : Random.Array(["Human", "Aasimar"]);
        }
        return character.Race.name;
    },

    // Random tables

    SiblingName: function(sibling) {
        let siblingRace = sibling.Race,
            name;
        if (siblingRace == "Tabaxi")
            return Random.Array(names.Tabaxi.Name);
        else
            name = (siblingRace == "Human" && character.Race.name != "Human") ?
            Names.GetHuman(Names.GetHumanEthnicity(), sibling.Gender) :
            Names.Get(sibling.Race, sibling.Gender);
        let lastSpace = name.lastIndexOf(" ");
        return lastSpace < 0 ? name : name.substring(0, lastSpace);
    },

    Alignment: function() {
        let roll = Random.DiceRoll("3d6");
        return roll < 4 ? Random.Array(["Chaotic Evil", "Chaotic Neutral"]) :
            roll < 6 ? "Lawful Evil" :
            roll < 9 ? "Neutral Evil" :
            roll < 13 ? "Neutral" :
            roll < 16 ? "Neutral Good" :
            roll < 17 ? "Lawful Good" :
            roll < 18 ? "Lawful Neutral" :
            Random.Array(["Chaotic Good", "Chaotic Neutral"]);
    },

    ClassWeighted: function() {
        let rand = Random.Num(115);
        return rand < 7 ? "Barbarian" :
            rand < 14 ? "Bard" :
            rand < 29 ? "Cleric" :
            rand < 36 ? "Druid" :
            rand < 52 ? "Fighter" :
            rand < 58 ? "Monk" :
            rand < 64 ? "Paladin" :
            rand < 70 ? "Ranger" :
            rand < 84 ? "Rogue" :
            rand < 89 ? "Sorcerer" :
            rand < 94 ? "Warlock" :
            rand < 100 ? "Wizard" :
            rand < 105 ? (usedBooks.includes("Unofficial") ? "Blood Hunter" : this.ClassWeighted()) :
            rand < 110 ? (usedBooks.includes("UA") ? "Artificer" : this.ClassWeighted()) :
            (usedBooks.includes("UA") ? "Mystic" : this.ClassWeighted());
    },

    Status: function() {
        let roll = Random.DiceRoll("3d6");
        return roll < 4 ? "Dead (roll on the Cause of Death table)" :
            roll < 6 ? "Missing or unknown" :
            roll < 9 ? "Alive, but doing poorly due to injury, financial trouble, or relationship difficulties" :
            roll < 13 ? "Alive and well" :
            roll < 16 ? "Alive and quite successful" :
            roll < 18 ? "Alive and infamous" :
            "Alive and famous";
    },

    RaisedBy: function() {
        let rand = Random.Num(100);
        return rand < 1 ? "Nobody" :
            rand < 2 ? "Institution, such as an asylum" :
            rand < 3 ? "Temple" :
            rand < 5 ? "Orphanage" :
            rand < 7 ? "Guardian" :
            rand < 15 ? "Paternal or maternal aunt, uncle, or both : or extended family such as a tribe or clan" :
            rand < 25 ? "Paternal or maternal grandparent(s)" :
            rand < 35 ? "Adoptive family (same or different race)" :
            rand < 55 ? "Single father or stepfather" :
            rand < 75 ? "Single mother or stepmother" :
            "Mother and father";
    },

    AbsentParent: function() {
        let rand = Random.Num(4);
        return rand < 1 ? "Your parent(s) died" :
            rand < 2 ? "Your parent(s) was/were imprisoned, enslaved, or otherwise taken away" :
            rand < 3 ? "Your parent(s) abandoned you" :
            "Your parent(s) disappeared to an unknown fate";
    },

    Lifestyle: function() {
        let roll = Random.DiceRoll("3d6");
        return roll < 4 ? ["Wretched", -40] :
            roll < 6 ? ["Squalid", -20] :
            roll < 9 ? ["Poor", -10] :
            roll < 13 ? ["Modest", 0] :
            roll < 16 ? ["Comfortable", 10] :
            roll < 18 ? ["Wealthy", 20] : ["Aristocratic", 40];
    },

    Home: function(lifeMod) {
        let rand = Random.Num(100) + lifeMod;
        return rand < 0 ? "On the streets" :
            rand < 20 ? "Rundown shack" :
            rand < 30 ? "No permanent residence, you moved around a lot" :
            rand < 40 ? "Encampment of village in the wilderness" :
            rand < 50 ? "Apartment in a rundown neighborhood" :
            rand < 70 ? "Small house" :
            rand < 90 ? "Large house" :
            rand < 110 ? "Mansion" :
            "Palace or Castle";
    },

    Memories: function() {
        let roll = Random.DiceRoll("3d6") + Random.Num(5) - 1;
        return roll < 4 ? "I am still haunted by my childhood, when I was treated badly by my peers" :
            roll < 6 ? "I spent most of my childhood alone, with no close friends" :
            roll < 9 ? "Others saw me as being different or strange, and so I had few companions" :
            roll < 13 ? "I had a few close friends and lived an ordinary childhood." :
            roll < 16 ? "I had several friends, and my childhood was generally a happy one." :
            roll < 18 ? "I always found it easy to make friends, and I loved being around people." :
            "Everyone knew who I was, and I had friends everywhere I went.";
    },

    Relationship: function() {
        let roll = Random.DiceRoll("3d4");
        return roll < 5 ? "Hostile" :
            roll < 11 ? "Friendly" :
            "Indifferent";
    },
}

var LockFunctions = {
    TryLock: function(id) {
        let button = $("#" + id + "-lock-button").children(":first"),
            lockThis = !lock[id];
        lock[id] = lockThis;
        button.prop("class", lockThis ? "fa fa-lock" : "fa fa-lock-open");
    },
    TryLockAll: function(id) {
        lock.all.forEach(function(id) {
            lock[id] = true;
            $("#" + id + "-lock-button").children(":first").prop("class", "fa fa-lock");
        });
    },
    TryUnlockAll: function(id) {
        lock.all.forEach(function(id) {
            lock[id] = false;
            $("#" + id + "-lock-button").children(":first").prop("class", "fa fa-lock-open");
        });
    }
}

// When the page loads
$(function() {
    let calls = 9;
    const GetJSON = function(name) {
        $.getJSON("js/JSON/" + name + ".json", function(data) {
            window[name] = data;
            calls--;
            if (calls <= 0) {
                CharacterType.GetNoCard();
                Dropdowns.Update();
                Generate.All();
            }
        });
    }

    GetJSON("backgrounds");
    GetJSON("books");
    GetJSON("cardsources");
    GetJSON("classes");
    GetJSON("life");
    GetJSON("names");
    GetJSON("npcs");
    GetJSON("other");
    GetJSON("races");

    defaultRaceSectionClass = $("#race-section").prop("class");

    InitCardScript();
});