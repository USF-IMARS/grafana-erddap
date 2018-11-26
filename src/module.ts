import {ExampleAppDatasource} from  './datasource';

class ExampleAppConfigCtrl {
    // template = '<datasource-http-settings current="ctrl.current"></datasource-http-settings>';
    static templateUrl = "partials/options.html";
}

export {
  ExampleAppDatasource,
  ExampleAppConfigCtrl as ConfigCtrl
};
