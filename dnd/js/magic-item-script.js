var tables = {};

function Generate() {
    let stringBuffer = [];
    for (let index = 0; index < $("#num-items").val(); index++) {
        const AddProp = (name, prop) => subBuffer.push("<b>" + name + ":</b> <i>" + prop.name + ".</i> " + prop.desc);
        let subBuffer = [];
        let type = RandomFromArray(itemTypes),
            creator = RandomFromArray(tables.creator),
            history = RandomFromArray(tables.history),
            property = RandomFromArray(tables.property),
            quirk = RandomFromArray(tables.quirk);
        if (type == "armor")
            subBuffer.push("<b>Armor (" + RandomFromArray(armorTypes) + ")</b>");
        else if (type == "weapon")
            subBuffer.push("<b>Weapon (" + RandomFromArray(weaponTypes) + ")</b>");
        else if (type == "other")
            subBuffer.push("<b>Weapon (" + RandomFromArray(otherTypes) + ")</b>");
        else
            subBuffer.push("<b>Wondrous Item</b>");
        AddProp("Creator", creator);
        AddProp("History", history);
        if (property.name == "reroll") {
            let prop1 = tables.property[RandomNum(tables.property.length - 1)],
                prop2;
            do
                prop2 = tables.property[RandomNum(tables.property.length - 1)];
            while (prop1 == prop2);
            AddProp("Property", prop1);
            AddProp("Property", prop2);
        } else
            AddProp("Property", property);
        AddProp("Quirk", quirk);
        stringBuffer.push(subBuffer.join("<br>"));
    }
    $("#magic-items-list").html(stringBuffer.join("<br><br>"));
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
        tables = data;
        Generate();
    });
});

const itemTypes = ["armor", "weapon", "weapon", "wondrous item", "wondrous item", "other"],
    armorTypes = ["studded leather", "breastplate", "half plate", "chain mail", "splint", "plate"],
    weaponTypes = ["dagger", "greatclub", "handaxe", "javelin", "light hammer", "mace", "quarterstaff", "sickle", "spear", "light crossbow", "shortbow", "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar", "pike", "rapier", "scimitar", "trident", "war pick", "warhammer", "whip", "hand crossbow", "heavy crossbow", "longbow", "net"],
    otherTypes = ["ring", "rod", "staff", "wand"]