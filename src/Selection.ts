import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove, ISelection } from "./types/interfaces";
import { URLBuild } from "./util/generic";

export interface IClassSelection {
  remove(): Promise<IEntityRemove>;
  data(path: string): Promise<any>;
}

export class Selection implements IClassSelection {
  private repoClient: QlikRepositoryClient;
  private area: string;
  details: ISelection;
  constructor(repoClient: QlikRepositoryClient, area: string) {
    this.area = area;
    this.repoClient = repoClient;
    this.details = {} as ISelection;
  }

  async init(filter: string) {
    if (!this.details.id) {
      const urlBuild = new URLBuild(`selection/${this.area}`);
      urlBuild.addParam("filter", filter);

      this.details = await this.repoClient
        .Post(`${urlBuild.getUrl()}`, {})
        .then((res) => res.data as ISelection);
    }
  }

  async data(path: string) {
    if (!path) throw new Error(`selection.data: "path" parameter is required`);

    return await this.repoClient
      .Get(`selection/${this.details.id}/${path}`)
      .then((res) => res.data);
  }

  public async remove() {
    return await this.repoClient
      .Delete(`selection/${this.details.id}`)
      .then((res) => {
        return { id: this.details.id, status: res.status } as IEntityRemove;
      });
  }
}
