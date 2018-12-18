import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk'; // will be resolved to app/plugins/sdk
import './css/panel.base.css';

class Ctrl extends MetricsPanelCtrl {
    static templateUrl = "partials/template.html";
    public url = ""
    public constructed_urls = [] as string[];
    public _panelPath = 'undefined'
    public img_width = 100.0

    constructor($scope, $injector) {
        super($scope, $injector);
        this.events.on('refresh', this.build_urls.bind(this));
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    }

    link(scope, element) {
        this.initStyles();
    }

    initStyles() {
        // (window as any).System.import(this.panelPath + 'css/panel.base.css!');
        // Remove next lines if you don't need separate styles for light and dark themes
        // if (grafanaBootData.user.lightTheme) {
        //     window.System.import(this.panelPath + 'css/panel.light.css!');
        // } else {
        //     window.System.import(this.panelPath + 'css/panel.dark.css!');
        // }
        // Remove up to here
    }

    get panelPath() {
        if (this._panelPath === 'undefined') {
            this._panelPath = `/public/plugins/${this.pluginId}/`;
        }
        return this._panelPath;
    }

    build_urls(){
        this.url = 'http://imars-physalis:8080/erddap';
        this.updateTimeRange()
        const t_0 = this.range.from.utc()
        const t_f = this.range.to.utc()
        const delta = 1
        let time = t_0
        let url_list = [] as string[];
        while (time.isBefore(t_f)){
            // console.log(time)
            url_list.push(this.get_url(time))
            time = time.add(delta, 'days')
        }
        this.constructed_urls = url_list
        // console.log('urls:', this.constructed_urls)
        const n_images = this.constructed_urls.length
        this.img_width = Math.floor(1.0 / n_images * 100.0)
        this.$scope.constructed_urls = url_list
        this.$scope.img_width = this.img_width
    }

    get_url(the_moment){
        // const t_0 = this.range.from.utc().format(fmt);
        // const t_f = this.range.to.utc().format(fmt);
        let constructed_url = this.url;
        // https://coastwatch.pfeg.noaa.gov/erddap
        // http://imars-physalis.marine.usf.edu:8080/erddap

        // + path to base url (TODO from panel options)
        const product_id = 'jplMURSST41anom1day'
        constructed_url += '/griddap/' + product_id + '.largePng?'

        // === + query string to url (TODO from panel options)
        const var_name = 'sstAnom'
        constructed_url += var_name

        let time_lat_lon_indicies = ''
        // time
        const fmt = 'YYYY-MM-DDTHH:mm:00[Z]'; // UTC without seconds
        const time = the_moment.format(fmt)
        time_lat_lon_indicies += '[(' + time + ')]'
        // lat & lon
        const lat_min = 23.5
        const lat_max = 27
        time_lat_lon_indicies += '[(' + lat_min + '):(' + lat_max + ')]'
        const lon_min = -83
        const lon_max = -80
        time_lat_lon_indicies += '[(' + lon_min + '):(' + lon_max + ')]'
        constructed_url += time_lat_lon_indicies //+ ',mask' + time_lat_lon_indicies
        constructed_url += '&.draw=surface&.vars=longitude%7Clatitude%7CsstAnom&.colorBar=%7C%7C%7C%7C%7C&.bgColor=0xffccccff'
        return constructed_url
    }

    onInitEditMode() {
        // this.addEditorTab('test1', 'public/app/plugins/panel/singlestat/mappings.html', 3);
        this.addEditorTab('ERDDAP Server', this.panelPath + 'partials/editor.html', 1);
        // this.addEditorTab('Not-Yet-Implemented', this.panelPath + 'partials/nyi.html', 99);
    }

}


export { Ctrl as PanelCtrl }
