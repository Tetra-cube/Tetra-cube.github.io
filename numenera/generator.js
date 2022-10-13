tetrasList = {
    "appearance": [],
    "aspect": [],
    "quirk": [],
    "usedBy": [],
    "utility": []
};
tetrasData = [], bookData = [], items = [];

function RandomNumber(max) {
    return Math.floor(Math.random() * max)
}

function RandomFromArray(arr) {
    return arr[RandomNumber(arr.length)];
}

function MakeList(arr) {
    let newArr = [];
    for (let index = 0; index < arr.length; index++) {
        let entry = arr[index];
        for (let repeat = 0; repeat < entry.weight; repeat++)
            newArr.push(entry.name);
    }
    return newArr;
}

$(function () {
    $.getJSON("JSON/tetras-data.json", function (tetrasJson) {
        tetrasData = tetrasJson;
        tetrasList.appearance = MakeList(tetrasData.appearance);
        tetrasList.aspect = MakeList(tetrasData.aspect);
        tetrasList.quirk = MakeList(tetrasData.quirk);
        tetrasList.usedBy = MakeList(tetrasData.usedBy);
        tetrasList.utility = MakeList(tetrasData.utility);
    });
    $.getJSON("JSON/book-data.json", function (bookJson) {
        bookData = bookJson;
    });
    
    OnCheck();
});

function GetBooks(arr) {
    let books = [];
    arr.forEach(book => {
        switch (book) {
            case "Discovery":
                if ($("#discovery-book").prop("checked"))
                    books.push("Discovery");
                break;
            case "Destiny":
                if ($("#destiny-book").prop("checked"))
                    books.push("Destiny");
                break;
            case "Building Tomorrow":
                if ($("#building-tomorrow-book").prop("checked"))
                    books.push("Building Tomorrow");
                break;
        }
    });
    return books;
}

function GenerateTetras() {
    let htmlItem =
        `<div><b>Aspect:</b> ${RandomFromArray(tetrasList.aspect)}</div>
        <div><b>Utility:</b> ${RandomFromArray(tetrasList.utility)}</div>
        <div><b>Appearance:</b> ${RandomFromArray(tetrasList.appearance)}</div>
        <div><b>Used by:</b> ${RandomFromArray(tetrasList.usedBy)}</div>
        <div><b>Quirk:</b> ${RandomFromArray(tetrasList.quirk)}</div>`
    AddItem(htmlItem);
}

function GenerateCypherArtifact(type, isPlan = false) {
    let books = GetBooks(["Discovery", "Discovery", "Destiny", "Building Tomorrow"]),
        book = RandomFromArray(books),
        item = RandomFromArray(bookData[type][book]),
        htmlItem =
            `<div><b>${item.name}${isPlan ? " (plan)" : ""}</b></div>`
            + (item.levelDie > 0 ?
                (`<div>Level ${RandomNumber(item.levelDie) + item.levelBonus + 1} ${type} (` +
                    (item.levelBonus > 0 ?
                        `d${item.levelDie} + ${item.levelBonus})</div>` :
                        `d${item.levelDie})`)) :
                `<div>Level ${item.levelBonus} ${type} (${item.levelBonus})</div>`)
            + `<div>Minimum Crafting Level: ${item.minimumCraftingLevel}</div>
                <div>${book} (pg. ${item.page})</div>`;
    AddItem(htmlItem);
}

function GenerateOddity() {
    let htmlItem = `<div><b>${RandomFromArray(bookData["Oddity"]["Discovery"])}</b></div><div>Oddity</div>`;
    AddItem(htmlItem);
}

function GenerateOther(type, isPlan = false) {
    let book = (type == "Biological" || type == "Otherspace") ? "Building Tomorrow" : 
        RandomFromArray(GetBooks(["Destiny", "Building Tomorrow"]));
        item = RandomFromArray(bookData[type][book]),
        htmlItem =
            `<div><b>${item.name}${isPlan ? " (plan)" : ""}</b></div>
            <div>${type}</div>
            <div>Minimum Crafting Level: ${item.minimumCraftingLevel}</div>
            <div>${book} (pg. ${item.page})</div>`
    AddItem(htmlItem);
}

function GeneratePlan() {
    let books = GetBooks(["Discovery", "Discovery", "Destiny", "Building Tomorrow"]),
        randomArr = [];
    if(books.includes("Discovery"))
        randomArr.push("Cypher", "Cypher", "Cypher", "Artifact", "Artifact")
    if(books.includes("Destiny") || books.includes("Building Tomorrow"))
        randomArr.push("Cypher", "Cypher", "Cypher", "Artifact", "Artifact",
            "Installation", "Installation", "Installation", "Installation", "Installation",
            "Automaton", "Automaton", "Automaton", "Vehicle", "Vehicle");
    if(books.includes("Building Tomorrow"))
        randomArr.push("Biological", "Biological", "Otherspace", "Otherspace")
    
    let type = RandomFromArray(randomArr);
    if (type == "Cypher" || type == "Artifact")
        GenerateCypherArtifact(type, true);
    else
        GenerateOther(type, true);
}

function AddItem(htmlItem) {
    items.unshift(htmlItem)
    if (items.length > 5)
        items.pop();
    $("#items-list").html(items.join("<hr>"));
}

function OnCheck() {
    if ($("input:checkbox:checked").length > 0) {
        $("#generate-cypher, #generate-artifact, #generate-plan").prop("disabled", false)
        $("#generate-oddity").prop("disabled",
            !$("#discovery-book").prop("checked"));
        $("#generate-installation, #generate-automaton, #generate-vehicle").prop("disabled", 
            !($("#destiny-book").prop("checked") || $("#building-tomorrow-book").prop("checked")));
        $("#generate-biological, #generate-otherspace").prop("disabled",
            !$("#building-tomorrow-book").prop("checked"));
    }
    else {
        $("button").prop("disabled", true)
        $("#generate-tetras").prop("disabled", false)
    }
}