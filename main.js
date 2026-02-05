$(document).ready(function(){
    const listsContainer = document.getElementById("listsContainer");

    let listCount = 0;
    let draggedItem = null;

    document.getElementById("exportButton").addEventListener("click", exportLists);

    document.getElementById("importButton").addEventListener("click", () => {
        document.getElementById("importFileInput").click();
    });

    document.getElementById("importFileInput").addEventListener("change", importLists);

    document.getElementById("generateLinksButton").addEventListener("click", () => {
        const outputAllAchievementsLink = document.getElementById("allAchievementsLinkOutput");
        const outputUserStatsLink = document.getElementById("userStatsLinkOutput");

        const steamid = document.getElementById("steamidInput").value.trim();
        const appid = document.getElementById("appidInput").value.trim();
        const apikey = document.getElementById("apikeyInput").value.trim();

        outputAllAchievementsLink.value = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apikey}&appid=${appid}&l=de`;
        outputUserStatsLink.value = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apikey}&steamid=${steamid}&appid=${appid}&l=en`;
    });

    document.getElementById("refreshButton").addEventListener("click", () => {
        const inputAllAchievements = document.getElementById("jsonAllAchievementsInput").value;
        const jsonUserStats = document.getElementById("jsonUserStatsInput").value;
        listsContainer.innerHTML = "";

        createList()
        const list1 = document.getElementById("list1");
        list1.innerHTML = "";
        list1.appendChild(createEditableText("Done"));

        createList()
        const list2 = document.getElementById("list2");
        list2.innerHTML = "";
        list2.appendChild(createEditableText("ToDo"));

        try {
            const data = JSON.parse(inputAllAchievements);
            const playerdata = JSON.parse(jsonUserStats);

            const simplified = createSimplifiedJSON(
                data.game?.availableGameStats?.achievements || [],
                playerdata.playerstats.achievements || []
            );
            const achievements = simplified.achievements || [];

            if (achievements.length === 0) {
                console.log("No achievements found in JSON");
                return;
            }

            achievements.forEach(achievement => {
                (achievement.achieved ? list1 : list2).appendChild(createAchievement(achievement));
            });
        } catch (error) {
            console.log("Error: " + error);
        }
    });

    document.getElementById("addListButton").addEventListener("click", () => {
        createList()
    });

    function createSimplifiedJSON(templates, playerstats) {
        const playerMap = {};
        playerstats.forEach(p => {
            playerMap[p.apiname] = { achieved: p.achieved };
        });

        return {
            achievements: templates.map(t => ({
                name: t.name,
                displayName: t.displayName,
                hidden: t.hidden,
                description: t.description,
                icon: t.icon,
                icongray: t.icongray,
                achieved: playerMap[t.name]?.achieved || 0
            }))
        };
    }

    function createEditableText(defaultText) {
        const wrapper = document.createElement("div");
        wrapper.className = "editableText";

        let isEditing = false;
        let currentText = defaultText;

        wrapper.textContent = defaultText;

        wrapper.addEventListener("click", () => {
            if (!isEditing) {
                isEditing = true;
                wrapper.classList.add("editing");

                const input = document.createElement("input");
                input.value = currentText;
                input.select();

                const save = () => {
                    currentText = input.value || defaultText;
                    wrapper.textContent = currentText;
                    wrapper.classList.remove("editing");
                    isEditing = false;
                }

                input.addEventListener("blur", _ =>{
                    save();
                });
                input.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") save();
                });

                wrapper.textContent = "";
                wrapper.appendChild(input);
                input.focus();
            }
        });

        return wrapper;
    }

    function createList() {
        const list = document.createElement("div");
        listCount++;
        list.id = `list${listCount}`;
        list.appendChild(createEditableText("New List"));
        listsContainer.appendChild(list);

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
                        <div class="name">${achievement.displayName}</div>
                        <div class="description">${achievement.description}</div>
                        <div class="status" style="color: ${achievement.achieved ? "#0F0" : "#F00"}">${status}</div>
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

        listsContainer.querySelectorAll('div[id^="list"]').forEach(list => {
            const titleElement = list.querySelector(".editableText");
            const title = titleElement ? titleElement.textContent.trim() : "Untitled";

            const achievements = [];
            list.querySelectorAll(".achievement").forEach(achievement => {
                const img = achievement.querySelector("img")
                const nameEl = achievement.querySelector(".name");
                const descriptionEl = achievement.querySelector(".description");
                const statusEl = achievement.querySelector(".status");

                achievements.push({
                    icon: img.src,
                    displayName: nameEl.textContent.trim(),
                    description: descriptionEl.textContent.trim(),
                    achieved: statusEl.textContent.includes("✅")
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
                document.getElementById("importFileInput").value = ""; // reset
            } catch (err) {
                console.log("Invalid file: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    function restoreLists(data) {
        // Clear everything
        listsContainer.innerHTML = "";
        listCount = data.listCount || 0;

        data.lists.forEach(listData => {
            const list = document.createElement("div");
            list.id = listData.id;

            // Restore editable title
            const titleDiv = createEditableText(listData.title);
            list.appendChild(titleDiv);

            // Restore achievements
            listData.achievements.forEach(achievement => {
                const achievementDiv = createAchievement({
                    icon: achievement.icon,
                    displayName: achievement.displayName,
                    description: achievement.description,
                    achieved: achievement.achieved
                });
                // DON'T auto-append - manually add to this list
                list.appendChild(achievementDiv);
            });

            // Re-attach drag/drop events
            list.addEventListener("dragover", (e) => {
                e.preventDefault();
                handleDragOver(e, list);
            });
            list.addEventListener("drop", (e) => {
                e.preventDefault();
                handleDrop(e, list);
            });
            list.addEventListener("dragleave", clearDragFeedback);

            listsContainer.appendChild(list);
        });
    }
});