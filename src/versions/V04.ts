import fs from "fs"
import path from "path"
import vscode from "vscode"
import { Version, VersionInfo } from "."
import { Rojo } from "../Rojo"

export type V04Project = {
  partitions: { [index: string]: { path: string; target: string } }
}

export const V04Info: VersionInfo = {
  name: "v0.4",
  canSyncPointsBeNonServices: false,
  configChangeRestartsRojo: true,

  getProjectFileName() {
    return "rojo.json"
  },

  isUpgraderAvailable() {
    return false
  },

  getPreviousVersionInfo(): never {
    throw new Error("No previous version to 0.4.x")
  }
}

export class V04 implements Version {
  public info = V04Info
  constructor(private rojo: Rojo<V04Project>) {}

  getDefaultProjectFilePath() {
    return path.join(
      this.rojo.getWorkspacePath(),
      this.info.getProjectFileName()
    )
  }

  getProjectFilePaths() {
    return [this.getDefaultProjectFilePath()]
  }

  async build() {
    vscode.window.showErrorMessage(
      "Rojo Build is only supported on 0.5.x or newer."
    )
  }

  isConfigRootDataModel(): never {
    throw new Error("Attempt to check if root is DataModel on 0.4.x")
  }

  async createSyncPoint(partitionPath: string, partitionTarget: string) {
    const currentConfig = this.rojo.loadProjectConfig()

    if (!currentConfig) {
      return false
    }

    let newName = path.basename(partitionPath, ".lua")
    while (currentConfig.partitions[newName] != null) {
      const numberPattern = / \((\d+)\)/

      const numberMatch = newName.match(numberPattern)
      if (numberMatch) {
        newName = newName.replace(
          numberPattern,
          ` (${(parseInt(numberMatch[1], 10) + 1).toString()})`
        )
      } else {
        newName += " (2)"
      }
    }

    currentConfig.partitions[newName] = {
      path: path
        .relative(path.dirname(this.getDefaultProjectFilePath()), partitionPath)
        .replace(/\\/g, "/"),
      target: partitionTarget
    }

    fs.writeFileSync(
      this.getDefaultProjectFilePath(),
      JSON.stringify(currentConfig, undefined, 2)
    )

    return true
  }

  upgrade(): never {
    throw new Error("No upgrader available")
  }
}
