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

/**
 * Filters table rows based on a specified search criteria.
 *
 * The function accepts a filter string that can specify a particular column to search in
 * using the format "td:index=searchTerms", where "index" is the 1-based index of the
 * target column and "searchTerms" can include multiple terms separated by commas
 * for "AND" conditions and pipes for "OR" conditions.
 * If the input does not match this format, the entire table is searched in the default
 * behavior.
 *
 * @param {string} filterString - The filter criteria in the format
 *                                 "td:index=term1,term2|term3" where "index"
 *                                 is the column number, and terms are the search strings.
 *
 * @example
 * // Filters the second column for rows containing both "fantasy" and "romance"
 * // or just "comedy".
 * filterData("td:2=fantasy,romance|comedy");
 *
 * @example
 * // If the input doesn't match the "td:" format, the function searches
 * // across all columns for the term "comedy".
 * filterData("comedy");
 * // both "fantasy" and "romance" or just "comedy".
 * filterData("fantasy,romance|comedy");
 */
function filterData(filterString) {
  // Extract column index and search terms from the input string
  const match = filterString.match(/td:(\d+)=(.+)/);
  let columnIndex = -1;
  let searchText = "";

  if (match) {
    columnIndex = parseInt(match[1]) - 1; // Convert to zero-based index
    searchText = match[2].trim();
  } else searchText = filterString;

  // Split by "|" first to separate OR groups
  const orGroups = searchText
    .split("|")
    .map((group) => group.trim().toLowerCase());

  const foundRow = $("#data-table tbody tr").filter(function () {
    // Get the text content of the row (td elements) and convert to lowercase
    const row = $(this).find("td");
    let text_content = row.text().trim().toLowerCase();

    if (match) {
      text_content = row.eq(columnIndex).text().trim().toLowerCase();
    }

    // "OR" filter: check if any of the OR groups matches
    return orGroups.some((group) => {
      // Split each group by "," for "AND" conditions
      const andTerms = group
        .split(",")
        .map((term) => term.trim().toLowerCase());

      // "AND" filter: all terms in the group must match
      return andTerms.every((term) => text_content.includes(term));
    });
  });

  if (foundRow.length > 0) {
    $("#data-count").text(foundRow.length);
    $("#data-table tbody tr").not(foundRow).hide(); // Hide all rows except the found row(s)
    foundRow.show(); // Show the found row(s)
  } else {
    $("#data-table tbody tr").show(); // Show all rows if no match is found
    console.log(
      "No matching row found",
      `"${searchText}" ${
        columnIndex >= 0 ? `at column ${columnIndex + 1}` : ""
      }`
    );
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

$("#data-search").on("keydown", function (event) {
  if (event.key === "Enter") {
    const searchText = $(this).val().trim().toLowerCase();
    filterData(searchText);
  }
});
$("#search-data-btn").click(function (event) {
  const searchText = $("#data-search").val().trim().toLowerCase();
  filterData(searchText);
});

//#endregion
