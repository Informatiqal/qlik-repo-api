import { QlikRepositoryClient } from "qlik-rest-api";
import { App } from "../App";
import { Apps } from "../Apps";

export async function getAppForReloadTask(
  appId: string,
  appFilter: string,
  repoClient: QlikRepositoryClient
): Promise<App> {
  let returnAppId: string = "";
  let returnAppsFilter: App;

  // without appId and appFilter - throw error
  if (!appId && !appFilter)
    throw new Error(
      `task.create: "appId" or "appFilter" parameter is required`
    );

  const apps = new Apps(repoClient, undefined);
  const appsFilter = await apps.getFilter({
    filter: appFilter || `id eq ${appId}`,
  });

  // if both exists, then appId is with priority
  if (appId && appFilter) returnAppId = appId;
  // if only appId exists
  if (appId && !appFilter) returnAppId = appId;
  // if only appFilter exists, then fetch the app(s) using the Apps class
  // if more than one app is returned, then throw an Error
  // if no apps are returned, then throw an Error
  // if only one app is returned, then get the appId from the first element
  if (!appId && appFilter) {
    if (appsFilter.length > 1)
      throw new Error(`task.create: "appFilter" returned more than one app`);
    if (appsFilter.length == 0)
      throw new Error(`task.create: "appFilter" returned 0 apps`);
    if (appsFilter.length == 1) {
      returnAppId = appsFilter[0].details.id;
      returnAppsFilter = appsFilter[0];
    }
  }

  return returnAppsFilter || appsFilter[0];
}
