const MeowchemyCloudScript = {
  combinedInfo: null,

  init: function () {
    this.combinedInfo = CloudScriptLib.getCombinedInfo();
  },

  getCurrentGameState: function () {
    let userData = CloudScriptLib.getUserData([
      "SaveVersion",
      "TutorialState",
      "ProgressionLevel",
      "IsStarterPackPurchased",
      "Stage0",
      "Stage1",
      "Stage2",
      "Stage3",
    ]);

    try {
      let saveVersion = userData.Data.SaveVersion.Value;
      let tutorialState = userData.Data.TutorialState.Value;
      let progressionLevel = 0;
      if (undefined !== userData.Data.ProgressionLevel) {
        progressionLevel = userData.Data.ProgressionLevel.Value;
      }
      if (undefined !== userData.Data.IsStarterPackPurchased) {
        isStarterPackPurchased = userData.Data.IsStarterPackPurchased.Value;
      }
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
        progressionLevel,
        tutorialState,
        coinsAmount,
        isStarterPackPurchased,
        items,
        stages,
      };
    } catch (e) {
      log.debug(e);
      return { error: e };
    }
  },

  updateSyncGameState: function (args, context) {
    try {
      let dataPayload = {};

      if (undefined !== args.saveVersion)
        dataPayload["SaveVersion"] = args.saveVersion;

      if (undefined !== args.tutorialState)
        dataPayload["TutorialState"] = args.tutorialState;

      if (undefined !== args.progressionLevel)
        dataPayload["ProgressionLevel"] = args.progressionLevel;
        
      if (undefined !== args.isStarterPackPurchased)
        dataPayload["IsStarterPackPurchased"] = args.isStarterPackPurchased;

      if (undefined != args.items) this.updateItemsIventory(args.items);

      if (undefined !== args.coinsAmount)
        this.updateVirtualCurrency(args.coinsAmount);

      if (undefined !== args.stages && args.stages.length > 0) {
        let itemsStageLocal = this.updateStages(args.stages);
        if (undefined !== itemsStageLocal.Stage0) {
          dataPayload["Stage0"] = JSON.stringify(itemsStageLocal.Stage0);
          dataPayload["Stage1"] = JSON.stringify(itemsStageLocal.Stage1);
          dataPayload["Stage2"] = JSON.stringify(itemsStageLocal.Stage2);
          dataPayload["Stage3"] = JSON.stringify(itemsStageLocal.Stage3);
        }
      }

      // log.debug("dataPayload");
      // log.debug(dataPayload);

      server.UpdateUserData({
        PlayFabId: currentPlayerId,
        Data: dataPayload,
      });

      log.debug("pass success");

      return args;
    } catch (e) {
      log.debug("error updateSyncGameState");
      log.debug(e);
      return false;
    }
  },

  updateStages: function (stages) {
    log.debug("updateStages");
    // log.debug(stages);

    let data = {};
    try {
      stages.map((stage) => {
        let saving = {
          stageId: stage.stageId,
          stageItemIndex: stage.stageItemIndex,
          stageItemProgress: stage.stageItemProgress,
        };

        let key = "Stage" + stage.stageId;
        data[key] = saving;
      });

      // log.debug(data);

      if (data.Stage0 !== undefined) {
        log.debug("saving stages");
        return data;
      } else {
        log.debug("no stages found....");
        return data;
      }
    } catch (e) {
      log.debug("error updateStages");
      log.debug(e);
      return data;
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

          CloudScriptLib.addVirtualCurrency(amountToAdd, "GP");
        }
      }
    } catch (e) {
      log.debug("error updateVirtualCurrency");
      log.debug(e);

      return e;
    }

    return true;
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
        CloudScriptLib.modifyItemUses(serverItem.ItemInstanceId, consume);

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
      if (items.length > 0) CloudScriptLib.grantItemsToUser(items);
    }

    let removeItem = null;
    //Remove from server items not present in client
    for (let ItemId in serverHash) {
      if (undefined === clientItems[ItemId]) {
        removeItem = serverHash[ItemId];
        CloudScriptLib.modifyItemUses(
          removeItem.ItemInstanceId,
          removeItem.RemainingUses * -1
        );
      }
    }
  },

  updateItemIventory: function (items) {
    let serverItems = this.getUserInventory();

    let createItems = [];
    for (let idxC in items) {
      itemClient = items[idxC];
      let found = false;

      for (let idxS in serverItems) {
        itemServer = serverItems[idxS];
        if (itemClient.id == itemServer.ItemId) {
          let consume = itemClient.quantity - itemServer.RemainingUses;
          if (consume != 0) {
            CloudScriptLib.modifyItemUses(itemServer.ItemInstanceId, consume);
          }
          found = true;
        }
      }
      if (!found) {
        for (let i = 0; i < itemClient.quantity; i++) {
          createItems.push(itemClient.id);
        }
      }
    }
    if (createItems.length > 0) {
      CloudScriptLib.grantItemsToUser(createItems);
    }
  },

  getCoinAmount: function (coinType) {
    let payload = this.combinedInfo;
    // log.debug("payload");
    // log.debug(payload);

    if (
      undefined === payload.UserVirtualCurrency ||
      undefined === payload.UserVirtualCurrency[coinType]
    ) {
      return 0;
    }

    // log.debug("getCoinAmount => payload");
    // log.debug(payload);
    // log.debug("UserVirtualCurrency");
    // log.debug(payload.UserVirtualCurrency);
    // log.debug("Amount");
    // log.debug(payload.UserVirtualCurrency[coinType]);

    return payload.UserVirtualCurrency[coinType];
  },

  getUserInventory: function () {
    let payload = this.combinedInfo;

    if (undefined === payload.UserInventory) {
      return [];
    }

    // log.debug("getUserInventory => payload");
    // log.debug(payload);
    // log.debug(payload.UserInventory);

    return payload.UserInventory;
  },

  getLifeMaxStack: function () {
    let lifeMaxStackData = CloudScriptLib.getTitleData(["LifeMaxStack"]);
    if (undefined === lifeMaxStackData) return 0;

    return lifeMaxStackData.Data.LifeMaxStack;
  },

  getCurrentUserLifeAmount: function () {
    let result = CloudScriptLib.getUserInventory();
    if (undefined === result) return 0;

    return result.Inventory.find((element) => element.DisplayName === "Life")
      .RemainingUses;
  },
};
