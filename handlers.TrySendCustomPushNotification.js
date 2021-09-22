handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();
    let userNextRewardTime = CloudScriptLib.getUserData(["NextAdRewardCurrencyTime"]);
    let utcNow = ((new Date().getTime() * 10000) + 621355968000000000);

    if (userLifeAmount == userLifeMaxAmount) {
        CloudScriptLib.SendPushNotificationFromTemplate("6b6a3814-99df-4387-9469-1f4f083a41b6")
    }
    
    if (userNextRewardTime.Data.NextAdRewardCurrencyTime !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value < utcNow) {

        CloudScriptLib.SendPushNotificationFromTemplate("7de32b12-53e4-4e0e-8715-57a014f1adab")
    }    
}