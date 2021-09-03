const MeowchemyCloudScript = {
  combinedInfo: null,

  init: function () {
    this.combinedInfo = this.getCombinedInfo();
  },

  getCurrentGameState: function () {
    let userData = this.getUserData([
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
      stages.push(JSON.parse(userData.Data.Stage0.Value));
      stages.push(JSON.parse(userData.Data.Stage1.Value));
      stages.push(JSON.parse(userData.Data.Stage2.Value));
      stages.push(JSON.parse(userData.Data.Stage3.Value));

      let boosterLocal = this.getUserInventory();
      let boosters = boosterLocal.map((item) => {
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
        boosters,
        stages,
      };
    } catch (e) {
      return { error: "um erro ocorreu" };
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

      log.debug("before updateUserDate (dataPayload)", dataPayload);

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

          resultSubtract = this.subtractVirtualCurrency(amountToSubtract);

          log.debug(resultSubtract);
        } else {
          // Add
          let amountToAdd = gameClientCurrencyAmount - UserVirtualCurrencyGP;

          this.addVirtualCurrency(amountToAdd);

          log.debug(resultAdd);
        }
      }
    } catch (e) {
      log.debug("error", e);

      return e;
    }

    return args;
  },

  addVirtualCurrency: function (amount) {
    let resultAdd = server.AddUserVirtualCurrency({
      Amount: amountToAdd,
      PlayFabId: currentPlayerId,
      VirtualCurrency: "GP",
    });
    return resultAdd;
  },

  subtractVirtualCurrency: function (amount) {
    let resultSubtract = server.SubtractUserVirtualCurrency({
      Amount: amountToSubtract,
      PlayFabId: currentPlayerId,
      VirtualCurrency: "GP",
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
      throw new Error("An error occurr");
    }

    log.debug("playerCombinedInfoResult", playerCombinedInfoResult);

    return playerCombinedInfoResult.InfoResultPayload;
  },

  getCoinAmount: function (coinType) {
    let payload = this.combinedInfo;

    log.debug("payload", payload);
    log.debug("UserVirtualCurrency", payload.UserVirtualCurrency);
    log.debug("Amount", payload.UserVirtualCurrency[coinType]);

    return payload.UserVirtualCurrency[coinType];
  },

  getUserInventory: function () {
    let payload = this.combinedInfo;

    log.debug("payload", payload);
    log.debug(payload.UserInventory);

    return payload.UserInventory;
  },
};

// handlers = {};
handlers.SyncGameState = function (args, context) {
  MeowchemyCloudScript.init();

  let serverCurrentSaveVersion = MeowchemyCloudScript.getUserData([
    "SaveVersion",
  ]);

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

// handlers.SyncGameState({ saveVersion: 5 });
