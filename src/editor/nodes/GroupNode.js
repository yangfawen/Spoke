import THREE from "../../vendor/three";
import EditorNodeMixin from "./EditorNodeMixin";

export default class GroupNode extends EditorNodeMixin(THREE.Group) {
  static legacyComponentName = "group";

  static nodeName = "Group";

  serialize() {
    return super.serialize({
      group: {}
    });
  }
}
