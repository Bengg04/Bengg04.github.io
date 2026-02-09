$(document).ready(function(){
    const listsContainerElement = document.getElementById("listsContainer");
    const exportButtonElement = document.getElementById("exportButton");
    const importButtonElement = document.getElementById("importButton");
    const importFileInputElement = document.getElementById("importFileInput");
    const generateLinksButtonElement = document.getElementById("generateLinksButton");
    const refreshButtonElement = document.getElementById("refreshButton");

    let listCount = 0;
    let draggedItem = null;

    exportButtonElement.addEventListener("click", exportLists);

    importButtonElement.addEventListener("click", () => {
        importFileInputElement.click();
    });

    importFileInputElement.addEventListener("change", importLists);

    generateLinksButtonElement.addEventListener("click", () => {
        const outputAllAchievementsLink = document.getElementById("allAchievementsLinkOutput");
        const outputUserStatsLink = document.getElementById("userStatsLinkOutput");

        const steamid = document.getElementById("steamidInput").value.trim();
        const appid = document.getElementById("appidInput").value.trim();
        const apikey = document.getElementById("apikeyInput").value.trim();

        outputAllAchievementsLink.value = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apikey}&appid=${appid}&l=de`;
        outputUserStatsLink.value = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apikey}&steamid=${steamid}&appid=${appid}&l=en`;
    });

    refreshButtonElement.addEventListener("click", () => {
        const inputAllAchievements = document.getElementById("jsonAllAchievementsInput").value;
        const jsonUserStats = document.getElementById("jsonUserStatsInput").value;

        listsContainerElement.innerHTML = "";

        createList()
        const list1Element = document.getElementById("list1");
        list1Element.innerHTML = "";
        list1Element.appendChild(createEditableText("Done"));

        createList()
        const list2Element = document.getElementById("list2");
        list2Element.innerHTML = "";
        list2Element.appendChild(createEditableText("ToDo"));

        try {
            const gameData = JSON.parse(inputAllAchievements);
            const playerData = JSON.parse(jsonUserStats);

            const simplifiedJSON = createSimplifiedJSON(
                gameData.game?.availableGameStats?.achievements || [],
                playerData.playerstats.achievements || []
            );
            const achievements = simplifiedJSON.achievements || [];

            if (achievements.length === 0) {
                console.log("No achievements found in JSON");
                return;
            }

            achievements.forEach(achievement => {
                (achievement.achieved ? list1Element : list2Element).appendChild(createAchievement(achievement));
            });
        } catch (error) {
            console.log("Error: " + error);
        }
    });

    document.getElementById("addListButton").addEventListener("click", () => {
        createList()
    });

    function createSimplifiedJSON(gameData, playerData) {
        const playerMap = {};
        playerData.forEach(pData => {
            playerMap[pData.apiname] = { achieved: pData.achieved };
        });

        return {
            achievements: gameData.map(gData => ({
                name: gData.name,
                displayName: gData.displayName,
                hidden: gData.hidden,
                description: gData.description,
                icon: gData.icon,
                icongray: gData.icongray,
                achieved: playerMap[gData.name]?.achieved || 0
            }))
        };
    }

    function createEditableText(listName) {
        const listNameContainer = document.createElement("div");
        listNameContainer.className = "editableText";

        let isEditing = false;
        let currentName = listName;

        listNameContainer.textContent = listName;

        listNameContainer.addEventListener("click", () => {
            if (!isEditing) {
                isEditing = true;
                listNameContainer.classList.add("editing");

                const input = document.createElement("input");
                input.value = currentName;
                input.select();

                const save = () => {
                    currentName = input.value || listName;
                    listNameContainer.textContent = currentName;
                    listNameContainer.classList.remove("editing");
                    isEditing = false;
                }

                input.addEventListener("blur", () =>{
                    save();
                });

                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") save();
                });

                listNameContainer.textContent = "";
                listNameContainer.appendChild(input);
                input.focus();
            }
        });

        return listNameContainer;
    }

    function createList() {
        const list = document.createElement("div");
        listCount++;
        list.id = `list${listCount}`;
        list.appendChild(createEditableText("New List"));
        listsContainerElement.appendChild(list);

        list.addEventListener("dragover", (e) => {
            e.preventDefault();
            handleDragOver(e, list);
        })

        list.addEventListener("drop", (e) => {
            e.preventDefault();
            handleDrop(e, list);
        })

        list.addEventListener("dragleave", clearDragFeedback)
    }

    function createAchievement(achievement) {
        const achievementDiv = document.createElement("div");
        achievementDiv.className = "achievement";
        achievementDiv.draggable = true;

        const status = achievement.achieved ? "✅ Unlocked" : "🔒 Locked";

        achievementDiv.innerHTML = `
            <img src="${!achievement.icongray || achievement.achieved ? achievement.icon : achievement.icongray}" 
                alt="${achievement.displayName}" 
                class="achievementIcon" />
            <div class="achievementContent">
                <div class="achievementName">${achievement.displayName}</div>
                <div class="achievementDescription">${achievement.description}</div>
                <div class="achievementStatus" style="color: ${achievement.achieved ? "#0F0" : "#F00"}">${status}</div>
            </div>
        `;

        achievementDiv.addEventListener("dragstart", () => {
            draggedItem = achievementDiv;
            achievementDiv.classList.add("dragging");
        });

        achievementDiv.addEventListener("dragend", () => {
            achievementDiv.classList.remove("dragging");
            clearDragFeedback()
            draggedItem = null;
        });

        return achievementDiv;
    }

    function handleDragOver(e, list) {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);

        clearDragFeedback();
        const items = list.querySelectorAll(".achievement:not(.dragging)");

        if (afterElement == null) {
            items[items.length - 1]?.classList.add("dragOver");
        } else {
            afterElement.classList.add("dragOver");
        }
    }

    function handleDrop(e, list) {
        const afterElement = getDragAfterElement(list, e.clientY);
        clearDragFeedback();

        if (afterElement == null) {
            list.appendChild(draggedItem);
        } else {
            list.insertBefore(draggedItem, afterElement);
        }
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".achievement:not(.dragging)")];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function clearDragFeedback() {
        document.querySelectorAll(".dragOver").forEach(item => {
            item.classList.remove("dragOver");
        });
    }

    function exportLists() {
        const lists = [];

        listsContainerElement.querySelectorAll('div[id^="list"]').forEach(list => {
            const titleElement = list.querySelector(".editableText");
            const title = titleElement ? titleElement.textContent.trim() : "Untitled";

            const achievements = [];
            list.querySelectorAll(".achievement").forEach(achievement => {
                const imgElement = achievement.querySelector("img")
                const nameElement = achievement.querySelector(".achievementName");
                const descriptionElement = achievement.querySelector(".achievementDescription");
                const statusElement = achievement.querySelector(".achievementStatus");

                achievements.push({
                    icon: imgElement.src,
                    displayName: nameElement.textContent.trim(),
                    description: descriptionElement.textContent.trim(),
                    achieved: statusElement.textContent.includes("✅")
                });
            });

            lists.push({ id: list.id, title, achievements });
        });

        const data = {lists, listCount};
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lists-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function importLists(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                restoreLists(data);
                importFileInputElement.value = "";
            } catch (err) {
                console.log("Invalid file: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    function restoreLists(data) {
        listsContainerElement.innerHTML = "";
        listCount = data.listCount || 0;

        data.lists.forEach(listData => {
            const list = document.createElement("div");
            list.id = listData.id;

            const titleDiv = createEditableText(listData.title);
            list.appendChild(titleDiv);

            listData.achievements.forEach(achievement => {
                const achievementDiv = createAchievement({
                    icon: achievement.icon,
                    displayName: achievement.displayName,
                    description: achievement.description,
                    achieved: achievement.achieved
                });
                list.appendChild(achievementDiv);
            });

            list.addEventListener("dragover", (e) => {
                e.preventDefault();
                handleDragOver(e, list);
            });
            list.addEventListener("drop", (e) => {
                e.preventDefault();
                handleDrop(e, list);
            });
            list.addEventListener("dragleave", clearDragFeedback);

            listsContainerElement.appendChild(list);
        });
    }
});