var books = [];

// Update the page depending on books selected
var UpdateList = function()
{
	// Get Books
	{
		books = [ "Real", "PHB" ];
		for(var bookNum in availableBooks)
		{
			var book = availableBooks[bookNum];
			if(book == "MR")
				continue;
			if(document.getElementById(book + "box").checked)
				books.push(book);
		}
		if(books.indexOf("VGtM") >= 0)
			books.push("MR");
	}
	
	var racesList = Content.Get(races);
		classesList = Content.Get(classes),
		backgroundsList = Content.Get(backgrounds);
		namesList = Content.GetNext(names);
	
	$("#races").html(HTMLStrings.Make(racesList));
	$("#classes").html(HTMLStrings.Make(classesList));
	$("#backgrounds").html(HTMLStrings.Make(backgroundsList));
	$("#names").html(HTMLStrings.MakeNames(namesList));
	$("#uaraces").html(UAStuff.Get(UARaces));
	$("#uaclasses").html(UAStuff.Get(UAClasses));
	$("#uaother").html(UAStuff.Get(UAOther));
	
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
		var properties = [];
		for(var propertyName in item)
		{
			var property = item[propertyName], propertySpecial = property._special.split(" "), bookString;
			
			for(var index in propertySpecial)
			{
				var splitSpecial = propertySpecial[index].split("-");
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
				var elements = [];
				for(var index in item)
				{
					var content = this.GetNext(item[index]);
					if(content != null)
						elements.push(content);
				}
				return elements;
			}
			else		// If item is an object
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
					var content = this.GetNext(item[propertyName]);
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
		var newItem = Object.assign({}, item), cases = item._special.split(" ");
		delete newItem._special;
		for(var caseIndex in cases)
			newItem = this.ApplySpecial(cases[caseIndex], newItem);
		if(jQuery.isEmptyObject(newItem))
			return null;
		return this.GetNext(newItem);
	},

	ApplySpecial: function(special, specialItem)			// Apply one special case to an object and return the resulting object
	{
		if(specialItem == null) return null;
		var splitSpecial = special.split("-");
		
		switch(splitSpecial[0])
		{
			case "book" :		// Remove this item if we don't have the necessary book
				return this.CheckForBook(splitSpecial[1]) ? specialItem : null;
				
			case "booksort" :	// Take a bunch of arrays and make a composite array, discarding data from books we don't have
			case 'humanethnicity':
				var newObj = {};
				for(var bookName in specialItem)
				{
					if(this.CheckForBook(bookName))
						newObj["[[" + bookName + "]]"] = specialItem[bookName];
				}
				return newObj;
				
			case "characteristics" :	// Output height, weight, appearance, etc
				var newObj = {};
				newObj["Base Height"] = Math.floor(specialItem.baseheight / 12) + "'" + (specialItem.baseheight % 12) + "\"";
				newObj["Height Mod"] = "+" + specialItem.heightmod;
				newObj["Base Weight"] = specialItem.baseweight + " lb.";
				newObj["Weight Mod"] = "x (" + specialItem.weightmod + ") lb.";
				if(specialItem.hasOwnProperty("_other"))
				{
					for(var propertyName in specialItem._other)
						newObj[propertyName] = specialItem._other[propertyName];
				}
				return newObj;
				
			case "dragonbornnickname" :
			case "tieflingvarianttype" :
			case "tieflingappearance" :
				return specialItem._array;
		
			case "backgroundtraits" :			// For the SCAG backgrounds where the writers were lazy and used personalities from the PHB 
				var backgroundCopy = backgrounds[splitSpecial[1].split("_").join(" ")];
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
		for(var index in books)
		{
			if(booksString.includes(books[index]))
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
		var stringBuffer = [];
		for(var index in arr)
		{
			var item = arr[index];
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
				var itemList = [], allStrings = true;
				for(var index in item)
				{
					if(allStrings && typeof item[index] != "string")
						allStrings = false;

					var newString = this.MakeNext(item[index], noBulletPoints);
					if(newString != null)
						itemList.push(newString);
				}
				if(allStrings)
				{
					// Check for duplicate items (used for the character generator) and remove
					var index1 = 0, index2;
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
					var content = this.MakeNext(item.content, noBulletPoints);
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
		var stringBuffer = [];
		stringBuffer.push("<ul>")
		for(var index in item)
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
				var stringBuffer = [];
				for(var index in item)
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
		var item = $(button).parent().next();
		
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
		var buttons = $("#" + listName).find(".collapsiblebutton");
		$.each(buttons, function(){
			$(this).html("[-] ");
			$(this).parent().next().show();
		});
	},

	RetractAll: function(listName)
	{
		var buttons = $("#" + listName).find(".collapsiblebutton");
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
		var stringBuffer = []
		for(var index in arr)
		{
			var item = arr[index];
			stringBuffer.push("<li><b>", item.name, ":</b> <a href=\"", item.link, "\">", item.source, "</a>");
		}
		return stringBuffer.join("");
	}
}



const noBulletPointsTraits = [ "Subraces and Variants", "Physical Characteristics", "Childhood Nickname", "Guide Name", "Animal Enhancement", "Advanced Animal Enhancement", "Artificer Specialty", "Mystic Order", "Blood Hunter Order" ];