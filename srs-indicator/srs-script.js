// ==UserScript==
// @name        WaniKani SRS Indicator
// @namespace   xrmicah
// @author      xrmicah
// @description Show current item's srs level
// @run-at      document-end
// @include     https://www.wanikani.com/review/session*
// @include     http://www.wanikani.com/review/session*
// @version     1.0.25
// @run-at      document-end
// @grant       none

// ==/UserScript==
// constants
const SCRIPT_NAME = "Wanikani SRS Indicator";
const CURRENT_EVENT_ITEM_UPDATE_STRING = "currentItemUpdated";
const SRS_INDICATOR_STYLES = "xr-styles";
const SRS_INDICATOR_DIV_ID = "xr-srsindicator-div";
const SRS_INDICATOR_SPAN_ID = "xr-srsindicator-span";
const CASE_MAP = {
  4: {
    copy: "Guru'ing",
    style: "",
  },
  6: {
    copy: "Master'ing",
    style: "",
  },
  7: {
    copy: "Enlighten'ing",
    style: "",
  },
  8: {
    copy: "Burn'ing",
    style: "",
  },
};

// styles
const WARNING_HEX = "#BA4E4B";
const WARNING_HEX2 = "#B94B58";
const NEUTRAL_BACKGROUND = "#BEB79B";
const scriptStyles = `
 #${SRS_INDICATOR_DIV_ID} {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   margin-top: 16px;
 }

 #${SRS_INDICATOR_SPAN_ID} {
   animation: pulse 1s infinite;
   color: red;
   background-color: white;
   border-radius: 10px;
   padding: 4px;
 }

 @keyframes pulse {
   0% {
     transform: scale(0.9);
     box-shadow: 0 0 0 0 rgba(235, 6, 20, 0.9);
   }
   70% {
     transform: scale(1);
     box-shadow: 0 0 0 10px rgba(235, 6, 20, 0);
   }
   100% {
     transform: scale(0.9)
   }
 }
 `;

const createCurrentItemUpdateEvent = (srsLevelNumber) =>
  new CustomEvent(CURRENT_EVENT_ITEM_UPDATE_STRING, {
    detail: { srsLevelNumber },
  });

const getOrCreateSRSIndicatorNode = (srsLevelNumber) => {
  let srsIndicatorDivNode = document.getElementById(SRS_INDICATOR_DIV_ID);
  if (srsIndicatorDivNode) {
    return srsIndicatorDivNode;
  }
  // create srs indicator components
  srsIndicatorDivNode = document.createElement("div");
  const srsIndicatorSpan = document.createElement("span");
  const srsIndicatorTextNode = document.createTextNode("");
  // set ids for style
  srsIndicatorDivNode.setAttribute("id", SRS_INDICATOR_DIV_ID);
  srsIndicatorSpan.setAttribute("id", SRS_INDICATOR_SPAN_ID);

  // combine
  srsIndicatorSpan.appendChild(srsIndicatorTextNode);
  srsIndicatorDivNode.appendChild(srsIndicatorSpan);

  // return parent node
  return srsIndicatorDivNode;
};

const addScriptStyles = () => {
  const style = document.createElement("style");
  style.innerHTML = scriptStyles;
  style.setAttribute("id", SRS_INDICATOR_STYLES);
  document.head.appendChild(style);
};

const main = () => {
  const currentReviewItem = $.jStorage.get("currentItem");
  const targetParent = document.querySelector("#question");
  // set up listeners
  targetParent.addEventListener(CURRENT_EVENT_ITEM_UPDATE_STRING, (e) => {
    // remove node if it exists
    if (!CASE_MAP[e.detail.srsLevelNumber]) {
      const srsIndicatorDivNode = document.getElementById(SRS_INDICATOR_DIV_ID);
      return srsIndicatorDivNode && srsIndicatorDivNode.remove();
    }
    const srsIndicatorDivNode = getOrCreateSRSIndicatorNode();
    srsIndicatorDivNode.children[0].textContent =
      CASE_MAP[e.detail.srsLevelNumber].copy;
    targetParent.appendChild(srsIndicatorDivNode);
  });
  $.jStorage.listenKeyChange("currentItem", () => {
    const srsLevelNumber = $.jStorage.get("currentItem").srs;
    targetParent.dispatchEvent(createCurrentItemUpdateEvent(srsLevelNumber));
  });
  // add styles
  addScriptStyles();
  // kick off script
  targetParent.dispatchEvent(
    createCurrentItemUpdateEvent(currentReviewItem.srs)
  );
};

main();
