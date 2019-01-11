import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk'; // will be resolved to app/plugins/sdk
import './css/panel.base.css';
import _ from 'lodash';
import moment from 'moment';

class Ctrl extends MetricsPanelCtrl {
    static templateUrl = "partials/template.html";
    static MAX_IMAGES = 30;

    public constructed_urls = [] as string[];
    public legend_url:string;
    public _panelPath:string = 'undefined';
    public img_width:number = 100.0;
    public panel:any;

    // Set and populate defaults
    public panelDefaults = {
        url: "http://imars-physalis:8080/erddap",
        product_id: 'jplMURSST41anom1day',
        variable_id: 'sstAnom',
        lat_min: 23.5,
        lat_max: 26,
        lon_min: -84,
        lon_max: -79.5,
        delta: 1,
        delta_unit: 'weeks',
        color_bar_str: '|||||',
        bg_color: '0xffccccff',
        n_images: 7
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

    fill_image_urls(){
        // Fills this.range to create image URLs at interval defined by
        // this.panel.delta & this.panel.delta_unit
        const t_0 = this.range.from.utc()
        const t_f = this.range.to.utc()
        let time = moment(t_0)
        this.constructed_urls = [] as string[];
        while (time.isBefore(t_f)){
            // console.log(time)
            // TODO: check if image at url is already in url_list
            //       if it is push placeholder instead for more info
            //       see USF-IMARS/grafana-erddap#3
            this.constructed_urls.push(this.get_url(time))
            // console.log(`+ ${this.panel.delta} ${this.panel.delta_unit}(s)`)
            time = time.add(this.panel.delta, this.panel.delta_unit)
            if (this.constructed_urls.length > Ctrl.MAX_IMAGES){
                throw `loading too many images (> ${Ctrl.MAX_IMAGES})`
                // TODO: put this in the UI somewhere?
            }
        }
    }

    build_urls(){
        this.updateTimeRange()
        this.build_legend_url()

        const t_0 = this.range.from.utc()
        const t_f = this.range.to.utc()

        // compute diff in ms
        var diffInMs = Math.abs(t_0.diff(t_f));
        // time delta in ms
        var delta_ms = diffInMs / this.panel.n_images;
        this.panel.delta = delta_ms
        this.panel.delta_unit = 'ms'

        this.fill_image_urls()

        // console.log('urls:', this.constructed_urls)
        this.img_width = Math.floor(1.0 / this.panel.n_images * 100.0)
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
        const time = this.erddap_fmt_momentjs(the_moment)
        constructed_url += `[(${time})]`
        // lat & lon
        constructed_url += `[(${this.panel.lat_min}):(${this.panel.lat_max})]`
        constructed_url += `[(${this.panel.lon_min}):(${this.panel.lon_max})]`

        // TODO: + this.encodeData()
        constructed_url += '&' + this.encodeData({
            '.draw':'surface',
            '.vars':'longitude|latitude|' + this.panel.variable_id,
            '.colorBar': this.panel.color_bar_str,
            '.bgColor': this.panel.bg_color,
            '.trim': '1',
            '.legend': 'Off',
        })
        return constructed_url
    }

    erddap_fmt_momentjs(the_moment){
        // convert moment.js moment into ERDDAP time string
        const fmt = 'YYYY-MM-DDTHH:mm:00[Z]'; // UTC without seconds
        return the_moment.format(fmt)
    }

    build_legend_url(){
        // use middle of time range to reduce chance of OoBounds errors
        const t_0 = this.range.from.utc();
        const t_f = this.range.to.utc()
        var diff = Math.abs(t_0.diff(t_f));
        diff = diff/2;
        var the_moment = moment(t_0);
        the_moment.add(diff, 'ms');

        let constructed_url = this.panel.url;
        // https://coastwatch.pfeg.noaa.gov/erddap
        // http://imars-physalis.marine.usf.edu:8080/erddap

        // + path to base url (TODO from panel options)
        constructed_url += '/griddap/' + this.panel.product_id + '.largePng'

        // === + query string to url (TODO from panel options)
        constructed_url += `?${this.panel.variable_id}`

        // time
        const time = this.erddap_fmt_momentjs(the_moment)
        constructed_url += `[(${time})]`
        // lat & lon
        constructed_url += `[(${this.panel.lat_min}):(${this.panel.lat_max})]`
        constructed_url += `[(${this.panel.lon_min}):(${this.panel.lon_max})]`

        // TODO: + this.encodeData()
        constructed_url += '&' + this.encodeData({
            '.draw':'surface',
            '.vars':'longitude|latitude|' + this.panel.variable_id,
            '.colorBar': this.panel.color_bar_str,
            '.bgColor': this.panel.bg_color,
            '.trim': '0',
            '.legend': 'Only',
        })
        this.legend_url = constructed_url
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
