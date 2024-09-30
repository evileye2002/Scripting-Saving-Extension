import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class Nettrom extends BaseConfig {
  constructor() {
    super(
      "_nettrom",
      "Nettrom",
      ["nettruyenww.com", "nettruyenviet.com"],
      [
        new ConfigField("Title", "h1.title-detail", {
          is_key: true,
        }),
        new ConfigField("Genres", ".kind > .col-xs-8 > a", {
          is_multiple: true,
        }),
        new ConfigField("Authors", ".author > .col-xs-8", {
          is_multiple: true,
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default Nettrom;
