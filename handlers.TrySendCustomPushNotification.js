handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();

    log.debug("userLifeAmount");
    log.debug(userLifeAmount);
    log.debug("userLifeMaxAmount");
    log.debug(userLifeMaxAmount);

    if (userLifeAmount === userLifeMaxAmount) {
        log.debug("userLifeAmount and userLifeMaxAmount are equals, sending push notification")
        CloudScriptLib.SendPushNotificationFromTemplate("6b6a3814-99df-4387-9469-1f4f083a41b6")
    }



    // get variavel life cap

    // SendPushnotification

    // get variavel time to reward currency

    // SendPushnotification
}