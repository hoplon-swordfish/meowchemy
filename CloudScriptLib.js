const CloudScriptLib = {
  addVirtualCurrency: function (amountToAdd) {
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

    // log.debug("playerCombinedInfoResult");

    return playerCombinedInfoResult.InfoResultPayload;
  },

  consumeItem: function (item, quantity) {
    // return console.log("consumeItem", item, quantity);

    return server.ConsumeItem({
      ConsumeCount: quantity,
      ItemInstanceId: item,
      PlayFabId: currentPlayerId,
    });
  },

  modifyItemUses: function (itemId, usesToAdd) {
    // return console.log("modifyItemUses", itemId, usesToAdd);

    if (usesToAdd == 0) return null;

    return server.ModifyItemUses({
      ItemInstanceId: itemId,
      PlayFabId: currentPlayerId,
      UsesToAdd: usesToAdd,
    });
  },

  grantItemsToUser: function (items) {
    // return console.log("grantItemsToUser", items);

    return server.GrantItemsToUser({
      ItemIds: items,
      PlayFabId: currentPlayerId,
    });
  },
};