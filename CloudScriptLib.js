const CloudScriptLib = {
  addVirtualCurrency: function (amountToAdd, currencyCode) {
    if (amountToAdd === 0) return false;
    let resultAdd = server.AddUserVirtualCurrency({
      Amount: amountToAdd,
      PlayFabId: currentPlayerId,
      VirtualCurrency: currencyCode,
    });
    return resultAdd;
  },

  subtractVirtualCurrency: function (amountToSubtract, currencyCode) {
    if (amountToSubtract === 0) return false;
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

  getTitleData: function (keys) {
    return server.GetTitleData({
      Keys: keys,
    });
  },

  getUserInventory: function () {
    return server.GetUserInventory({
      PlayFabId: currentPlayerId,
    });
  },

  SendPushNotificationFromTemplate: function (pushNotificationTemplateId) {
    return server.SendPushNotificationFromTemplate({
      PushNotificationTemplateId: pushNotificationTemplateId,
      Recipient: currentPlayerId,
    });
  },
};
