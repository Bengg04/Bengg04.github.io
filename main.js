$(document).ready(function(){
    const buttonRefresh = document.getElementById("refreshBtn");
    const buttonGenerateLink = document.getElementById("generateLinks");

    buttonGenerateLink.addEventListener("click", () => {
        const output1 = document.getElementById("output1");
        const output2 = document.getElementById("output2");


        const steamid = document.getElementById("steamid").value.trim();
        const appid = document.getElementById("appid").value.trim();
        const apikey = document.getElementById("apikey").value.trim();

        output1.value = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apikey}&steamid=${steamid}&appid=${appid}&l=en`;
        output2.value = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apikey}&appid=${appid}&l=de`;
    });

    buttonRefresh.addEventListener("click", () => {
        const input1 = document.getElementById("jsonInput1").value;
        const input2 = document.getElementById("jsonInput2").value;
        
        const container = document.getElementById("list");
        container.innerHTML = '';

        try {
            const data = JSON.parse(input1);
            const achievements = data.playerstats.achievements;

            achievements.forEach(achievement => {
                const div = document.createElement('div');
                div.className = `achievement ${achievement.achieved ? 'achieved' : 'locked'}`;

                const status = achievement.achieved ? '✅ Achieved' : '🔒 Locked';
                const date = achievement.unlocktime && achievement.unlocktime > 0
                    ? new Date(achievement.unlocktime * 1000).toLocaleDateString()
                    : 'N/A';

                div.innerHTML = `
                <div class="name">${achievement.name}</div>
                <div class="status ${achievement.achieved ? 'unlocked' : 'locked-status'}">${status}</div>
                <div class="description">${achievement.description}</div>
                ${date !== 'N/A' ? `<div class="date">Unlocked: ${date}</div>` : ''}
            `;

                container.appendChild(div);
            });

        } catch (error) {
            container.innerHTML = `<div style="color: red; padding: 20px;">Error: Invalid JSON. Please check your input.</div>`;
        }
    });
});