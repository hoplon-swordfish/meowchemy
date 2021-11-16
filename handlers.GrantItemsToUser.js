handlers.GrantItemsToUser = function (args, context) {
  MeowchemyCloudScript.init();

  if (!Array.isArray(args)) {
    return false;
  }

  CloudScriptLib.grantItemsToUser(args);
};
