// var data;
let statblocks = [];
let printMargin;

const BLOCKTEMPLATE = `<div class="stat-block-container"> <!-- id="stat-block-wrapper" class="content" -->
<div id="stat-block" class="stat-block">
    <hr class="orange-border" />
    <div class="section-left">
        <div class="creature-heading">
            <h1 id="monster-name">Monster</h1>
            <h2 id="monster-type">Size, type, alignment</h2>
        </div> <!-- creature heading -->
        <svg height="5" width="100%" class="tapered-rule">
            <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
        <div class="top-stats">
            <div class="property-line first">
                <h4>Armor Class</h4>
                <p id="armor-class"></p>
            </div> <!-- property line -->
            <div class="property-line">
                <h4>Hit Points</h4>
                <p id="hit-points"></p>
            </div> <!-- property line -->
            <div class="property-line last">
                <h4>Speed</h4>
                <p id="speed"></p>
            </div> <!-- property line -->
            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div class="scores">
                <div class="scores-strength">
                    <h4>STR</h4>
                    <p id="strpts"></p>
                </div> <!-- scores strength -->
                <div class="scores-dexterity">
                    <h4>DEX</h4>
                    <p id="dexpts"></p>
                </div> <!-- scores dexterity -->
                <div class="scores-constitution">
                    <h4>CON</h4>
                    <p id="conpts"></p>
                </div> <!-- scores constitution -->
                <div class="scores-intelligence">
                    <h4>INT</h4>
                    <p id="intpts"></p>
                </div> <!-- scores intelligence -->
                <div class="scores-wisdom">
                    <h4>WIS</h4>
                    <p id="wispts"></p>
                </div> <!-- scores wisdom -->
                <div class="scores-charisma">
                    <h4>CHA</h4>
                    <p id="chapts"></p>
                </div> <!-- scores charisma -->
            </div> <!-- scores -->
            <svg height="5" width="100%" class="tapered-rule">
                <polyline points="0,0 400,2.5 0,5"></polyline>
            </svg>
            <div id="properties-list"></div>
            <div id="challenge-rating-line" class="property-line last">
                <h4>Challenge</h4>
                <p id="challenge-rating"></p>
            </div> <!-- property line -->
        </div> <!-- top stats -->
        <svg height="5" width="100%" class="tapered-rule">
            <polyline points="0,0 400,2.5 0,5"></polyline>
        </svg>
        <div class="actions">
            <div id="traits-list-left"></div>
        </div> <!-- actions -->
    </div> <!-- section left -->
    <div class="section-right">
        <div class="actions">
            <div id="traits-list-right"></div>
        </div> <!-- actions -->
    </div> <!-- section right -->
    <hr class="orange-border bottom" />
</div>
</div>`

// Methods for the statblock list entries's buttons
let blockList = {
    up: (elem) => {
        let i = elem.index();
        [statblocks[i-1], statblocks[i]] = [statblocks[i], statblocks[i-1]];
        refresh();
    },
    down: (elem) => {
        let i = elem.index();
        [statblocks[i+1], statblocks[i]] = [statblocks[i], statblocks[i+1]];
        refresh();
    },
    remove: (elem) => {
        statblocks.splice(elem.index(), 1);
        refresh();
    },
    clone: (elem) => {
        i = elem.index();
        statblocks.splice(i, 0, statblocks[i])
        refresh();
    },
    download: (elem) => {
        let mon = statblocks[elem.index()];
        saveAs(new Blob([JSON.stringify(mon)], {
            type: "text/plain;charset=utf-8"
        }), mon.name.toLowerCase() + ".monster")
    }
}

function addStatblock() { // read every selected file and push it to the statblocks list
    Array.from($("#file-upload").prop("files")).forEach(file => {
        let reader = new FileReader();
        reader.onload = function (e) {
            statblocks.push(JSON.parse(reader.result));
            refresh()
        };
        reader.readAsText(file);
    });
}

function printBlocks() {
    let printWindow = window.open();
    printWindow.document.write(`<html>
        <head>
            <meta charset="utf-8"/>
            <title>Statblock printer - RESULT</title>
            <link rel="shortcut icon" type="image/x-icon" href="./dndimages/favicon.ico" />
            <link rel="stylesheet" type="text/css" href="css/statblock-style.css">
            <link rel="stylesheet" type="text/css" href="css/libre-baskerville.css">
            <link rel="stylesheet" type="text/css" href="css/noto-sans.css">
        </head>
        <body>`);
    printWindow.document.write($("#print-preview-page").html());
    printWindow.document.write('</body></html>');
    printWindow.print();
}


function refresh() {
    let statblocksList = $("#statblocks-list");
    let printPreview = $("#print-preview");
    statblocksList.empty();
    printPreview.empty();

    // determine margin values
    if($("#print-margin-check-input").prop("checked")) {
        $("#print-margin-input").prop("disabled", false)
        printMargin = $("#print-margin-input").val();
    } else {
        $("#print-margin-input").prop("disabled", true)
        printMargin = "0px";
    }

    var savePaper = $("#save-paper-input").prop("checked");
    var isAlreadyHori = false; // whether the current statblock is planned to be placed on the left side
    var savePaperApplied = false; // for width determination
    
    $.each(statblocks, (index, mon) => {
        // Refresh statblock list
        statblocksList.append(
            `<li>
                <i class="fa fa-arrow-up ${index == 0 ? 'disabled' : ''}" title="Up" onclick="${index>0 ? 'blockList.up($(this).parent())' : ''}"></i>
                <i class="fa fa-arrow-down ${index + 1 == statblocks.length ? 'disabled' : ''}" title="Down" onclick="${index + 1 == statblocks.length ? '' : 'blockList.down($(this).parent())'}"></i>
                <i class="fa fa-trash" title="Remove" onclick="blockList.remove($(this).parent())"></i>
                <i class="fa fa-clone" title="Clone" onclick="blockList.clone($(this).parent())"></i>
                <i class="fa fa-download" title="Download" onclick="blockList.download($(this).parent())"></i>
                <b>${StringFunctions.RemoveHtmlTags(mon.name)}</b> <i>${StringFunctions.StringCapitalize(StringFunctions.RemoveHtmlTags(mon.size) + " " + mon.type + (mon.tag == "" ? ", " : " (" + mon.tag + "), ") + mon.alignment)}</i>
            </li>`
        );

        // Refresh print preview
        // var insertStatblockInto;
        var style;

        if(isAlreadyHori) {
            // End of side-by-side (this statblock: right)
            // insertStatblockInto = $("#print-preview > div.side-by-side:last-child");
            isAlreadyHori = false;
            style = "margin-bottom: " + printMargin;
            if(index != statblocks.length-1) style += "; float: right";
        } else if(savePaper && !mon.doubleColumns && index != statblocks.length-1 && !statblocks[index+1].doubleColumns) {
            // Start of side-by-side (this statblock: left)
            // printPreview.append('<div class="side-by-side"></div>')
            // insertStatblockInto = $("#print-preview > div.side-by-side:last-child").css("width", "calc(800px + " + printMargin + ")");
            isAlreadyHori = true;
            savePaperApplied = true;
            style = `float: inline-start; margin: 0px ${printMargin} ${printMargin} 0px`;
        } else {
            // normal
            // insertStatblockInto = printPreview;
            style = `margin: 0px ${printMargin} ${printMargin} 0px`;
        }

        printPreview.append(BLOCKTEMPLATE);
        var currentStatblockContainer = printPreview.children().last();
        UpdateStatblock(undefined, mon);
        // if(isAlreadyHori) currentStatblockContainer.css("float", "left"); // first block (left)

        // delete all IDs so this statblock won't be affected by later calls of UpdateStatblock()
        currentStatblockContainer.removeAttr("id");
        currentStatblockContainer.html(currentStatblockContainer.html().replaceAll(/id=".*?"/g, ''));

        // add CSS
        console.log(index, style);
        currentStatblockContainer[0].style = style;
        // monochrome print
        if($("#monochrome-print-input").prop("checked")) {
            $(".stat-block-container").attr("id", "print-block")
        } else {
            $(".stat-block-container").removeAttr("id")
        }

        // margins
        // $(".stat-block-container:not(:last-child)").css("margin", "0px " + printMargin + " " + printMargin + " 0px"); // right and bottom
        // $(".side-by-side > :last-child").css("margin-bottom", printMargin);
    });

    // determine width of #print-preview
    let width = "400px" // one-column statblocks, vertically aligned
    if($("#print-preview .stat-block.wide").length) width = "800px" // at least one two-column statblock exists
    if(savePaperApplied) width = `calc(800px + ${printMargin})`
    $("#print-preview").css("width", width)
}

// Document ready function
$(() => {
    // Load statblock from cache
    let savedData = localStorage.getItem("SavedData");
    if (savedData != undefined)
        statblocks.push(JSON.parse(savedData));
        
    $.getJSON("js/JSON/statblockdata.json", json => {
        data = json
        refresh();
    });
})