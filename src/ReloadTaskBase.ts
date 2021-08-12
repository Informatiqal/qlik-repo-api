import { IHttpReturn, QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove, IHttpStatus, ISelection } from "./types/interfaces";
import {
  ISchemaEvent,
  ISelectionEvent,
  ITask,
  ITaskExecutionResult,
  ITaskReloadUpdate,
} from "./Task.interface";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IClassSchemaTrigger, SchemaTrigger } from "./SchemaTrigger";
import { CompositeTrigger, IClassCompositeTrigger } from "./CompositeTrigger";

export interface IClassReloadTask {
  remove(): Promise<IEntityRemove>;
  start(): Promise<IHttpStatus>;
  startSynchronous(): Promise<IHttpReturn>;
  waitExecution(executionId?: string): Promise<ITaskExecutionResult>;
  scriptLogGet(fileReferenceId: string): Promise<string>;
  scriptLogFileGet(executionResultId: string): Promise<string>;
  update(arg: ITaskReloadUpdate): Promise<ITask>;
  // triggersGetAll(): Promise<IClassSchemaTrigger[]>;
  triggersGetSchema(id: string): Promise<IClassSchemaTrigger>;
  details: ITask;
}

export abstract class ReloadTaskBase implements IClassReloadTask {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ITask;
  triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
  baseUrl: string;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    baseUrl: string,
    details?: ITask
  ) {
    if (!id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    this.baseUrl = baseUrl;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      [this.details, this.triggersDetails] = await Promise.all([
        this.repoClient
          .Get(`${this.baseUrl}/${this.id}`)
          .then((res) => res.data as ITask),
        this.triggersGetAll(),
      ]);
      // this.details = await this.repoClient
      //   .Get(`${this.baseUrl}/${this.id}`)
      //   .then((res) => res.data as ITask);
      // this.triggersDetails = await this.triggersGetAll();
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`${this.baseUrl}/${this.id}`)
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  async start() {
    return await this.repoClient
      .Post(`task/${this.id}/start`, {})
      .then((res) => res.status);
  }

  async startSynchronous() {
    return await this.repoClient.Post(`task/${this.id}/start/synchronous`, {});
  }

  async waitExecution(executionId?: string) {
    let taskStatusCode = -1;
    let resultId: string;

    if (!executionId)
      resultId = this.details.operational.lastExecutionResult.id;

    if (executionId) {
      resultId = await this.repoClient
        .Get(`/executionSession/${executionId}`)
        .then((res) => {
          return res.data.executionResult.Id;
        });
    }

    let result: ITaskExecutionResult;
    while (taskStatusCode < 3) {
      result = await this.repoClient
        .Get(`/executionResult/${resultId}`)
        .then((res) => {
          return res.data;
        });

      taskStatusCode = (result as any).status;
    }

    return result;
  }

  async scriptLogGet(fileReferenceId: string) {
    if (!fileReferenceId)
      throw new Error(
        `task.scriptLogGet: "fileReferenceId" parameter is required`
      );
    if (this.baseUrl == "externalprogramtask")
      throw new Error(
        `scriptLogGet: Unfortunately only task of type Reload have this option `
      );

    return await this.repoClient
      .Get(
        `${this.baseUrl}/${
          this.details.id
        }/scriptlog?filereferenceid=${encodeURIComponent(fileReferenceId)}
    `
      )
      .then((res) => res.data as string);
  }

  async scriptLogFileGet(executionResultId: string) {
    if (!executionResultId)
      throw new Error(
        `task.scriptLogFileGet: "executionResultId" parameter is required`
      );

    if (this.baseUrl == "externalprogramtask")
      throw new Error(
        `scriptLogGet: Unfortunately only task of type Reload have this option `
      );

    return await this.repoClient
      .Get(
        `${this.baseUrl}/${
          this.details.id
        }/scriptlog?executionresultid =${encodeURIComponent(executionResultId)}
  `
      )
      .then((res) => res.data as string);
  }

  async update(arg: ITaskReloadUpdate) {
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      this.details.taskSessionTimeout = arg.taskSessionTimeout;
    if (arg.maxRetries) this.details.maxRetries = arg.maxRetries;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`${this.baseUrl}/${this.details.id}`, { ...this.details })
      .then((res) => res.data as ITask);
  }

  private async triggersGetAll() {
    const type =
      this.baseUrl == "externalprogramtask"
        ? "ExternalProgramTask"
        : "ReloadTask";

    const selection = await this.repoClient
      .Post(`selection`, {
        items: [
          {
            type: type,
            objectID: `${this.id}`,
          },
        ],
      })
      .then((res) => res.data as ISelection);

    const selectionData = await this.repoClient
      .Get(`selection/${selection.id}/Event/full`)
      .then(async (s0) => {
        return await Promise.all(
          (s0.data as ISchemaEvent[]).map(async (s1) => {
            if (s1.eventType == 0) {
              const t: SchemaTrigger = new SchemaTrigger(
                this.repoClient,
                s1.id,
                s1
              );
              await t.init();

              return t;
            }

            if (s1.eventType == 1) {
              const t: CompositeTrigger = new CompositeTrigger(
                this.repoClient,
                s1.id,
                s1
              );
              await t.init();

              return t;
            }
          })
        );
      });

    return selectionData;
  }

  async triggersGetSchemas() {}

  async triggersGetSchema(id: string) {
    if (!id)
      throw new Error(
        `reloadTasks.triggersGetSchema: "id" parameter is required`
      );
    const schema: SchemaTrigger = new SchemaTrigger(this.repoClient, id);
    await schema.init();

    return schema;
  }
}
