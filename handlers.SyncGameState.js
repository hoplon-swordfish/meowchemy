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

  if (currentSaveVersion >= args.saveVersion) {
    // log.debug(currentSaveVersion + " " + args.saveVersion);

    let currentServerGameState = MeowchemyCloudScript.getCurrentGameState();
    return currentServerGameState;
  }

  MeowchemyCloudScript.updateSyncGameState(args, context);

  return args;
};
