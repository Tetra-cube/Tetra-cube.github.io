function Serialize(item)
{
	if(Array.isArray(item))
	{
		var serializedArr = [];
		for(var index = 0; index < item.length; index++)
			serializedArr.push(Serialize(item[index]));
		return "[" + serializedArr.join("/") + "]";
	}
	if(typeof item == "object")
	{
		var propertiesArr = [];
		for(var propertyName in item)
			propertiesArr.push(propertyName + ":" + Serialize(item[propertyName]));
		
		return "{" + propertiesArr.join("|") + "}";
	}
	if(typeof item == "string")
	{
		var index = 0;
		while(index < item.length)
		{
			if(specialChars.includes(item[index]))
			{
				item = item.slice(0, index) + "$" + item.slice(index);
				index += 2;
			}
			else
				index++;
		}
		return item;
	}
	return item;
}

function Deserialize(string)
{
	var innerString = string.slice(1, string.length - 1);
	switch(string[0])
	{
		case "[":
			return TraverseString(innerString, "/", []);
		case "{":
			var objArr = TraverseString(innerString, "|", {}), newObj = {};
			for(var index = 0; index < objArr.length; index++)
			{
				var propString = objArr[index]; dividerIndex = propString.indexOf(":");
				newObj[propString.slice(0, dividerIndex)] = Deserialize(propString.slice(dividerIndex + 1));
			}
		return newObj;
	}
	return string.split("$").join("");
}

function TraverseString(string, separator, failCase)
{
	if(string.length == 0)
		return failCase;
	var index = 0, lastIndex = 0, depth = 0, arr = [];
	while(index < string.length)
	{
		var character = string[index];
		if(character == "$")
		{
			index++;
			continue;
		}
		if(character == separator && depth == 0)
		{
			arr.push(Deserialize(string.slice(lastIndex, index)));
			lastIndex = index + 1;
		}
		else if(character == "[" || character == "{")
			depth++;
		else if(character == "]" || character == "}")
			depth--;
		
		index++;
	}
	arr.push(Deserialize(string.slice(lastIndex, index)));
	return arr;
}

const specialChars = [ "|", ":", "/", "[", "]", "{", "}", "$" ];