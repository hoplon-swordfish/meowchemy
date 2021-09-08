handlers.UpdateLife = function (args, context) {
  MeowchemyCloudScript.init();

  if (undefined !== args.id) MeowchemyCloudScript.updateItemIventory([args]);

  return args;
};
