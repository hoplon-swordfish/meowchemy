handlers.TrySendCustomPushNotification = function (args, context)
{
    try
    {
        let logMessage = ``;
        let lifeMaxStackReachedTemplate = "";
        let adRewardCurrencyAvaibleTemplate = "";
        let dataPayload = {};

        let userData = CloudScriptLib.getUserData(["NextAdRewardCurrencyTime", "LifeFloodController", "AdRewardFloodController"]);
        logMessage = `TrySendCustomPushNotification::userData: ${JSON.stringify(userData)}`;
        log.info(logMessage);

        if (script.titleId == "8ABEF")
        {
            lifeMaxStackReachedTemplate = "6b6a3814-99df-4387-9469-1f4f083a41b6";
            adRewardCurrencyAvaibleTemplate = "7de32b12-53e4-4e0e-8715-57a014f1adab";

        } else if (script.titleId == "57FD5")
        {
            lifeMaxStackReachedTemplate = "a43a3366-2f3f-48b6-bbde-3439a5664df1";
            adRewardCurrencyAvaibleTemplate = "f5b0776f-c2cf-447b-9610-5de86a1545f2";

        } else if (script.titleId == "EAFEB")
        {
            lifeMaxStackReachedTemplate = "25de0c79-c3a1-4c6a-9b04-cacb2951b49e";
            adRewardCurrencyAvaibleTemplate = "b55c72c1-c70c-4757-8b9e-3e4d9f99b1f3";
        }

        TrySendCustomPushNotificationFunctions.TrySendLifePushNotification(userData, dataPayload, lifeMaxStackReachedTemplate);
        TrySendCustomPushNotificationFunctions.TrySendAdRewardPushNotification(userData, dataPayload, adRewardCurrencyAvaibleTemplate);

        logMessage = `TrySendCustomPushNotification::dataPayload: ${JSON.stringify(dataPayload)}`;
        log.info(logMessage);

        TrySendCustomPushNotificationFunctions.TryUpdatePushnotificationFloodController(dataPayload);
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
        let logMessage = ``;
        let userLifeAmount = MeowchemyCloudScript.getCurrentUserLifeAmount();
        let userLifeMaxAmount = MeowchemyCloudScript.getLifeMaxStack();

        logMessage = `TrySendLifePushNotification::userLifeAmount:${userLifeAmount} and TrySendLifePushNotification::userLifeMaxAmount:${userLifeMaxAmount}`;
        log.info(logMessage);

        if (userData.Data.LifeFloodController === undefined
            || userData.Data.LifeFloodController.Value === undefined
            || userData.Data.LifeFloodController.Value == 0)
        {
            if (userLifeAmount == userLifeMaxAmount)
            {
                CloudScriptLib.SendPushNotificationFromTemplate(lifeMaxStackReachedTemplate)
                dataPayload["LifeFloodController"] = 1;

                logMessage = `TrySendLifePushNotification::SendPushNotificationFromTemplate and setting LifeFloodController to 1`;
                log.info(logMessage);
            }
        } else if (userLifeAmount < userLifeMaxAmount)
        {
            dataPayload["LifeFloodController"] = 0;
            logMessage = `TrySendLifePushNotification:: Setting LifeFloodController to 0`;
            log.info(logMessage);
        }
    },
    TrySendAdRewardPushNotification: function TrySendAdRewardPushNotification(userData, dataPayload, adRewardCurrencyAvaibleTemplate)
    {
        let logMessage = ``;

        if (userData.Data.NextAdRewardCurrencyTime === undefined
            || userData.Data.NextAdRewardCurrencyTime.Value === undefined)
        {
            logMessage = `TrySendAdRewardPushNotification::NextAdRewardCurrencyTime not found, impossible to evaluate`;
            log.info(logMessage);
            return;
        }

        let utcNow = ((new Date().getTime() * 10000) + 621355968000000000);

        logMessage = `TrySendAdRewardPushNotification::NextAdRewardCurrencyTime: ${userData.Data.NextAdRewardCurrencyTime.Value} and utcNow: ${utcNow}`;
        log.info(logMessage);

        if (userData.Data.AdRewardFloodController === undefined
            || userData.Data.AdRewardFloodController.Value === undefined
            || userData.Data.AdRewardFloodController.Value == 0)
        {
            if (userData.Data.NextAdRewardCurrencyTime.Value <= utcNow)
            {
                CloudScriptLib.SendPushNotificationFromTemplate(adRewardCurrencyAvaibleTemplate)
                dataPayload["AdRewardFloodController"] = 1;

                logMessage = `TrySendAdRewardPushNotification::SendPushNotificationFromTemplate and setting AdRewardFloodController to 1`;
                log.info(logMessage);
            }
        } else if (userData.Data.NextAdRewardCurrencyTime.Value > utcNow)
        {
            dataPayload["AdRewardFloodController"] = 0;
            logMessage = `TrySendAdRewardPushNotification:: Setting AdRewardFloodController to 0`;
            log.info(logMessage);
        }
    },
    TryUpdatePushnotificationFloodController: function TryUpdatePushnotificationFloodController(dataPayload)
    {
        if (Object.keys(dataPayload).length)
            server.UpdateUserData(
                {
                    PlayFabId: currentPlayerId,
                    Data: dataPayload,
                });
    }
}