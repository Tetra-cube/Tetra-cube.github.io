const numTeams = 2, maxNotifications = 2;
var trackerIndex = 0;
var tracker = [{
    turn: 0,
    characters: [
    {
        team: 0,
        status: 0,
        name: "",
        hp: 0,
        def: 0,
        conditions: []
    }],
    notes: ""
}];

$(function () {
    var savedData = localStorage.getItem("combatTrackerData");
    if (savedData) {
        tracker = JSON.parse(savedData);
        var savedIndex = localStorage.getItem("combatTrackerIndex");
        trackerIndex = savedIndex ? savedIndex : tracker.length - 1;
    }
    SetTrackerDisplay(true);
});

function AddNotification(text, team) {
    if ($("#notifications").children().length >= maxNotifications) {
        $("#notifications :first-child").remove();
    }
    $("#notifications").append(`<div class="notification notification-t${team}">${text}</div>`);
    var newNotification = $("#notifications :last-child");
    setTimeout(() => newNotification.fadeOut(1000, "swing", () => newNotification.remove()), 2000);
}

function ChangeTracker(func, resetDisplay) {
    tracker.splice(trackerIndex + 1);
    var latest = structuredClone(tracker[trackerIndex]);
    if (tracker.length > 100)
        tracker.splice(0, tracker.length - 100)
    tracker.push(latest);
    trackerIndex = tracker.length - 1;
    func(latest);
    localStorage.setItem("combatTrackerData", JSON.stringify(tracker));
    localStorage.setItem("combatTrackerIndex", trackerIndex);
    SetTrackerDisplay(resetDisplay);
}

function SetTrackerDisplay(resetDisplay) {
    if (resetDisplay) {
        var currentTracker = tracker[trackerIndex];
        if (currentTracker.turn == 0) {
            $("#ally-turn").show();
            $("#enemy-turn").hide();
        }
        else {
            $("#ally-turn").hide();
            $("#enemy-turn").show();
        }
        if (currentTracker.characters.length > 0) {
            $("#combatant-list").show();
            $("#no-combatants").hide();
            $("#combatant-list tbody").html(
                currentTracker.characters.map((c, ci) =>
                    `<tr>` +
                    `<td class="center-align"><span class="team-icon" title="${TeamTitle(c)}">${TeamSymbol(c)}</span></td>` +
                    `<td class="center-align"><span class="status-icon ${c.status < 2 ? "pointer" : "" }"  title="${StatusTitle(c)}"onclick="ChangeStatus(${ci})">${StatusSymbol(c)}</span></td>` +
                    `<td class="left-align"><input type="text" id="character-${ci}-name" class="name-input" value="${c.name}" placeholder="Name" maxLength="256" onchange="EditName(${ci})" /></td>` +
                    `<td class="center-align"><input type="number" id="character-${ci}-hp" class="hp-input" value="${c.hp}" max="9999" min="-9999" onchange="EditHp(${ci})" /></td>` +
                    `<td class="center-align"><input type="number" id="character-${ci}-def" class="def-input" value="${c.def}" max="99" min="-99" onchange="EditDef(${ci})" /></td>` +
                    `<td class="center-align" id="character-${ci}-ac">${Number(c.def) + 11}</td>` +
                    `<td class="left-align conditions-box">` +
                        `<div class="conditions-list">` +
                            `<div class="list-label">` +
                                `<button title="Add New Condition" onClick="AddCondition(${ci})">+</button>` +
                            `</div>` +
                            `<ul>${Conditions(c, ci)}</ul>` +
                        `</div>` +
                    `</td>` +
                    `<td class="move-character-icons">` +
                        (
                            ci > 0 ?
                                `<span class="pointer" title="Move Character Up" onClick="MoveCharacter(${ci}, ${ci - 1})"><i class="fa-solid fa-chevron-up"></i></span>` : 
                                `<span><i class="fa-solid fa-chevron-up disabled-icon"></i></span>`
                        ) +
                        (
                            ci < currentTracker.characters.length - 1 ?
                                `<span class="pointer" title="Move Character Down" onClick="MoveCharacter(${ci}, ${ci + 1})"><i class="fa-solid fa-chevron-down"></i></span>` :
                                `<span><i class="fa-solid fa-chevron-down disabled-icon"></i></span>`
                        ) +
                    `</td>` +
                    `<td><span title="Delete Character" onClick="DeleteCharacter(${ci})" class="pointer">❌</span></td>` +
                `</tr>`
            ).join(""));
        }
        else {
            $("#combatant-list").hide();
            $("#no-combatants").show();
        }
        $("#notes-textarea").val(currentTracker.notes);
    }
    $("#undo").prop("disabled", trackerIndex <= 0);
    $("#redo").prop("disabled", trackerIndex >= tracker.length - 1);
    
    function TeamTitle(c) {
        switch (c.team) {
            case 0: return "Ally";
            case 1: return "Enemy";
        };
    }
    function TeamSymbol(c) {
        switch (c.team) {
            case 0: return `<i class="fa-solid fa-flag green"></i>`;
            case 1: return `<i class="fa-solid fa-flag red"></i>`;
        };
    }
    function StatusTitle(c) {
        switch (c.status) {
            case 0: return "Turn Available";
            case 1: return "Turn in Progress";
            case 2: return "Turn Taken";
        }
    }
    function StatusSymbol(c) {
        switch (c.status) {
            case 0: return `<i class="fa-solid fa-circle green"></i>`;
            case 1: return `<i class="fa-solid fa-circle yellow"></i>`;
            case 2: return `<i class="fa-solid fa-circle red"></i>`;
        }
    }
    function Conditions(c, ci) {
        return c.conditions.map((n, ni) => `<li><input type="text" id="character-${ci}-condition-${ni}" value="${n.description}" placeholder="Condition" maxLength="256" onchange="EditCondition(${ci},${ni})" />`
            + `<span title="Delete Condition" class="pointer" onClick="DeleteCondition(${ci},${ni})">❌</span></li>`).join("");
    }
}

function UpdateTurnOrder(tracker) {
    if (tracker.characters.length <= 0)
        return;
    if (!tracker.characters.some(c => (c.status == 0 && c.team == tracker.turn) || c.status == 1)) {
        for (var i = 0; i < tracker.characters.length; i++) {
            var character = tracker.characters[i];
            if (character.team == tracker.turn && character.status == 2)
                character.status = 0;
        }
        tracker.turn = (tracker.turn + 1) % numTeams;
        // If we switch to a team but all characters on that team have already gone
        if (tracker.characters.some(c => (c.status == 0 && c.team == tracker.turn))) {
            switch (tracker.turn) {
                case 0: AddNotification("Beginning ally turn.", 0); break;
                case 1: AddNotification("Beginning enemy turn.", 1); break;
            }
        }
        else {
            for (var i = 0; i < tracker.characters.length; i++) {
                var character = tracker.characters[i];
                if (character.team == tracker.turn && character.status == 2)
                    character.status = 0;
            }
            tracker.turn = (tracker.turn + 1) % numTeams;
            switch (tracker.turn) {
                case 0: AddNotification("Enemies already moved, beginning ally turn again.", 0); break;
                case 1: AddNotification("Allies already moved, beginning enemy turn again.", 1); break;
            }
        }
    }
    // tracker.characters.sort((a, b) => GetSortOrder(a) - GetSortOrder(b));

    // function GetSortOrder(c) {
    //     switch (c.status) {
    //         case 0: return c.team == tracker.turn ? 1 : 2;
    //         case 1: return 0;
    //         case 2: return c.team == tracker.turn ? 3 : 4;
    //     }
    // }
}

function Undo() {
    trackerIndex--;
    localStorage.setItem("combatTrackerIndex", trackerIndex);
    SetTrackerDisplay(true);
}

function Redo() {
    trackerIndex++;
    localStorage.setItem("combatTrackerIndex", trackerIndex);
    SetTrackerDisplay(true);
}

function ChangeTurnManual() {
    ChangeTracker(t => {
        for (var i = 0; i < t.characters.length; i++) {
            var character = t.characters[i];
            if (character.team == t.turn)
                character.status = 2;
        }
        UpdateTurnOrder(t);
    }, true);
}

function AddCharacter(team) {
    if (tracker[trackerIndex].characters.length < 100) {
        var newIndex = lastIndexOfFunction(tracker[trackerIndex].characters, c => c.team == team) + 1;
        ChangeTracker(t => t.characters.splice(newIndex, 0, {
            team: team,
            status: 0,
            name: "",
            hp: 0,
            def: 0,
            conditions: []
        }), true);
        switch (team) {
            case 0: AddNotification("Ally added.", 0); break;
            case 1: AddNotification("Enemy added.", 1); break;
        }
    }

    function lastIndexOfFunction(arr, func) {
        for (var i = arr.length - 1; i >= 0; i--)
            if (func(arr[i]))
                return i;
    }
}

function MoveCharacter(from, to) {
    ChangeTracker(t => {
        var temp = t.characters[to];
        t.characters[to] = t.characters[from];
        t.characters[from] = temp;
    }, true);
}

function DeleteCharacter(ci) {
    var character = tracker[trackerIndex].characters[ci];
    ChangeTracker(t => t.characters.splice(ci, 1), true);
    if (character.name)
        switch (character.team) {
            case 0: AddNotification(`Ally ${character.name} deleted.`, 0); break;
            case 1: AddNotification(`Enemy ${character.name} deleted.`, 1); break;
        }
    else
        switch (character.team) {
            case 0: AddNotification(`Unnamed ally deleted.`, 0); break;
            case 1: AddNotification(`Unnamed enemy deleted.`, 1); break;
        }
}

function ChangeStatus(ci) {
    if (tracker[trackerIndex].characters[ci].status < 2)
        ChangeTracker(t => {
            t.characters[ci].status = t.characters[ci].status + 1
            UpdateTurnOrder(t);
        }, true);
}

function EditName(ci) {
    ChangeTracker(t => t.characters[ci].name = $(`#character-${ci}-name`).val(), false);
}

function EditHp(ci) {
    var hp = Clamp(Number($(`#character-${ci}-hp`).val()), -9999, 9999);
    $(`#character-${ci}-hp`).val(hp);
    ChangeTracker(t => t.characters[ci].hp = hp, false);
}

function EditDef(ci) {
    var def = Clamp(Number($(`#character-${ci}-def`).val()), -99, 99);
    ChangeTracker(t => t.characters[ci].def = def, false);
    $(`#character-${ci}-def`).val(def);
    $(`#character-${ci}-ac`).html(def + 11);
}

function AddCondition(ci) {
    if (tracker[trackerIndex].characters[ci].conditions.length < 100)
        ChangeTracker(t => t.characters[ci].conditions.push({description: ""}), true);
}

function EditCondition(ci, ni) {
    ChangeTracker(t => t.characters[ci].conditions[ni].description = $(`#character-${ci}-condition-${ni}`).val(), false);
}

function DeleteCondition(ci, ni) {
    ChangeTracker(t => t.characters[ci].conditions.splice(ni, 1), true);
}

function EditNotes() {
    ChangeTracker(t => t.notes = $(`#notes-textarea`).val(), false);
}

function ClearAll() {
    ChangeTracker(t => {
        t.turn = 0;
        t.characters = [];
        t.notes = "";
    }, true);
    AddNotification("Tracker data cleared.", 1);
}

function Clamp(num, min, max) {
    return Math.max(Math.min(num, max), min);
}