import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class CuuTruyen extends BaseConfig {
  constructor() {
    super(
      "_cuutruyen",
      "CuuTruyen",
      ["cuutruyen.net"],
      [
        new ConfigField("Title", "h1.text-2xl", {
          is_key: true,
        }),
        new ConfigField("Tags", "div.flex-wrap > a", {
          is_multiple: true,
          regex: "^(.*?)(?:\\s+\\d+)?$",
        }),
        new ConfigField("Author", "div.bg-gradient-dark > div h2.mb-0"),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default CuuTruyen;
