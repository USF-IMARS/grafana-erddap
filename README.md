## ERDDAP Panel for Grafana

### Development

Using Docker:

1. Clone the repository and `cd` to it
1. install deps `npm install .`
1. Start the "watch" task: `npm run watch`
1. Run a local Grafana instance with the development version of the plugin: `docker run -p 3000:3000 -d --name gf-dev --volume $(pwd)/dist:/var/lib/grafana/plugins/erddap-panel grafana/grafana`
1. Check the logs to see that Grafana has started up: `docker logs -f df-dev`
1. Open Grafana at http://localhost:3000/
1. Log in with username "admin" and password "admin"
1. Create new dashboard and add the plugin

#### Sanity Checks
1. can grafana find your plugin? `sudo docker exec gf-dev grafana-cli plugins ls`
    * if no: probably malformed `plugin.json`
1. does the output in `./dist/` look right?
1. is your plugin volume mounted properly? `sudo docker exec gf-dev ls /var/lib/grafana/plugins`
1. have you tried restarting the docker container? `sudo docker restart gf-dev`

#### Changelog

##### v0.0.1

- first "working" version
