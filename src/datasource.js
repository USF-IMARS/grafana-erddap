export default class ExampleAppDatasource {

  constructor() {}

  query(options) {
    console.log(options);
    return [];
  }

  testDatasource() {
    return false;
  }
}
