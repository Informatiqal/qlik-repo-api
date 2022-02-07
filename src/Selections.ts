import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassSelection, Selection } from "./Selection";

export type TSelectionAreas =
  | "app"
  | "app/content"
  | "app/datasegment"
  | "app/internal"
  | "app/object"
  | "appcontentquota"
  | "appseedinfo"
  | "appstatus"
  | "binarydelete"
  | "binarydownload"
  | "binarysyncruleevaluation"
  | "compositeevent"
  | "compositeeventoperational"
  | "compositeeventruleoperational"
  | "contentlibrary"
  | "custompropertydefinition"
  | "dataconnection"
  | "engineservice"
  | "executionresult"
  | "executionresult/detail"
  | "executionsession"
  | "extension"
  | "externalprogramtask"
  | "externalprogramtaskoperational"
  | "fileextension"
  | "fileextensionwhitelist"
  | "filereference"
  | "license/analyzeraccessgroup"
  | "license/analyzeraccesstype"
  | "license/analyzeraccessusage"
  | "license/analyzertimeaccesstype"
  | "license/analyzertimeaccessusage"
  | "license/loginaccesstype"
  | "license/loginaccessusage"
  | "license/professionalaccessgroup"
  | "license/professionalaccesstype"
  | "license/professionalaccessusage"
  | "license/useraccessgroup"
  | "license/useraccesstype"
  | "license/useraccessusage"
  | "lock"
  | "many"
  | "mimetype"
  | "odagenginegroup"
  | "odaglink"
  | "odaglinkusage"
  | "odagmodelgroup"
  | "odagrequest"
  | "odagservice"
  | "previewcreateprivilege"
  | "previewprivileges"
  | "printingservice"
  | "proxyservice"
  | "proxyservicecertificate"
  | "reloadtask"
  | "reloadtaskoperational"
  | "repositoryservice"
  | "schedulerservice"
  | "schemaevent"
  | "schemaeventoperational"
  | "servernodeconfiguration"
  | "servernodeheartbeat"
  | "servernoderole"
  | "servicecluster"
  | "servicestatus"
  | "sharedcontent"
  | "staticcontentreference"
  | "stream"
  | "syncsession"
  | "systeminfo"
  | "systemnotification"
  | "systemrule"
  | "tag"
  | "tempcontent"
  | "user"
  | "userdirectory"
  | "usersynctask"
  | "usersynctaskoperational"
  | "virtualproxyconfig";

export interface IClassSelections {
  create(arg: {
    area: TSelectionAreas;
    filter?: string;
  }): Promise<IClassSelection>;
}

export class Selections implements IClassSelections {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async create(arg: { area: TSelectionAreas; filter?: string }) {
    if (!arg.area)
      throw new Error(`select.create: "area" parameter is required`);

    const selection: Selection = new Selection(this.#repoClient, arg.area);
    await selection.init(arg.filter);

    return selection;
  }
}
