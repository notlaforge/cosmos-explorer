import * as DataModels from "../Contracts/DataModels";
import { KernelConnectionMetadata } from "../Contracts/ViewModels";
import * as Logger from "../Common/Logger";

export class NotebookConfigurationUtils {
  private constructor() {}

  public static async configureServiceEndpoints(
    notebookPath: string,
    notebookConnectionInfo: DataModels.NotebookWorkspaceConnectionInfo,
    kernelName: string,
    clusterConnectionInfo: DataModels.SparkClusterConnectionInfo
  ): Promise<void> {
    if (!notebookPath || !notebookConnectionInfo || !kernelName) {
      Logger.logError(
        "Invalid or missing notebook connection info/path",
        "NotebookConfigurationUtils/configureServiceEndpoints"
      );
      return Promise.reject("Invalid or missing notebook connection info");
    }

    if (!clusterConnectionInfo || !clusterConnectionInfo.endpoints || clusterConnectionInfo.endpoints.length === 0) {
      Logger.logError(
        "Invalid or missing cluster connection info/endpoints",
        "NotebookConfigurationUtils/configureServiceEndpoints"
      );
      return Promise.reject("Invalid or missing cluster connection info");
    }

    const dataExplorer = window.dataExplorer;
    const notebookEndpointInfo: DataModels.NotebookConfigurationEndpointInfo[] = clusterConnectionInfo.endpoints.map(
      clusterEndpoint => ({
        type: clusterEndpoint.kind.toLowerCase(),
        endpoint: clusterEndpoint && clusterEndpoint.endpoint,
        username: clusterConnectionInfo.userName,
        password: clusterConnectionInfo.password,
        token: dataExplorer && dataExplorer.arcadiaToken()
      })
    );
    const configurationEndpoints: DataModels.NotebookConfigurationEndpoints = {
      path: notebookPath,
      endpoints: notebookEndpointInfo
    };
    const kernelMetadata: KernelConnectionMetadata = {
      configurationEndpoints,
      notebookConnectionInfo,
      name: kernelName
    };

    return await NotebookConfigurationUtils._configureServiceEndpoints(kernelMetadata);
  }

  private static async _configureServiceEndpoints(kernelMetadata: KernelConnectionMetadata): Promise<void> {
    if (!kernelMetadata) {
      // should never get into this state
      Logger.logWarning("kernel metadata is null or undefined", "NotebookConfigurationUtils/configureServiceEndpoints");
      return;
    }

    const notebookConnectionInfo = kernelMetadata.notebookConnectionInfo;
    const configurationEndpoints = kernelMetadata.configurationEndpoints;
    if (notebookConnectionInfo && configurationEndpoints) {
      try {
        const headers: any = { "Content-Type": "application/json" };
        if (notebookConnectionInfo.authToken) {
          headers["Authorization"] = `token ${notebookConnectionInfo.authToken}`;
        }
        const response = await fetch(`${notebookConnectionInfo.notebookServerEndpoint}/api/configureEndpoints`, {
          method: "POST",
          headers,
          body: JSON.stringify(configurationEndpoints)
        });
        if (!response.ok) {
          const responseMessage = await response.json();
          Logger.logError(
            JSON.stringify(responseMessage),
            "NotebookConfigurationUtils/configureServiceEndpoints",
            response.status
          );
        }
      } catch (error) {
        Logger.logError(error, "NotebookConfigurationUtils/configureServiceEndpoints");
      }
    }
  }
}
