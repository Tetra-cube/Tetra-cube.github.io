var backgrounds, books, classes, names, other, races, ua,
	usedBooks = [];

// Update the page depending on books selected
var UpdateList = function()
{
	// Get Books
	{
		usedBooks = [ "Real", "PHB" ];
		for(let bookNum = 0; bookNum < books.availableBooks.length; bookNum++)
		{
			let book = books.availableBooks[bookNum];
			if(book == "MR") continue;
			if(document.getElementById(book + "box").checked)
				usedBooks.push(book);
		}
		if(usedBooks.indexOf("VGtM") >= 0)
			usedBooks.push("MR");
	}
	
	let racesList = Content.Get(races);
		classesList = Content.Get(classes),
		backgroundsList = Content.Get(backgrounds);
		namesList = Content.GetNext(names);
	
	$("#races").html(HTMLStrings.Make(racesList));
	$("#classes").html(HTMLStrings.Make(classesList));
	$("#backgrounds").html(HTMLStrings.Make(backgroundsList));
	$("#names").html(HTMLStrings.MakeNames(namesList));
	$("#uaraces").html(UAStuff.Get(ua.races));
	$("#uaclasses").html(UAStuff.Get(ua.classes));
	$("#uaother").html(UAStuff.Get(ua.other));
	
	Collapsibles.RetractAll("races");
	Collapsibles.RetractAll("classes");
	Collapsibles.RetractAll("backgrounds");
	Collapsibles.RetractAll("names");
}

// Gets content from dnd-data and puts it into a format more readable to the generator (also filters out things that should be inaccessible)
var Content = 
{
	// Recursive function to populate the content lists
	Get: function(item)
	{
		let properties = [];
		for(let propertyName in item)
		{
			let property = item[propertyName], propertySpecial = property._special.split(" "), bookString;
			
			for(let index = 0; index < propertySpecial.length; index++)
			{
				let splitSpecial = propertySpecial[index].split("-");
				if(splitSpecial[0] = "book")
				{
					bookString = splitSpecial[1];
					break;
				}
			}
			
			if(this.CheckForBook(bookString))
				properties.push( { "name" : propertyName, "content" : Content.GetNext(property), "book" : bookString } );
		}
		return properties;
	},
	
	GetNext: function(item)
	{
		if(item == null) return null;
		if(typeof item == "object")
		{
			if(Array.isArray(item))		// If item is an array
			{
				let elements = [];
				for(let index = 0; index < item.length; index++)
				{
					let content = this.GetNext(item[index]);
					if(content != null)
						elements.push(content);
				}
				return elements;
			}
			else		// If item is an object
			{
				if(item.hasOwnProperty("_special"))
				{
					let specialItem = this.Special(item);
					return jQuery.isEmptyObject(specialItem) ? null : specialItem;
				}
				let properties = [];
				for(let propertyName in item)
				{
					let content = this.GetNext(item[propertyName]);
					if(content != null)
						properties.push( { "name" : propertyName, "content" : content } );
				}
				return properties;
			}
		}
		return item;	// If item is a string or other simple variable
	},
	
	Special: function(item)
	{
		// Clone the item, remove special from the clone, and apply every special in order
		let newItem = Object.assign({}, item), cases = item._special.split(" ");
		delete newItem._special;
		for(let caseIndex = 0; caseIndex < cases.length; caseIndex++)
			newItem = this.ApplySpecial(cases[caseIndex], newItem);
		return jQuery.isEmptyObject(newItem) ? null : this.GetNext(newItem);
	},

	ApplySpecial: function(special, specialItem)			// Apply one special case to an object and return the resulting object
	{
		if(specialItem == null) return null;
		let splitSpecial = special.split("-");
		
		switch(splitSpecial[0])
		{
			case "book" :		// Remove this item if we don't have the necessary book
				return this.CheckForBook(splitSpecial[1]) ? specialItem : null;
				
			case "booksort" :	// Take a bunch of arrays and make a composite array, discarding data from books we don't have
			case 'humanethnicity':
				let heObj = {};
				for(let bookName in specialItem)
				{
					if(this.CheckForBook(bookName))
						heObj["[[" + bookName + "]]"] = specialItem[bookName];
				}
				return heObj;
				
			case "characteristics" :	// Output height, weight, appearance, etc
				let chObj = {};
				chObj["Base Height"] = Math.floor(specialItem.baseheight / 12) + "'" + (specialItem.baseheight % 12) + "\"";
				chObj["Height Mod"] = "+" + specialItem.heightmod;
				chObj["Base Weight"] = specialItem.baseweight + " lb.";
				chObj["Weight Mod"] = "x (" + specialItem.weightmod + ") lb.";
				if(specialItem.hasOwnProperty("_other"))
				{
					for(let propertyName in specialItem._other)
						chObj[propertyName] = specialItem._other[propertyName];
				}
				return chObj;
				
			case "dragonbornnickname" :
			case "tieflingvarianttype" :
			case "tieflingappearance" :
				return specialItem._array;
		
			case "backgroundtraits" :			// For the SCAG backgrounds where the writers were lazy and used personalities from the PHB 
				let backgroundCopy = backgrounds[splitSpecial[1].split("_").join(" ")];
				specialItem["Trait"] = backgroundCopy.Trait;
				specialItem["Ideal"] = backgroundCopy.Ideal;
				specialItem["Bond"] = backgroundCopy.Bond;
				specialItem["Flaw"] = backgroundCopy.Flaw;
				return specialItem;
		}
		
		return specialItem;
	},

	CheckForBook: function(booksString)			// Check if any of the books in a given string are enabled
	{
		for(let index in usedBooks)
		{
			if(booksString.includes(usedBooks[index]))
				return true;
		}
		return false;
	},
}

// Functions for making content objects into HTML strings to be displayed
var HTMLStrings =
{
	Make: function(arr)
	{
		let stringBuffer = [];
		for(let index = 0; index < arr.length; index++)
		{
			let item = arr[index];
			stringBuffer.push("<h3>", Collapsibles.New(), item.name, " <sup>(", item.book, ")</sup>", "</h3>", this.MakeNext(item.content));
		}
		return stringBuffer.join("");
	},

	MakeNext: function(item, noBulletPoints = false)
	{
		if(typeof item == "object")
		{
			if(Array.isArray(item))		// If item is an array
			{
				let itemList = [], allStrings = true;
				for(let index = 0; index < item.length; index++)
				{
					if(allStrings && typeof item[index] != "string")
						allStrings = false;

					let newString = this.MakeNext(item[index], noBulletPoints);
					if(newString != null)
						itemList.push(newString);
				}
				if(allStrings)
				{
					// Check for duplicate items (used for the character generator) and remove
					let index1 = 0, index2;
					while(index1 < itemList.length)
					{
						index2 = index1 + 1;
						while(index2 < itemList.length)
						{
							if(itemList[index1] == itemList[index2])
								itemList.splice(index2, 1);
							else
								index2 ++;
						}
						index1 ++;
					}
					if(noBulletPoints)
						return itemList.join(", ");
				}
				return "<ul><li>" + itemList.join("</li><li>") + "</li></ul>";
			}
			else
			{
				if(item.name.includes("[["))
					return this.MakeNext(item.content, true) + " <sup>(" + item.name.slice(2, -2) + ")</sup>";
				else
				{
					if(!noBulletPoints)
						noBulletPoints = noBulletPointsTraits.includes(item.name);
					let content = this.MakeNext(item.content, noBulletPoints);
					if(content != null)
						return "<b>" + item.name + "</b>: " + content;
				}
			}
		}
		
		if(item[0] == "_")
			return null;

		return item;
	},
	
	MakeNames: function(item)
	{
		let stringBuffer = [];
		stringBuffer.push("<ul>")
		for(let index = 0; index < item.length; index++)
			stringBuffer.push("<li><b>", Collapsibles.New(), item[index].name, "</b>:", this.MakeNamesNext(item[index].content), "</li>");
		stringBuffer.push("</ul>")
		return stringBuffer.join("");
	},
	
	MakeNamesNext: function(item)
	{
		if(typeof item == "object")
		{
			if(Array.isArray(item))
			{
				let stringBuffer = [];
				for(let index = 0; index < item.length; index++)
					stringBuffer.push(this.MakeNamesNext(item[index]));
				if(typeof item[0] == "object")
					return "<ul><li>" + stringBuffer.join("</li><li>") + "</li></ul>";
				return "<ul><li>" + stringBuffer.join(", ") + "</li></ul>";
			}
			else
				return "<b>" + item.name + "</b>:" + this.MakeNamesNext(item.content);
		}
		else
			return item;
	}
}

// Deal with collapsible buttons, collapse/expand content
var Collapsibles =
{

	New: function()
	{
		return "<span class=\"collapsiblebutton\" onclick=\"Collapsibles.CollapseExpand(this)\">[+] </span>"
	},

	CollapseExpand: function(button)
	{
		let item = $(button).parent().next();
		
		while(item[0].tagName != "UL")
			item = item.next();
		
		
		if(item.is(":visible"))
		{
			$(button).html("[+] ");
			item.hide();
		}
		else
		{
			$(button).html("[-] ");
			item.show();
		}
	},

	ExpandAll: function(listName)
	{
		let buttons = $("#" + listName).find(".collapsiblebutton");
		$.each(buttons, function(){
			$(this).html("[-] ");
			$(this).parent().next().show();
		});
	},

	RetractAll: function(listName)
	{
		let buttons = $("#" + listName).find(".collapsiblebutton");
		$.each(buttons, function(){
			$(this).html("[+] ");
			$(this).parent().next().hide();
		});
	}
}

// Populate the UA lists at the bottom
var UAStuff = 
{
	Get: function(arr)
	{
		let stringBuffer = []
		for(let index = 0; index < arr.length; index++)
		{
			let item = arr[index];
			stringBuffer.push("<li><b>", item.name, ":</b> <a href=\"", item.link, "\">", item.source, "</a>");
		}
		return stringBuffer.join("");
	}
}

$(function()
{
	let calls = 7;
	const GetJSON = function(name) {
		$.getJSON("js/JSON/" + name + ".json", function(data) {
			window[name] = data;
			calls--;
			if(calls <= 0)
				UpdateList();
		});
	}
	
	GetJSON("backgrounds");
	GetJSON("books");
	GetJSON("classes");
	GetJSON("names");
	GetJSON("other");
	GetJSON("races");
	GetJSON("ua");
});

const noBulletPointsTraits = [ "Subraces and Variants", "Physical Characteristics", "Childhood Nickname", "Guide Name", "Animal Enhancement", "Advanced Animal Enhancement", "Artificer Specialty", "Mystic Order", "Blood Hunter Order" ];