handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();
    let utcNow = ((new Date().getTime() * 10000) + 621355968000000000);

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

    log.debug(userNextRewardTime.Data.NextAdRewardCurrencyTime !== undefined);
    log.debug(userNextRewardTime.Data.NextAdRewardCurrencyTime.Value !== undefined);
    log.debug(userNextRewardTime.Data.NextAdRewardCurrencyTime.Value < utcNow);


    if (userNextRewardTime.Data.NextAdRewardCurrencyTime !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value !== undefined
        && userNextRewardTime.Data.NextAdRewardCurrencyTime.Value < utcNow) {

        log.debug("NextAdRewardCurrencyTime is lower then utcNow, sending push notification")
    }

    // SendPushnotification
}