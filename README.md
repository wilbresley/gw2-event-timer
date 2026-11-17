# Gw2 Event Timer

[![Português](https://img.shields.io/badge/Leia%20em-Portugu%C3%AAs-2ea44f?style=for-the-badge)](README.pt-BR.md)

Version 1.0.1.

A browser page for Guild Wars 2 world bosses and meta events, with an optional account panel. The clock is the clock of the device looking at the page. There is no database, no site login, and no build step.

The container only serves the files in `site`. After those files have loaded, the page is a local tool on that person's computer. It does not send events, favorites, alerts, or the API key to the machine that delivered the page, and it does not phone home.

The event timer reads `site/data.js` and saves favorites, alerts, and completed marks in the browser. It makes no network request of its own. The account panel, only if someone pastes a key, calls `https://api.guildwars2.com` directly from that browser. Item icons and wiki links opened from the panel also come from ArenaNet, not from this project. The same boundary is written at the top of `site/index.html`, `site/app.js`, and `site/account.js`.

Copying the `site` folder is enough to keep using the timer with no server at all: open `index.html` from that folder, or serve the folder with any static file server. A browser "save complete page" is less reliable, because browsers rewrite paths and can leave a file out. The account panel still needs that person's internet connection to ArenaNet. Removing the original host does not stop a copy that already has the files.

Anyone can clone and use this project. If you reuse it, publish a fork, or take it as the base of another tool, please mention this project as the inspiration or as the fork it came from.

If the timer helped, you can send a gift in Guild Wars 2 to **Bresleywil.2384**, or buy a coffee.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?style=for-the-badge)](https://github.com/sponsors/wilbresley)

**Pix, for Brazil.** Scan the code in your bank app and choose the amount. The block under the code has GitHub's copy button.

![Pix QR code](site/assets/pix-qr.png)

```text
a8d44088-1b08-465d-aac1-29ca42014692
```

## What you need

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://docs.docker.com/get-docker/) on Windows or macOS, or Docker Engine plus the Compose plugin on Linux

Docker has to be running before the commands below. On Windows, open Docker Desktop and wait until it is ready.

## Run it on your computer

Copy and paste, one block at a time.

```bash
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
```

Open [http://localhost:8094](http://localhost:8094).

The same result comes from a shortcut, already inside the project folder:

- Windows, in PowerShell: `.\start.ps1`
- Linux and macOS: `chmod +x start.sh && ./start.sh`

To check that it is up:

```bash
docker compose ps
```

The state column should show the container running. Its name is `gw2-event-timer`.

To stop it, without deleting the folder:

```bash
docker compose down
```

To start it again after stopping:

```bash
docker compose up -d
```

## Change the port

`docker-compose.yml` publishes port 8094 of the machine on port 80 inside the container:

```yaml
ports:
  - "8094:80"
```

If 8094 is already taken, change only the number on the left. For example, to use 8080:

```yaml
ports:
  - "8080:80"
```

Save the file and run:

```bash
docker compose up -d
```

The page then opens at `http://localhost:8080`. The number on the right, `80`, stays as it is.

## Update a copy that is already running

Go into the project folder and pull the new version. The page files are mounted straight from the folder, so there is no image to build.

```bash
cd gw2-event-timer
git pull
docker compose up -d
```

Reload the browser. The address stays the same.

If `git pull` says the history was rewritten, do not force anything unless you know what that replaces. The safe path is to keep the current folder under another name and clone again:

```bash
cd ..
mv gw2-event-timer gw2-event-timer-old
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
```

On Windows, in PowerShell, `mv` renames the folder too.

## Run it on a Debian server

These steps are for a clean Debian machine with administrator access. Change the user and the path if the machine already has a layout. The commands below use `sudo` when the task needs root.

### 1. Install Git and Docker

```bash
sudo apt update
sudo apt install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
```

Leave the session and come back, so the `docker` group applies. Check:

```bash
docker version
docker compose version
```

Both commands need to print a version number, with no permission error.

### 2. Download the project and start it

```bash
git clone https://github.com/wilbresley/gw2-event-timer.git
cd gw2-event-timer
docker compose up -d
docker compose ps
```

On the server itself:

```text
http://SERVER-IP:8094
```

From another computer on the same network, use that machine's IP instead of `localhost`.

If the server has a firewall, open only the port you chose:

```bash
sudo apt install -y ufw
sudo ufw allow 8094/tcp
sudo ufw status
```

Do not run `ufw enable` until SSH is allowed. Without port 22 open, the remote session drops.

### 3. Put a proxy in front, if you want a domain

The container already answers HTTP on the published port. A proxy in front, Nginx or Caddy, can terminate HTTPS and forward to `127.0.0.1:8094`. This repository does not ship a certificate or a domain. Minimal host Nginx site, without TLS:

```nginx
server {
    listen 80;
    server_name timer.example.com;

    location / {
        proxy_pass http://127.0.0.1:8094;
    }
}
```

Replace `timer.example.com` with the name that points at that server. TLS stays with the proxy you already use.

### 4. Update the server

```bash
cd gw2-event-timer
git pull
docker compose up -d
```

`restart: unless-stopped` in Compose starts the container again when the machine reboots, as long as the Docker service also starts with the system.

## What the page does

The header stays put. The list scrolls. The header has the name, the device clock, the time zone, search, sound, the account button, and a GitHub button that opens this repository. When a key is saved in this browser, a dot to the left of **Account** shows the last account read: solid green when it worked, blinking blue while it updates, solid red when nothing was updated, and solid yellow when only part of it worked.

The queues are Active, Next 10 min, Done, Favorites, and Alerts. The content filters are Main, Bosses, Metas, and the regions: Core Tyria, Heart of Thorns, Path of Fire, Icebrood Saga, End of Dragons, Secrets of the Obscure, Janthir Wilds, and Visions of Eternity. More than one can be selected. Name search applies on top.

On each event:

- **Copy teleport** copies the chat code. The browser does not move the character.
- The star saves a favorite.
- The bell turns on the alert for that event.
- The "I did this" mark clears at the game reset, midnight UTC. Favorites and alerts stay.

The reset is shown in the footer in the device time zone. There is no time-zone picker. With the system clock set to automatic, the page already shows local time.

Some metas warn early, so there is time to find a map. That lead time is a player estimate, not an official pre-event:

| Event | Warning |
| --- | --- |
| Chak Gerent | 20 minutes before |
| Octovine | 15 minutes before |
| Dragon's Stand | 15 minutes before the map reset |

With the bell on and the page sound on, the warning plays even when the tab is in the background. The browser only allows audio after the first tap on the page. The files are in `site/assets/sounds/`:

| Moment | File |
| --- | --- |
| Prepare | `prep.mp3` |
| In 10 min | `soon.mp3` |
| Started | `start.mp3` |

Warnings of the same kind share one screen. Different kinds queue: started first, then the 10-minute ones, then prepare.

The window width changes how many columns the list uses: 1 up to 1199 px, 2 from 1200, 3 from 1900, 4 from 2560, 5 from 3440, and 6 from 3840.

## Account panel

**Account** opens a panel in the same browser. The person pastes a key created at [account.arena.net/applications](https://account.arena.net/applications). The key stays in `localStorage`, on this site, in this browser. Another browser or another computer asks for the key again. **Forget Account** deletes the key from this browser.

Requests go from that person's browser straight to `https://api.guildwars2.com`. This container does not proxy those calls and does not keep the key. Icons from `render.guildwars2.com` do not count toward the API request budget.

The menus, in this order, are Summary, Legendary, Ascended, Inventory, Characters, Tools, Bosses, Wallet, Unlocks, Action House, PvP, WvW, Progress, and Guilds. The panel shows what the API returns and redraws the open menu when a read finishes. A page reload is not required.

To the left of **Forget Account** there are four buttons:

- **Clear this menu's filters** clears the filters of the open menu. On Characters, it returns to the first character in the list, build 1, and equipment 1.
- **Clear filters on all menus** clears the filters of every menu, with the same Characters reset.
- **Update this menu from the API** reads the open menu again.
- **Update all menus from the API** reads the account again. That button waits 60 seconds between uses.

**Legendary** sits above Ascended and lists what the account has at Legendary rarity. The filters are All, Weapons, Armor, Accessories, Relics, and Items. A subfilter appears only inside its own category. Light, Medium, or Heavy weight combines only with an armor piece.

**Ascended** has Weapons, Armor, Accessories, and Items. There is no ascended relic filter, because that rarity does not exist, and there is no materials filter. Weight appears only when Armor is selected. The weapon filters, here and on Legendary, include longbow and shortbow. The API records those types as LongBow and ShortBow; the page treats both spellings as the same bow, so an ascended or legendary bow is not left out of the filter.

**Inventory** separates Bank, Shared Slot, Materials, and each character. Each bank tab is a grid of 10 columns by 3 rows. Grouped bank mode is also 10 columns. Shared inventory is always 10 columns and shows the number of slots the API returns, without padding past that. Materials follow the official API categories, in the official order, and list what is stored. An empty category stays in the list. The API does not report the unlocked material storage size, so the page does not invent that number. The column stepper changes character bags only. Each character name in that filter uses the profession color.

**Characters** shows weapon skills 1 to 5 of the equipped weapons, plus heal, utilities, and elite. There are no F1 to F5 skills. On an elementalist, each element shows that element's skill on the equipped weapon. On a ranger, only the equipped pets appear. On a revenant, each equipped legend has its own heal and utility bar, drawn beside a weapon line only so the rows line up. The weapon does not choose those skills.

**Tools** separates infinite and limited gathering tools. One infinite tool of each type can be tracked, and **Clear tracked tools** removes that tracking from the header. Between the infinite tools and the limited tools, only gathering-tool glyphs appear, loose or socketed in a tool. Runes, sigils, and other upgrades are not listed. Clicking a glyph opens where it is.

**Bosses** marks what the account has already done. A boss that also exists on the timer has **Copy teleport**, with the same chat code as the event.

**Guilds** shows the name, the level, and the member count.

The page does not calculate combat attributes. If the API does not send a number, the panel does not invent one.

The browser keeps a local IndexedDB cache so catalogs that change rarely, such as items, skins, and recipes, are not downloaded again. The first open of a large account takes longer. Later opens use what was already saved in that browser.

There is a ceiling of 600 requests per minute in the browser itself, to stay inside ArenaNet's public limit. The account updates on its own every 10 minutes, tools every 5 minutes, and account bosses every hour. If ArenaNet's API does not answer, the panel closes and the event timer keeps running.

## How the time is calculated

The fixed cycles are in `site/data.js`. The count starts at midnight UTC, on the same basis as the public wiki table, and the browser shows that instant in the device time zone.

The schedule does not update itself. If a fixed time changes in the game, `site/data.js` has to be updated and the page published again. Drizzlewood Coast is not included: that map has no fixed time in this table.

Nothing from the timer is sent to a server beyond the page itself. Favorites, alerts, and completed marks stay in the browser's local storage.

## File map

| File | Role |
| --- | --- |
| `docker-compose.yml` | Starts Nginx and publishes port 8094 |
| `nginx.conf` | Serves the page and asks the browser not to keep a stale copy |
| `start.ps1`, `start.sh` | Shortcut for `docker compose up -d` |
| `VERSION` | This version number: 1.0.1 |
| `README.md` | This documentation |
| `README.pt-BR.md` | The same documentation in Portuguese |
| `site/` | HTML, CSS, JavaScript, and the schedule |
| `site/index.html` | Page shell |
| `site/app.js` | Timer, filters, favorites, alerts, and sound |
| `site/app.css` | Timer look and the account status dot |
| `site/data.js` | Fixed times and teleport codes |
| `site/account.js` | Account panel |
| `site/account.css` | Account panel look |
| `site/assets/` | Page icon, shared-inventory icon, and the sounds |

The image used is `nginx:1.27-alpine`. It is not built in this repository. Compose only mounts `site` at `/usr/share/nginx/html` and `nginx.conf` at `/etc/nginx/conf.d/default.conf`, both read-only.

## When something does not open

**The page does not load.** Check that Docker is open and the container is up:

```bash
docker compose ps
docker compose logs
```

**The port is taken.** The log says `address already in use`. Change the number on the left in `docker-compose.yml`, as in the port section, and run `docker compose up -d` again.

**A phone on the same network cannot open `localhost`.** `localhost` is the machine itself. On the phone, use the IP of the computer where Docker is running, with the same port. Example: `http://192.168.0.20:8094`.

**The account does not load and an API warning appears.** ArenaNet may be in maintenance. The event timer does not depend on that API and keeps running. Try the panel again later.

**A key was pasted and nothing changes.** The key needs the account permissions the panel reads, such as account, characters, inventories, and unlocks. A key without a permission comes back empty or with an error in that section. **Forget Account** clears the wrong key so another one can be pasted.

**The files were updated and the browser shows the old version.** Reload the page. Nginx sends `Cache-Control: no-cache`. If it still looks old, force-reload the browser.
