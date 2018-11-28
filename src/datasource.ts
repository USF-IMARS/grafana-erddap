// import kbn from 'app/core/utils/kbn';
import kbn from 'grafana/app/core/utils/kbn';
import moment from 'moment';


export default class ERDDAPDatasource {
    id: number;
    name: string;

    public url: string = 'http://imars-physalis.marine.usf.edu:8080/erddap';

    // Switch IV to DV when the interval is large
    // maxIVinterval:3000000;
    maxIVinterval = 8000000;

    /** @ngInject */
    constructor(instanceSettings, private $q, private backendSrv) {
        console.log("settings:", instanceSettings)
        console.log("$q: ", this.$q)
        console.log("backSrv:", backendSrv)

        this.id = instanceSettings.id;
        this.name = instanceSettings.name;

        const jsonData = instanceSettings.jsonData || {};

        this.maxIVinterval = kbn.interval_to_ms(jsonData.jsonData || '3h');
        //console.log('Set max interval to:', this.maxIVinterval);
    }

    query(options) {
        console.log('ERDDAP query options:')
        console.log(options);
        // return this.$q.reject({message: 'TEST FAIL'})
        let constructed_url = this.url;
        // https://coastwatch.pfeg.noaa.gov/erddap
        // http://imars-physalis.marine.usf.edu:8080/erddap

        // + path to base url (TODO from panel options)
        const product_id = 'jplMURSST41anom1day'
        constructed_url += '/griddap/' + product_id + '.json?'

        // === + query string to url (TODO from panel options)
        const var_name = 'sstAnom'
        constructed_url += var_name

        let time_lat_lon_indicies = ''
        // time
        const fmt = 'YYYY-MM-DDTHH:mm:00[Z]'; // UTC without seconds
        const t_0 = options.range.from.utc().format(fmt);
        const t_f = options.range.to.utc().format(fmt);
        time_lat_lon_indicies += '[(' + t_0 + '):1:(' + t_f + ')]'
        // lat & lon
        const lat_min = -24
        const lat_max = -23
        time_lat_lon_indicies += '[(' + lat_min + '):1:(' + lat_max + ')]'
        const lon_min = 178
        const lon_max = 180
        time_lat_lon_indicies += '[(' + lon_min + '):1:(' + lon_max + ')]'

        constructed_url += time_lat_lon_indicies //+ ',mask' + time_lat_lon_indicies
        return this.backendSrv
          .datasourceRequest({
            url: constructed_url,
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
          })
          .then(result => {
              console.log('result data:', result.data)
              // const lines = result.data.split('\n');
              // const info = this.readRDB(lines, true, args.show, tooBigForIV);
              // return {data: info.series};
          });
    }

    testDatasource() {
        // test query options
        let options = {
            range: {
                from: moment().subtract(90, 'd'),
                to: moment().subtract(88, 'd'),
            },
            rangeRaw: {
                // to: 'now',
            },
            targets: [
                {
                    query: '&sites=01646500&service=iv&parameterCd=00010',
                },
            ],
        };

        console.log("ERDDAP TEST");

        return this.query(options)
        .then(rsp => {
            return {status: 'success', message: 'Data source is working', title: 'Success'};
        })
        .catch(ex => {
            console.log('Error Testing USGS', ex);
            let msg = ex;
            if (ex.message) {
                msg = ex.message;
            }
            return {status: 'error', message: msg};
        });
    }
}
