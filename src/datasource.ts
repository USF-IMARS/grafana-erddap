// import kbn from 'app/core/utils/kbn';
import kbn from 'grafana/app/core/utils/kbn';
import moment from 'moment';


export default class ERDDAPDatasource {
    id: number;
    name: string;

    public url: string = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41anom1day.graph';

    // Switch IV to DV when the interval is large
    // maxIVinterval:3000000;
    maxIVinterval = 8000000;

    /** @ngInject */
    constructor(instanceSettings, private $q, private backendSrv) {
        console.log(instanceSettings, $q, backendSrv);

        this.id = instanceSettings.id;
        this.name = instanceSettings.name;

        const jsonData = instanceSettings.jsonData || {};

        this.maxIVinterval = kbn.interval_to_ms(jsonData.jsonData || '3h');
        //console.log('Set max interval to:', this.maxIVinterval);
    }

    query(options) {
        console.log(options);

        if (true){
            return this.$q.reject({message: 'TEST FAIL'})
        } else {
            return this.backendSrv
              .datasourceRequest({
                url: this.url,
                method: 'GET',
              })
              .then(result => {
              });
        }
    }

    testDatasource() {
        let options = {
            range: {
                from: moment().add(-4, 'h'),
            },
            rangeRaw: {
                to: 'now',
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
