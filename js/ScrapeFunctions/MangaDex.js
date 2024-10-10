import { BaseConfig } from "../models/BaseConfig.js";
import { ConfigField } from "../models/ConfigFields.js";

class MangaDex extends BaseConfig {
  constructor() {
    super(
      "_mangadex",
      "MangaDex",
      ["mangadex.org"],
      [
        new ConfigField("Title", ".title > .mb-1", {
          is_key: true,
        }),
        new ConfigField("Tags", "div.tags-row > a", {
          is_multiple: true,
        }),
        new ConfigField("Info", ".flex.gap-6 > div:nth-child(1) > div", {
          is_parent: true,
          children: [
            new ConfigField("Genres", ".flex a", {
              is_multiple: true,
              conditions: "Genres",
            }),
            new ConfigField("Format", ".flex a", {
              conditions: "Format",
            }),

            new ConfigField("Artist", ".flex a", {
              is_multiple: true,
              conditions: "Artist",
            }),
            new ConfigField("Author", ".flex a", {
              is_multiple: true,
              is_store_best_author: true,
              conditions: "Author",
            }),
          ],
        }),
      ],
      { is_pointing: true, is_chaptering: true }
    );
  }
}

export default MangaDex;
