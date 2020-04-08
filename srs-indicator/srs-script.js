// ==UserScript==
// @name        WaniKani SRS Indicator
// @namespace   xrmicah
// @author      xrmicah
// @description Show current item's srs level
// @run-at      document-end
// @include     https://www.wanikani.com/review/session*
// @include     http://www.wanikani.com/review/session*
// @version     1.1.2
// @run-at      document-end
// @grant       none

// ==/UserScript==
// constants
const SCRIPT_NAME = "Wanikani SRS Indicator";
const CURRENT_EVENT_ITEM_UPDATE_STRING = "currentItemUpdated";
const SRS_INDICATOR_STYLES = "xr-styles";
const SRS_INDICATOR_CONTAINER_ID = "xr-srsindicator-container";
const SRS_INDICATOR_DIV_ID = "xr-srsindicator-div";
const SRS_INDICATOR_TEXT_DIV_ID = 'xr-srsindicatortext-div';
const SRS_DANGER_CIRCLE_DIV_CLASS = "xr-srsdangercircle-div";
const CASE_MAP = {
  4: {
    copy: "Guruing",
  },
  6: {
    copy: "Mastering",
  },
  7: {
    copy: "Enlightening",
  },
  8: {
    copy: "Burning",
  },
};

// styles
const scriptStyles = `
 #${SRS_INDICATOR_CONTAINER_ID} {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   margin-top: 16px;
   display: flex;
   justify-content: center;
 }

 #${SRS_INDICATOR_DIV_ID} {
   background-color: white;
   border-radius: 10px;
   padding: 4px;
 }
 #${SRS_INDICATOR_TEXT_DIV_ID} {
   display: inline-block;
  color: red;
 }
 .${SRS_DANGER_CIRCLE_DIV_CLASS} {
  animation: pulse 1s infinite;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: red;
  display: inline-block;
  margin: 4px;
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
    detail: {
      srsLevelNumber
    },
  });

const getOrCreateSRSIndicatorNode = (srsLevelNumber) => {
  let srsIndicatorContainer = document.getElementById(SRS_INDICATOR_CONTAINER_ID);
  if (srsIndicatorContainer) {
    return srsIndicatorContainer;
  }
  // create srs indicator components
  srsIndicatorContainer = document.createElement("div");
  const srsDangerCircleSpanOne = document.createElement('div');
  const srsDangerCircleSpanTwo = document.createElement('div');

  const srsIndicatorDiv = document.createElement("div");
  const srsIndicatorSpan = document.createElement('div');

  // set ids for style
  srsIndicatorContainer.setAttribute("id", SRS_INDICATOR_CONTAINER_ID);
  srsIndicatorDiv.setAttribute("id", SRS_INDICATOR_DIV_ID);
  srsIndicatorSpan.setAttribute('id', SRS_INDICATOR_TEXT_DIV_ID);
  // set classes on danger circles
  srsDangerCircleSpanOne.setAttribute('class', SRS_DANGER_CIRCLE_DIV_CLASS);
  srsDangerCircleSpanTwo.setAttribute('class', SRS_DANGER_CIRCLE_DIV_CLASS);

  // combine
  srsIndicatorDiv.appendChild(srsDangerCircleSpanOne);
  srsIndicatorDiv.appendChild(srsIndicatorSpan);
  srsIndicatorDiv.appendChild(srsDangerCircleSpanTwo);

  srsIndicatorContainer.appendChild(srsIndicatorDiv);

  // return parent node
  return srsIndicatorContainer;
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
      const srsIndicatorDivNode = document.getElementById(SRS_INDICATOR_CONTAINER_ID);
      return srsIndicatorDivNode && srsIndicatorDivNode.remove();
    }
    const srsIndicatorDivNode = getOrCreateSRSIndicatorNode();
    srsIndicatorDivNode.children[0].children[1].textContent =
      CASE_MAP[e.detail.srsLevelNumber].copy;
    targetParent.appendChild(srsIndicatorDivNode);
  });
  $.jStorage.listenKeyChange("currentItem", () => {
    const srsLevelNumber = $.jStorage.get("currentItem").srs;
    targetParent.dispatchEvent(createCurrentItemUpdateEvent(srsLevelNumber));
  });
  // add styles
  addScriptStyles();
  // kick off script for initial element
  targetParent.dispatchEvent(
    createCurrentItemUpdateEvent(currentReviewItem.srs)
  );
};

main();