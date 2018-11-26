import {StreamPageCtrl} from './components/stream';
import {ExampleAppConfigCtrl} from './components/config';

import {PanelCtrl} from './panel/module';
import {ExampleAppDatasource} from './datasource/module';

export {
  ExampleAppConfigCtrl as ConfigCtrl,
  StreamPageCtrl, //Matches pages.component in plugin.json
  PanelCtrl,
  ExampleAppDatasource as DatasourceCtrl,
};
