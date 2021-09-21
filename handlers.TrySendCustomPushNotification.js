handlers.TrySendCustomPushNotification = function (args, context) {

    let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
    let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();

    if (userLifeAmount === userLifeMaxAmount)
        CloudScriptLib.SendPushNotificationFromTemplate("6b6a3814-99df-4387-9469-1f4f083a41b6")


    // get variavel life cap

    // SendPushnotification

    // get variavel time to reward currency

    // SendPushnotification
}