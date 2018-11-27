import ERDDAPDatasource from  './datasource';

class ExampleAppConfigCtrl {
    // template = '<datasource-http-settings current="ctrl.current"></datasource-http-settings>';
    static templateUrl = "partials/options.html";
}

export {
  ERDDAPDatasource as Datasource,
  ExampleAppConfigCtrl as ConfigCtrl
};
