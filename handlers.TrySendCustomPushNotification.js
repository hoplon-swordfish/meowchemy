handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();
    let utcNow = ((new Date().getTime() * 10000) + 621355968000000000n);

    //log.debug("userLifeAmount");
    //log.debug(userLifeAmount);
    //log.debug("userLifeMaxAmount");
    //log.debug(userLifeMaxAmount);

    if (userLifeAmount == userLifeMaxAmount) {
        //log.debug("userLifeAmount and userLifeMaxAmount are equals, sending push notification")
        CloudScriptLib.SendPushNotificationFromTemplate("6b6a3814-99df-4387-9469-1f4f083a41b6")
    }

    let userNextRewardTime = CloudScriptLib.getUserData(["NextAdRewardCurrencyTime"]);

    log.debug("userNextRewardTime");
    log.debug(userNextRewardTime);
    log.debug("utcNow");
    log.debug(utcNow);

    if (Data.NextAdRewardCurrencyTime !== undefined
        && Data.NextAdRewardCurrencyTime.Value !== undefined
        && Data.NextAdRewardCurrencyTime.Value < utcNow) {

        log.debug("NextAdRewardCurrencyTime is lower then utcNow, sending push notification")
    }

    // SendPushnotification
}