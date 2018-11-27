## Clock App Plugin for Grafana

The Clock Panel can show the current time or a countdown and updates every second.

Show the time in another office or show a countdown to an important event.

### Plugin options

#### Options

- **Mode**:

  Default is time. If countdown is chosen then set the Countdown Deadline to start the countdown.

- **12 or 24 hour**:

  Show time in the 12/24 hour format.

- **Offset from UTC**:

  This is a simple way to get the time for different time zones. Default is empty and that means local time (whatever that is on your computer). -5 would be UTC -5 (New York or central US)

- **Countdown Deadline**:

  Used in conjuction with the mode being set to countdown. Choose a date and time to count down to.

- **Countdown End Text**:

  The text to show when the countdown ends. E.g. LIFTOFF

- **Date/Time formatting options**:

  The font size, weight and date/time formatting can be customized here. If the seconds ticking annoys you then change the time format to HH:mm for the 24 hour clock or h:mm A for the 12 hour clock, or see the [full list of formatting options](https://momentjs.com/docs/#/displaying/).

- **Bg Color**:

  Choose a background color for the clock with the color picker.

#### Refresh

- **Sync**:

  The clock is paused and only updated when the dashboard refreshes - the clock will show the timestamp for the last refresh.

### Screenshots

- [Screenshot of two clocks and a countdown](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clocks.png)
- [Screenshot of the options screen](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clock-options.png)

### Development

Using Docker:

1. Clone the repository and `cd` to it
1. install deps `npm install .`
1. Start the "watch" task: `npm run watch`
1. Run a local Grafana instance with the development version of the plugin: `docker run -p 3000:3000 -d --name gf-dev --volume $(pwd)/dist:/var/lib/grafana/plugins/erddap grafana/grafana`
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
