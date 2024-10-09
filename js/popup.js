import BlogTruyen from "./ScrapeFunctions/BlogTruyen.js";
import CuuTruyen from "./ScrapeFunctions/CuuTruyen.js";
import MangaDex from "./ScrapeFunctions/MangaDex.js";
import Manhuaus from "./ScrapeFunctions/Manhuaus.js";
import Nettrom from "./ScrapeFunctions/Nettrom.js";
import OtakuSan from "./ScrapeFunctions/Otakusan.js";
import Pixiv from "./ScrapeFunctions/Pixiv.js";
import TruyenQQ from "./ScrapeFunctions/TruyenQQ.js";
import {
  ExportData,
  getStorageData,
  ImportData,
  ScriptingCurrentTab,
} from "./utils.js";

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

const global = {
  $body: null,
  currentUrl: null,
  currentConfig: null,
  currentLocalData: null,
  localData: [],
  bestAuthors: [],
  settings: {
    truncate: true,
    debug: false,
    overideAll: true,
  },
};

//#region Main
async function start() {
  const { $body, currentUrl } = await ScriptingCurrentTab();
  let settings = await getStorageData(["settings"], global.settings);
  settings = { ...global.settings, ...settings };

  // Find current config //
  const currentConfig = configs.find((config) => {
    return config.urls.some((url) => {
      const regex = new RegExp(url);
      return regex.test(currentUrl);
    });
  });

  if (!currentConfig) {
    if (settings.debug) console.log("Current Config is undefined");
    return;
  }

  let localData = await getStorageData([currentConfig.id]);
  let bestAuthors = null;
  let currentLocalData = null;

  if (!localData) {
    chrome.storage.local.set({ [currentConfig.id]: global.localData });
    localData = global.localData;
  }

  let is_store_best_author = currentConfig.fields.some((field) => {
    if (field.children?.length > 0) {
      return field.children.some(
        (child) => child.is_store_best_author === true
      );
    }
    return field.is_store_best_author === true;
  });

  if (is_store_best_author) {
    bestAuthors = await getStorageData([`${currentConfig.id}_best_authors`]);
  }

  // Scripting //
  currentConfig.$body = $body;
  currentConfig.bestAuthors = bestAuthors;
  currentConfig.scrape();
  currentConfig.render();

  global.$body = $body;
  global.settings = settings;
  global.currentUrl = currentUrl;
  global.currentConfig = currentConfig;
  global.localData = localData;
  global.bestAuthors = bestAuthors;
  global.scrapeData = currentConfig.scrapeData;

  const is_exist = localData.some(
    (obj) => obj.code === currentConfig.scrapeData.code
  );

  if (is_exist) {
    currentLocalData = localData.find((data) => {
      return data.code === currentConfig.scrapeData.code;
    });

    global.currentLocalData = currentLocalData;

    updateStatus();
  }

  $("#web-name").text(`[${currentConfig.name}]`);
  $("#web-name").addClass("text-danger").removeClass("text-secondary");

  // Init
  if (currentConfig.is_pointing) $("#point-div").toggleClass("visually-hidden");
  if (currentConfig.is_chaptering)
    $("#chapter-div").toggleClass("visually-hidden");
  if (settings["debug"]) $("#debug").prop("checked", true);
  if (settings["overideAll"]) $("#overide-all").prop("checked", true);
  if (settings["truncate"]) {
    $("[field-value-label]").toggleClass("text-truncate");
    $("#truncate").prop("checked", true);
  }

  // Log Data
  if (settings["debug"]) {
    console.log("Settings:", settings);
    console.log("Current Url:", currentUrl);
    console.log("Current Config:", currentConfig);
    console.log("Local Data:", localData);
    console.log("Current Local Data:", currentLocalData);
    console.log("Best Authors:", bestAuthors);
    console.log("Scrape Data:", currentConfig.scrapeData);
  }

  if (!currentConfig.scrapeData.code) {
    console.log("Something went wrong!");
    return;
  }

  $("#main").toggleClass("visually-hidden");
}
start();
//#endregion

//#region Functions
function updateData() {
  const chapterInput = $("#chapter");
  const pointInput = $("#point");
  const is_exist = global.localData.some(
    (obj) => obj.code === global.currentConfig.scrapeData.code
  );

  if (is_exist) {
    const currentData = global.localData.find(
      (obj) => obj.code === global.currentConfig.scrapeData.code
    );

    const point = currentData?.point || 0;
    const chapter = currentData?.chapter || 0;

    pointInput.val(point);
    pointInput.addClass("text-danger").removeClass("text-secondary");

    chapterInput.val(chapter);
    chapterInput.addClass("text-danger").removeClass("text-secondary");
  } else {
    pointInput.addClass("text-secondary").removeClass("text-danger");
    chapterInput.addClass("text-secondary").removeClass("text-danger");
  }
}

function updateStatus(is_delete = false) {
  const statusLabel = $("#status");

  if (is_delete) {
    statusLabel.text(`[Unread]`);
    statusLabel.addClass("text-secondary").removeClass("text-danger");
  } else {
    statusLabel.text(`[Read]`);
    statusLabel.addClass("text-danger").removeClass("text-secondary");
  }

  $("#btn-add").toggleClass("disabled");
  $("#btn-delete").toggleClass("disabled");

  updateData();
}

function onInfoChange() {
  const is_exist = global.localData.some(
    (obj) => obj.code === global.currentConfig.scrapeData.code
  );

  if (!is_exist) return;

  $("#btn-update").removeClass("disabled");
}

async function getAllLocalData() {
  let allData = {};
  let allBestAuthor = {};

  for (const config of configs) {
    const tempLocalData = await getStorageData([config.id], null);
    if (tempLocalData) allData[config.id] = tempLocalData;

    let is_store_best_author = config.fields.some(
      (field) => field.is_store_best_author === true
    );

    if (is_store_best_author) {
      const tempBestAuthorData = await getStorageData(
        [`${config.id}_best_authors`],
        null
      );
      allBestAuthor[config.id] = tempBestAuthorData;
    }
  }

  return { allData, allBestAuthor };
}
//#endregion

//#region Events
$("#debug").change(function (event) {
  global.settings.debug = !global.settings.debug;
  chrome.storage.local.set({ settings: global.settings });
});

$("#overide-all").change(function (event) {
  global.settings.overideAll = !global.settings.overideAll;
  chrome.storage.local.set({ settings: global.settings });
});

$("#truncate").change(function (event) {
  $("[field-value-label]").toggleClass("text-truncate");

  global.settings.truncate = !global.settings.truncate;
  chrome.storage.local.set({ settings: global.settings });
});

$("#point").change(onInfoChange);

$("#chapter").change(onInfoChange);

$("#btn-add").click(function (event) {
  let newData = global.scrapeData;

  if (global.currentConfig.is_pointing) newData["point"] = $("#point").val();
  if (global.currentConfig.is_chaptering)
    newData["chapter"] = $("#chapter").val();

  global.localData.push(newData);
  chrome.storage.local.set(
    { [global.currentConfig.id]: global.localData },
    () => updateStatus()
  );

  if (global.settings["debug"])
    console.log(`Add to '${global.currentConfig.id}':`, `'${newData.code}'`);
});

$("#btn-delete").click(function (event) {
  const index = global.localData.findIndex(
    (obj) => obj.code === global.currentConfig.scrapeData.code
  );

  if (index == -1) {
    if (global.settings["debug"]) console.log("Data doesn't exists.");
    return;
  }

  const currentData = global.localData[index];
  global.localData.splice(index, 1);

  chrome.storage.local.set(
    { [global.currentConfig.id]: global.localData },
    () => updateStatus(true)
  );

  if (global.settings["debug"])
    console.log(
      `Delete '${currentData.code}' from '${global.currentConfig.id}'.`
    );
});

$("#btn-update").click(function (event) {
  const index = global.localData.findIndex(
    (obj) => obj.code === global.currentConfig.scrapeData.code
  );

  if (index == -1) {
    if (global.settings["debug"]) console.log("Data doesn't exists.");
    return;
  }

  let newData = {};
  const oldData = global.localData[index];

  if (global.settings["overideAll"]) newData = global.scrapeData;
  else newData = oldData;

  if (global.currentConfig.is_pointing) newData["point"] = $("#point").val();
  if (global.currentConfig.is_chaptering)
    newData["chapter"] = $("#chapter").val();

  global.localData[index] = newData;

  chrome.storage.local.set(
    { [global.currentConfig.id]: global.localData },
    function () {
      $("#btn-update").addClass("disabled");
    }
  );

  if (global.settings["debug"])
    console.log(`Update '${oldData.code}' from '${global.currentConfig.id}'.`);
});

$(document).on("click", ".btn-author", function () {
  let author_id = $(this).attr("data-author-id");

  const index = global.bestAuthors.findIndex((obj) => obj.id === author_id);
  let is_exist = false;

  if (index != -1) is_exist = true;

  $(this)
    .toggleClass("btn-danger", !is_exist)
    .toggleClass("btn-outline-secondary", is_exist);

  if (!is_exist) {
    const newBestAuthor = {
      id: author_id,
      label: $(this).text().trim(),
    };
    global.bestAuthors.push(newBestAuthor);

    if (global.settings["debug"])
      console.log(`Add '${author_id}' to '${global.currentConfig.id}'.`);
  } else {
    global.bestAuthors.splice(index, 1);

    if (global.settings["debug"])
      console.log(`Delete '${author_id}' from '${global.currentConfig.id}'.`);
  }

  chrome.storage.local.set({
    [`${global.currentConfig.id}_best_authors`]: global.bestAuthors,
  });
});
//#endregion

//#region Import-Export
const dialog = $("#dialog");
dialog.change((e) => {
  ImportData(e);
});

$("#export").click(async () => {
  const all = await getAllLocalData();
  ExportData(all);
});

$("#import").click(() => {
  dialog.click();
});
//#endregion
