const CloudScriptLib = {
  addVirtualCurrency: function (amount) {
    let resultAdd = server.AddUserVirtualCurrency({
      Amount: amountToAdd,
      PlayFabId: currentPlayerId,
      VirtualCurrency: "GP",
    });
    return resultAdd;
  },

  subtractVirtualCurrency: function (amountToSubtract, currencyCode) {
    let resultSubtract = server.SubtractUserVirtualCurrency({
      Amount: amountToSubtract,
      PlayFabId: currentPlayerId,
      VirtualCurrency: currencyCode,
    });
    return resultSubtract;
  },

  getUserData: function (keys) {
    let userData = server.GetUserData({
      PlayFabId: currentPlayerId,
      Keys: keys,
    });
    return userData;
  },

  getCombinedInfo: function () {
    let playerCombinedInfoResult = server.GetPlayerCombinedInfo({
      PlayFabId: currentPlayerId,
      InfoRequestParameters: {
        GetUserVirtualCurrency: true,
        GetUserInventory: true,
      },
    });

    if (undefined === playerCombinedInfoResult) {
      return {
        UserVirtualCurrency: [],
        UserInventory: [],
      };
    }

    log.debug("playerCombinedInfoResult", playerCombinedInfoResult);

    return playerCombinedInfoResult.InfoResultPayload;
  },

  consumeItem: function (item, quantity) {
    return console.log("consumeItem", item, quantity);

    // server.ConsumeItem({
    //   ConsumeCount: quantity,
    //   ItemInstanceId: item,
    //   PlayFabId = currentPlayerId,
    // });
  },

  modifyItemUses: function (itemId, usesToAdd) {
    return console.log("modifyItemUses", itemId, usesToAdd);

    // server.ModifyItemUses({
    //   ItemInstanceId: itemId,
    //   PlayFabId: currentPlayerId,
    //   UsesToAdd: usesToAdd,
    // });
  },

  grantItemsToUser: function (items) {
    return console.log("grantItemsToUser", items);

    // server.GrantItemsToUser({
    //   ItemIds: items,
    //   PlayFabId: currentPlayerId,
    // });
  },
};

const MeowchemyCloudScript = {
  combinedInfo: null,

  init: function () {
    this.combinedInfo = CloudScriptLib.getCombinedInfo();
  },

  getCurrentGameState: function () {
    let userData = CloudScriptLib.getUserData([
      "SaveVersion",
      "Life",
      "TutorialState",
      "Stage0",
      "Stage1",
      "Stage2",
      "Stage3",
    ]);

    try {
      let saveVersion = userData.Data.SaveVersion.Value;
      let life = userData.Data.Life.Value;
      let tutorialState = userData.Data.TutorialState.Value;
      let coinsAmount = this.getCoinAmount("GP");

      let stages = [];
      if (undefined !== userData.Data.Stage0)
        stages.push(JSON.parse(userData.Data.Stage0.Value));
      if (undefined !== userData.Data.Stage1)
        stages.push(JSON.parse(userData.Data.Stage1.Value));
      if (undefined !== userData.Data.Stage2)
        stages.push(JSON.parse(userData.Data.Stage2.Value));
      if (undefined !== userData.Data.Stage3)
        stages.push(JSON.parse(userData.Data.Stage3.Value));

      let localItems = this.getUserInventory();
      let items = localItems.map((item) => {
        return {
          id: item.ItemId,
          quantity: item.RemainingUses,
        };
      });

      return {
        saveVersion,
        life,
        tutorialState,
        coinsAmount,
        items,
        stages,
      };
    } catch (e) {
      return { error: e };
    }
  },

  updateSyncGameState: function (args, context) {
    try {
      let dataPayload = {};

      if (undefined !== args.lifeAmount) dataPayload["Life"] = args.lifeAmount;

      if (undefined !== args.saveVersion)
        dataPayload["SaveVersion"] = args.saveVersion;

      if (undefined !== args.tutorialState)
        dataPayload["TutorialState"] = args.tutorialState;

      if (undefined != args.items) this.updateItemsIventory(args.items);

      if (undefined !== args.coinsAmount)
        this.updateVirtualCurrency(args.coinsAmount);

      server.UpdateUserData({
        PlayFabId: currentPlayerId,
        Data: dataPayload,
      });

      log.debug("pass success", args);
    } catch (e) {
      log.debug(e.name + ": " + e.message);
    }
  },

  updateVirtualCurrency: function (gameClientCurrencyAmount) {
    try {
      let UserVirtualCurrencyGP = this.getCoinAmount("GP");

      if (undefined !== UserVirtualCurrencyGP) {
        if (UserVirtualCurrencyGP == gameClientCurrencyAmount) {
          return true;
        }

        if (UserVirtualCurrencyGP > gameClientCurrencyAmount) {
          // Subtract
          let amountToSubtract =
            UserVirtualCurrencyGP - gameClientCurrencyAmount;

          resultSubtract = CloudScriptLib.subtractVirtualCurrency(
            amountToSubtract,
            "GP"
          );

          log.debug(resultSubtract);
        } else {
          // Add
          let amountToAdd = gameClientCurrencyAmount - UserVirtualCurrencyGP;

          CloudScriptLib.addVirtualCurrency(amountToAdd);

          log.debug(resultAdd);
        }
      }
    } catch (e) {
      log.debug("error", e);

      return e;
    }

    return args;
  },

  updateItemsIventory: function (items) {
    let serverItems = this.getUserInventory();

    let serverHash = [];
    serverItems.length > 0 &&
      serverItems.map((item) => {
        serverHash[item.ItemId] = item;
      });

    let clientItems = [];
    items.length > 0 &&
      items.map((item) => {
        clientItems[item.id] = item;
      });

    newItemsToServer = [];
    for (let ItemId in clientItems) {
      clientItem = clientItems[ItemId];

      // Client Item found in Server
      if (undefined !== serverHash[clientItem.id]) {
        const serverItem = serverHash[clientItem.id];

        // Remove items from Server
        let consume = clientItem.quantity - serverItem.RemainingUses;
        CloudScriptLib.modifyItemUses(serverItem.ItemId, consume);

        // Client Item not found in server
      } else {
        newItemsToServer.push(clientItem);
      }
    }

    //Adding in server
    if (newItemsToServer.length > 0) {
      let items = [];
      newItemsToServer.map((clientItem) => {
        for (var i = 0; i < clientItem.quantity; i++) {
          items.push(clientItem.id);
        }
      });
      CloudScriptLib.grantItemsToUser(items);
    }

    //Remove from server items not present in client
    for (let ItemId in serverHash) {
      if (undefined === clientItems[ItemId]) {
        removeItem = serverHash[ItemId];
        CloudScriptLib.modifyItemUses(
          removeItem.ItemId,
          removeItem.RemainingUses * -1
        );
      }
    }
  },

  getCoinAmount: function (coinType) {
    let payload = this.combinedInfo;

    if (
      undefined === payload.UserVirtualCurrency ||
      undefined === payload.UserVirtualCurrency[coinType]
    ) {
      return 0;
    }

    log.debug("payload", payload);
    log.debug("UserVirtualCurrency", payload.UserVirtualCurrency);
    log.debug("Amount", payload.UserVirtualCurrency[coinType]);

    return payload.UserVirtualCurrency[coinType];
  },

  getUserInventory: function () {
    let payload = this.combinedInfo;

    if (undefined === payload.UserInventory) {
      return [];
    }

    log.debug("payload", payload);
    log.debug(payload.UserInventory);

    return payload.UserInventory;
  },
};

// handlers = {};
handlers.SyncGameState = function (args, context) {
  MeowchemyCloudScript.init();

  let serverCurrentSaveVersion = CloudScriptLib.getUserData(["SaveVersion"]);

  if (
    serverCurrentSaveVersion === null ||
    undefined === serverCurrentSaveVersion.Data ||
    undefined === serverCurrentSaveVersion.Data.SaveVersion
  ) {
    MeowchemyCloudScript.updateSyncGameState(args, context);
    return args;
  }

  let currentSaveVersion = serverCurrentSaveVersion.Data.SaveVersion.Value;

  if (currentSaveVersion == args.saveVersion) {
    return args;
  }

  if (currentSaveVersion > args.saveVersion) {
    let currentServerGameState = MeowchemyCloudScript.getCurrentGameState();
    return currentServerGameState;
  }

  MeowchemyCloudScript.updateSyncGameState(args, context);

  return args;
};

// updateItems = function (serverItems, items) {
//   // let serverItems = this.getUserInventory();

//   let serverHash = [];
//   serverItems.map((item) => {
//     serverHash[item.ItemId] = item;
//   });

//   let clientItems = [];
//   items.map((item) => {
//     clientItems[item.id] = item;
//   });

//   newItemsToServer = [];
//   for (let ItemId in clientItems) {
//     clientItem = clientItems[ItemId];

//     // Client Item found in Server
//     if (undefined !== serverHash[clientItem.id]) {
//       const serverItem = serverHash[clientItem.id];

//       // Remove items from Server
//       // if (clientItem.quantity < serverItem.RemainingUses) {
//       let consume = clientItem.quantity - serverItem.RemainingUses;
//       CloudScriptLib.modifyItemUses(serverItem.ItemId, consume);
//       // consumeItem(serverItem.ItemId, consume);
//       // }

//       // Add items on Server
//       // if (clientItem.quantity > serverItem.RemainingUses) {
//       //   const addqtd = clientItem.quantity - serverItem.RemainingUses;
//       //   modifyItemUses(serverItem.ItemId, addqtd);
//       // }

//       // Client Item not found in server
//     } else {
//       newItemsToServer.push(clientItem);
//     }
//   }

//   //Adding in server
//   if (newItemsToServer.length > 0) {
//     let items = [];
//     newItemsToServer.map((clientItem) => {
//       for (var i = 0; i < clientItem.quantity; i++) {
//         items.push(clientItem.id);
//       }
//     });
//     CloudScriptLib.grantItemsToUser(items);
//   }

//   //Remove from server items not present in client
//   for (let ItemId in serverHash) {
//     if (undefined === clientItems[ItemId]) {
//       removeItem = serverHash[ItemId];
//       CloudScriptLib.modifyItemUses(
//         removeItem.ItemId,
//         removeItem.RemainingUses * -1
//       );
//     }
//   }
// };

// let serverItems = [
//   {
//     ItemId: "96E72FBC-F9A5-4643-9C70-FDCA6828D0A8",
//     ItemInstanceId: "1F0F86F20944EBFE",
//     PurchaseDate: "2021-09-03T13:19:21.877Z",
//     RemainingUses: 1,
//     CatalogVersion: "Main",
//     DisplayName: "Boost 02 (Staff)",
//     UnitCurrency: "GP",
//     UnitPrice: 110,
//   },
//   {
//     ItemId: "40B122DD-646C-468E-AB75-3D0703D05ED4_",
//     ItemInstanceId: "358FCF97080E9C30",
//     PurchaseDate: "2021-09-03T11:41:55.102Z",
//     RemainingUses: 1,
//     CatalogVersion: "Main",
//     DisplayName: "Boost 01 (Potion)",
//     UnitCurrency: "GP",
//     UnitPrice: 100,
//   },
// ];

// let clientItems = [
//   {
//     id: "96E72FBC-F9A5-4643-9C70-FDCA6828D0A8",
//     quantity: 2,
//   },
//   {
//     id: "40B122DD-646C-468E-AB75-3D0703D05ED4",
//     quantity: 4,
//   },
// ];

// // updateItems(serverItems, clientItems);
