$(document).ready(function(){
    const buttonRefresh = document.getElementById("refreshBtn");
    const buttonGenerateLink = document.getElementById("generateLinks");

    buttonGenerateLink.addEventListener("click", () => {
        const outputAllAchievementsLink = document.getElementById("outputAllAchievementsLink");
        const outputUserStatsLink = document.getElementById("outputUserStatsLink");


        const steamid = document.getElementById("steamid").value.trim();
        const appid = document.getElementById("appid").value.trim();
        const apikey = document.getElementById("apikey").value.trim();

        outputAllAchievementsLink.value = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apikey}&appid=${appid}&l=de`;
        outputUserStatsLink.value = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apikey}&steamid=${steamid}&appid=${appid}&l=en`;
    });

    buttonRefresh.addEventListener("click", () => {
        const inputAllAchievements = document.getElementById("jsonAllAchievements").value;
        const jsonUserStats = document.getElementById("jsonUserStats").value;
        
        const container1 = document.getElementById("list1");
        const container2 = document.getElementById("list2");
        container1.innerHTML = '';
        container2.innerHTML = '';

        try {
            const data = JSON.parse(inputAllAchievements);
            const playerdata = JSON.parse(jsonUserStats);

            const simplified = createSimplifiedJSON(
                data.game?.availableGameStats?.achievements || [],
                playerdata.playerstats.achievements || []
            );
            const achievements = simplified.achievements || [];

            if (achievements.length === 0) {
                container1.innerHTML = '<div style="color: orange; padding: 20px;">No achievements found in JSON</div>';
                return;
            }

            achievements.forEach(achievement => {
                const div = document.createElement('div');
                div.className = "achievement";

                const status = achievement.achieved ? '✅ Unlocked' : '🔒 Locked';

                div.innerHTML = `
                    <img src="${achievement.achieved ? achievement.icon : achievement.icongray}" 
                         alt="${achievement.displayName}" 
                         class="achievement-icon" />
                    <div class="achievement-content">
                        <div class="name">${achievement.displayName}</div>
                        <div class="description">${achievement.description}</div>
                        <div class="status" style="color: ${achievement.achieved ? "#0F0" : "#F00"}">${status}</div>
                    </div>
                `;

                if (achievement.achieved) {
                    container1.appendChild(div);
                } else {
                    container2.appendChild(div);
                }
            });
        } catch (error) {
            container1.innerHTML = `<div style="color: red; padding: 20px;">❌ Fehler: Ungültiges JSON. Bitte überprüfe deinen Input.<br><small>${error.message}</small></div>`;
        }
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
});