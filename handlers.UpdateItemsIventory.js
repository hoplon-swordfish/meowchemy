// GrantItemsToUser => UpdateItemsIventory
handlers.UpdateItemsIventory = function (args, context) {
  MeowchemyCloudScript.init();

  if (!Array.isArray(args)) {
    return false;
  }

  MeowchemyCloudScript.updateItemIventory(args);
};
