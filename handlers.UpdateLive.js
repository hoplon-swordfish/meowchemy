handlers.UpdateLife = function (args, context) {
  MeowchemyCloudScript.init();

  if (undefined !== args.id) MeowchemyCloudScript.updateItemsIventory([args]);

  return args;
};
