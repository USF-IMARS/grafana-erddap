import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk'; // will be resolved to app/plugins/sdk
import './css/panel.base.css';
import _ from 'lodash';

class Ctrl extends MetricsPanelCtrl {
    static templateUrl = "partials/template.html";
    static MAX_IMAGES = 30;
    public constructed_urls = [] as string[];
    public _panelPath = 'undefined'
    public img_width = 100.0
    public panel: any;

    // Set and populate defaults
    panelDefaults = {
        url: "http://imars-physalis:8080/erddap",
        product_id: 'jplMURSST41anom1day',
        variable_id: 'sstAnom',
        lat_min: 23.5,
        lat_max: 26,
        lon_min: -84,
        lon_max: -79.5,
        delta: 1,
        delta_unit: 'weeks'
    };

    constructor($scope, $injector) {
        super($scope, $injector);
        _.defaults(this.panel, this.panelDefaults);
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
        this.updateTimeRange()
        const t_0 = this.range.from.utc()
        const t_f = this.range.to.utc()
        let time = t_0
        let url_list = [] as string[];
        while (time.isBefore(t_f)){
            // console.log(time)
            // TODO: check if image at url is already in url_list
            //       if it is push placeholder instead for more info
            //       see USF-IMARS/grafana-erddap#3
            url_list.push(this.get_url(time))
            // console.log(`+ ${this.panel.delta} ${this.panel.delta_unit}(s)`)
            time = time.add(this.panel.delta, this.panel.delta_unit)
            if (url_list.length > Ctrl.MAX_IMAGES){
                throw `loading too many images (> ${Ctrl.MAX_IMAGES})`
                // TODO: put this in the UI somewhere?
            }
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
        let constructed_url = this.panel.url;
        // https://coastwatch.pfeg.noaa.gov/erddap
        // http://imars-physalis.marine.usf.edu:8080/erddap

        // + path to base url (TODO from panel options)
        constructed_url += '/griddap/' + this.panel.product_id + '.largePng'

        // === + query string to url (TODO from panel options)
        constructed_url += `?${this.panel.variable_id}`

        // time
        const fmt = 'YYYY-MM-DDTHH:mm:00[Z]'; // UTC without seconds
        const time = the_moment.format(fmt)
        constructed_url += `[(${time})]`
        // lat & lon
        constructed_url += `[(${this.panel.lat_min}):(${this.panel.lat_max})]`
        constructed_url += `[(${this.panel.lon_min}):(${this.panel.lon_max})]`

        // TODO: + this.encodeData()
        constructed_url += '&' + this.encodeData({
            '.draw':'surface',
            '.vars':'longitude|latitude|' + this.panel.variable_id,
            '.colorBar':'|||||',
            '.bgColor':'0xffccccff',
        })
        return constructed_url
    }

    encodeData(data) {
        return Object.keys(data).map(function(key) {
            return [key, data[key]].map(encodeURIComponent).join("=");
        }).join("&");
    }

    onInitEditMode() {
        // this.addEditorTab('test1', 'public/app/plugins/panel/singlestat/mappings.html', 3);
        this.addEditorTab('ERDDAP Connection', this.panelPath + 'partials/editor.html', 1);
        // this.addEditorTab('Not-Yet-Implemented', this.panelPath + 'partials/nyi.html', 99);
    }

}


export { Ctrl as PanelCtrl }
