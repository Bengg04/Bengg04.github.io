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
        const input2 = document.getElementById("jsonUserStats").value;
        
        const container = document.getElementById("list");
        container.innerHTML = '';

        try {
            const data = JSON.parse(inputAllAchievements);
            const achievements = data.game?.availableGameStats?.achievements || [];

            if (achievements.length === 0) {
                container.innerHTML = '<div style="color: orange; padding: 20px;">No achievements found in JSON</div>';
                return;
            }

            container.innerHTML = '';

            achievements.forEach(achievement => {
                const div = document.createElement('div');
                div.className = `achievement_${achievement.name}`;

                const status = achievement.achieved ? '✅ Erreicht' : '🔒 Nicht erreicht';

                div.innerHTML = `
                <img src="${achievement.icon}" 
                     alt="${achievement.displayName}" 
                     class="achievement-icon"
                <div class="content">
                    <div class="name">${achievement.displayName}</div>
                    <div class="status ${achievement.achieved ? 'unlocked' : 'locked-status'}">${status}</div>
                    <div class="description">${achievement.description}</div>
                </div>
            `;

                container.appendChild(div);
            });
        } catch (error) {
            container.innerHTML = `<div style="color: red; padding: 20px;">❌ Fehler: Ungültiges JSON. Bitte überprüfe deinen Input.<br><small>${error.message}</small></div>`;
        }
    });
});