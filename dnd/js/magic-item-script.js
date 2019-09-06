var dmgTables = {},
    homebrewTables = {},
    items = [];

const AddProp = (name, prop, buffer) => buffer.push("<b>" + name + ":</b> <i>" + prop.name + ".</i> " + prop.desc);

function GenerateDMG() {
    let subBuffer = [];

    subBuffer.push(GetItemType());
    AddProp("Creator", RandomFromArray(dmgTables.creator), subBuffer);
    AddProp("History", RandomFromArray(dmgTables.history), subBuffer);

    let property = RandomFromArray(dmgTables.property);
    AddProp("Property", property, subBuffer);
    if (RandomNum(20) == 0)
        AddProp("Property", GetSecondProperty(dmgTables.property, property), subBuffer);

    AddProp("Quirk", RandomFromArray(dmgTables.quirk), subBuffer);
    AddToItemsList(subBuffer.join("<br>"));
}

function GenerateHomebrew() {
    let subBuffer = [];
    subBuffer.push(GetItemType());
    AddProp("Origin", RandomFromArray(homebrewTables.origin), subBuffer);
	
	
	let majorprop = RandomFromArray(homebrewTables.majorprop);
    AddProp("Major Property", majorprop, subBuffer);
    if (RandomNum(15) == 0)
		AddProp("Major Property", GetSecondProperty(homebrewTables.majorprop, majorprop), subBuffer);

	let minorprop = RandomFromArray(homebrewTables.minorprop);
    AddProp("Minor Property", RandomFromArray(homebrewTables.minorprop), subBuffer);
    if (RandomNum(15) == 0)
		AddProp("Minor Property", GetSecondProperty(homebrewTables.minorprop, minorprop), subBuffer);
	
	let specialprop = RandomFromArray(homebrewTables.specialprop);
    AddProp("Special Property", RandomFromArray(homebrewTables.specialprop), subBuffer);
    if (RandomNum(15) == 0)
		AddProp("Special Property", GetSecondProperty(homebrewTables.specialprop, specialprop), subBuffer);
	
    AddToItemsList(subBuffer.join("<br>"));
}

function GetItemType() {
    let type = RandomFromArray(itemTypes);
    if (type == "armor")
        return "<b>Armor (" + RandomFromArray(armorTypes) + ")</b>";
    if (type == "weapon")
        return "<b>Weapon (" + RandomFromArray(weaponTypes) + ")</b>";
    if (type == "other")
        return "<b>" + RandomFromArray(otherTypes) + "</b>";
    return "<b>Wondrous Item</b>";
}

function GetSecondProperty(table, firstprop) {
    let prop = null;
    do prop = table[RandomNum(table.length)];
    while (prop == firstprop);
	return prop;
}

function AddToItemsList(newItem) {
    items.unshift(newItem);
    if (items.length > 10)
        items.pop();
    $("#magic-items-list").html(items.join("<br><br>"));
}

function RandomNum(max) {
    return Math.floor(Math.random() * max);
}

function RandomFromArray(arr) {
    return arr[RandomNum(arr.length)];
}

// When the page loads
$(function() {
    $.getJSON("js/JSON/magic-item-specials.json", function(data) {
        dmgTables.creator = GetTable(data.creator);
        dmgTables.history = GetTable(data.history);
        dmgTables.property = GetTable(data.property);
        dmgTables.quirk = GetTable(data.quirk);
    });
    $.getJSON("js/JSON/magic-item-homebrews.json", function(data) {
        homebrewTables.origin = GetTable(data.origin);
        homebrewTables.majorprop = GetTable(data.majorprop);
        homebrewTables.minorprop = GetTable(data.minorprop);
        homebrewTables.specialprop = GetTable(data.specialprop);
    });
});

function GetTable(arr) {
    let newArr = []
    for (let index = 0; index < arr.length; index++) {
        let entry = arr[index];
        for (let repeat = 0; repeat < entry.weight; repeat++)
            newArr.push(entry);
    }
    return newArr;
}

const itemTypes = ["armor", "weapon", "weapon", "wondrous item", "wondrous item", "other"],
    armorTypes = ["studded leather", "breastplate", "half plate", "chain mail", "splint", "plate"],
    weaponTypes = ["dagger", "greatclub", "handaxe", "javelin", "light hammer", "mace", "quarterstaff", "sickle", "spear", "light crossbow", "shortbow", "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar", "pike", "rapier", "scimitar", "trident", "war pick", "warhammer", "whip", "hand crossbow", "heavy crossbow", "longbow", "net"],
    otherTypes = ["Instrument", "Ring", "Rod", "Staff", "Wand"]