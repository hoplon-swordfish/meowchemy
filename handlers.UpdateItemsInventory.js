// GrantItemsToUser => UpdateItemsIventory
handlers.UpdateItemsInventory = function (args, context) {
  MeowchemyCloudScript.init();

  if (!Array.isArray(args)) {
    return false;
  }

  MeowchemyCloudScript.updateItemIventory(args);
};
