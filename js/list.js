import {
  render_config_row,
  render_data_row,
  render_field_row,
} from "./render.js";
import { getStorageData } from "./utils.js";
import BlogTruyen from "./ScrapeFunctions/BlogTruyen.js";
import CuuTruyen from "./ScrapeFunctions/CuuTruyen.js";
import MangaDex from "./ScrapeFunctions/MangaDex.js";
import Manhuaus from "./ScrapeFunctions/Manhuaus.js";
import Nettrom from "./ScrapeFunctions/Nettrom.js";
import OtakuSan from "./ScrapeFunctions/Otakusan.js";
import Pixiv from "./ScrapeFunctions/Pixiv.js";
import TruyenQQ from "./ScrapeFunctions/TruyenQQ.js";

const global = {
  settings: {
    truncate: true,
    debug: false,
    overideAll: true,
  },
};

const configs = [
  new OtakuSan(),
  new Nettrom(),
  new TruyenQQ(),
  new BlogTruyen(),
  new Manhuaus(),
  new Pixiv(),
  new MangaDex(),
  new CuuTruyen(),
];

//#region Main

async function start() {
  let settings = await getStorageData(["settings"], global.settings);
  settings = { ...global.settings, ...settings };

  let configs_tbody = "";
  configs.map((config) => {
    configs_tbody += render_config_row(config);
  });
  $("#config-table tbody").html(configs_tbody);

  global.settings = settings;

  // Log Data
  if (settings["debug"]) {
    console.log("Settings:", settings);
  }
}

start();

//#endregion

//#region Methods

function filterData(searchText) {
  const foundRow = $("#data-table tbody tr").filter(function () {
    return $(this).find("td").text().trim().toLowerCase().includes(searchText);
  });

  if (foundRow.length > 0) {
    $("#data-table tbody tr").not(foundRow).hide(); // Hide all rows except the found row
    foundRow.show(); // Show the found row
  } else {
    $("#data-table tbody tr").show(); // Show all rows if no match is found
    console.log("No matching row found.");
  }
}

//#endregion

//#region Events

$("#config-table tbody").on("click", "tr", async function () {
  const id = $(this).data("config-id");
  const selected_config = configs.find((config) => {
    return config.id === id;
  });
  const selected_config_data = await getStorageData([selected_config.id], []);
  const selected_config_best_authors = await getStorageData(
    [`${selected_config.id}_best_authors`],
    []
  );

  // Log Data
  if (global.settings["debug"]) {
    console.log("\nSelected Config:", selected_config);
    console.log("Selected Config Data:", selected_config_data);
    console.log("Selected Config Best Authors:", selected_config_best_authors);
  }

  // Fields
  let fields_tbody = "";
  selected_config.fields.map((field) => {
    if (field.children?.length > 0)
      field.children.map((child) => {
        fields_tbody += render_field_row(child);
      });
    else fields_tbody += render_field_row(field);
  });
  $("#field-table tbody").html(fields_tbody).attr("data-config-id", id);

  // Data
  const { data_thead, data_tbody } = render_data_row(
    selected_config.fields,
    selected_config_data,
    selected_config.is_pointing,
    selected_config.is_chaptering,
    global.settings.truncate
  );
  $("#data-table thead").html(data_thead).attr("data-config-id", id);
  $("#data-table tbody").html(data_tbody).attr("data-config-id", id);

  // Best Authors
});

$("#data-search").on("change", function (event) {
  const searchText = $(this).val().trim().toLowerCase();
  filterData(searchText);
});

$("#search-data-btn").click(function (event) {
  const searchText = $("#data-search").val().trim().toLowerCase();
  filterData(searchText);
});

//#endregion
