handlers.TrySendCustomPushNotification = function (args, context)
{
    try
    {
        let lifeMaxStackReachedTemplate = "";
        let adRewardCurrencyAvaibleTemplate = "";
        let dataPayload = {};

        if (script.titleId == "8ABEF")
        {
            lifeMaxStackReachedTemplate = "6b6a3814-99df-4387-9469-1f4f083a41b6";
            adRewardCurrencyAvaibleTemplate = "7de32b12-53e4-4e0e-8715-57a014f1adab";

        } else if (script.titleId == "57FD5")
        {
            lifeMaxStackReachedTemplate = "a43a3366-2f3f-48b6-bbde-3439a5664df1";
            adRewardCurrencyAvaibleTemplate = "f5b0776f-c2cf-447b-9610-5de86a1545f2";
        }

        let userData = CloudScriptLib.getUserData(["NextAdRewardCurrencyTime", "LifeFloodController", "AdRewardFloodController"]);
        TrySendCustomPushNotificationFunctions.TrySendLifePushNotification(userData, dataPayload, lifeMaxStackReachedTemplate);
        TrySendCustomPushNotificationFunctions.TrySendAdRewardPushNotification(userData, dataPayload, adRewardCurrencyAvaibleTemplate);

        server.UpdateUserData(
            {
                PlayFabId: currentPlayerId,
                Data: dataPayload,
            });
    }
    catch (e)
    {
        let rawError = `Raw error message: ${e}`
        log.error(rawError)

        let error = e.apiErrorInfo.apiError.error;
        let errorCode = e.apiErrorInfo.apiError.errorCode;
        let errorMessage = `API Error: ${error}. Error code: ${errorCode}`;
        log.error(errorMessage);
    }
}

const TrySendCustomPushNotificationFunctions = {
    TrySendLifePushNotification: function TrySendLifePushNotification(userData, dataPayload, lifeMaxStackReachedTemplate)
    {
        let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
        let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();

        if (userData.Data.LifeFloodController === undefined
            || userData.Data.LifeFloodController.Value === undefined
            || userData.Data.LifeFloodController.Value == 0)
        {
            if (userLifeAmount == userLifeMaxAmount)
            {
                CloudScriptLib.SendPushNotificationFromTemplate(lifeMaxStackReachedTemplate)
                dataPayload["LifeFloodController"] = 1;
            }
        } else if (userLifeAmount < userLifeMaxAmount)
        {
            dataPayload["LifeFloodController"] = 0;
        }
    },
    TrySendAdRewardPushNotification: function TrySendAdRewardPushNotification(userData, dataPayload, adRewardCurrencyAvaibleTemplate)
    {
        if (userData.Data.NextAdRewardCurrencyTime === undefined
            || userData.Data.NextAdRewardCurrencyTime.Value === undefined)
        {
            return;
        }

        let utcNow = ((new Date().getTime() * 10000) + 621355968000000000);

        if (userData.Data.LifeFloodController === undefined
            || userData.Data.AdRewardFloodController.Value === undefined
            || userData.Data.AdRewardFloodController.Value == 0)
        {
            if (userData.Data.NextAdRewardCurrencyTime.Value <= utcNow)
            {
                CloudScriptLib.SendPushNotificationFromTemplate(adRewardCurrencyAvaibleTemplate)
                dataPayload["AdRewardFloodController"] = 1;
            }
        } else if (userData.Data.NextAdRewardCurrencyTime.Value > utcNow)
        {
            dataPayload["AdRewardFloodController"] = 0;
        }
    }
}