## ERDDAP Panel for Grafana

![screenshot](https://raw.githubusercontent.com/USF-IMARS/grafana-erddap/master/src/img/screenshot-1.png)

### Installation
1. cd to your grafana plugin dir `cd /var/lib/grafana/plugins/`
1. clone repo `git clone https://github.com/USF-IMARS/grafana-erddap --branch prod ./erddap-panel`
1. restart grafana `service grafana-server restart`
1. check if installed: `grafana-cli plugins ls | grep erddap`
### Development

Using Docker:

1. Clone the repository and `cd` to it
1. install deps `npm install .`
1. Start the "watch" task: `npm run watch`
1. Run a local Grafana instance with the development version of the plugin: `docker run -p 3000:3000 -d --name gf-dev --volume $(pwd)/dist:/var/lib/grafana/plugins/erddap-panel grafana/grafana`
1. Check the logs to see that Grafana has started up: `docker logs -f gf-dev`
1. Open Grafana at http://localhost:3000/
1. Log in with username "admin" and password "admin"
1. Create new dashboard and add the plugin

#### Sanity Checks
1. can grafana find your plugin? `sudo docker exec gf-dev grafana-cli plugins ls`
    * if no: probably malformed `plugin.json`
1. does the output in `./dist/` look right?
1. is your plugin volume mounted properly? `sudo docker exec gf-dev ls /var/lib/grafana/plugins`
1. have you tried restarting the docker container? `sudo docker restart gf-dev`

#### `prod` branch
The `prod` branch is special; it contains only the output normally in `/dist`.
Do not try to merge to this branch as you normally would.
Instead you must copy a build into it manually.
Before doing so update the version numbers & changelogs at:
* ./README.md # Changelog
* ./package.json : version
* ./src/plugin.json : version

steps:
1. build the latest master version into `./dist`
    * the `watch` task does this automatically; stop it before proceeding.
1. switch to `prod` branch: `git checkout prod`
1. merge changes from new build: `cp -R ./dist/* .`
1. use `git status` & `git add` to stage changes
1. `git commit` to the `prod` branch

#### Changelog
##### v0.5.0
- + image date to image title
- + image date table above images
- better layout of legend

##### v0.4.0
- automatic time delta using n-images setting (#2)
- fixes modified this.range side-effect
- colorbar request now uses middle of this.range
- data credit links to data request instead of graph

##### v0.3.0
- + custom color bar formatting
- color bar separated out from images
- images auto-cropped

##### v0.2.0
- + time delta to editor
- other minor panel editor improvements

##### v0.1.1
- fix bugs preventing save & use of configs

##### v0.1.0
- editor options added to config ERDDAP request(s)
- color invert replaces zoom effect on img hover
- img opens in new tab on click
- first actually working version

##### v0.0.2
- editor tab added

##### v0.0.1
- first "working" version
