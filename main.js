$(document).ready(function(){
    const buttonRefresh = document.getElementById('refreshBtn');
    const buttonGenerateLink = document.getElementById('generateLinks');

    buttonGenerateLink.addEventListener('click', () => {
        const output1 = document.getElementById('output1');
        const output2 = document.getElementById('output2');


        const steamid = document.getElementById('steamid').value.trim();
        const appid = document.getElementById('appid').value.trim();
        const apikey = document.getElementById('apikey').value.trim();

        output1.value = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apikey}&steamid=${steamid}&appid=${appid}&l=en`;
        output2.value = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apikey}&appid=${appid}&l=de`;
    });

    buttonRefresh.addEventListener('click', async (e) => {
        e.preventDefault();

        const steamid = document.getElementById('steamid').value.trim();
        const appid = document.getElementById('appid').value.trim();
        const apikey = document.getElementById('apikey').value.trim();

        const statusDiv = document.getElementById('status');
        const listDiv = document.getElementById('list');

        if (!steamid || !appid || !apikey) return;

        statusDiv.textContent = 'Lade Achievements...';
        listDiv.innerHTML = '';

        try {
            const res = await fetch(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${encodeURIComponent(apikey)}&steamid=${encodeURIComponent(steamid)}&appid=${encodeURIComponent(appid)}&l=en`);
            const data = await res.json();
            console.log(data);

            if (!res.ok) {
                statusDiv.textContent = data.error || 'Fehler beim Laden.';
                return;
            }

            lastData = data.achievements || [];
            statusDiv.textContent = `Gefundene Achievements: ${lastData.length}`;
            renderList();
        } catch (err) {
            console.error(err);
            statusDiv.textContent = 'Fehler bei der Anfrage.';
        }
    });


    const onlyMissingCheckbox = document.getElementById('onlyMissing');
    onlyMissingCheckbox.addEventListener('change', renderList);
})

let lastData = [];

function renderList() {
    listDiv.innerHTML = '';
    const onlyMissing = onlyMissingCheckbox.checked;

    const achievements = lastData.filter(a => {
        if (onlyMissing) return !a.achieved;
        return true;
    });

    achievements.forEach(a => {
        const div = document.createElement('div');
        div.className = 'achievement ' + (a.achieved ? 'achieved' : 'locked');

        const iconUrl = a.achieved ? a.icon : a.icongray;

        if (iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.className = 'icon';
            img.alt = 'icon';
            div.appendChild(img);
        }

        const textDiv = document.createElement('div');
        const title = document.createElement('div');
        title.textContent = a.title || a.apiName;

        const desc = document.createElement('div');
        desc.textContent = a.description || '';

        const state = document.createElement('div');
        state.textContent = a.achieved ? 'Erreicht' : 'Nicht erreicht';

        textDiv.appendChild(title);
        textDiv.appendChild(desc);
        textDiv.appendChild(state);

        div.appendChild(textDiv);
        listDiv.appendChild(div);
    });
}