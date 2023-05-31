let statblocks = [];

const BLOCKTEMPLATE = `<div id="stat-block-wrapper">
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
</div> <!-- stat block -->`

// Methods for the statblock list entries's buttons
let blockList = {
    up: (elem) => {
        let i = elem.index();
        [statblocks[i-1], statblocks[i]] = [statblocks[i], statblocks[i-1]];
        refresh();
    },
    down: (elem) => {
        let i = elem.index();
        console.log(elem);
        console.log(i);
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

function refresh() {
    // Refresh statblock list
    $("#statblocks-list").empty();

    $.each(statblocks, (index, mon) => {
        $("#statblocks-list").append(
            `<li>
                <i class="fa fa-arrow-up ${index == 0 ? 'disabled' : ''}" title="Up" onclick="${index>0 ? 'blockList.up($(this).parent())' : ''}"></i>
                <i class="fa fa-arrow-down ${index + 1 == statblocks.length ? 'disabled' : ''}" title="Down" onclick="${index + 1 == statblocks.length ? '' : 'blockList.down($(this).parent())'}"></i>
                <i class="fa fa-trash-o" title="Remove" onclick="blockList.remove($(this).parent())"></i>
                <i class="fa fa-clone" title="Clone" onclick="blockList.clone($(this).parent())"></i>
                <i class="fa fa-download" title="Download" onclick="blockList.download($(this).parent())"></i>
                <b>${StringFunctions.RemoveHtmlTags(mon.name)}</b> <i>${StringFunctions.StringCapitalize(StringFunctions.RemoveHtmlTags(mon.size) + " " + mon.type + (mon.tag == "" ? ", " : " (" + mon.tag + "), ") + mon.alignment)}</i>
            </li>`
        )
    })
    // Refresh print preview
    // UpdateStatblock()
}

// Document ready function
$(() => {
    // Load statblock from cache
    let savedData = localStorage.getItem("SavedData");
    if (savedData != undefined)
        statblocks.push(JSON.parse(savedData));
    refresh();
})