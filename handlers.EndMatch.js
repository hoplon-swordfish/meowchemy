handlers.EndMatch = function (args, context) {
  // stage	    Stage
  // lifeItem	    Item
  // coinsAmount	int
  // progressionLevel int

  MeowchemyCloudScript.init();

  stageName = "Stage" + args.stage.stageId;

  const dataPayload = {};

  dataPayload[stageName] = JSON.stringify(args.stage);

  if (undefined !== args.progressionLevel) {
    dataPayload["ProgressionLevel"] = args.progressionLevel;
  }

  server.UpdateUserData({
    PlayFabId: currentPlayerId,
    Data: dataPayload,
  });

  if (undefined !== args.coinsAmount)
    MeowchemyCloudScript.updateVirtualCurrency(args.coinsAmount);

  if (undefined !== args.items)
    MeowchemyCloudScript.updateItemInventory(args.items);

  return args;
};
