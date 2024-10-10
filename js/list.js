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

  $("#config-count").text(configs.length);

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

function render_data() {
  const { data_thead, data_tbody } = render_data_row(
    global.config.fields,
    global.data,
    global.config.is_pointing,
    global.config.is_chaptering,
    global.settings.truncate
  );
  $("#data-table thead")
    .html(data_thead)
    .attr("data-config-id", global.config.id);
  $("#data-table tbody")
    .html(data_tbody)
    .attr("data-config-id", global.config.id);
}

//#endregion

//#region Events

$("#config-table tbody").on("click", "tr", async function () {
  const id = $(this).data("config-id");

  $("#config-table tbody tr").removeClass("table-active");
  $(this).addClass("table-active");

  const selected_config = configs.find((config) => {
    return config.id === id;
  });
  const selected_config_data = await getStorageData([selected_config.id], []);
  const selected_config_best_authors = await getStorageData(
    [`${selected_config.id}_best_authors`],
    []
  );

  $("#field-count").text(selected_config.fields.length);
  $("#data-count").text(selected_config_data.length);

  global.config = selected_config;
  global.data = selected_config_data;
  global.best_authors = selected_config_best_authors;

  // Sort Data
  selected_config_data.sort(function (a, b) {
    if (a.point === undefined) return 1; // Move a (undefined point) after b
    if (b.point === undefined) return -1; // Move b (undefined point) after a

    const pointA = parseFloat(a.point);
    const pointB = parseFloat(b.point);

    if (pointA > pointB) return -1;
    if (pointA < pointB) return 1;

    return 0; // If pointA === pointB, leave them unchanged
  });

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
  render_data();

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
