var client = {
  stage: { stageId: 1, stageItemIndex: 1, stageItemProgress: 4500.0 },
  items: [{ id: "f98ea5b4-8790-43b6-bc1b-7caec140f817", quantity: 8 }],
  coinsAmount: 1060,
};
var serverItems = [
  {
    ItemId: "f98ea5b4-8790-43b6-bc1b-7caec140f817",
    ItemInstanceId: "BCA4E477C1A74300",
    PurchaseDate: "2021-09-08T13:43:09.439Z",
    RemainingUses: 5,
    CatalogVersion: "Main",
    DisplayName: "Life",
    UnitPrice: 0,
  },
];

const CloudScriptLib = {
  modifyItemUses: function (instance, consume) {
    console.log(instance, consume);
  },
  grantItemsToUser(item) {
    console.log(item);
  },
};
const miau = {
  getUserInventory: () => {
    return serverItems;
  },

  updateItemIventory: function (items) {
    let serverItems = this.getUserInventory();

    let createItems = [];
    for (let idxC in items) {
      itemClient = items[idxC];
      let found = false;

      for (let idxS in serverItems) {
        itemServer = serverItems[idxS];
        if (itemClient.id == itemServer.ItemId) {
          let consume = itemClient.quantity - itemServer.RemainingUses;
          if (consume != 0) {
            CloudScriptLib.modifyItemUses(itemServer.ItemInstanceId, consume);
          }
          found = true;
        }
      }
      if (!found) {
        for (let i = 0; i < itemClient.quantity; i++) {
          createItems.push(itemClient.id);
        }
      }
    }
    if (createItems.length > 0) {
      CloudScriptLib.grantItemsToUser(createItems);
    }
  },
};

miau.updateItemIventory(client.items);
