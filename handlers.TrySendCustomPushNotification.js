handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();
    let userNextRewardTime = CloudScriptLib.getUserData(["NextAdRewardCurrencyTime"]);
    let utcNow = ((new Date().getTime() * 10000) + 621355968000000000);

    let lifeMaxStackReachedTemplate = "";
    let adRewardCurrencyAvaibleTemplate = "";

    if (script.titleId == "8ABEF") {

        lifeMaxStackReachedTemplate = "6b6a3814-99df-4387-9469-1f4f083a41b6";
        adRewardCurrencyAvaibleTemplate = "7de32b12-53e4-4e0e-8715-57a014f1adab";

    } else if (script.titleId == "57FD5") {

        lifeMaxStackReachedTemplate = "a43a3366-2f3f-48b6-bbde-3439a5664df1";
        adRewardCurrencyAvaibleTemplate = "f5b0776f-c2cf-447b-9610-5de86a1545f2";

    }

    if (userLifeAmount == userLifeMaxAmount) {

        CloudScriptLib.SendPushNotificationFromTemplate(lifeMaxStackReachedTemplate)
    }

    if (userNextRewardTime.Data.NextAdRewardCurrencyTime !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value < utcNow) {

        CloudScriptLib.SendPushNotificationFromTemplate(adRewardCurrencyAvaibleTemplate)
    }
}